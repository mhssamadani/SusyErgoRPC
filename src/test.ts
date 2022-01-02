import setupRPC from "./network/rpc"
import config from "./config/conf";
import signService, {signMsg} from "./susy/signService";
import * as wasm from 'ergo-lib-wasm-nodejs'
import {Boxes} from "./susy/boxes";
import {getSecret} from "./susy/init/util";
import ApiNetwork from "./network/api";
import {generateVaa} from "./susy/init";
import {issueVAA, updateVAABox} from "./susy/transaction";
import {VAA, registerChainPayload, transferPayload, updateGuardianPayload} from "./models/models";
import * as codec from "./utils/codec";

const inputBoxes = wasm.ErgoBoxes.from_boxes_json([JSON.stringify({
    "boxId": "da7c86513d48f5081825effbec947f36c4f201abb49a1d0863f427dc4ffa750a",
    "transactionId": "c427c64f8934fce495417ea5e36d2655d7e85ed9d3a6627eff038d577932d4e2",
    "blockId": "8fa4a885c6a0a331d40c11497ed4fde9920752dedf2f7d079784955f95b72af7",
    "value": 3978000000,
    "index": 1,
    "globalIndex": 251545,
    "creationHeight": 0,
    "settlementHeight": 109673,
    "ergoTree": "0008cd02aae3107235e1eebb54a87fbd34d0656ef20e871c3568090b63302e6767720d0f",
    "address": "9fpKbN9rDg5pSjrfNPZQWZpQxWfv2QeQK7wwYtPdbPsxMMFe7Eq",
    "assets": [{
        "tokenId": "cadeadd7f480be7725cab8bf3254e8fd3e60a878dc89094aeb5b3fc7999f6f80",
        "index": 0,
        "amount": 999,
        "name": "Guardian Token",
        "decimals": 0,
        "type": "EIP-004"
    }, {
        "tokenId": "4662cfff004341503d24338bf8b24f90f3c660e0a1378292832e31419a2486d0",
        "index": 1,
        "amount": 9999,
        "name": "Bank Identifier",
        "decimals": 0,
        "type": "EIP-004"
    }, {
        "tokenId": "466d0a2ce63bce0fafce842ef249f9cb56a574716f653206589b918240a886c4",
        "index": 2,
        "amount": 1,
        "name": "register NFT",
        "decimals": 0,
        "type": "EIP-004"
    }, {
        "tokenId": "96ea478bb2f03b20c1ffff2ebea302880c55746ec0f52d6aeb4fe1d75a780374",
        "index": 3,
        "amount": 1,
        "name": "Guardian NFT",
        "decimals": 0,
        "type": "EIP-004"
    }, {
        "tokenId": "6bb7e2a6245cea46acd5ea363389c274444903210a1d51aeac3c879ba92f2a24",
        "index": 4,
        "amount": 9997,
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
    if (!ctx) {
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
    const secret = getSecret()
    console.log(secret.get_address().to_base58(config.networkType))
    sks.add(secret);
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
    const tx = await issueVAA(inputBoxes, new VAA(tou8(Buffer.from(vaa, "hex")), 'transfer'), config.initializer.address)
    return tx.outputs().get(0)
}

const test_update_vaa = async () => {
    const tokenId = "803935d89d5e33acc6e24bbb835212ee3997abbc7f756ccc37a07258fb7b9fd3"
    const vaaBytesHex = await generateVaa(tokenId)
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

// TODO: should change to testcase
const test_payloads = () => {
    const transferString = "00000000000000007800000000000000000000000000000000000000000000000037d3f4eeb9ba3e4f860f21c634d9a77e05294736cf399051d25f3b2cef30496100020102764ea2b0b9b06b5730a4257bba71fd7797eb1ec12bc3ae6025a01d7fba53830e229592eb00030000000000000005000000000000000000000000000000000000000000000000"
    const transferBytes = Buffer.from(transferString, 'hex')

    const transfer = new transferPayload(transferBytes)
    if (transfer.toHex() !== transferString) console.log("[-] transferPayload test failed")

    const registerChainString = "000000000000000000000000000000000000000000546f6b656e42726964676501000000080102030400000000000000000000000000000000000000000000000000000000"
    const registerChainBytes = Buffer.from(registerChainString, 'hex')

    const registerChain = new registerChainPayload(registerChainBytes)
    if (registerChain.toHex() !== registerChainString) console.log("[-] registerChainPayload test failed")

    const updateGuardianString = "000000000000000000000000000000000000000000546f6b656e427269646765320003000000013602992ac27c178c07371da6c9d623d05174e2fae90cc656346e9edf5a5a5c76f202a5a670080865606db7b6fe14d238589a875b9cf810e55e9247b68a0dbb0d18036c6c34d1dcda1d0d5d855ade5ff4f66734be43458ae2ab3c902526b81712d6036c6c34d1dcda1d0d5d855ade5ff4f66734be43458ae2ab3c902526b81712d602a5a670080865606db7b6fe14d238589a875b9cf810e55e9247b68a0dbb0d18036c6c34d1dcda1d0d5d855ade5ff4f66734be43458ae2ab3c902526b81712d6"
    const updateGuardianBytes = Buffer.from(updateGuardianString, 'hex')

    const updateGuardian = new updateGuardianPayload(updateGuardianBytes)
    if (updateGuardian.toHex() !== updateGuardianString) console.log("[-] updateGuardianPayload test failed")
}

test_update_vaa().then(() => null)

// test_payloads()
