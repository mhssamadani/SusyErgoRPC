import config from "../config/conf";
import ApiNetwork from "../network/api";
import * as wasm from 'ergo-lib-wasm-nodejs'
import * as codec from '../utils/codec'
import { verify } from "../utils/ecdsa";
import {updateVAABox} from "./transaction";
import BigInteger from 'bigi';
import ecurve from 'ecurve'
import { blake2b } from "ethereum-cryptography/blake2b"
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
    const maxBigInt = BigInteger.fromHex("7FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF")
    // const maxBigInt = BigInteger.fromHex("1ee194860333e2bc66c86840d051be002b851655c04d824e2dfa8ff02c0524e2")
    while (true) {
        const r = rand()
        const ecParams = ecurve.getCurveByName('secp256k1')
        const a = ecParams.G.multiply(r)
        const msgHash = blake2b(Buffer.from(msg), 32).toString('hex')
        const z: BigInteger = r.add(BigInteger.fromHex(sk).multiply(BigInteger.fromHex(msgHash))).remainder(ecParams.n)
        const zHex = z.toHex();
        console.log(z.toString(), z.toString(16), a.getEncoded().toString('hex'))
        if (zHex.length < 64 || (zHex.length == 64 && Number(zHex[0]) <= 7)) {
            return [a.getEncoded().toString('hex'), z.toString(16)]
        }
    }
}

const verifyBoxSignatures = (box: VAABox, guardianBox: GuardianBox): boolean => {
    const signatures: Array<WormholeSignature> = box.getSignatures()
    const guardianAddresses: Array<string> = guardianBox.getWormholeAddresses()
    const vaaData: string = box.getObservation()
    return verify(vaaData, signatures[config.guardian.index].toHex(), guardianAddresses[config.guardian.index])
}

const signService = async (): Promise<void> => {
    // loop this procedure (e.g. once in 3 minutes)

    const vaaBoxes: Array<VAABox> = (await ApiNetwork.getVAABoxes()).map(boxJson => new VAABox(boxJson))
    for (const box of vaaBoxes) {
        if (checkSign(box)) continue

        const lastBox: VAABox = await ApiNetwork.trackMemPool(box, 1)

        if (checkSign(lastBox)) continue

        const guardianBox: GuardianBox = new GuardianBox(await ApiNetwork.getGuardianBox(0))
        if (!verifyBoxSignatures(lastBox, guardianBox)) continue

        const msg: Uint8Array = codec.strToUint8Array(lastBox.getObservation())
        const signatureData: Array<string> = signMsg(msg, config.guardian.privateKey)

        const wormholeBox: wasm.ErgoBox = wasm.ErgoBox.from_json(JSON.stringify(await ApiNetwork.getWormholeBox()))
        const sponsorBox: wasm.ErgoBox = wasm.ErgoBox.from_json(JSON.stringify(await ApiNetwork.getSponsorBox()))
        console.log("start generating transaction")
        await updateVAABox(
            wormholeBox,
            box.getErgoBox(),
            sponsorBox,
            guardianBox.getErgoBox(),
            config.guardian.index,
            Uint8Array.from(Buffer.from(signatureData[0], "hex")),
            Uint8Array.from(Buffer.from(signatureData[1], "hex")),
        )
    }
}

export default signService;
export { signMsg }
