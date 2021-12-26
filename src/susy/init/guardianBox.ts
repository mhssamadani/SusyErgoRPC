import * as util from "ethereumjs-util";
import {Buffer} from "buffer";
import {verify} from "../../utils/ecdsa";
import * as bip39 from "bip39";
import {hdkey} from "ethereumjs-wallet";
import * as wasm from 'ergo-lib-wasm-nodejs'
import { fromSeed } from 'bip32';
import config from "../../config/conf";
import {createAndSignTx, fetchBoxesAndIssueToken, getSecret, sendAndWaitTx} from "./util";
import ApiNetwork from "../../network/api";
import Contracts from "../contracts";

const wormholeAddress = () => {
    const mnemonic = bip39.generateMnemonic(160)
    const wallet = hdkey.fromMasterSeed(bip39.mnemonicToSeedSync(mnemonic)).getWallet()
    const address = `0x${wallet.getAddress().toString('hex')}`
    return {privateKey: wallet.getPrivateKey(), address: address, mnemonic: mnemonic}
}

const ergoAddress = () => {
    const tou8 = require('buffer-to-uint8array');
    const mnemonic = bip39.generateMnemonic(160)
    const seed = fromSeed(bip39.mnemonicToSeedSync(mnemonic)).derivePath("m/44'/429'/0'/0/0");
    const secretHex = seed.privateKey?.toString("hex")
    const secret = wasm.SecretKey.dlog_from_bytes(tou8(seed.privateKey));
    let hexed = ""
    secret.get_address().to_bytes(config.networkType).forEach((chr, index) => hexed = hexed + chr.toString(16).padStart(2, "0"))
    const publicKey = hexed.substring(2, hexed.length - 8);
    return {publicKey: publicKey, mnemonic: mnemonic, seed: secretHex}
}

const createGuardianBox = async () => {
    const secret = getSecret();
    const height = await ApiNetwork.getHeight();
    const contract: wasm.Contract = await Contracts.generateGuardianContract();
    const tou8 = require('buffer-to-uint8array');
    const ergoAddresses = Array(6).fill("").map(item => ergoAddress())
    const wormholeAddresses = Array(6).fill("").map(item => wormholeAddress())
    console.log(ergoAddresses, wormholeAddresses)
    const wormholePublic = wormholeAddresses.map(item => tou8(Buffer.from(item.address, "hex")))
    const ergoPublic = ergoAddresses.map(item => tou8(Buffer.from(item.publicKey, "hex")))
    const builder = new wasm.ErgoBoxCandidateBuilder(
        wasm.BoxValue.from_i64(wasm.I64.from_str(config.fee.toString())),
        contract,
        height
    )
    builder.set_register_value(4, wasm.Constant.from_coll_coll_byte(wormholePublic))
    builder.set_register_value(5, wasm.Constant.from_coll_coll_byte(ergoPublic))
    builder.set_register_value(6, wasm.Constant.from_i32(0))
    builder.add_token(wasm.TokenId.from_str(config.token.guardianToken), wasm.TokenAmount.from_i64(wasm.I64.from_str("1")))
    const NFTBoxes = await ApiNetwork.getBoxWithToken(config.token.guardianToken)
    let boxes: Array<wasm.ErgoBox> = []
    try {
        boxes.push(wasm.ErgoBox.from_json(JSON.stringify(NFTBoxes.items[0])));
    } catch (exp) {
        throw Error("bank identifier or nft not found")
    }
    const required = 3 * config.fee - boxes.map(box => box.value().as_i64().as_num()).reduce((a, b) => a + b, 0)
    if(required > 0){
        const ergBoxes = await ApiNetwork.getCoveringForAddress(
            secret.get_address().to_ergo_tree().to_base16_bytes().toString(),
            required,
            [],
            (box) => wasm.ErgoBox.from_json(JSON.stringify(box)).tokens().len() === 0
        )
        if(!ergBoxes.covered) {
            throw Error("insufficient boxes to issue guardian box")
        }
        ergBoxes.boxes.forEach(item => boxes.push(wasm.ErgoBox.from_json(item)))
    }
    const candidate = builder.build()
    const inputBoxes = new wasm.ErgoBoxes(boxes[0])
    boxes.slice(1).forEach(item => inputBoxes.add(item))
    await sendAndWaitTx(await createAndSignTx(secret, inputBoxes, [candidate], height));
}


export default createGuardianBox;
