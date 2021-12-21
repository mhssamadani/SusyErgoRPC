"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const conf_json_1 = __importDefault(require("../config/conf.json"));
const URL = conf_json_1.default.node;
const nodeClient = axios_1.default.create({
    baseURL: URL,
    timeout: 8000,
    headers: { "Content-Type": "application/json" }
});
const explorerApi = axios_1.default.create({
    baseURL: conf_json_1.default.explorerApi,
    timeout: 8000
});
class ApiNetwork {
}
exports.default = ApiNetwork;
ApiNetwork.pay2ScriptAddress = (script) => {
    return nodeClient.post("/script/p2sAddress", { source: script }).then(res => res.data.address);
};
ApiNetwork.getGuardianPubkeys = () => {
    return explorerApi.get(`/api/v1/boxes/unspent/byTokenId/${conf_json_1.default.token.guardianNFT}`).then(res => {
        let box = res.data.items[0];
        let pubKeys = [];
        let arr = box.additionalRegisters.R4.renderedValue;
        arr.slice(1, arr.length).split(",").array.forEach((element) => {
            pubKeys.push(parseInt(element, 16));
        });
        pubKeys;
    });
};
