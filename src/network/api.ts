import axios from "axios";
import config from "../config/conf";
import Contracts from "../susy/contracts";
const ergoLib = require("ergo-lib-wasm-nodejs");

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

    static getLastBlockHeader = () => {
        return nodeClient.get("/blocks/lastHeaders/10").then(
            res => res.data
        )
    }

    static getHeight = async (): Promise<number> => {
        return nodeClient.get("/info").then((info: any) => info.fullHeight)
    }

    static sendTx = async (tx: any) => {
        const response = await nodeClient.post("/transactions", JSON.parse(tx));
        return { "txId": response.data as string };
    };

    // TODO: should checked with new function
    static getErgoStateContexet = async () => {
        const blockHeaderJson = await this.getLastBlockHeader();
        const blockHeaders = ergoLib.BlockHeaders.from_json(blockHeaderJson);
        const preHeader = ergoLib.PreHeader.from_block_header(blockHeaders.get(0));
        return new ergoLib.ErgoStateContext(preHeader, blockHeaders);
    }

    static getBoxWithToken = (token: string) => {
        return explorerApi.get(`/api/v1/boxes/unspent/byTokenId/${token}`).then(res => res.data)
    }

    static getGuardianBox = () => {
        ApiNetwork.getBoxWithToken(config.token.guardianNFT).then(res => res.items[0])
    }

    static getVAABoxes = () => {
        return explorerApi.get(`/api/v1/boxes/unspent/byTokenId/${config.token.VAAT}`).then(res => res.data.items)
    }

    static getWormholeBox = () => {
        return explorerApi.get(`/api/v1/boxes/unspent/byTokenId/${config.token.wormholeNFT}`).then(res => res.data.items[0])
    }

    static getBankBox = () => {
        return explorerApi.get(`/api/v1/boxes/unspent/byTokenId/${config.token.bankNFT}`).then(res => res.data.items[0])
    }

    static getSponsorBox = () => {
        let address = Contracts.generateSponsorContract()
        return explorerApi.get(`/api/v1/boxes/unspent/byAddress/${address}`).then(res => res.data.items[0])
    }

    static getTransaction = async (txId: string) => {
        return await explorerApi.get(`/api/v1/transactions/${txId}`).then(res => res.data)
    }

    static trackMempool = async (box: any, index: number): Promise<any> => {
        let mempoolTxs = await explorerApi.get(`/api/v1/mempool/transactions/byAddress/${box.address}`).then(res => res.data)
        if (mempoolTxs.total == 0) return box
        for (const tx of mempoolTxs.items.array) {
            if (tx.inputs[index].boxId == box.boxId) {
                let newVAABox = tx.outputs[index]
                return ApiNetwork.trackMempool(newVAABox, index)
            }
        }
        return box
    }

    static getBoxesForAddress = async (tree: string, offset=0, limit=100) => {
        return explorerApi.get(`/api/v1/boxes/unspent/byErgoTree/${tree}?offset=${offset}&limit=${limit}`).then(res => res.data);
    }

    static getCoveringForAddress = async (tree: string, amount: number, ignoreBoxes: Array<string> = [], filter: (box: any) => boolean = () => true) => {
        let res = []
        const boxesItems = await ApiNetwork.getBoxesForAddress(tree, 0, 1)
        const total = boxesItems.total;
        let offset = 0;
        let selectedIds: Array<string> = [];
        while (offset < total && amount > 0){
            const boxes = await ApiNetwork.getBoxesForAddress(tree, offset, 10)
            for(let box of boxes.items){
                if(ignoreBoxes.indexOf(box.boxId) < 0 && filter(box)){
                    selectedIds.push(box.boxId)
                    res.push(JSON.stringify(box));
                    amount -= box.value;
                    if(amount <= 0) break
                }
            }
            offset += 10;
        }
        return {boxes: res, covered: amount <= 0, selectedIds: selectedIds}
    }
}
