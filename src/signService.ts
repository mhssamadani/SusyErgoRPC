import * as Models from "./models/models"
import config from "./config/conf.json";
import ApiNetwork from "./network/api";
import { TextEncoder } from "util";

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
        let msgHash = blake2b(msg, 32).toString('hex') // TODO: Result is different from scala Blake2b256 hash
        let z: any = r.add(BigInteger.fromHex(sk).multiply(BigInteger.fromHex(msgHash))).remainder(ecparams.n)
        if (z.bitCount() < 256) {
            return (a.getEncoded().toString('hex'), z.toString(16))
        }
    }
}

console.log("[*] sign service started...")

// loop this procedure (e.g. once in 3 minutes)

/* TODO: Uncomment this section
ApiNetwork.getVAABoxes().then(vaaBoxes => {
    vaaBoxes.array.forEach((box: any) => {
        if (checkSign(box)) return
    
        let lastBox = ApiNetwork.trackMempool(box, 1)
    
        if (checkSign(lastBox)) return
    
        let msg = Models.getVAADataFromBox(lastBox)
        let signatureData = signMsg(msg, config.guardian.privateKey)
    
        // TODO: generate and send the transaction
    });
})
*/

console.log("[+] sign service done...")
