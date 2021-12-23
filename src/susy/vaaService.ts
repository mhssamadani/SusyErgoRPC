import VAA from "../models/models"
import ApiNetwork from "../network/api";
import * as Utils from '../utils/decodeEncode'
import { verify } from "../utils/ecdsa";

export function verifyVAASignatures(vaa: any, guardianBox: any): boolean {
    let signatures = vaa.Signatures
    let guardianAddresses = Utils.getGuardianAddresses(guardianBox)
    let vaaData = vaa.hexData()

    for (const sign of signatures) {
        if (!verify(vaaData, sign.toHex(), guardianAddresses[sign.index])) return false
    }
    return true
}

export default async function processVAA(vaaBytes: Uint8Array) {
    let vaa = new VAA(vaaBytes)
    let msg = vaa.hexData()

    let guardianBoxJson = await ApiNetwork.getGuardianBox()

    if (!verifyVAASignatures(msg, guardianBoxJson)) {
        console.log("[-] verify signature failed")
        return false
    }

    // TODO: import issueVAABox properly
    // issueVAABox(vaa)

    return true
}
