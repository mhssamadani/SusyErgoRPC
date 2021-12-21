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

    static getGuardianPubkeys = () => {
        return explorerApi.get(`/api/v1/boxes/unspent/byTokenId/${config.token.guardianNFT}`).then(res => {
            let box = res.data.items[0]
            let pubKeys: Array<number> = []

            let arr = box.additionalRegisters.R4.renderedValue
            arr.slice(1, arr.length).split(",").array.forEach((element: string) => {
                pubKeys.push(parseInt(element, 16))
            });
            pubKeys
        })
    }

    static getVAABoxes = () => {
        return explorerApi.get(`/api/v1/boxes/unspent/byTokenId/${config.token.VAAT}`).then(res => res.data.items)
    }

    static trackMempool = async (box: any) => {
        let mempoolTxs = await explorerApi.get(`/api/v1/mempool/transactions/byAddress/${box.address}`).then(res => res.data)
        if (mempoolTxs.total == 0) return box
        mempoolTxs.items.array.forEach((tx: any) => {
            if (tx.inputs[1].boxId == box.boxId) {
                let newVAABox = tx.outputs[1]
                return ApiNetwork.trackMempool(newVAABox) // TODO: IS THIS TRUE ? IS THIS RETURN FOR WHOLE FUNCTION ? OR JUST forEach ??
            }
        });
    }

}
