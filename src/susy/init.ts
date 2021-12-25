import * as wasm from 'ergo-lib-wasm-nodejs'
import ApiNetwork from "../network/api";
import {Buffer} from "buffer";
import config from "../config/conf";
import {TextEncoder} from "util";
import Contracts from "./contracts";
import {create} from "domain";

const getSecret = () => wasm.SecretKey.dlog_from_bytes(Buffer.from(config.initializer.secret, "hex"))

const extractBoxes = async (secret: wasm.SecretKey, tx: wasm.Transaction) => {
    const ergo_tree_hex = secret.get_address().to_ergo_tree().to_base16_bytes().toString()
    return Array(tx.outputs().len()).fill("")
        .map((item, index) => tx.outputs().get(index))
        .filter(box => box.tokens().len() === 0)
        .filter(box => box.ergo_tree().to_base16_bytes().toString() === ergo_tree_hex)
}

const createChangeBox = (boxes: wasm.ErgoBoxes, candidates: Array<wasm.ErgoBoxCandidate>, height: number, secret: wasm.SecretKey) => {
    const processBox = (box: wasm.ErgoBox | wasm.ErgoBoxCandidate, tokens: { [id: string]: number; }, sign: number) => {
        Array(box.tokens().len()).fill("").forEach((notUsed, tokenIndex) => {
            const token = box.tokens().get(tokenIndex);
            if (!tokens.hasOwnProperty(token.id().to_str())) {
                tokens[token.id().to_str()] = token.amount().as_i64().as_num() * sign
            } else {
                tokens[token.id().to_str()] += token.amount().as_i64().as_num() * sign
            }
        })
    }
    let value: number = 0;
    let tokens: { [id: string]: number; } = {}
    Array(boxes.len()).fill("").forEach((item, index) => {
        const box = boxes.get(index);
        value += box.value().as_i64().as_num()
        processBox(box, tokens, 1)
    });
    candidates.forEach(candidate => {
        value -= candidate.value().as_i64().as_num()
        processBox(candidate, tokens, -1)
    })
    const change = new wasm.ErgoBoxCandidateBuilder(
        wasm.BoxValue.from_i64(wasm.I64.from_str((value - config.fee).toString())),
        wasm.Contract.pay_to_address(secret.get_address()),
        height
    )
    Object.entries(tokens).forEach(([key, value]) => {
        if (value > 0) {
            change.add_token(wasm.TokenId.from_str(key), wasm.TokenAmount.from_i64(wasm.I64.from_str(value.toString())))
        }
    })
    return change.build()
}

const createAndSignTx = async (secret: wasm.SecretKey, boxes: wasm.ErgoBoxes, candidates: Array<wasm.ErgoBoxCandidate>, height: number, dataInput?: wasm.ErgoBoxes) => {
    const change = createChangeBox(boxes, candidates, height, secret)
    const candidateBoxes = new wasm.ErgoBoxCandidates(candidates[0])
    candidates.slice(1).forEach(item => candidateBoxes.add(item))
    candidateBoxes.add(change)
    const boxSelection = new wasm.BoxSelection(boxes, new wasm.ErgoBoxAssetsDataList());
    const txBuilder = wasm.TxBuilder.new(
        boxSelection,
        candidateBoxes,
        height,
        wasm.BoxValue.from_i64(wasm.I64.from_str(config.fee.toString())),
        secret.get_address(),
        wasm.BoxValue.from_i64(wasm.I64.from_str(config.fee.toString()))
    )
    return signTx(secret, txBuilder.build(), boxSelection, dataInput ? dataInput : wasm.ErgoBoxes.from_boxes_json([]))
}

const signTx = async (secret: wasm.SecretKey, tx: wasm.UnsignedTransaction, boxSelection: wasm.BoxSelection, dataInput: wasm.ErgoBoxes) => {
    const secrets = new wasm.SecretKeys()
    secrets.add(secret)
    const wallet = wasm.Wallet.from_secrets(secrets);
    const ctx = await ApiNetwork.getErgoStateContexet();
    return wallet.sign_transaction(ctx, tx, boxSelection.boxes(), dataInput)
}

const issueToken = async (secret: wasm.SecretKey, boxes: wasm.ErgoBoxes, amount: number, name: string, description: string, decimal: number = 0) => {
    const height = await ApiNetwork.getHeight();
    const candidateBuilder = new wasm.ErgoBoxCandidateBuilder(
        wasm.BoxValue.from_i64(wasm.I64.from_str(config.fee.toString())),
        wasm.Contract.pay_to_address(secret.get_address()),
        height
    )
    candidateBuilder.add_token(wasm.TokenId.from_str(boxes.get(0).box_id().to_str()), wasm.TokenAmount.from_i64(wasm.I64.from_str(amount.toString())))
    candidateBuilder.set_register_value(4, wasm.Constant.from_byte_array(new TextEncoder().encode(name)))
    candidateBuilder.set_register_value(5, wasm.Constant.from_byte_array(new TextEncoder().encode(description)))
    candidateBuilder.set_register_value(6, wasm.Constant.from_byte_array(new TextEncoder().encode(decimal.toString())))
    candidateBuilder.set_register_value(7, wasm.Constant.from_byte_array(new TextEncoder().encode("1")))
    const candidate = candidateBuilder.build()
    return await createAndSignTx(secret, boxes, [candidate], height)
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

const createWormholeBox = async () => {
    const height = await ApiNetwork.getHeight();
    const contract = await Contracts.generateWormholeContract();
    const box = await ApiNetwork.getBoxWithToken(config.token.wormholeNFT)
    const secret = getSecret()
    const boxes = new wasm.ErgoBoxes(wasm.ErgoBox.from_json(JSON.stringify(box.items[0])))
    const required = 3 * config.fee - boxes.get(0).value().as_i64().as_num()
    const ergBoxes = await ApiNetwork.getCoveringForAddress(
        secret.get_address().to_ergo_tree().to_base16_bytes().toString(),
        required,
        [],
        (box) => wasm.ErgoBox.from_json(JSON.stringify(box)).tokens().len() === 0
    )
    if (!ergBoxes.covered) {
        throw Error("insufficient boxes to issue bank identifier")
    }
    ergBoxes.boxes.forEach(item => boxes.add(wasm.ErgoBox.from_json(item)))
    const candidateBuilder = new wasm.ErgoBoxCandidateBuilder(
        wasm.BoxValue.from_i64(wasm.I64.from_str(config.fee.toString())),
        contract,
        0
    )
    candidateBuilder.add_token(wasm.TokenId.from_str(config.token.wormholeNFT), wasm.TokenAmount.from_i64(wasm.I64.from_str("1")))
    const candidate = candidateBuilder.build()
    return await createAndSignTx(secret, boxes, [candidate], height)
}

const createSponsorBox = async () => {
    const height = await ApiNetwork.getHeight();
    const contract = await Contracts.generateSponsorContract();
    const secret = getSecret()
    const ergBoxes = await ApiNetwork.getCoveringForAddress(
        secret.get_address().to_ergo_tree().to_base16_bytes().toString(),
        1e9,
        [],
        (box) => wasm.ErgoBox.from_json(JSON.stringify(box)).tokens().len() === 0
    )
    if (!ergBoxes.covered) {
        throw Error("insufficient boxes to issue bank identifier")
    }
    const wasmBoxes = ergBoxes.boxes.map(item => wasm.ErgoBox.from_json(item))
    const boxes = new wasm.ErgoBoxes(wasmBoxes[0])
    wasmBoxes.slice(1).forEach(item => boxes.add(item))
    const candidate = new wasm.ErgoBoxCandidateBuilder(
        wasm.BoxValue.from_i64(wasm.I64.from_str(1e9.toString())),
        contract,
        0
    ).build()
    const change = createChangeBox(boxes, [candidate], height, secret)
    const candidates = new wasm.ErgoBoxCandidates(candidate)
    return await createAndSignTx(secret, boxes, [candidate], height)
}

const createBankBox = async (name: string, description: string, decimal: number, amount: number) => {
    const height = await ApiNetwork.getHeight();
    const contract = await Contracts.generateBankContract();
    const secret = getSecret()
    const tx1 = await fetchBoxesAndIssueToken(secret, amount, name, description, decimal)
    const outputs = tx1.tx.outputs()
    const wrappedToken = outputs.get(0).tokens().get(0).id().to_str()
    const initializer_tree = secret.get_address().to_ergo_tree().to_base16_bytes().toString()
    const boxes = Array(outputs.len()).fill("")
        .map((item, index) => outputs.get(index))
        .filter(box => box.ergo_tree().to_base16_bytes().toString() === initializer_tree)
    const tokenBoxes = await ApiNetwork.getBoxWithToken(config.token.bankNFT)
    if(tokenBoxes.total == 0){
        throw Error("insufficient boxes to issue bank identifier")
    }
    boxes.push(wasm.ErgoBox.from_json(JSON.stringify(tokenBoxes.items[0])))
    const required = 3 * config.fee - boxes.map(box => box.value().as_i64().as_num()).reduce((a, b) => a + b, 0)
    if(required > 0){
        const ergBoxes = await ApiNetwork.getCoveringForAddress(
            secret.get_address().to_ergo_tree().to_base16_bytes().toString(),
            required,
            [],
            (box) => wasm.ErgoBox.from_json(JSON.stringify(box)).tokens().len() === 0
        )
        if(!ergBoxes.covered) {
            throw Error("insufficient boxes to issue bank identifier")
        }
        ergBoxes.boxes.forEach(item => boxes.push(wasm.ErgoBox.from_json(item)))
    }
    const candidateBuilder = new wasm.ErgoBoxCandidateBuilder(
        wasm.BoxValue.from_i64(wasm.I64.from_str(config.fee.toString())),
        contract,
        height
    )
    candidateBuilder.add_token(
        wasm.TokenId.from_str(config.token.bankNFT),
        wasm.TokenAmount.from_i64(wasm.I64.from_str("1"))
    )
    candidateBuilder.add_token(
        wasm.TokenId.from_str(wrappedToken),
        wasm.TokenAmount.from_i64(wasm.I64.from_str(amount.toString()))
    )
    const candidate = candidateBuilder.build()
    const inputBoxes = new wasm.ErgoBoxes(boxes[0])
    boxes.slice(1).forEach(item => inputBoxes.add(item))
    const tx2 = await createAndSignTx(secret, inputBoxes, [candidate], height)
    return [tx1.tx, tx2]
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
    txs.map(tx => ApiNetwork.sendTx(tx.to_json()))
    return txs
}

export default initializeServiceToken;

export {
    createWormholeBox,
    createSponsorBox,
    createBankBox,
}
