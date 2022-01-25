import { VAA, WormholeSignature } from "../models/models"
import ApiNetwork from "../network/api";
import * as wasm from 'ergo-lib-wasm-nodejs'
import { verify } from "../utils/ecdsa";
import config from "../config/conf";
import { IssueVAA } from "./transaction";
import { sendAndWaitTx } from "./init/util";
import { GuardianBox, VAABox } from "../models/boxes";
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

const processVaaMessage = async (vaa: VAA, vaaContract: wasm.Contract, wait: boolean) => {
    const vaaAddress = wasm.Address.recreate_from_ergo_tree(vaaContract.ergo_tree()).to_base58(config.networkType)
    const guardianBox: GuardianBox = await ApiNetwork.getGuardianBox(vaa.getGuardianSetIndex())
    if (!verifyVAASignatures(vaa, guardianBox)) {
        console.log("[-] verify signature failed")
        return false
    }
    const boxes = await ApiNetwork.getCoveringErgoAndTokenForAddress(
        vaaContract.ergo_tree().to_base16_bytes(),
        config.fee * 3,
        {[config.token.VAAT]: 1}
    )
    const register = await ApiNetwork.getRegisterBox();
    if (!boxes.covered) {
        console.log("[-] insufficient box found to issue new vaa")
        return false
    }
    const ergoBoxes: wasm.ErgoBoxes = new wasm.ErgoBoxes(boxes.boxes[0])
    boxes.boxes.slice(1).map(box => ergoBoxes.add(box))
    if (wait) {
        await sendAndWaitTx(await IssueVAA(ergoBoxes, vaa, vaaAddress, register, vaaContract))
    } else {
        await ApiNetwork.sendTx((await IssueVAA(ergoBoxes, vaa, vaaAddress, register, vaaContract)).to_json);
    }
}

const processVAA = async (vaaBytes: Uint8Array, wait: boolean = false) => {
    const vaaContract = await Contracts.generateVAAContract()
    const vaa: VAA = new VAA(vaaBytes, 'transfer')
    return processVaaMessage(vaa, vaaContract, wait)
}

const processRegisterVaa = async (vaaBytes: Uint8Array, wait: boolean = false) => {
    const vaaContract = await Contracts.generateRegisterVAAContract();
    const vaa: VAA = new VAA(vaaBytes, 'register_chain');
    return processVaaMessage(vaa, vaaContract, wait);
}

const processGuardianVaa = async (vaaBytes: Uint8Array, wait: boolean = false) => {
    const vaaContract = await Contracts.generateGuardianVAAContract();
    const vaa: VAA = new VAA(vaaBytes, 'update_guardian');
    return processVaaMessage(vaa, vaaContract, wait);
}

export {
    verifyVAASignatures,
    processRegisterVaa,
    processGuardianVaa,
    processVAA,
}
