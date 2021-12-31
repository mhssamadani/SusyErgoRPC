import setupRPC from "./network/rpc"
import config from "./config/conf";
import signService from "./susy/signService";
import {processPayments} from "./susy/payment";
import {generateVaa, initializeServiceBoxes, issueTokens} from "./susy/init";
import * as wasm from 'ergo-lib-wasm-nodejs'
import processVAA from "./susy/vaaService";

const main = () => {
    // console.log(wasm.SecretKey.dlog_from_bytes(Buffer.from(config.initializer.secret, "hex")).get_address().to_base58(config.networkType))
    // issueTokens().then((tokens) => console.log(tokens))
    // initializeServiceBoxes().then(() => null)
    // const tou8 = require('buffer-to-uint8array');
    // const vaa = generateVaa('803935d89d5e33acc6e24bbb835212ee3997abbc7f756ccc37a07258fb7b9fd3')
    // processVAA(tou8(Buffer.from(vaa, "hex")), true).then(() => {
    //     signService().then(() => null)
    // })
    //
    if (config.service === "rpc") {
        setupRPC();
    } else if (config.service === "sign") {
        signService().then(() => null)
    } else if (config.service === "payment") {
        processPayments().then(() => null)
    } else {
        console.log(`invalid service type ${config.service}`)
    }
}

main()
