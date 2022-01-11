import * as wasm from 'ergo-lib-wasm-nodejs'
import ApiNetwork from "../../network/api";
import config from "../../config/conf";
import Contracts from "../contracts";
import createGuardianBox from "./guardianBox";
import {createAndSignTx, fetchBoxesAndIssueToken, getSecret, sendAndWaitTx} from "./util";
import {wormhole} from "../../config/keys";
import {sign} from "../../utils/ecdsa";
import * as codec from '../../utils/codec';
import {Boxes} from "../boxes";
import fs from 'fs';
import processVAA from "../vaaService";
import signService from "../signService";
import {strToUint8Array} from "../../utils/codec";

const issueBankIdentifier = async (secret: wasm.SecretKey) => {
    return await fetchBoxesAndIssueToken(secret, 10000, "Bank Identifier", "Wormhole Bank Boxes Identifier", 0)
}

const issueVaaIdentifier = async (secret: wasm.SecretKey) => {
    return await fetchBoxesAndIssueToken(secret, 10000, "VAA Identifier", "VAA Boxes Identifier", 0)
}

const issueWormHoleNFT = async (secret: wasm.SecretKey) => {
    return await fetchBoxesAndIssueToken(secret, 1, "Wormhole NFT", "Wormhole Contract NFT", 0)
}

const issueGuardianNFT = async (secret: wasm.SecretKey) => {
    return await fetchBoxesAndIssueToken(secret, 1, "Guardian NFT", "Guardian repo NFT", 0)
}

const issueRegisterNFT = async (secret: wasm.SecretKey) => {
    return await fetchBoxesAndIssueToken(secret, 1, "register NFT", "register new chain nft", 0)
}

const issueGuardianToken = async (secret: wasm.SecretKey) => {
    return await fetchBoxesAndIssueToken(secret, 1000, "Guardian Token", "Guardian repo Token", 0)
}

const createVaaCreatorBox = async () => {
    const height = await ApiNetwork.getHeight();
    const secret = getSecret()
    let res = await ApiNetwork.getBoxWithToken(config.token.VAAT, 0, 1)
    const total = res.total
    let offset = 0;
    let selectedBoxes: Array<wasm.ErgoBox> = []
    let ids: Array<string> = []
    const processSingleBox = (box: wasm.ErgoBox) => {
        if (ids.indexOf(box.box_id().to_str()) == -1) {
            selectedBoxes.push(box);
            ids.push(box.box_id().to_str())
        }
    }
    while (offset < total) {
        (await ApiNetwork.getBoxWithToken(config.token.VAAT, offset, 100)).boxes.forEach(processSingleBox)
    }
    const ergBoxes = await ApiNetwork.getCoveringForAddress(secret.get_address().to_ergo_tree().to_base16_bytes(), 1e9 + config.fee * 2)
    ergBoxes.boxes.forEach(processSingleBox)
    const boxes = new wasm.ErgoBoxes(selectedBoxes[0])
    selectedBoxes.slice(1).forEach(box => boxes.add(box))
    const tokenAmount = selectedBoxes.map(box => {
        return Array(box.tokens().len()).fill("").map((item, index) => {
            const token = box.tokens().get(index)
            return token.id().to_str() === config.token.VAAT ? token.amount().as_i64().as_num() : 0
        }).reduce((a, b) => a + b, 0)
    }).reduce((a, b) => a + b, 0)
    const builder = new wasm.ErgoBoxCandidateBuilder(wasm.BoxValue.from_i64(wasm.I64.from_str(1e9.toString())), await Contracts.generateVaaCreatorContract(), height)
    builder.add_token(wasm.TokenId.from_str(config.token.VAAT), wasm.TokenAmount.from_i64(wasm.I64.from_str(tokenAmount.toString())))
    const candidate = await Boxes.getWormholeBox()
    await sendAndWaitTx(await createAndSignTx(secret, boxes, [candidate], height))
}

const createWormholeBox = async () => {
    const height = await ApiNetwork.getHeight();
    const tokenBoxes = await ApiNetwork.getBoxWithToken(config.token.wormholeNFT)
    const secret = getSecret()
    const boxes = new wasm.ErgoBoxes(tokenBoxes.boxes[0])
    const required = 3 * config.fee - boxes.get(0).value().as_i64().as_num()
    const ergBoxes = await ApiNetwork.getCoveringForAddress(
        secret.get_address().to_ergo_tree().to_base16_bytes().toString(),
        required,
        (box) => wasm.ErgoBox.from_json(JSON.stringify(box)).tokens().len() === 0
    )
    if (!ergBoxes.covered) {
        throw Error("insufficient boxes to issue bank identifier")
    }
    ergBoxes.boxes.forEach(item => boxes.add(wasm.ErgoBox.from_json(JSON.stringify(item))))
    const candidate = await Boxes.getWormholeBox()
    await sendAndWaitTx(await createAndSignTx(secret, boxes, [candidate], height))
}

const createSponsorBox = async () => {
    const height = await ApiNetwork.getHeight();
    const secret = getSecret()
    const ergBoxes = await ApiNetwork.getCoveringForAddress(
        secret.get_address().to_ergo_tree().to_base16_bytes().toString(),
        1e9,
        (box) => wasm.ErgoBox.from_json(JSON.stringify(box)).tokens().len() === 0
    )
    if (!ergBoxes.covered) {
        throw Error("insufficient boxes to issue bank identifier")
    }
    const wasmBoxes = ergBoxes.boxes.map(item => wasm.ErgoBox.from_json(JSON.stringify(item)))
    const boxes = new wasm.ErgoBoxes(wasmBoxes[0])
    wasmBoxes.slice(1).forEach(item => boxes.add(item))
    const candidate = await Boxes.getSponsorBox(1e9)
    await sendAndWaitTx(await createAndSignTx(secret, boxes, [candidate], height))
}

const createBankBox = async (name: string, description: string, decimal: number, amount: number) => {
    const height = await ApiNetwork.getHeight();
    const contract = await Contracts.generateBankContract();
    const secret = getSecret();
    const tokenId = await fetchBoxesAndIssueToken(secret, amount, name, description, decimal);
    const tokenBoxes = await ApiNetwork.getBoxWithToken(tokenId);
    const NFTBoxes = await ApiNetwork.getBoxWithToken(config.token.bankNFT)
    let boxes: Array<wasm.ErgoBox> = []
    try {
        boxes.push(tokenBoxes.boxes[0]);
        boxes.push(NFTBoxes.boxes[0]);
    } catch (exp) {
        throw Error("bank identifier or nft not found")
    }
    const required = 3 * config.fee - boxes.map(box => box.value().as_i64().as_num()).reduce((a, b) => a + b, 0)
    if (required > 0) {
        const ergBoxes = await ApiNetwork.getCoveringForAddress(
            secret.get_address().to_ergo_tree().to_base16_bytes().toString(),
            required,
            (box) => wasm.ErgoBox.from_json(JSON.stringify(box)).tokens().len() === 0
        )
        if (!ergBoxes.covered) {
            throw Error("insufficient boxes to issue bank identifier")
        }
        ergBoxes.boxes.forEach(item => boxes.push(wasm.ErgoBox.from_json(JSON.stringify(item))))
    }
    const candidateBuilder = new wasm.ErgoBoxCandidateBuilder(
        wasm.BoxValue.from_i64(wasm.I64.from_str(config.minBoxValue.toString())),
        contract,
        height
    )
    candidateBuilder.add_token(
        wasm.TokenId.from_str(config.token.bankNFT),
        wasm.TokenAmount.from_i64(wasm.I64.from_str("1"))
    )
    candidateBuilder.add_token(
        wasm.TokenId.from_str(tokenId),
        wasm.TokenAmount.from_i64(wasm.I64.from_str(amount.toString()))
    )
    const candidate = candidateBuilder.build()
    const inputBoxes = new wasm.ErgoBoxes(boxes[0])
    boxes.slice(1).forEach(item => inputBoxes.add(item))
    await sendAndWaitTx(await createAndSignTx(secret, inputBoxes, [candidate], height));
    return tokenId
}

const issueTokens = async () => {
    const secret = getSecret();
    const bankIdentifier = await issueBankIdentifier(secret);
    const vaaIdentifier = await issueVaaIdentifier(secret)
    const wormholeNFT = await issueWormHoleNFT(secret)
    const guardianNFT = await issueGuardianNFT(secret)
    const guardianToken = await issueGuardianToken(secret)
    const registerNFT = await issueRegisterNFT(secret)
    return {
        VAAT: vaaIdentifier,
        wormholeNFT: wormholeNFT,
        guardianNFT: guardianNFT,
        guardianToken: guardianToken,
        bankNFT: bankIdentifier,
        registerNFT: registerNFT,
    }

}

const BigIntToHexString = (num: bigint) => {
    let buff = Buffer.alloc(32, 0)
    buff.writeBigUInt64BE(num)
    return buff.toString("hex")
}

const uint8arrayToHex = (arr: Uint8Array) => {
    return Buffer.from(arr).toString('hex')
}

const generateVaa = (tokenId: string, emiterId: number, emiterAddress: string) => {
    let buff = Buffer.alloc(32, 0)
    buff.writeBigUInt64BE(BigInt(100));
    console.log(wasm.Address.from_base58("9fRAWhdxEsTcdb8PhGNrZfwqa65zfkuYHAMmkQLcic1gdLSV5vA").to_ergo_tree().to_base16_bytes())
    const payload = [
        "00",   // id
        BigIntToHexString(BigInt(120)),     // amount
        wasm.TokenId.from_str(tokenId).to_str(),     //
        "0002",     // SOLANA
        // uint8arrayToHex(wasm.Address.from_base58("9fRAWhdxEsTcdb8PhGNrZfwqa65zfkuYHAMmkQLcic1gdLSV5vA").to_bytes(config.networkType)),
        uint8arrayToHex(strToUint8Array(wasm.Address.from_base58("9fRAWhdxEsTcdb8PhGNrZfwqa65zfkuYHAMmkQLcic1gdLSV5vA").to_ergo_tree().to_base16_bytes())),
        "0003",
        BigIntToHexString(BigInt(5)),
    ]
    const observationParts = [
        codec.UInt32ToByte(1231829),    // timestamp
        codec.UInt32ToByte(25327),       // nonce
        codec.UInt8ToByte(0),           // consistencyLevel,
        codec.UInt8ToByte(emiterId),           // emitter chain
        emiterAddress,  // emitter address
        ...payload,
    ]
    const observation = observationParts.join("")
    let signatures = "06";
    signatures += wormhole.map((item, index) => `0${index}` + sign(Buffer.from(observation, "hex"), Buffer.from(item.privateKey, "hex"))).join("")
    const vaaParts = [
        codec.UInt8ToByte(2),       // version
        codec.UInt32ToByte(0),      // guardian set index
        signatures,
        ...observationParts
    ]
    return vaaParts.join("")
}

const initializeServiceBoxes = async () => {
    await createVaaCreatorBox();
    await createWormholeBox();
    await createSponsorBox();
    const tokenId = await createBankBox("voUSDT2", "this is a testing token for susy version 2 ergo gateway", 2, 1e15)
    await createGuardianBox(1);
    return tokenId
}

const initializeAll = async (test: boolean = false) => {
    const tokens = await issueTokens()
    fs.writeFileSync("src/config/tokens.json", JSON.stringify(tokens))
    if (config.setToken) {
        config.setToken(tokens);
        const tokenId = await initializeServiceBoxes()
        const emitterAddress = "74e7b65055d170d36d4fb926102fe6e047390980f66611f541f1b8268cbd5a25"
        const emitterId = 1
        if (test) {
            const vaa = generateVaa(tokenId, emitterId, emitterAddress)
            await processVAA(codec.hexStringToByte(vaa), true)
            if(config.setGuardianIndex) {
                for (let index = 0; index < 6; index++) {
                    config.setGuardianIndex(index)
                    await signService(true)
                }
            }
        }
    }
}
export {
    createWormholeBox,
    createSponsorBox,
    createBankBox,
    issueTokens,
    initializeServiceBoxes,
    generateVaa,
    initializeAll
}
