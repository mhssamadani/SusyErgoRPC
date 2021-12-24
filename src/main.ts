import setupRPC from "./network/rpc"
import config from "./config/conf";
import signService from "./susy/signService";

const ergoLib=require("ergo-lib-wasm-nodejs");
const main = () => {
    if (config.service === "rpc") {
        setupRPC();
    } else if (config.service === "sign") {
        signService().then(() => null)
    } else {
        console.log(`invalid service type ${config.service}`)
    }
}

main()
