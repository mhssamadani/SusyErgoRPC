import setupRPC from "./network/rpc"
import config from "./config/conf";
import signService from "./susy/signService";
// import initializeServiceToken from "./susy/init";
import ApiNetwork from "./network/api";
import {createSponsorBox, createWormholeBox} from "./susy/init";

const main = () => {
    createSponsorBox().then(tx => ApiNetwork.sendTx(tx.to_json()))
    // createWormholeBox().then((tx) => ApiNetwork.sendTx(tx.to_json()));
    // initializeServiceToken().then(res => res.map(item => ApiNetwork.sendTx(item.to_json())))
    // if (config.service === "rpc") {
    //     setupRPC();
    // } else if (config.service === "sign") {
    //     signService().then(() => null)
    // } else {
    //     console.log(`invalid service type ${config.service}`)
    // }
}

main()
