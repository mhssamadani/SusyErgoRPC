import * as wasm from 'ergo-lib-wasm-nodejs'
import config from "../../config/conf";
import { TextEncoder } from "util";
import sleep from "sleep-promise";
import ApiNetwork from "../../network/api";

const getSecret = () => config.getExtraInitialize().secret

const extractBoxes = async (secret: wasm.SecretKey, tx: wasm.Transaction) => {
    const ergo_tree_hex = secret.get_address().to_ergo_tree().to_base16_bytes().toString()
    return Array(tx.outputs().len()).fill("")
        .map((item, index) => tx.outputs().get(index))
        .filter(box => box.tokens().len() === 0)
        .filter(box => box.ergo_tree().to_base16_bytes().toString() === ergo_tree_hex)
}

const createChangeBox = (boxes: wasm.ErgoBoxes, candidates: Array<wasm.ErgoBoxCandidate>, height: number, secret: wasm.SecretKey, contract?: wasm.Contract): wasm.ErgoBoxCandidate | null => {
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
    if (value > config.fee + wasm.BoxValue.SAFE_USER_MIN().as_i64().as_num()) {
        const change = new wasm.ErgoBoxCandidateBuilder(
            wasm.BoxValue.from_i64(wasm.I64.from_str((value - config.fee).toString())),
            contract ? contract : wasm.Contract.pay_to_address(secret.get_address()),
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

const createAndSignTx = async (secret: wasm.SecretKey, boxes: wasm.ErgoBoxes, candidates: Array<wasm.ErgoBoxCandidate>, height?: number, dataInputs?: wasm.ErgoBoxes, changeContract?: wasm.Contract) => {
    if (!height) height = await ApiNetwork.getHeight();
    const change = createChangeBox(boxes, candidates, height, secret, changeContract)
    const candidateBoxes = new wasm.ErgoBoxCandidates(candidates[0])
    candidates.slice(1).forEach(item => candidateBoxes.add(item))
    if (change) {
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
    if (dataInputs) {
        const txDataInputs = new wasm.DataInputs()
        Array(dataInputs.len()).fill("").forEach((item, index) => txDataInputs.add(new wasm.DataInput(dataInputs.get(index).box_id())))
        txBuilder.set_data_inputs(txDataInputs)
    }
    return signTx(secret, txBuilder.build(), boxSelection, dataInputs ? dataInputs : wasm.ErgoBoxes.from_boxes_json([]))
}

const signTx = async (secret: wasm.SecretKey, tx: wasm.UnsignedTransaction, boxSelection: wasm.BoxSelection, dataInputs: wasm.ErgoBoxes) => {
    const secrets = new wasm.SecretKeys()
    secrets.add(secret)
    const wallet = wasm.Wallet.from_secrets(secrets);
    const ctx = await ApiNetwork.getErgoStateContext();
    return wallet.sign_transaction(ctx, tx, boxSelection.boxes(), dataInputs)
}

const issueToken = async (secret: wasm.SecretKey, boxes: wasm.ErgoBoxes, amount: number, name: string, description: string, decimal: number = 0) => {
    const height = await ApiNetwork.getHeight();
    const candidateBuilder = new wasm.ErgoBoxCandidateBuilder(
        wasm.BoxValue.from_i64(wasm.I64.from_str(config.minBoxValue.toString())),
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
    const ergAmount = 3 * config.fee;
    const boxes = await ApiNetwork.getCoveringForAddress(secret.get_address().to_ergo_tree().to_base16_bytes(), ergAmount)
    if (!boxes.covered) {
        throw Error("insufficient boxes to issue bank identifier")
    }
    const inputBoxes = new wasm.ErgoBoxes(boxes.boxes[0]);
    boxes.boxes.slice(1,).forEach((box: wasm.ErgoBox) => inputBoxes.add(box))
    const {tx, id} = await issueToken(secret, inputBoxes, amount, name, description, decimal)
    console.log(`token issues with is: ${id} . waiting transaction to be mined`)
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
