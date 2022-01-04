import * as wasm from 'ergo-lib-wasm-nodejs'
import {Buffer} from "buffer";
import config from "../../config/conf";
import {TextEncoder} from "util";
import sleep from "sleep-promise";
import ApiNetwork from "../../network/api";

const getSecret = () => wasm.SecretKey.dlog_from_bytes(Buffer.from(config.initializer.secret, "hex"))

const extractBoxes = async (secret: wasm.SecretKey, tx: wasm.Transaction) => {
    const ergo_tree_hex = secret.get_address().to_ergo_tree().to_base16_bytes().toString()
    return Array(tx.outputs().len()).fill("")
        .map((item, index) => tx.outputs().get(index))
        .filter(box => box.tokens().len() === 0)
        .filter(box => box.ergo_tree().to_base16_bytes().toString() === ergo_tree_hex)
}

const createChangeBox = (boxes: wasm.ErgoBoxes, candidates: Array<wasm.ErgoBoxCandidate>, height: number, secret: wasm.SecretKey): wasm.ErgoBoxCandidate | null => {
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
    const changeTokens = Object.entries(tokens).filter(([key, value]) => value > 0)
    if(value > config.fee + wasm.BoxValue.SAFE_USER_MIN().as_i64().as_num()){
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
    // }else if(changeTokens.length){
    //     console.log(changeTokens)
        // throw Error("Insufficient erg to create change bux but tokens found")
    }
    return null
}

const createAndSignTx = async (secret: wasm.SecretKey, boxes: wasm.ErgoBoxes, candidates: Array<wasm.ErgoBoxCandidate>, height: number, dataInput?: wasm.ErgoBoxes) => {
    const change = createChangeBox(boxes, candidates, height, secret)
    const candidateBoxes = new wasm.ErgoBoxCandidates(candidates[0])
    candidates.slice(1).forEach(item => candidateBoxes.add(item))
    if(change) {
        candidateBoxes.add(change)
    }
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
    const ctx = await ApiNetwork.getErgoStateContext();
    return wallet.sign_transaction(ctx, tx, boxSelection.boxes(), dataInput)
}

const issueToken = async (secret: wasm.SecretKey, boxes: wasm.ErgoBoxes, amount: number, name: string, description: string, decimal: number = 0) => {
    const height = await ApiNetwork.getHeight();
    const candidateBuilder = new wasm.ErgoBoxCandidateBuilder(
        wasm.BoxValue.from_i64(wasm.I64.from_str(config.fee.toString())),
        wasm.Contract.pay_to_address(secret.get_address()),
        height
    )
    const tokenId = boxes.get(0).box_id().to_str();
    candidateBuilder.add_token(wasm.TokenId.from_str(tokenId), wasm.TokenAmount.from_i64(wasm.I64.from_str(amount.toString())))
    candidateBuilder.set_register_value(4, wasm.Constant.from_byte_array(new TextEncoder().encode(name)))
    candidateBuilder.set_register_value(5, wasm.Constant.from_byte_array(new TextEncoder().encode(description)))
    candidateBuilder.set_register_value(6, wasm.Constant.from_byte_array(new TextEncoder().encode(decimal.toString())))
    candidateBuilder.set_register_value(7, wasm.Constant.from_byte_array(new TextEncoder().encode("1")))
    const candidate = candidateBuilder.build()
    return {tx: await createAndSignTx(secret, boxes, [candidate], height), id: tokenId}
}

const fetchBoxesAndIssueToken = async (
    secret: wasm.SecretKey,
    amount: number,
    name: string,
    description: string,
    decimal: number,
) => {
    const outputBoxes: Array<wasm.ErgoBox> = [];
    const ergAmount = 3 * config.fee;
    const boxes = await ApiNetwork.getCoveringForAddress(secret.get_address().to_ergo_tree().to_base16_bytes(), ergAmount)
    if (!boxes.covered) {
        throw Error("insufficient boxes to issue bank identifier")
    }
    boxes.boxes.forEach((box) => outputBoxes.push(wasm.ErgoBox.from_json(JSON.stringify(box))))
    const inputBoxes = new wasm.ErgoBoxes(outputBoxes[0]);
    outputBoxes.slice(1,).forEach(box => inputBoxes.add(box))
    const {tx, id} = await issueToken(secret, inputBoxes, amount, name, description, decimal)
    console.log(`token issues with is: ${id}. waiting transaction to be mined`)
    await sendAndWaitTx(tx)
    return id
}

const sendAndWaitTx = async (tx: wasm.Transaction) => {
    console.log("transaction generated.")
    await ApiNetwork.sendTx(tx.to_json())
    console.log(`transaction submitted with id ${tx.id().to_str()}. waiting to be mined`)
    let counter = 0;
    while (true) {
        await sleep(10 * 1000)
        counter++;
        try {
            await ApiNetwork.getTransaction(tx.id().to_str())
            break;
        } catch (exp: any) {
            if (counter % 60 === 0) {
                console.log(`retry sending transaction with id ${tx.id().to_str()}`)
                await ApiNetwork.sendTx(tx.to_json())
            }
        }
    }
}

export {
    sendAndWaitTx,
    fetchBoxesAndIssueToken,
    issueToken,
    signTx,
    createAndSignTx,
    createChangeBox,
    extractBoxes,
    getSecret,
}
