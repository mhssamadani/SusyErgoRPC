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
import {hdkey} from "ethereumjs-wallet";
import processVAA from "./susy/vaaService";
import createGuardianBox from "./susy/init/guardianBox";
import VAA from "./models/models";
// const hdkey = require('ethereumjs-wallet/hdkey');

const main = () => {
    // createGuardianBox(1).then(() => null)
    // const tou8 = require('buffer-to-uint8array');
    // const vaa = generateVaa()
    // console.log(vaa)
    // processVAA(tou8(Buffer.from(vaa, "hex"))).then((res) => console.log(res))
    // issueTokens().then((tokens) => console.log(tokens))
    // initializeServiceBoxes().then(() => null)
    // Contracts.generateRegisterVAAContract().then(() => null)
    // createBankBox("test Susy 2", "this is a testing token for susy version 2 ergo gateway", 2, 1e15).then((tx) => {
    //     tx.forEach(item => ApiNetwork.sendTx(item.to_json()))
    // })
    // createSponsorBox().then(tx => ApiNetwork.sendTx(tx.to_json()))
    // createWormholeBox().then((tx) => ApiNetwork.sendTx(tx.to_json()));
    // initializeServiceToken().then(res => res.map(item => ApiNetwork.sendTx(item.to_json())))
    
    if (config.service === "rpc") {
        setupRPC();
    } else if (config.service === "sign") {
        signService().then(() => null)
    } else {
        console.log(`invalid service type ${config.service}`)
    }
}

main()
