import {bankScript, guardianScript, sponserScript, VAAScript, wormholeScript} from "./scripts";
import ApiNetwork from "../network/api";
import config from "../config/conf.json";

class Contracts {
    static generateBankContract = () => {
        const script: string = bankScript.replace("VAATToken", "\"" + config.token.VAAT + "\"");
        return ApiNetwork.pay2ScriptAddress(script);
    }

    static generateVAAContract = () => {
        let script: string = VAAScript;
        script = script.replace("WORMHOLENFT", "\"" + config.token.wormholeNFT + "\"");
        script = script.replace("BFTSIGNATURECOUNT", config.bftSignatureCount.toString());
        return ApiNetwork.pay2ScriptAddress(script);
    }

    static generateWormholeContract = () => {
        let script: string = wormholeScript;
        script = script.replace("VAATToken", "\"" + config.token.VAAT + "\"");
        script = script.replace("WORMHOLENFT", "\"" + config.token.wormholeNFT + "\"");
        script = script.replace("GUARDIANORACLENFT", "\"" + config.token.guardianNFT + "\"");
        return ApiNetwork.pay2ScriptAddress(script);
    }

    static generateGuardianContract = () => {
        const script: string = guardianScript.replace("GUARDIANORACLENFT", "\"" + config.token.guardianNFT + "\"");
        return ApiNetwork.pay2ScriptAddress(script);

    }

    static generateSponsorContract = () => {
        let script: string = sponserScript;
        script = script.replace("WORMHOLENFT", "\"" + config.token.wormholeNFT + "\"");
        script = script.replace("BANKNFT", "\"" + config.token.bankNFT + "\"");
        script = script.replace("FEE", config.fee.toString())
        return ApiNetwork.pay2ScriptAddress(script)
    }
}

export default Contracts;