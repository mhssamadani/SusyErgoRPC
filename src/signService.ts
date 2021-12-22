import VAA from "./models/models"
import config from "./config/conf.json";
import ApiNetwork from "./network/api";
import { TextEncoder } from "util";

var ecurve = require('ecurve')
var BigInteger = require('bigi')
const { blake2b } = require("ethereum-cryptography/blake2b")

function checkSign(box: any): boolean {
    let checkpoint = box.additionalRegisters.R7.renderedValue.slice(1).split(",")[0]
    if ((checkpoint & Math.pow(2, config.guardian.index)) > 0) return true
    return false
}

function signMsg(msg: Uint8Array, sk: string) {
    while (true) {
        let r = BigInteger.fromHex("c7065537c8a4473c24f66efef51cdd7e07f0c767db10ae20a3df025bcb551753") // TODO: This should be csprn
        let ecparams = ecurve.getCurveByName('secp256k1')
        let a = ecparams.G.multiply(r)
        let msgHash = blake2b(msg, 32).toString('hex') // TODO: Result is different from scala Blake2b256 hash
        let z: any = r.add(BigInteger.fromHex(sk).multiply(BigInteger.fromHex(msgHash))).remainder(ecparams.n)
        if (z.bitCount() < 256) {
            return (a.getEncoded().toString('hex'), z.toString(16))
        }
    }
}

function signVAABox(box: any) {
    // TODO: get observation and paylaod from box

    // TODO: get privateKey fron config file and convert it to Bigint for signMsg function argument

    // TODO: sign data with signMsg function

    // TODO: create signedBox
}

console.log("[*] sign service started...")

var enc = new TextEncoder()
let msg = enc.encode("s".repeat(50))
let secret = "17b42abec839188f816f2b0c39be2a401bb05a0a152db37e87f76bb5ae38f6db"
console.log(signMsg(msg, secret))


// loop this procedure (e.g. once in 3 minutes)
// get vaa boxes from network

// TODO: how await for this function ? 
//      or how we await for axios request without making this function async ?
/*ApiNetwork.getVAABoxes().then(vaaBoxes => {
    vaaBoxes.array.forEach((box: any) => {
        if (checkSign(box)) return
    
        let lastBox = ApiNetwork.trackMempool(box)
    
        if (checkSign(lastBox)) return
    
        let newVAABox = signVAABox(lastBox)
    
        // TODO: generate and send the transaction
    });
})*/


console.log("[+] sign service done...")
