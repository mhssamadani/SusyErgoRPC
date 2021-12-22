import * as Models from "./models/models"
import config from "./config/conf.json";
import ApiNetwork from "./network/api";
import { TextEncoder } from "util";

var ecurve = require('ecurve')
var BigInteger = require('bigi')
const blake2 = require("blake2")
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

function blake2bHash(msg: Uint8Array) {
    var h = blake2.createHash('blake2b', {digestLength: 32})
    h.update(msg)
    return h.digest("hex")
}

function signMsg(msg: Uint8Array, sk: string) {
    while (true) {
        //let r = rand()
        let r = BigInteger.fromHex("c7065537c8a4473c24f66efef51cdd7e07f0c767db10ae20a3df025bcb551753")
        let ecparams = ecurve.getCurveByName('secp256k1')
        let a = ecparams.G.multiply(r)
        let msgHash = blake2bHash(msg)
        console.log(`msgHash: ${msgHash}`)
        console.log(`msgHash bigint: ${BigInteger.fromHex(msgHash).toString(16)}`)
        let z: any = r.add(BigInteger.fromHex(sk).multiply(BigInteger.fromHex(msgHash))).remainder(ecparams.n)
        if (z.bitCount() < 256) {
            return (a.getEncoded().toString('hex'), z.toString(16))
        }
    }
}

console.log("[*] sign service started...")

// TODO: remove this (this is for test) =====================
var enc = new TextEncoder()
let msg = enc.encode("s".repeat(50))
let secret = "17b42abec839188f816f2b0c39be2a401bb05a0a152db37e87f76bb5ae38f6db"
console.log(signMsg(msg, secret))
// ==========================================================


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
