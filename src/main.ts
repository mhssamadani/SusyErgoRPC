import setupRPC from "./network/rpc"
import config from "./config/conf";
import signService from "./susy/signService";
// import initializeServiceToken from "./susy/init";
import ApiNetwork from "./network/api";
import {
    createBankBox,
    createSponsorBox,
    createWormholeBox,
    generateVaa,
    initializeServiceBoxes,
    issueTokens
} from "./susy/init";
import Contracts from "./susy/contracts";
import * as bip39 from 'bip39'
import * as wasm from 'ergo-lib-wasm-nodejs';
import {hdkey} from "ethereumjs-wallet";
import processVAA from "./susy/vaaService";
import createGuardianBox from "./susy/init/guardianBox";
import VAA from "./models/models";
// const hdkey = require('ethereumjs-wallet/hdkey');

const main = () => {
    // console.log(wasm.SecretKey.dlog_from_bytes(Buffer.from(config.initializer.secret, "hex")).get_address().to_base58(config.networkType))
    // issueTokens().then((tokens) => console.log(tokens))
    // const tou8 = require('buffer-to-uint8array');
    // const vaa = generateVaa()
    // console.log(vaa)
    // processVAA(tou8(Buffer.from(vaa, "hex"))).then((res) => console.log(res))
    // initializeServiceBoxes().then(() => null)

    if (config.service === "rpc") {
        setupRPC();
    } else if (config.service === "sign") {
        signService().then(() => null)
    } else {
        console.log(`invalid service type ${config.service}`)
    }
}

main()
