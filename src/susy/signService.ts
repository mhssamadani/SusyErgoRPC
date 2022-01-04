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
import { GuardianBox, VAABox } from "../models/boxes";
import { WormholeSignature } from "../models/models";

const rand = (): BigInteger => {
    const r = secureRandom.randomBuffer(32)
    return BigInteger.fromHex(r.toString('hex'))
}

const checkSign = (box: VAABox): boolean => {
    const checkpoint = box.getCheckpoint()
    if ((checkpoint & Math.pow(2, config.guardian.index)) > 0) return true
    return false
}

const signMsg = (msg: Uint8Array, sk: string): Array<string> => {
    const msgHash = "00" + blake2b(Buffer.from(msg), 32).toString('hex').slice(2)
    const ecParams = ecurve.getCurveByName('secp256k1')
    while (true) {
        const r = rand()
        const a = ecParams.G.multiply(r)
        // const msgHash = blake2b(Buffer.from(msg), 32).toString('hex').slice(2, 64)
        const z: BigInteger = r.add(BigInteger.fromHex(sk).multiply(BigInteger.fromHex(msgHash))).remainder(ecParams.n)
        const zHex = z.toHex();
        // console.log(z.toString(), z.toString(16), a.getEncoded().toString('hex'))
        if (zHex.length < 64 || (zHex.length == 64 && Number(zHex[0]) <= 7)) {
            return [a.getEncoded().toString('hex'), z.toString(16).padStart(64, '0')]
        }
    }
}

const verifyBoxSignature = (box: VAABox, guardianBox: GuardianBox): boolean => {
    const signature: WormholeSignature = box.getSignatureWithIndex(config.guardian.index)
    const guardianAddresses: Array<string> = guardianBox.getWormholeAddresses()
    const vaaData: string = box.getObservation()
    return verify(vaaData, signature.getSignatureHexData(), guardianAddresses[config.guardian.index])
}

const signService = async (wait: boolean = false): Promise<void> => {
    // loop this procedure (e.g. once in 3 minutes)

    const vaaBoxes: Array<VAABox> = await ApiNetwork.getVAABoxes()
    for (const box of vaaBoxes) {
        if (checkSign(box)) continue

        await box.trackMempool()
        if (checkSign(box)) continue

        const guardianBox: GuardianBox = await ApiNetwork.getGuardianBox(0)
        if (!verifyBoxSignature(box, guardianBox)) continue

        const msg: Uint8Array = codec.strToUint8Array(box.getObservation())
        const signatureData: Array<string> = signMsg(msg, config.guardian.privateKey)

        const wormholeBox: wasm.ErgoBox = await ApiNetwork.getWormholeBox()
        const sponsorBox: wasm.ErgoBox = await ApiNetwork.getSponsorBox()
        console.log("start generating transaction")
        await updateVAABox(
            wormholeBox,
            box.getErgoBox(),
            sponsorBox,
            guardianBox.getErgoBox(),
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
