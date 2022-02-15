import axios from "axios";
import config from "../config/conf";
import Contracts from "../susy/contracts";
import * as wasm from "ergo-lib-wasm-nodejs"
import { GuardianBox, VAABox } from "../models/boxes";
import { ergoTreeToBase58Address } from "../utils/codec";
import ErgoTx from "../models/types";
import SleepPromise from 'sleep-promise';

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
    static pay2ScriptAddress = (script: string): Promise<string> => {
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
        return nodeClient.get("/info").then((info: any) => info.data.fullHeight)
    }

    static sendTx = (tx: any) => {
        return nodeClient.post("/transactions", JSON.parse(tx)).then(response => ({"txId": response.data as string})).catch(exp => {
            console.log(exp.response.data)
            return SleepPromise(config.sendTxTimeout).then(() => null)
        });
    };

    // TODO: should checked with new function
    static getErgoStateContext = async (): Promise<wasm.ErgoStateContext> => {
        const blockHeaderJson = await this.getLastBlockHeader();
        const blockHeaders = wasm.BlockHeaders.from_json(blockHeaderJson);
        const preHeader = wasm.PreHeader.from_block_header(blockHeaders.get(0));
        return new wasm.ErgoStateContext(preHeader, blockHeaders);
    }

    static getBoxWithToken = (token: string, offset: number = 0, limit: number = 100): Promise<{ total: number, boxes: Array<wasm.ErgoBox> }> => {
        return explorerApi.get(`/api/v1/boxes/unspent/byTokenId/${token}`).then(res => {
            const data = res.data
            return {
                boxes: data.items.map((item: JSON) => wasm.ErgoBox.from_json(JSON.stringify(item))),
                total: data.total
            }
        })
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
        return new GuardianBox(JSON.parse(box.boxes[0].to_json()))
    }

    static getGuardianTokenRepo = async (): Promise<wasm.ErgoBox> => {
        const box: wasm.ErgoBox = await ApiNetwork.getBoxWithToken(config.token.guardianNFT).then(boxes => boxes.boxes[0])
        return await ApiNetwork.trackMemPool(box)
    }

    static getVAABoxes = async (): Promise<Array<VAABox>> => {
        const vaaTree = (await Contracts.generateVAAContract()).ergo_tree().to_base16_bytes();
        const vaaRegisterTree = (await Contracts.generateRegisterVAAContract()).ergo_tree().to_base16_bytes();
        const vaaGuardianTree = (await Contracts.generateGuardianVAAContract()).ergo_tree().to_base16_bytes();
        const res = await ApiNetwork.getBoxWithToken(config.token.VAAT)
        const limit = 100
        let offset = 0
        let res_boxes: Array<VAABox> = []
        while (offset < res.total) {
            const page = await ApiNetwork.getBoxWithToken(config.token.VAAT, offset, limit)
            page.boxes.forEach(item => {
                const tree = item.ergo_tree().to_base16_bytes()
                if (tree === vaaTree || tree === vaaRegisterTree || tree === vaaGuardianTree) {
                    res_boxes.push(new VAABox(JSON.parse(item.to_json())));
                }
            });
            offset += limit
        }
        return res_boxes
    }

    static getWormholeBox = async (): Promise<wasm.ErgoBox> => {
        const box: wasm.ErgoBox = await ApiNetwork.getBoxWithToken(config.token.wormholeNFT).then(boxes => boxes.boxes[0])
        return await ApiNetwork.trackMemPool(box)
    }

    static getBankBox = async (token: string, amount: number | string): Promise<wasm.ErgoBox | undefined> => {
        const bankBoxes = await ApiNetwork.getBoxWithToken(config.token.bankNFT).then(res => res.boxes)
        const banks = bankBoxes.filter((box: wasm.ErgoBox) => {
            return (
                box.tokens().len() > 1 &&
                box.tokens().get(1).id().to_str() === token &&
                box.tokens().get(1).amount().as_i64().as_num() >= Number(amount)
            )
        })
        if (banks) {
            return banks[0];
        }
        return undefined;
    }

    static getSponsorBox = async (): Promise<wasm.ErgoBox> => {
        const address: string = ergoTreeToBase58Address((await Contracts.generateSponsorContract()).ergo_tree())
        const box: wasm.ErgoBox = wasm.ErgoBox.from_json(JSON.stringify(await ApiNetwork.getBoxesByAddress(address).then(box => box.items[0])))
        return await ApiNetwork.trackMemPool(box)
    }

    static getRegisterBox = async (): Promise<wasm.ErgoBox> => {
        return ApiNetwork.getBoxWithToken(config.token.registerNFT).then(res => res.boxes[0])
    }

    static getTransaction = async (txId: string) => {
        return await explorerApi.get(`/api/v1/transactions/${txId}`).then(res => res.data)
    }

    static getMemPoolTxForAddress = async (address: string) => {
        return await explorerApi.get<{ items: Array<ErgoTx>, total: number }>(`/api/v1/mempool/transactions/byAddress/${address}`).then(res => res.data)
    }
    static trackMemPool = async (box: wasm.ErgoBox): Promise<any> => {
        const address: string = ergoTreeToBase58Address(box.ergo_tree())
        let memPoolBoxesMap = new Map<string, wasm.ErgoBox>();
        (await ApiNetwork.getMemPoolTxForAddress(address).then(res => {
            return res.items
        })).forEach((tx: ErgoTx) => {
            for (let inBox of tx.inputs) {
                if (inBox.address === address) {
                    for (let outBox of tx.outputs) {
                        if (outBox.address === address) {
                            memPoolBoxesMap.set(inBox.boxId, wasm.ErgoBox.from_json(JSON.stringify(outBox)))
                            break
                        }
                    }
                    break
                }
            }
        })
        let lastBox: wasm.ErgoBox = box
        while (memPoolBoxesMap.has(lastBox.box_id().to_str())) lastBox = memPoolBoxesMap.get(lastBox.box_id().to_str())!
        return lastBox
    }

    static getBoxesForAddress = async (tree: string, offset = 0, limit = 100) => {
        return explorerApi.get(`/api/v1/boxes/unspent/byErgoTree/${tree}?offset=${offset}&limit=${limit}`).then(res => res.data);
    }

    static getCoveringForAddress = async (tree: string, amount: number, filter: (box: any) => boolean = () => true) => {
        return ApiNetwork.getCoveringErgoAndTokenForAddress(tree, amount, {}, filter);
    }

    static getCoveringErgoAndTokenForAddress = async (
        tree: string,
        amount: number,
        covering: { [id: string]: number } = {},
        filter: (box: any) => boolean = () => true
    ): Promise<{ covered: boolean, boxes: Array<wasm.ErgoBox> }> => {
        let res = []
        const boxesItems = await ApiNetwork.getBoxesForAddress(tree, 0, 1)
        const total = boxesItems.total;
        let offset = 0;
        const remaining = () => {
            const tokenRemain = Object.entries(covering).map(([key, amount]) => Math.max(amount, 0)).reduce((a, b) => a + b, 0);
            return tokenRemain + Math.max(amount, 0) > 0;
        }
        while (offset < total && remaining()) {
            const boxes = await ApiNetwork.getBoxesForAddress(tree, offset, 10)
            for (let box of boxes.items) {
                if (filter(box)) {
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
        return {boxes: res.map(box => wasm.ErgoBox.from_json(JSON.stringify(box))), covered: !remaining()}

    }
}

export default ApiNetwork;
