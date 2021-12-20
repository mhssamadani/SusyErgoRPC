import axios, { Axios } from "axios";
import config from "../config/conf.json";

const URL = config.node;
const nodeClient = axios.create({
    baseURL: URL,
    timeout: 8000,
    headers: {"Content-Type": "application/json"}
});

const explorerApi = axios.create({
    baseURL: config.explorerApi,
    timeout: 8000
})

export default class ApiNetwork {
    static pay2ScriptAddress = (script: string) => {
        return nodeClient.post("/script/p2sAddress", {source: script}).then(
            res => res.data.address
        )
    }

    static getGuardianData = () => {
        return explorerApi.get(`/boxes/unspent/byTokenId/${config.token.guardianNFT}`).then(res => res.data)
    }
}