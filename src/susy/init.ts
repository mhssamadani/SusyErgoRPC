import * as wasm from 'ergo-lib-wasm-nodejs'
import ApiNetwork from "../network/api";
import {Buffer} from "buffer";
import config from "../config/conf";
import {TextEncoder} from "util";

const getSecret = () => wasm.SecretKey.dlog_from_bytes(Buffer.from(config.initializer.secret, "hex"))

const issueToken = async (amount: number, name: string, description: string, decimal: number = 0) => {
    const height = await ApiNetwork.getHeight();
    const secret = getSecret();
    const tree = secret.get_address().to_ergo_tree().to_base16_bytes()
    let requiredErg = config.fee * 2
    const boxes = await ApiNetwork.getBoxesForAddress(tree)
    const selected = []
    for(let box of boxes){
        selected.push(JSON.stringify(box));
        requiredErg -= box.value;
        if(requiredErg < 0){
            break
        }
    }
    const boxSelection = new wasm.BoxSelection(wasm.ErgoBoxes.from_boxes_json(selected), new wasm.ErgoBoxAssetsDataList())
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
    const signed = wallet.sign_transaction(ctx, builder.build(), boxSelection.boxes(),wasm.ErgoBoxes.from_boxes_json([]))
    return signed.to_json()
}

const initTokenBank = (secret: wasm.SecretKey) => {

}

const initializeService = () => {

}

export default initializeService;

export {
    issueToken,
    getSecret
}
