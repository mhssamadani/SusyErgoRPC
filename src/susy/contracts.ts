import {bankScript, guardianScript, sponserScript, VAAScript, wormholeScript} from "./scripts";
import ApiNetwork from "../network/api";
import config from "../config/conf";

const ergoLib = require("ergo-lib-wasm-nodejs");

class Contracts {
    static generateBankContract = () => {
        const script: string = bankScript.replace(
            "VAATToken",
            "\"" + Buffer.from(config.token.VAAT).toString("base64") + "\""
        );
        return ApiNetwork.pay2ScriptAddress(script).then(res => {
            const P2SA = ergoLib.Address.from_base58(res);
            return ergoLib.Contract.pay_to_address(P2SA);
        });
    }

    static generateVAAContract = () => {
        let script: string = VAAScript;
        script = script.replace(
            "WORM_HOLE_NFT",
            Buffer.from(config.token.wormholeNFT, "hex").toString("base64")
        ).replace(
            "BFT_SIGNATURE_COUNT",
            config.bftSignatureCount.toString()
        );
        console.log(script)
        return ApiNetwork.pay2ScriptAddress(script).then(res => {
            const P2SA = ergoLib.Address.from_base58(res);
            return ergoLib.Contract.pay_to_address(P2SA);
        });
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
        return ApiNetwork.pay2ScriptAddress(script).then(res => {
            const P2SA = ergoLib.Address.from_base58(res);
            return ergoLib.Contract.pay_to_address(P2SA);
        });
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
        return ApiNetwork.pay2ScriptAddress(script).then(res => {
            const P2SA = ergoLib.Address.from_base58(res);
            return ergoLib.Contract.pay_to_address(P2SA);
        });
    }
}

export default Contracts;
