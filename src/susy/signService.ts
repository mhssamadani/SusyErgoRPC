import config from "../config/conf";
import ApiNetwork from "../network/api";
import * as wasm from 'ergo-lib-wasm-nodejs'
import * as codec from '../utils/codec'
import { verify } from "../utils/ecdsa";
import { UpdateVAABox } from "./transaction";
import BigInteger from 'bigi';
import ecurve from 'ecurve'
import { blake2b } from "ethereum-cryptography/blake2b"
import secureRandom from 'secure-random'
import { GuardianBox, VAABox } from "../models/boxes";
import { WormholeSignature } from "../models/models";

const rand = (): BigInteger => {
    const r = secureRandom.randomBuffer(32)
    return BigInteger.fromHex(r.toString('hex'))
}

const checkSign = (box: VAABox): boolean => {
    const checkpoint = box.getCheckpoint()
    if ((checkpoint & Math.pow(2, config.getExtraSign().guardian.index)) > 0) return true
    return false
}

const signMsg = (msg: Uint8Array, sk: BigInteger): Array<string> => {
    const msgHash = "00" + blake2b(Buffer.from(msg), 32).toString('hex').slice(2)
    const ecParams = ecurve.getCurveByName('secp256k1')
    while (true) {
        const r = rand()
        const a = ecParams.G.multiply(r)
        const z: BigInteger = r.add(sk.multiply(BigInteger.fromHex(msgHash))).remainder(ecParams.n)
        const zHex = z.toHex();
        if (zHex.length < 64 || (zHex.length == 64 && Number(zHex[0]) <= 7)) {
            return [a.getEncoded().toString('hex'), z.toString(16).padStart(64, '0')]
        }
    }
}

const verifyBoxSignature = (box: VAABox, guardianBox: GuardianBox): boolean => {
    const signature: WormholeSignature = box.getSignatureWithIndex(config.getExtraSign().guardian.index)
    const guardianAddresses: Array<string> = guardianBox.getWormholeAddresses()
    const vaaData: string = box.getObservation()
    return verify(vaaData, signature.getSignatureHexData(), guardianAddresses[config.getExtraSign().guardian.index])
}

const signService = async (wait: boolean = false): Promise<void> => {
    // loop this procedure (e.g. once in 3 minutes)

    const vaaBoxes: Array<VAABox> = await ApiNetwork.getVAABoxes()
    for (const box of vaaBoxes) {
        try {
            if (checkSign(box)) continue

            await box.trackMempool()
            if (checkSign(box)) continue
            const guardianBox: GuardianBox = await ApiNetwork.getGuardianBox(box.getGuardianSetIndex())
            if (!verifyBoxSignature(box, guardianBox)) continue

            const msg: Uint8Array = codec.strToUint8Array(box.getObservation())
            const signatureData: Array<string> = signMsg(msg, config.getExtraSign().guardian.privateKey)

            const wormholeBox: wasm.ErgoBox = await ApiNetwork.getWormholeBox()
            const sponsorBox: wasm.ErgoBox = await ApiNetwork.getSponsorBox()
            console.log("start generating transaction")
            await UpdateVAABox(
                wormholeBox,
                box.getErgoBox(),
                sponsorBox,
                guardianBox.getErgoBox(),
                config.getExtraSign().guardian.index,
                Uint8Array.from(Buffer.from(signatureData[0], "hex")),
                Uint8Array.from(Buffer.from(signatureData[1], "hex")),
                undefined,
                wait
            )
        }catch (e){
            console.log(e)
        }
    }
}

const signServiceContinues = () => {
    console.log("new signing tick")
    signService().then(() => {
        let timeout = config.timeout - config.sendTxTimeout;
        timeout += Math.floor(Math.random() * 2 * config.sendTxTimeout);
        setTimeout(() => signServiceContinues(), timeout);
    });
}

export {
    signMsg,
    signServiceContinues,
    signService
}
