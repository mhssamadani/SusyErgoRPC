import * as wasm from 'ergo-lib-wasm-nodejs'
import ApiNetwork from "../network/api";
import {Buffer} from "buffer";
import config from "../config/conf";
import {TextEncoder} from "util";
import Contracts from "./contracts";

const getSecret = () => wasm.SecretKey.dlog_from_bytes(Buffer.from(config.initializer.secret, "hex"))

const extractBoxes = async (secret: wasm.SecretKey, tx: wasm.Transaction) => {
    const ergo_tree_hex = secret.get_address().to_ergo_tree().to_base16_bytes().toString()
    return Array(tx.outputs().len()).fill("")
        .map((item, index) => tx.outputs().get(index))
        .filter(box => box.tokens().len() === 0)
        .filter(box => box.ergo_tree().to_base16_bytes().toString() === ergo_tree_hex)
}

const issueToken = async (secret: wasm.SecretKey, boxes: wasm.ErgoBoxes, amount: number, name: string, description: string, decimal: number = 0) => {
    const height = await ApiNetwork.getHeight();
    const totalInput = Array(boxes.len()).fill("").map((item, index) => boxes.get(index).value().as_i64().as_num()).reduce((a, b) => a + b, 0)
    const boxSelection = new wasm.BoxSelection(boxes, new wasm.ErgoBoxAssetsDataList())
    const candidate = new wasm.ErgoBoxCandidateBuilder(
        wasm.BoxValue.from_i64(wasm.I64.from_str(config.fee.toString())),
        wasm.Contract.pay_to_address(secret.get_address()),
        height
    )
    candidate.add_token(wasm.TokenId.from_str(boxSelection.boxes().get(0).box_id().to_str()), wasm.TokenAmount.from_i64(wasm.I64.from_str(amount.toString())))
    candidate.set_register_value(4, wasm.Constant.from_byte_array(new TextEncoder().encode(name)))
    candidate.set_register_value(5, wasm.Constant.from_byte_array(new TextEncoder().encode(description)))
    candidate.set_register_value(6, wasm.Constant.from_byte_array(new TextEncoder().encode(decimal.toString())))
    candidate.set_register_value(7, wasm.Constant.from_byte_array(new TextEncoder().encode("1")))
    const change = new wasm.ErgoBoxCandidateBuilder(
        wasm.BoxValue.from_i64(wasm.I64.from_str((totalInput - 2 * config.fee).toString())),
        wasm.Contract.pay_to_address(secret.get_address()),
        height
    )
    let tokens: { [id: string]: number; } = {}
    Array(boxes.len()).fill("").forEach((item, index) => {
        const box = boxes.get(index);
        Array(box.tokens().len()).fill("").forEach((notUsed, tokenIndex) => {
            const token = box.tokens().get(tokenIndex);
            if(!tokens.hasOwnProperty(token.id().to_str())){
                tokens[token.id().to_str()] = token.amount().as_i64().as_num()
            }else{
                tokens[token.id().to_str()] = token.amount().as_i64().as_num()
            }
        })
    })
    Object.entries(tokens).forEach(([key, value]) => {
        change.add_token(wasm.TokenId.from_str(key), wasm.TokenAmount.from_i64(wasm.I64.from_str(value.toString())))
    })
    const candidates = new wasm.ErgoBoxCandidates(candidate.build())
    candidates.add(change.build())
    const builder = wasm.TxBuilder.new(
        boxSelection,
        candidates,
        height,
        wasm.BoxValue.from_i64(wasm.I64.from_str(config.fee.toString())),
        secret.get_address(),
        wasm.BoxValue.SAFE_USER_MIN()
    )
    const secrets = new wasm.SecretKeys()
    secrets.add(secret)
    const wallet = wasm.Wallet.from_secrets(secrets);
    const ctx = await ApiNetwork.getErgoStateContexet();
    return wallet.sign_transaction(ctx, builder.build(), boxSelection.boxes(), wasm.ErgoBoxes.from_boxes_json([]))
}

const fetchBoxesAndIssueToken = async (
    secret: wasm.SecretKey,
    amount: number,
    name: string,
    description: string,
    decimal: number,
    oldTx?: wasm.Transaction
) => {
    const outputBoxes: Array<wasm.ErgoBox> = oldTx ? await extractBoxes(secret, oldTx) : [];
    const ergAmount = 3 * config.fee - outputBoxes.map(box => box.value().as_i64().as_num()).reduce((a, b) => a + b, 0)
    if (ergAmount > 0) {
        const boxes = await ApiNetwork.getCoveringForAddress(secret.get_address().to_ergo_tree().to_base16_bytes(), ergAmount)
        if (!boxes.covered) {
            throw Error("insufficient boxes to issue bank identifier")
        }
        boxes.boxes.forEach(boxStr => outputBoxes.push(wasm.ErgoBox.from_json(boxStr)))
    }
    const inputBoxes = new wasm.ErgoBoxes(outputBoxes[0]);
    outputBoxes.slice(1,).forEach(box => inputBoxes.add(box))
    return {
        tx: await issueToken(secret, inputBoxes, amount, name, description, decimal),
        boxes: outputBoxes.map(box => box.box_id().to_str())
    }
}

const issueBankIdentifier = async (secret: wasm.SecretKey, txs: Array<wasm.Transaction>, fetchedBoxes: Array<string>) => {
    const res = await fetchBoxesAndIssueToken(secret, 10000, "Bank Identifier", "Wormhole Bank Boxes Identifier", 0)
    txs.push(res.tx);
    res.boxes.forEach(item => fetchedBoxes.push(item))
    return res.tx
}

const issueVaaIdentifier = async (secret: wasm.SecretKey, txs: Array<wasm.Transaction>, fetchedBoxes: Array<string>) => {
    const res = await fetchBoxesAndIssueToken(secret, 10000, "VAA Identifier", "VAA Boxes Identifier", 0, txs.length ? txs[txs.length - 1] : undefined)
    txs.push(res.tx)
    res.boxes.forEach(item => fetchedBoxes.push(item))
    return res.tx
}

const issueWormHoleNFT = async (secret: wasm.SecretKey, txs: Array<wasm.Transaction>, fetchedBoxes: Array<string>) => {
    const res = await fetchBoxesAndIssueToken(secret, 1, "Wormhole NFT", "Wormhole Contract NFT", 0, txs.length ? txs[txs.length - 1] : undefined)
    txs.push(res.tx)
    res.boxes.forEach(item => fetchedBoxes.push(item))
    return res.tx
}

const issueGuardianNFT = async (secret: wasm.SecretKey, txs: Array<wasm.Transaction>, fetchedBoxes: Array<string>) => {
    const res = await fetchBoxesAndIssueToken(secret, 1, "Guardian NFT", "Guardian repo NFT", 0, txs.length ? txs[txs.length - 1] : undefined)
    txs.push(res.tx)
    res.boxes.forEach(item => fetchedBoxes.push(item))
    return res.tx
}

const issueGuardianToken = async (secret: wasm.SecretKey, txs: Array<wasm.Transaction>, fetchedBoxes: Array<string>) => {
    const res = await fetchBoxesAndIssueToken(secret, 1000, "Guardian Token", "Guardian repo Token", 0, txs.length ? txs[txs.length - 1] : undefined)
    txs.push(res.tx)
    res.boxes.forEach(item => fetchedBoxes.push(item))
    return res.tx
}

const initializeServiceToken = async () => {
    let txs: Array<wasm.Transaction> = [];
    let fetchedBoxes: Array<string> = [];
    const secret = getSecret();
    await issueBankIdentifier(secret, txs, fetchedBoxes)
    await issueVaaIdentifier(secret, txs, fetchedBoxes)
    await issueWormHoleNFT(secret, txs, fetchedBoxes)
    await issueGuardianNFT(secret, txs, fetchedBoxes)
    await issueGuardianToken(secret, txs, fetchedBoxes)
    return txs
}

const createWormholeBox = async () => {
    const contract = await Contracts.generateVAAContract();
    const box = await ApiNetwork.getBoxWithToken(config.token.wormholeNFT)
    const secret = getSecret()
    const allBoxes = await ApiNetwork.getBoxesForAddress(secret.get_address().to_ergo_tree().to_base16_bytes().toString(), 0, 100)
    const noTokenBoxes = allBoxes.items.map((item: any) => wasm.ErgoBox.from_json(JSON.stringify(item))).filter((box: wasm.ErgoBox) => box.tokens().len() === 0)
    
    // allBoxes.boxes.forEach((boxStr => outputBoxes.push(wasm.ErgoBox.from_json(boxStr)))
}


export default initializeServiceToken;

export {
    createWormholeBox,
}
