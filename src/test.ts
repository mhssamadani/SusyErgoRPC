import setupRPC from "./network/rpc"
import config from "./config/conf";
import signService, {signMsg} from "./susy/signService";
import * as wasm from 'ergo-lib-wasm-nodejs'
import {Boxes} from "./susy/boxes";
import {getSecret} from "./susy/init/util";
import ApiNetwork from "./network/api";
import guardianBox from "./susy/init/guardianBox";
import {generateVaa} from "./susy/init";
import {issueVAA, updateVAABox} from "./susy/transaction";
import { VAA, registerChainPayload, transferPayload, updateGuardianPayload } from "./models/models";
import * as codec from "./utils/codec";

const inputBoxes = wasm.ErgoBoxes.from_boxes_json([JSON.stringify({
    "boxId": "332a628eb197d6fc59c3c6e7dbdd309ddb53d1f7350c68e2c7e456b2509640a7",
    "transactionId": "fdf50e567d4f54699e7001695fee8e7ab34679389a5ab385fd7293961358c4d7",
    "blockId": "6c6364da5ae5611c215131d7a6c19d67dd8eddf4130277ab057e3c7e88c5a249",
    "value": 3982400000,
    "index": 1,
    "globalIndex": 243448,
    "creationHeight": 0,
    "settlementHeight": 105804,
    "ergoTree": "0008cd0331685f7477bd338f5ae97c492c4e1746c22c21b126b506e64e9e9bee14f07e65",
    "address": "9gqZkAPjFQ3kn2dFMu3FaSvbZ4j2Ph51qSHzyXt6vMwjthYDpoM",
    "assets": [{
        "tokenId": "df5d4bd170dc6f1fb6287593d90c927b70f6914e881009916feb87f4a5ba2cb8",
        "index": 0,
        "amount": 999,
        "name": "Guardian Token",
        "decimals": 0,
        "type": "EIP-004"
    }, {
        "tokenId": "5d7744e9c83dc9914297b5fd0d6cd4e2cc3505fa807b5f9d4069e19641d37b2d",
        "index": 1,
        "amount": 9999,
        "name": "Bank Identifier",
        "decimals": 0,
        "type": "EIP-004"
    }, {
        "tokenId": "80bcc185786d9e75819224275011bab8d219d9bbe2767371e38eced385df6e5a",
        "index": 2,
        "amount": 1,
        "name": "register NFT",
        "decimals": 0,
        "type": "EIP-004"
    }, {
        "tokenId": "afcf07e5d6d1300ecc7054e51b4b64e962ad4bde79f3fdec6abcfcd971d0115b",
        "index": 3,
        "amount": 1,
        "name": "Guardian NFT",
        "decimals": 0,
        "type": "EIP-004"
    }, {
        "tokenId": "c985cf8865c6f42dc34bc6e9b021916e603e7654844bf32fbd74597a8a456733",
        "index": 4,
        "amount": 9999,
        "name": "VAA Identifier",
        "decimals": 0,
        "type": "EIP-004"
    }],
    "additionalRegisters": {},
    "spentTransactionId": null,
    "mainChain": true
})])
const fee = wasm.BoxValue.from_i64(wasm.I64.from_str(config.fee.toString()))
let ctx: wasm.ErgoStateContext | null = null
const emptyBoxes = wasm.ErgoBoxes.from_boxes_json([])

const getCtx = async () => {
    if(!ctx){
        ctx = await ApiNetwork.getErgoStateContext();
    }
    return ctx!
}

const fakeBox = async (candidate: wasm.ErgoBoxCandidate) => {
    const boxSelection = new wasm.BoxSelection(inputBoxes, new wasm.ErgoBoxAssetsDataList());
    const txOutput = new wasm.ErgoBoxCandidates(candidate);
    const builder = wasm.TxBuilder.new(
        boxSelection,
        txOutput,
        0,
        fee,
        getSecret().get_address(),
        wasm.BoxValue.SAFE_USER_MIN()
    )
    const sks = new wasm.SecretKeys();
    sks.add(getSecret());
    const wallet = wasm.Wallet.from_secrets(sks);
    const signedTx = wallet.sign_transaction(await getCtx(), builder.build(), inputBoxes, emptyBoxes);
    return signedTx.outputs().get(0)
}

const fakeWormhole = async () => {
    const wormhole = await Boxes.getWormholeBox()
    return fakeBox(wormhole)
}

const fakeSponsor = async () => {
    const sponsor = await Boxes.getSponsorBox(1e9)
    return fakeBox(sponsor)
}

const fakeGuardian = async () => {
    const guardian = await Boxes.getGuardianBox(1)
    return fakeBox(guardian)
}

const fakeVAA = async (vaa: string) => {
    const tou8 = require('buffer-to-uint8array');
    const txJson = await issueVAA(inputBoxes, new VAA(tou8(Buffer.from(vaa, "hex"))), config.initializer.address)
    const tx = wasm.Transaction.from_json(txJson)
    return tx.outputs().get(0)
}

const test_update_vaa = async () => {
    const vaaBytesHex = await generateVaa()
    const wormholeBox = await fakeWormhole()
    const vaaBox = await fakeVAA(vaaBytesHex)
    let msg = codec.strToUint8Array(codec.getVAADataFromBox(vaaBox))
    let signatureData = signMsg(msg, config.guardian.privateKey)
    const sponsorBox = await fakeSponsor()
    const guardianBox = await fakeGuardian()
    await updateVAABox(
        wormholeBox,
        vaaBox,
        sponsorBox,
        guardianBox,
        config.guardian.index,
        Uint8Array.from(Buffer.from(signatureData[0], "hex")),
        Uint8Array.from(Buffer.from(signatureData[1], "hex")),
    )
}

const test_payloads = () => {
    let registerChainString = "000000000000000000000000000000000000000000546f6b656e42726964676501000000080102030400000000000000000000000000000000000000000000000000000000"
    let registerChainBytes = Buffer.from(registerChainString, 'hex')
    
    let registerChain = new registerChainPayload(registerChainBytes)
    if (registerChain.toString() !== registerChainString) console.log("[-] registerChainPayload test failed")

    let transferString = "00000000000000007800000000000000000000000000000000000000000000000037d3f4eeb9ba3e4f860f21c634d9a77e05294736cf399051d25f3b2cef30496100020102764ea2b0b9b06b5730a4257bba71fd7797eb1ec12bc3ae6025a01d7fba53830e229592eb00030000000000000005000000000000000000000000000000000000000000000000"
    let transferBytes = Buffer.from(transferString, 'hex')
    
    let transfer = new transferPayload(transferBytes)
    if (transfer.toString() !== transferString) console.log("[-] transferPayload test failed")

    let updateGuardianString = "000000000000000000000000000000000000000000546f6b656e427269646765320003000000013602992ac27c178c07371da6c9d623d05174e2fae90cc656346e9edf5a5a5c76f202a5a670080865606db7b6fe14d238589a875b9cf810e55e9247b68a0dbb0d18036c6c34d1dcda1d0d5d855ade5ff4f66734be43458ae2ab3c902526b81712d6036c6c34d1dcda1d0d5d855ade5ff4f66734be43458ae2ab3c902526b81712d602a5a670080865606db7b6fe14d238589a875b9cf810e55e9247b68a0dbb0d18036c6c34d1dcda1d0d5d855ade5ff4f66734be43458ae2ab3c902526b81712d6"
    let updateGuardianBytes = Buffer.from(updateGuardianString, 'hex')
    
    let updateGuardian = new updateGuardianPayload(updateGuardianBytes)
    if (updateGuardian.toString() !== updateGuardianString) console.log("[-] updateGuardianPayload test failed")
}

test_update_vaa().then(() => null)
