import * as Models from "../models/models"
import config from "../config/conf.json";
import ApiNetwork from "../network/api";
import { TextEncoder } from "util";
import * as wasm from 'ergo-lib-wasm-nodejs'
import * as Utils from '../utils/decodeEncode'
import { verifyBoxSignatures } from "../utils/ecdsa";

var ecurve = require('ecurve')
var BigInteger = require('bigi')
const { blake2b } = require("ethereum-cryptography/blake2b")
var secureRandom = require('secure-random')

function rand() {
    let r = secureRandom.randomBuffer(32)
    return BigInteger.fromHex(r.toString('hex'))
}

function checkSign(box: any): boolean {
    let checkpoint = box.additionalRegisters.R7.renderedValue.slice(1).split(",")[0]
    if ((checkpoint & Math.pow(2, config.guardian.index)) > 0) return true
    return false
}

function signMsg(msg: Uint8Array, sk: string) {
    while (true) {
        let r = rand()
        let ecparams = ecurve.getCurveByName('secp256k1')
        let a = ecparams.G.multiply(r)
        let msgHash = blake2b(msg, 32).toString('hex')
        let z: any = r.add(BigInteger.fromHex(sk).multiply(BigInteger.fromHex(msgHash))).remainder(ecparams.n)
        if (z.bitCount() < 256) {
            return (a.getEncoded().toString('hex'), z.toString(16))
        }
    }
}

export default async function signSerivce() {
    // loop this procedure (e.g. once in 3 minutes)

    let vaaBoxes = await ApiNetwork.getVAABoxes()
    for (const box of vaaBoxes.array) {
        if (checkSign(box)) continue
    
        let lastBox = await ApiNetwork.trackMempool(box, 1)
    
        if (checkSign(lastBox)) continue

        let guardianBoxJson = await ApiNetwork.getGuardianBox()

        if (!verifyBoxSignatures(lastBox, guardianBoxJson)) continue
    
        let msg = Utils.strToUint8Array(Utils.getVAADataFromBox(lastBox))
        let signatureData = signMsg(msg, config.guardian.privateKey)
    
        let wormholeBox = wasm.ErgoBox.from_json(await ApiNetwork.trackMempool(ApiNetwork.getWormholeBox(), 1))
        let sponsorBox = wasm.ErgoBox.from_json(await ApiNetwork.trackMempool(ApiNetwork.getSponsorBox(), 1))
        let guardianBox = wasm.ErgoBox.from_json(guardianBoxJson)

        // TODO: import updateVAABox properly
        updateVAABox(wormholeBox, box, sponsorBox, guardianBox, config.guardian.index, signatureData[0], signatureData[1])
    }
}
