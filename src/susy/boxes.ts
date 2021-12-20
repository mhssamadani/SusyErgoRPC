import {bankScript, guardianScript, sponserScript, VAAScript, wormholeScript} from "./scripts";
import ApiNetwork from "../network/api";
import config from "../config/conf.json";

class Contracts {
    static generateBankContract = () => {
        const script: string = bankScript.replace(
            "VAATToken",
            "\"" + Buffer.from(config.token.VAAT).toString("base64") + "\""
        );
        return ApiNetwork.pay2ScriptAddress(script);
    }

    static generateVAAContract = () => {
        let script: string = VAAScript;
        script = script.replace(
            "WORMHOLENFT",
            "\"" + Buffer.from(config.token.wormholeNFT).toString() + "\""
        );
        script = script.replace(
            "BFTSIGNATURECOUNT",
            config.bftSignatureCount.toString()
        );
        return ApiNetwork.pay2ScriptAddress(script);
    }

    static generateWormholeContract = () => {
        let script: string = wormholeScript;
        script = script.replace(
            "VAATToken",
            "\"" + Buffer.from(config.token.VAAT).toString("base64") + "\""
        );
        script = script.replace(
            "WORMHOLENFT",
            "\"" + Buffer.from(config.token.wormholeNFT).toString("base64") + "\""
        );
        script = script.replace(
            "GUARDIANORACLENFT",
            "\"" + Buffer.from(config.token.guardianNFT).toString("base64") + "\""
        );
        return ApiNetwork.pay2ScriptAddress(script);
    }

    static generateGuardianContract = () => {
        const script: string = guardianScript.replace(
            "GUARDIANORACLENFT",
            "\"" + Buffer.from(config.token.guardianNFT).toString("base64") + "\""
        );
        return ApiNetwork.pay2ScriptAddress(script);

    }

    static generateSponsorContract = () => {
        let script: string = sponserScript;
        script = script.replace(
            "WORMHOLENFT",
            "\"" + Buffer.from(config.token.wormholeNFT).toString("base64") + "\""
        );
        script = script.replace(
            "BANKNFT",
            "\"" + Buffer.from(config.token.bankNFT).toString("base64") + "\""
        );
        script = script.replace("FEE", config.fee.toString())
        return ApiNetwork.pay2ScriptAddress(script)
    }
}

export default Contracts;