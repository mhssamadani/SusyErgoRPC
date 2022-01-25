import * as bip39 from "bip39";
import { hdkey } from "ethereumjs-wallet";
import * as wasm from 'ergo-lib-wasm-nodejs'
import { fromSeed } from 'bip32';
import config from "../../config/conf";
import { createAndSignTx, getSecret, sendAndWaitTx } from "./util";
import ApiNetwork from "../../network/api";
import { Boxes } from "../boxes";

const wormholeAddress = () => {
    const mnemonic = bip39.generateMnemonic(160)
    const wallet = hdkey.fromMasterSeed(bip39.mnemonicToSeedSync(mnemonic)).getWallet()
    const address = `0x${wallet.getAddress().toString('hex')}`
    return {privateKey: wallet.getPrivateKey(), address: address, mnemonic: mnemonic}
}

const ergoAddress = () => {
    const mnemonic = bip39.generateMnemonic(160)
    const seed = fromSeed(bip39.mnemonicToSeedSync(mnemonic)).derivePath("m/44'/429'/0'/0/0");
    const secretHex = seed.privateKey?.toString("hex")
    const secret = wasm.SecretKey.dlog_from_bytes(Uint8Array.from(seed.privateKey!));
    let hexed = ""
    secret.get_address().to_bytes(config.networkType).forEach((chr, index) => hexed = hexed + chr.toString(16).padStart(2, "0"))
    const publicKey = hexed.substring(2, hexed.length - 8);
    return {publicKey: publicKey, mnemonic: mnemonic, seed: secretHex}
}

const createGuardianTokenRepo = async (tokenCount: number) => {
    const tokenRepoBox = await Boxes.getGuardianTokenRepo(tokenCount)
    const inputBoxes = await ApiNetwork.getCoveringErgoAndTokenForAddress(
        config.address.to_ergo_tree().to_base16_bytes(),
        config.minBoxValue,
        {
            [config.token.guardianNFT]: 1,
            [config.token.guardianToken]: tokenCount
        }
    )
    if (!inputBoxes.covered) {
        throw Error("insufficient boxes to issue guardian box")
    }
    const txBoxes = new wasm.ErgoBoxes(inputBoxes.boxes[0]);
    inputBoxes.boxes.slice(1).forEach(box => txBoxes.add(box))
    await sendAndWaitTx(await createAndSignTx(config.secret!, txBoxes, [tokenRepoBox]));
}
const createGuardianBox = async (index: number) => {
    const secret = getSecret();
    const height = await ApiNetwork.getHeight();
    const NFTBoxes = await ApiNetwork.getBoxWithToken(config.token.guardianToken)
    let boxes: Array<wasm.ErgoBox> = []
    try {
        boxes.push(NFTBoxes.boxes[0]);
    } catch (exp) {
        throw Error("bank identifier or nft not found")
    }
    const required = 3 * config.fee - boxes.map(box => box.value().as_i64().as_num()).reduce((a, b) => a + b, 0)
    if (required > 0) {
        const ergBoxes = await ApiNetwork.getCoveringForAddress(
            secret.get_address().to_ergo_tree().to_base16_bytes().toString(),
            required,
            (box) => wasm.ErgoBox.from_json(JSON.stringify(box)).tokens().len() === 0
        )
        if (!ergBoxes.covered) {
            throw Error("insufficient boxes to issue guardian box")
        }
        ergBoxes.boxes.forEach(item => boxes.push(wasm.ErgoBox.from_json(JSON.stringify(item))))
    }
    const candidate = await Boxes.getGuardianBox(0)
    const inputBoxes = new wasm.ErgoBoxes(boxes[0])
    boxes.slice(1).forEach(item => inputBoxes.add(item))
    await sendAndWaitTx(await createAndSignTx(secret, inputBoxes, [candidate], height));
}


export default createGuardianBox;

export {
    createGuardianTokenRepo
}
