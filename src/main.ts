import setupRPC from "./network/rpc"
import config from "./config/conf";
import signService from "./susy/signService";
import initializeService from "./susy/init";

const main = () => {
    initializeService().then(res => console.log(res))
    if (config.service === "rpc") {
        setupRPC();
    } else if (config.service === "sign") {
        signService().then(() => null)
    } else {
        console.log(`invalid service type ${config.service}`)
    }
}

main()
