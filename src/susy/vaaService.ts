import { VAA, WormholeSignature } from "../models/models"
import ApiNetwork from "../network/api";
import * as wasm from 'ergo-lib-wasm-nodejs'
import * as Utils from '../utils/codec'
import {verify} from "../utils/ecdsa";
import config from "../config/conf";
import {IssueVAA} from "./transaction";
import {sendAndWaitTx} from "./init/util";
import { GuardianBox } from "../models/boxes";
import Contracts from "./contracts";

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
    const vaaContract = await Contracts.generateVaaCreatorContract()
    const vaaAddress = wasm.Address.recreate_from_ergo_tree(vaaContract.ergo_tree()).to_base58(config.networkType)
    const vaa: VAA = new VAA(vaaBytes, 'transfer')
    const guardianBox: GuardianBox = await ApiNetwork.getGuardianBox(vaa.getGuardianSetIndex())
    if (!verifyVAASignatures(vaa, guardianBox)) {
        console.log("[-] verify signature failed")
        return false
    }
    // TODO: what is type of this variable ?
    const boxes = await ApiNetwork.getCoveringErgoAndTokenForAddress(
        vaaContract.ergo_tree().to_base16_bytes(),
        config.fee * 3,
        {[config.token.VAAT]: 1}
    )
    const register = await ApiNetwork.getRegisterBox();
    if(!boxes.covered){
        throw new Error("[-] insufficient box found to issue new vaa")
    }
    const ergoBoxes: wasm.ErgoBoxes = new wasm.ErgoBoxes(boxes.boxes[0])
    boxes.boxes.slice(1).map(box => ergoBoxes.add(box))
    if(wait){
        await sendAndWaitTx(await IssueVAA(ergoBoxes, vaa, vaaAddress, register, await Contracts.generateVAAContract()))
    }else {
        await ApiNetwork.sendTx((await IssueVAA(ergoBoxes, vaa, vaaAddress, register, await Contracts.generateVAAContract())).to_json);
    }
    return true
}

const processRegisterChain = async (vaaBytes: Uint8Array, wait: boolean = false) => {
    const vaaContract = Contracts.generateRegisterVAAContract()
    const vaa: VAA = new VAA(vaaBytes, 'register_chain')
}

export default processVAA;
export { verifyVAASignatures }
