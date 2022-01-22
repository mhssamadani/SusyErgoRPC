import setupRPC from "./network/rpc"
import config from "./config/conf";
import signService from "./susy/signService";
import {processFinalize} from "./susy/finalize";
import {initializeAll} from "./susy/init";

const main = () => {
    if (config.service === "rpc") {
        setupRPC();
    } else if (config.service === "sign") {
        signService().then(() => null)
    } else if (config.service === "payment") {
        processFinalize().then(() => null)
    } else if (config.service === "init") {
        initializeAll(config.getExtraInitialize().test).then(() => null)
    } else {
        console.log(`invalid service type ${config.service}`)
    }
}

main()
