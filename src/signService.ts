import VAA from "./models/models"
import config from "./config/conf.json";
import ApiNetwork from "./network/api";

var ecurve = require('ecurve')
const { blake2b } = require("ethereum-cryptography/blake2b")

function checkSign(box: any): boolean {
    let checkpoint = box.additionalRegisters.R7.renderedValue.slice(1).split(",")[0]
    if ((checkpoint & Math.pow(2, config.guardian.index)) > 0) return true
    return false
}

// TODO: this fucntion implemented correct ?
function signMsg(msg: Uint8Array, sk: number) {
    while (true) {
        let r = 1000000000000000000000 // TODO: This should be csprn
        let ecparams = ecurve.getCurveByName('secp256k1')
        let a = ecparams.G.multiply(r)
        let z = (r + sk * parseInt(blake2b(msg), 16)) % ecparams.n
        if (z.toString(2).length < 256) return (a.getEncoded().toString('hex'), z.toString(16))
    }
}

function signVAABox(box: any) {
    // TODO: get observation and paylaod from box

    // TODO: get privateKey fron config file and convert it to Bigint for signMsg function argument

    // TODO: sign data with signMsg function

    // TODO: create signedBox
}

console.log("[*] sign service started...")

// loop this procedure (e.g. once in 3 minutes)
// get vaa boxes from network

// TODO: how await for this function ? 
//      or how we await for axios request without making this function async ?
let vaaBoxes = await ApiNetwork.getVAABoxes()

vaaBoxes.array.forEach((box: any) => {
    if (checkSign(box)) return

    let lastBox = ApiNetwork.trackMempool(box)

    if (checkSign(lastBox)) return

    let newVAABox = signVAABox(lastBox)

    // TODO: generate and send the transaction
});

console.log("[+] sign service done...")
