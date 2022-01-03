
import ApiNetwork from "../network/api";
import * as wasm from 'ergo-lib-wasm-nodejs'
import {transferPayload} from "../models/models";
import {createPayment} from "./transaction";
import config from "../config/conf";

const processPayments = async () => {
    const vaaBoxes = await ApiNetwork.getVAABoxes()
    for (const boxJson of vaaBoxes) {
        const box = wasm.ErgoBox.from_json(JSON.stringify(boxJson))
        const R4 = box.register_value(4)?.to_coll_coll_byte()!
        const payload = new transferPayload(R4[1])
        const tokenId = payload.TokenAddress()
        console.log(tokenId)
        const bank = await ApiNetwork.getBankBox(tokenId, payload.Amount().toString())
        const sponsor = wasm.ErgoBox.from_json(JSON.stringify(await ApiNetwork.getSponsorBox()))
        if (box.register_value(7)?.to_i32_array()[1]! >= config.bftSignatureCount && bank) {
            await createPayment(bank, box, sponsor, payload)
        }
    }
}


export {
    processPayments
}
