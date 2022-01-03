import { VAA, WormholeSignature } from "../models/models"
import ApiNetwork from "../network/api";
import * as wasm from 'ergo-lib-wasm-nodejs'
import * as Utils from '../utils/codec'
import {verify} from "../utils/ecdsa";
import config from "../config/conf";
import {issueVAA} from "./transaction";
import {sendAndWaitTx} from "./init/util";
import { GuardianBox } from "../models/boxes";

const verifyVAASignatures = (vaa: VAA, guardianBox: GuardianBox): boolean => {
    const signatures: Array<WormholeSignature> = vaa.getSignatures()
    const guardianAddresses: Array<string> = guardianBox.getWormholeAddresses()
    const vaaData: string = vaa.hexData()
    let verified: number = 0
    for (const sign of signatures) {
        if (verify(vaaData, sign.getSignatureHexData(), guardianAddresses[sign.getIndex()])) verified += 1
    }
    return verified >= 4;
}

const processVAA = async (vaaBytes: Uint8Array, wait: boolean = false) => {
    const vaa: VAA = new VAA(vaaBytes, 'transfer')
    const guardianBox: GuardianBox = await ApiNetwork.getGuardianBox(vaa.getGuardianSetIndex())
    if (!verifyVAASignatures(vaa, guardianBox)) {
        console.log("[-] verify signature failed")
        return false
    }
    // TODO: what is type of this variable ?
    const boxes = await ApiNetwork.getCoveringErgoAndTokenForAddress(
        wasm.Address.from_base58(config.vaaSourceBoxAddress).to_ergo_tree().to_base16_bytes(),
        config.fee * 3,
        {[config.token.VAAT]: 1}
    )
    if(!boxes.covered){
        throw new Error("[-] insufficient box found to issue new vaa")
    }
    const ergoBoxes: wasm.ErgoBoxes = wasm.ErgoBoxes.from_boxes_json(boxes.boxes.map(box => JSON.stringify(box)))
    if(wait){
        await sendAndWaitTx(await issueVAA(ergoBoxes, vaa, config.vaaSourceBoxAddress))
    }else {
        await ApiNetwork.sendTx((await issueVAA(ergoBoxes, vaa, config.vaaSourceBoxAddress)).to_json);
    }
    return true
}

export default processVAA;
export { verifyVAASignatures }
