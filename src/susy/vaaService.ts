import VAA from "../models/models"
import ApiNetwork from "../network/api";
import * as wasm from 'ergo-lib-wasm-nodejs'
import * as Utils from '../utils/decodeEncode'
import { verify } from "../utils/ecdsa";
import config from "../config/conf";
import {strToUint8Array} from "../utils/decodeEncode";
import {issueVAA} from "./transaction";

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
    let vaaSourceBox = wasm.ErgoBox.from_json(await ApiNetwork.getVAABoxes().then(res => {
        for (const box of res) {
            if (box.address == config.vaaSourceBoxAddress && box.value > 2 * config.fee) {
                for (const token of box.assets) {
                    if (token.tokenId == config.token.VAAT && token.value > 1) return box
                }
            }
        }
        throw new Error("[-] No VAA Source Box found")
    }))

    if (!verifyVAASignatures(msg, guardianBoxJson)) {
        console.log("[-] verify signature failed")
        return false
    }
    let wormholeBox = wasm.ErgoBox.from_json(await ApiNetwork.trackMempool(ApiNetwork.getBankBox(), 1))
    const VAAMessage={
        "signatures":["123", "321", "456", "654", "789", "987"],
        "observation":strToUint8Array("observation msg"),
        "payload":vaa.payload.bytes,
    };
    console.log(await issueVAA(vaaSourceBox, VAAMessage, config.address));
    // TODO: import issueVAABox properly
    // issueVAABox(vaa)


    return true
}
