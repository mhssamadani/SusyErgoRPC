import axios from "axios";
import config from "../config/conf";
import Contracts from "../susy/contracts";
import * as wasm from "ergo-lib-wasm-nodejs"
import { GuardianBox, VAABox } from "../models/boxes";
import { ergoTreeToAddress } from "../utils/codec";
import { TX } from "../models/types"

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
        const blockHeaders = wasm.BlockHeaders.from_json(blockHeaderJson);
        const preHeader = wasm.PreHeader.from_block_header(blockHeaders.get(0));
        return new wasm.ErgoStateContext(preHeader, blockHeaders);
    }

    static getBoxWithToken = (token: string) => {
        return explorerApi.get(`/api/v1/boxes/unspent/byTokenId/${token}`).then(res => res.data)
    }

    static getBoxesByAddress = (address: string) => {
        return explorerApi.get(`/api/v1/boxes/unspent/byAddress/${address}`).then(res => res.data)
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

    static getWormholeBox = async (): Promise<wasm.ErgoBox> => {
        const box: wasm.ErgoBox = wasm.ErgoBox.from_json(await ApiNetwork.getBoxWithToken(config.token.wormholeNFT).then(box => box.data.items[0]))
        return await ApiNetwork.trackMemPool(box)
    }

    static getBankBox = async (token: string, amount: number | string): Promise<wasm.ErgoBox> => {
        const bankBoxes = await ApiNetwork.getBoxWithToken(config.token.bankNFT).then(res => res.data.items)
        return bankBoxes.map((item: any) => wasm.ErgoBox.from_json(JSON.stringify(item))).filter((box: wasm.ErgoBox) => {
            return (box.tokens().get(1).id().to_str() === token && box.tokens().get(1).amount().as_i64().as_num() > Number(amount))
        })[0]
    }

    static getSponsorBox = async (): Promise<wasm.ErgoBox> => {
        const address = wasm.Address.recreate_from_ergo_tree((await Contracts.generateSponsorContract()).ergo_tree()).to_base58(config.networkType)
        const box: wasm.ErgoBox = wasm.ErgoBox.from_json(await ApiNetwork.getBoxesByAddress(address).then(box => box.data.items[0]))
        return await ApiNetwork.trackMemPool(box)
    }

    static getTransaction = async (txId: string) => {
        return await explorerApi.get(`/api/v1/transactions/${txId}`).then(res => res.data)
    }

    static trackMemPool = async (box: wasm.ErgoBox): Promise<any> => {
        const address: string = ergoTreeToAddress(box.ergo_tree())
        let mempoolBoxesMap = new Map<string, wasm.ErgoBox>();
        (await ApiNetwork.getBoxesByAddress(address).then(res => res.data.items)).forEach((tx: TX) => {
            for (var inBox of tx.inputs) {
                if (inBox.address) {
                    for (var outBox of tx.outputs) {
                        if (outBox.address) {
                            mempoolBoxesMap.set(inBox.boxId, wasm.ErgoBox.from_json(JSON.stringify(outBox)))
                            break
                        }
                    }
                    break
                }
            }
        })
        var lastBox: wasm.ErgoBox = box
        while (mempoolBoxesMap.has(lastBox.box_id().to_str())) lastBox = mempoolBoxesMap.get(lastBox.box_id().to_str())!
        return lastBox
    }

    static getBoxesForAddress = async (tree: string, offset = 0, limit = 100) => {
        return explorerApi.get(`/api/v1/boxes/unspent/byErgoTree/${tree}?offset=${offset}&limit=${limit}`).then(res => res.data);
    }

    static getCoveringForAddress = async (tree: string, amount: number, filter: (box: any) => boolean = () => true) => {
        return ApiNetwork.getCoveringErgoAndTokenForAddress(tree, amount, {}, filter);
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
