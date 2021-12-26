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

    const vaaHex = "020000000106007186fb46f9c2b9f1b043ce02865e3956e47e2893eb5ffc72d78158f3d05c50b41c541ae0797cf7e6cc1f816a64cd8f748cbb9c934f45fd7ed88b2f3d08afe6361c01cfb32e3b1e348c0abdb36f299280baa5551063862183c4df41aea4654f77af034c16d52f6f7c302842f9621a6b16669cabeeb00228456e3fd33ad9df9d1378fc1c0271ea1f55728ad05d801557fbd040b0740b44904e97da404e89fdc3deea7f9e3f134d3a21776d572051835a067755d42af12c501320994ae2dbac233e1fb032cb1c030a0a5774e57b740b20385c1e2b0ca14231f5991f7fe3e52aee6f9ffccd64f7cd1b3aaf3669da08edf6be64db58b06395a14268960614fbf0199bcdb25cc4805b1b04a8fc1d823a78e5711c133cac57211af4f5d59d8449cebd261db704e4b947ede311e9e590f630f17154918380697acaa1022aabb88c8984ec33499d1d6b0857e91b055e1c8120943c4631e648e745f5795f1c82aeb28566148c3a94d91a99234465e029fbf44bc96cf952e7af6fad3ab92954a8f8afba08aba1b28e9a11290f9e8c131c0012cbd5000062ef000174e7b65055d170d36d4fb926102fe6e047390980f66611f541f1b8268cbd5a2500000000000000007800000000000000000000000000000000000000000000000037d3f4eeb9ba3e4f860f21c634d9a77e05294736cf399051d25f3b2cef30496100020102764ea2b0b9b06b5730a4257bba71fd7797eb1ec12bc3ae6025a01d7fba53830e229592eb00030000000000000005000000000000000000000000000000000000000000000000"
    const vaa = new VAA(Uint8Array.from(Buffer.from(vaaHex, "hex")))
    if (config.service === "rpc") {
        setupRPC();
    } else if (config.service === "sign") {
        signService().then(() => null)
    } else {
        console.log(`invalid service type ${config.service}`)
    }
}

main()
