import setupRPC from "./network/rpc"
import config from "./config/conf";
import { finalizeServiceContinues } from "./susy/finalize";
import { initializeAll } from "./susy/init";
import { signServiceContinues } from "./susy/signService";

const main = () => {
    if (config.service === "rpc") {
        setupRPC();
    } else if (config.service === "sign") {
        signServiceContinues();
    } else if (config.service === "payment") {
        finalizeServiceContinues();
    } else if (config.service === "init") {
        initializeAll(config.getExtraInitialize().test).then(() => null)
    } else {
        console.log(`invalid service type ${config.service}`)
    }
}

main()
