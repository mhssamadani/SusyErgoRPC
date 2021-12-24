import * as wasm from 'ergo-lib-wasm-nodejs'
import ApiNetwork from "../network/api";
import {Buffer} from "buffer";
import config from "../config/conf";
import {TextEncoder} from "util";
import {array} from "getenv";

const getSecret = () => wasm.SecretKey.dlog_from_bytes(Buffer.from(config.initializer.secret, "hex"))

const issueToken = async (boxes: Array<string>, amount: number, name: string, description: string, decimal: number = 0) => {
    const height = await ApiNetwork.getHeight();
    const secret = getSecret();
    const boxSelection = new wasm.BoxSelection(wasm.ErgoBoxes.from_boxes_json(boxes), new wasm.ErgoBoxAssetsDataList())
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
    const builder = wasm.TxBuilder.new(
        boxSelection,
        new wasm.ErgoBoxCandidates(candidate.build()),
        height,
        wasm.BoxValue.from_i64(
            wasm.I64.from_str(
                config.fee.toString()
            )
        ),
        secret.get_address(),
        wasm.BoxValue.SAFE_USER_MIN()
    )
    const secrets = new wasm.SecretKeys()
    secrets.add(secret)
    const wallet = wasm.Wallet.from_secrets(secrets);
    const ctx = await ApiNetwork.getErgoStateContexet();
    return wallet.sign_transaction(ctx, builder.build(), boxSelection.boxes(),wasm.ErgoBoxes.from_boxes_json([]))
}

const initializeService = async () => {
    let txs = [];
    let fetchedBoxes = [];
    const secret = getSecret();
    const boxes = await ApiNetwork.getCoveringForAddress(secret.get_address().to_ergo_tree().to_base16_bytes(), 2 * config.fee)
    if(!boxes.covered){
        throw Error("insufficient boxes to issue bank identifier")
    }
    txs.push(
        issueToken(
            boxes.boxes,
            10000,
            "Bank Identifier",
            "Wormhole Bank boxes identifier",
            0
        )
    );
    fetchedBoxes.push(...boxes.selectedIds)
    console.log(fetchedBoxes)
}

export default initializeService;

export {
    issueToken,
    getSecret
}
