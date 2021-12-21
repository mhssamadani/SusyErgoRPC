"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const scripts_1 = require("./scripts");
const api_1 = __importDefault(require("../network/api"));
const conf_json_1 = __importDefault(require("../config/conf.json"));
const ergoLib = require("ergo-lib-wasm-nodejs");
class Contracts {
}
Contracts.generateBankContract = () => {
    const script = scripts_1.bankScript.replace("VAATToken", "\"" + Buffer.from(conf_json_1.default.token.VAAT).toString("base64") + "\"");
    return api_1.default.pay2ScriptAddress(script).then(res => {
        const P2SA = ergoLib.Address.from_base58(res);
        return ergoLib.Contract.pay_to_address(P2SA);
    });
};
Contracts.generateVAAContract = () => {
    let script = scripts_1.VAAScript;
    script = script.replace("WORMHOLENFT", "\"" + Buffer.from(conf_json_1.default.token.wormholeNFT).toString() + "\"");
    script = script.replace("BFTSIGNATURECOUNT", conf_json_1.default.bftSignatureCount.toString());
    return api_1.default.pay2ScriptAddress(script).then(res => {
        const P2SA = ergoLib.Address.from_base58(res);
        return ergoLib.Contract.pay_to_address(P2SA);
    });
};
Contracts.generateWormholeContract = () => {
    let script = scripts_1.wormholeScript;
    script = script.replace("VAATToken", "\"" + Buffer.from(conf_json_1.default.token.VAAT).toString("base64") + "\"");
    script = script.replace("WORMHOLENFT", "\"" + Buffer.from(conf_json_1.default.token.wormholeNFT).toString("base64") + "\"");
    script = script.replace("GUARDIANORACLENFT", "\"" + Buffer.from(conf_json_1.default.token.guardianNFT).toString("base64") + "\"");
    return api_1.default.pay2ScriptAddress(script).then(res => {
        const P2SA = ergoLib.Address.from_base58(res);
        return ergoLib.Contract.pay_to_address(P2SA);
    });
};
Contracts.generateGuardianContract = () => {
    const script = scripts_1.guardianScript.replace("GUARDIANORACLENFT", "\"" + Buffer.from(conf_json_1.default.token.guardianNFT).toString("base64") + "\"");
    return api_1.default.pay2ScriptAddress(script);
};
Contracts.generateSponsorContract = () => {
    let script = scripts_1.sponserScript;
    script = script.replace("WORMHOLENFT", "\"" + Buffer.from(conf_json_1.default.token.wormholeNFT).toString("base64") + "\"");
    script = script.replace("BANKNFT", "\"" + Buffer.from(conf_json_1.default.token.bankNFT).toString("base64") + "\"");
    script = script.replace("FEE", conf_json_1.default.fee.toString());
    return api_1.default.pay2ScriptAddress(script).then(res => {
        const P2SA = ergoLib.Address.from_base58(res);
        return ergoLib.Contract.pay_to_address(P2SA);
    });
};
exports.default = Contracts;
