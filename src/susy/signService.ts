import config from "../config/conf";
import ApiNetwork from "../network/api";
import * as wasm from 'ergo-lib-wasm-nodejs'
import * as codec from '../utils/codec'
import {verify} from "../utils/ecdsa";
import {updateVAABox} from "./transaction";
import BigInteger from 'bigi';
import ecurve from 'ecurve'
import {blake2b} from "ethereum-cryptography/blake2b"
import secureRandom from 'secure-random'
import {sendAndWaitTx} from "./init/util";

const rand = (): BigInteger => {
    const r = secureRandom.randomBuffer(32)
    return BigInteger.fromHex(r.toString('hex'))
}

const checkSign = (box: any): boolean => {
    const checkpoint = JSON.parse(box.additionalRegisters.R7.renderedValue)[0]
    if ((checkpoint & Math.pow(2, config.guardian.index)) > 0) return true
    return false
}

const signMsg = (msg: Uint8Array, sk: string): Array<string> => {
    const msgHash = "00" + blake2b(Buffer.from(msg), 32).toString('hex').slice(2)
    console.log(Buffer.from(msgHash, "hex").toString("base64"))
    const ecParams = ecurve.getCurveByName('secp256k1')
    while (true) {
        const r = rand()
        const a = ecParams.G.multiply(r)
        // const msgHash = blake2b(Buffer.from(msg), 32).toString('hex').slice(2, 64)
        const z: BigInteger = r.add(BigInteger.fromHex(sk).multiply(BigInteger.fromHex(msgHash))).remainder(ecParams.n)
        const zHex = z.toHex();
        console.log(z.toString(), z.toString(16), a.getEncoded().toString('hex'))
        if (zHex.length < 64 || (zHex.length == 64 && Number(zHex[0]) <= 7)) {
            return [a.getEncoded().toString('hex'), z.toString(16)]
        }
    }
}

const verifyBoxSignatures = (box: wasm.ErgoBox, guardianBox: any): boolean => {
    const signatures = codec.getBoxSignatures(box)
    const guardianAddresses = codec.getGuardianAddresses(guardianBox)
    const vaaData = codec.getVAADataFromBox(box)
    return verify(vaaData, signatures[config.guardian.index].toHex(), guardianAddresses[config.guardian.index])
}

const signService = async (wait: boolean = false): Promise<void> => {
    // loop this procedure (e.g. once in 3 minutes)

    const vaaBoxes = await ApiNetwork.getVAABoxes()
    for (const box of vaaBoxes) {
        if (checkSign(box)) continue

        const lastBox = await ApiNetwork.trackMemPool(box, 1)

        if (checkSign(lastBox)) continue

        const guardianBoxJson = await ApiNetwork.getGuardianBox(0)
        if (!verifyBoxSignatures(wasm.ErgoBox.from_json(JSON.stringify(lastBox)), guardianBoxJson)) continue

        const msg = codec.strToUint8Array(codec.getVAADataFromBox(wasm.ErgoBox.from_json(JSON.stringify(lastBox))))
        const signatureData = signMsg(msg, config.guardian.privateKey)

        const wormholeBox = wasm.ErgoBox.from_json(JSON.stringify(await ApiNetwork.getWormholeBox()))
        const sponsorBox = wasm.ErgoBox.from_json(JSON.stringify(await ApiNetwork.getSponsorBox()))
        const guardianBox = wasm.ErgoBox.from_json(JSON.stringify(guardianBoxJson))
        const vaaBox = wasm.ErgoBox.from_json(JSON.stringify(box));
        console.log("start generating transaction")
        await updateVAABox(
            wormholeBox,
            vaaBox,
            sponsorBox,
            guardianBox,
            config.guardian.index,
            Uint8Array.from(Buffer.from(signatureData[0], "hex")),
            Uint8Array.from(Buffer.from(signatureData[1], "hex")),
            undefined,
            wait
        )
    }
}

export default signService;
export {signMsg}
