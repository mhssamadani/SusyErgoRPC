import { VAA } from "../models/models"
import ApiNetwork from "../network/api";
import * as wasm from 'ergo-lib-wasm-nodejs'
import * as Utils from '../utils/codec'
import {verify} from "../utils/ecdsa";
import config from "../config/conf";
import {issueVAA} from "./transaction";

export function verifyVAASignatures(vaa: VAA, guardianBox: any): boolean {
    let signatures = vaa.getSignatures()
    let guardianAddresses = Utils.getGuardianAddresses(guardianBox)
    let vaaData = vaa.hexData()
    let verified: number = 0
    for (const sign of signatures) {
        if (verify(vaaData, sign.toHex(), guardianAddresses[sign.getIndex()])) verified += 1
    }
    return verified >= 4;
}

export default async function processVAA(vaaBytes: Uint8Array) {
    let vaa = new VAA(vaaBytes, 'transfer')
    let guardianBoxJson = await ApiNetwork.getGuardianBox(vaa.getGuardianSetIndex())
    if (!verifyVAASignatures(vaa, guardianBoxJson)) {
        console.log("[-] verify signature failed")
        return false
    }
    const boxes = await ApiNetwork.getCoveringErgoAndTokenForAddress(
        wasm.Address.from_base58(config.vaaSourceBoxAddress).to_ergo_tree().to_base16_bytes(),
        config.fee * 3,
        {[config.token.VAAT]: 1}
    )
    if(!boxes.covered){
        throw new Error("[-] insufficient box found to issue new vaa")
    }
    const ergoBoxes = wasm.ErgoBoxes.from_boxes_json(boxes.boxes.map(box => JSON.stringify(box)))
    await ApiNetwork.sendTx((await issueVAA(ergoBoxes, vaa, config.vaaSourceBoxAddress)));
    return true
}
