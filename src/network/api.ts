import axios from "axios";
import config from "../config/conf";
import Contracts from "../susy/contracts";
import ergoLib from "ergo-lib-wasm-nodejs"
import { GuardianBox, VAABox } from "../models/boxes";

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

class ApiNetwork {
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

    static sendTx = (tx: any) => {
        return nodeClient.post("/transactions", JSON.parse(tx)).then(response => ({"txId": response.data as string})).catch(exp => {
            console.log(exp.response.data)
        });
    };

    // TODO: should checked with new function
    static getErgoStateContext = async () => {
        const blockHeaderJson = await this.getLastBlockHeader();
        const blockHeaders = ergoLib.BlockHeaders.from_json(blockHeaderJson);
        const preHeader = ergoLib.PreHeader.from_block_header(blockHeaders.get(0));
        return new ergoLib.ErgoStateContext(preHeader, blockHeaders);
    }

    static getBoxWithToken = (token: string) => {
        return explorerApi.get(`/api/v1/boxes/unspent/byTokenId/${token}`).then(res => res.data)
    }

    static getGuardianBox = async (setIndex: number): Promise<GuardianBox> => {
        const guardianAddress = await Contracts.generateGuardianContract()
        const box = await ApiNetwork.getCoveringErgoAndTokenForAddress(
            guardianAddress.ergo_tree().to_base16_bytes(),
            0,
            {[config.token.guardianToken]: 1},
            box => {
                if (!box.hasOwnProperty('assets')) {
                    return false
                }
                let found = false
                box.assets.forEach((item: { tokenId: string }) => {
                    if (item.tokenId === config.token.guardianToken) found = true
                });
                if (!found) return false
                if (box.hasOwnProperty('additionalRegisters')) {
                    if (box.additionalRegisters.hasOwnProperty('R6')) {
                        return box.additionalRegisters.R6.renderedValue === setIndex.toString()
                    }
                }
                return false
            }
        )
        if (!box.covered) {
            throw Error("guardian box not found")
        }
        return new GuardianBox(box.boxes[0])
    }

    static getVAABoxes = async (): Promise<Array<VAABox>> => {
        const vaaAddress = await Contracts.generateVAAContract()
        const boxes = await ApiNetwork.getCoveringErgoAndTokenForAddress(
            vaaAddress.ergo_tree().to_base16_bytes(),
            1e18,
            {},
            box => {
                if (!box.hasOwnProperty('assets')) {
                    return false
                }
                let found = false
                box.assets.forEach((item: { tokenId: string }) => {
                    if (item.tokenId === config.token.VAAT) found = true
                });
                return found
            }
        )
        return boxes.boxes.map(box => new VAABox(box));
    }

    static getWormholeBox = async () => {
        const box = await explorerApi.get(`/api/v1/boxes/unspent/byTokenId/${config.token.wormholeNFT}`)
        return await ApiNetwork.trackMemPool(box.data.items[0], 1)
    }

    static getBankBox = async (token: string, amount: number | string): Promise<ergoLib.ErgoBox> => {
        const bankBoxes = await explorerApi.get(`/api/v1/boxes/unspent/byTokenId/${config.token.bankNFT}`).then(res => res.data.items)
        return bankBoxes.filter((box: any) => {
            const ergoBox = ergoLib.ErgoBox.from_json(JSON.stringify(box))
            return (ergoBox.tokens().get(1).id().to_str() === token && ergoBox.tokens().get(1).amount().as_i64().as_num() > Number(amount))
        })[0]
    }

    static getSponsorBox = async () => {
        const address = ergoLib.Address.recreate_from_ergo_tree((await Contracts.generateSponsorContract()).ergo_tree()).to_base58(config.networkType)
        const box = await explorerApi.get(`/api/v1/boxes/unspent/byAddress/${address}`)
        return await ApiNetwork.trackMemPool(box.data.items[0], 1)
    }

    static getTransaction = async (txId: string) => {
        return await explorerApi.get(`/api/v1/transactions/${txId}`).then(res => res.data)
    }

    static trackMemPool = async (box: any, index: number): Promise<any> => {
        // let mempoolTxs = await explorerApi.get(`/api/v1/mempool/transactions/byAddress/${box.address}`).then(res => res.data)
        // if (mempoolTxs.total == 0) return box
        // for (const tx of mempoolTxs.items) {
        //     if (tx.inputs[index].boxId == box.boxId) {
        //         let newVAABox = tx.outputs[index]
        //         return ApiNetwork.trackMemPool(newVAABox, index)
        //     }
        // }
        return box
    }

    static getBoxesForAddress = async (tree: string, offset = 0, limit = 100) => {
        return explorerApi.get(`/api/v1/boxes/unspent/byErgoTree/${tree}?offset=${offset}&limit=${limit}`).then(res => res.data);
    }

    static getCoveringForAddress = async (tree: string, amount: number, filter: (box: any) => boolean = () => true) => {
        return ApiNetwork.getCoveringErgoAndTokenForAddress(tree, amount);
    }

    static getCoveringErgoAndTokenForAddress = async (tree: string, amount: number, covering: { [id: string]: number } = {}, filter: (box: any) => boolean = () => true) => {
        let res = []
        const boxesItems = await ApiNetwork.getBoxesForAddress(tree, 0, 1)
        const total = boxesItems.total;
        let offset = 0;
        let selectedIds: Array<string> = [];
        const remaining = () => {
            const tokenRemain = Object.entries(covering).map(([key, amount]) => Math.max(amount, 0)).reduce((a, b) => a + b, 0);
            return tokenRemain + Math.max(amount, 0) > 0;
        }
        while (offset < total && remaining()) {
            const boxes = await ApiNetwork.getBoxesForAddress(tree, offset, 10)
            for (let box of boxes.items) {
                if (filter(box)) {
                    selectedIds.push(box.boxId)
                    res.push(box);
                    amount -= box.value;
                    box.assets.map((asset: any) => {
                        if (covering.hasOwnProperty(asset.tokenId)) {
                            covering[asset.tokenId] -= asset.amount;
                        }
                    })
                    if (!remaining()) break
                }
            }
            offset += 10;
        }
        return {boxes: res, covered: !remaining(), selectedIds: selectedIds}

    }
}

export default ApiNetwork;
