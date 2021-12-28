import config from "../config/conf";
import ApiNetwork from "../network/api";
import * as wasm from 'ergo-lib-wasm-nodejs'
import * as codec from '../utils/codec'
import { verify } from "../utils/ecdsa";
import {updateVAABox} from "./transaction";
import BigInteger from 'bigi';

const ecurve = require('ecurve')
const { blake2b } = require("ethereum-cryptography/blake2b")
const secureRandom = require('secure-random')

const rand = (): BigInteger =>  {
    let r = secureRandom.randomBuffer(32)
    return BigInteger.fromHex(r.toString('hex'))
}

function checkSign(box: any): boolean {
    let checkpoint = JSON.parse(box.additionalRegisters.R7.renderedValue)[0]
    if ((checkpoint & Math.pow(2, config.guardian.index)) > 0) return true
    return false
}

export function signMsg(msg: Uint8Array, sk: string) {
    const maxBigInt = BigInteger.fromHex("7FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF")
    // const maxBigInt = BigInteger.fromHex("1ee194860333e2bc66c86840d051be002b851655c04d824e2dfa8ff02c0524e2")
    while (true) {
        let r = rand()
        let ecParams = ecurve.getCurveByName('secp256k1')
        let a = ecParams.G.multiply(r)
        let msgHash = blake2b(msg, 32).toString('hex')
        let z: BigInteger = r.add(BigInteger.fromHex(sk).multiply(BigInteger.fromHex(msgHash))).remainder(ecParams.n)
        const zHex = z.toHex();
        console.log(z.toString(), z.toString(16), a.getEncoded().toString('hex'))
        if (zHex.length < 64 || (zHex.length == 64 && Number(zHex[0]) <= 7)) {
            return [a.getEncoded().toString('hex'), z.toString(16)]
        }
    }
}

function verifyBoxSignatures(box: wasm.ErgoBox, guardianBox: any): boolean {
    let signatures = codec.getBoxSignatures(box)
    let guardianAddresses = codec.getGuardianAddresses(guardianBox)
    let vaaData = codec.getVAADataFromBox(box)
    return verify(vaaData, signatures[config.guardian.index].toHex(), guardianAddresses[config.guardian.index])
}

export default async function signService() {
    // loop this procedure (e.g. once in 3 minutes)

    let vaaBoxes = await ApiNetwork.getVAABoxes()
    for (const box of vaaBoxes) {
        if (checkSign(box)) continue

        let lastBox = await ApiNetwork.trackMemPool(box, 1)

        if (checkSign(lastBox)) continue

        let guardianBoxJson = await ApiNetwork.getGuardianBox(0)
        if (!verifyBoxSignatures(wasm.ErgoBox.from_json(JSON.stringify(lastBox)), guardianBoxJson)) continue

        let msg = codec.strToUint8Array(codec.getVAADataFromBox(wasm.ErgoBox.from_json(JSON.stringify(lastBox))))
        let signatureData = signMsg(msg, config.guardian.privateKey)

        let wormholeBox = wasm.ErgoBox.from_json(JSON.stringify(await ApiNetwork.getWormholeBox()))
        let sponsorBox = wasm.ErgoBox.from_json(JSON.stringify(await ApiNetwork.getSponsorBox()))
        let guardianBox = wasm.ErgoBox.from_json(JSON.stringify(guardianBoxJson))
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
        )
    }
}
