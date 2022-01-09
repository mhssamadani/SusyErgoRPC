import {
    bankScript,
    guardianScript,
    guardianTokenRepo,
    guardianVAAScript, registerScript, registerVAAScript,
    sponsorScript, VAACreator,
    VAAScript,
    wormholeScript
} from "./scripts";
import ApiNetwork from "../network/api";
import config from "../config/conf";
import {blake2b} from "ethereum-cryptography/blake2b";
import * as wasm from "ergo-lib-wasm-nodejs"

const getContractScriptHashBase64 = (contract: wasm.Contract) => blake2b(Buffer.from(contract.ergo_tree().to_base16_bytes(), "hex"), 32).toString("base64")

const MIN_BOX_ERG = config.minBoxValue.toString();

class Contracts {
    static generateVaaCreatorContract = async () => {
        try {
            const pubKey = Buffer.from(wasm.Address.from_base58(config.address).to_bytes(config.networkType)).slice(1, 34)
            const script: string = VAACreator
                .replace("FEE", config.fee.toString())
                .replace("PAYMENT_VAA", getContractScriptHashBase64(await this.generateVAAContract()))
                .replace("REGISTER_VAA", getContractScriptHashBase64(await this.generateRegisterVAAContract()))
                .replace("GUARDIAN_VAA", getContractScriptHashBase64(await this.generateGuardianVAAContract()))
                .replace("CREATOR_AUTHORITY_PK", pubKey.toString("base64"))
                .replace("MIN_BOX_ERG", MIN_BOX_ERG)
            const res = await ApiNetwork.pay2ScriptAddress(script)
            const P2SA = wasm.Address.from_base58(res);
            return wasm.Contract.pay_to_address(P2SA);
        } catch (e) {
            console.log(e)
            throw e
        }
    }

    static generateBankContract = async () => {
        const script: string = bankScript
            .replace("WORMHOLE_NFT", Buffer.from(config.token.wormholeNFT, "hex").toString("base64"))
            .replace("BANK_NFT", Buffer.from(config.token.bankNFT, "hex").toString("base64"))
            .replace("VAA_TOKEN", Buffer.from(config.token.VAAT, "hex").toString("base64"))
        const address = await ApiNetwork.pay2ScriptAddress(script)
        const P2SA = wasm.Address.from_base58(address);
        return wasm.Contract.pay_to_address(P2SA);
    }

    static generateVAAContract = async () => {
        const script: string = VAAScript
            .replace("WORMHOLE_NFT", Buffer.from(config.token.wormholeNFT, "hex").toString("base64"))
            .replace("BFT_SIGNATURE_COUNT", config.bftSignatureCount.toString())
            .replace("TRANSACTION_FEE", config.fee.toString())
            .replace("MIN_BOX_ERG", MIN_BOX_ERG);
        const address = await ApiNetwork.pay2ScriptAddress(script)
        const P2SA = wasm.Address.from_base58(address);
        return wasm.Contract.pay_to_address(P2SA);
    }

    static generateWormholeContract = async () => {
        const script: string = wormholeScript
            .replace("WORMHOLE_NFT", Buffer.from(config.token.wormholeNFT, "hex").toString("base64"))
            .replace("BANK_NFT", Buffer.from(config.token.bankNFT, "hex").toString("base64"))
            .replace("VAA_TOKEN", Buffer.from(config.token.VAAT, "hex").toString("base64"))
            .replace("GUARDIAN_TOKEN", Buffer.from(config.token.guardianToken, "hex").toString("base64"))

        const address = await ApiNetwork.pay2ScriptAddress(script)
        const P2SA = wasm.Address.from_base58(address);
        return wasm.Contract.pay_to_address(P2SA);
    }

    static generateSponsorContract = async () => {
        const script = sponsorScript
            .replace("WORMHOLE_NFT", Buffer.from(config.token.wormholeNFT, "hex").toString("base64"))
            .replace("BANK_NFT", Buffer.from(config.token.bankNFT, "hex").toString("base64"))
            .replace("GUARDIAN_NFT", Buffer.from(config.token.guardianNFT, "hex").toString("base64"))
            .replace("REGISTER_NFT", Buffer.from(config.token.registerNFT, "hex").toString("base64"))
            .replace("FEE", config.fee.toString())
        const address = await ApiNetwork.pay2ScriptAddress(script)
        const P2SA = wasm.Address.from_base58(address);
        return wasm.Contract.pay_to_address(P2SA);
    }

    static generateGuardianVAAContract = async () => {
        const guardianContract = await Contracts.generateGuardianContract()
        const guardianScriptHash = blake2b(Buffer.from(guardianContract.ergo_tree().to_base16_bytes(), "hex"), 32)
        const script: string = guardianVAAScript
            .replace("WORMHOLE_NFT", Buffer.from(config.token.wormholeNFT, "hex").toString("base64"))
            .replace("GUARDIAN_NFT", Buffer.from(config.token.guardianNFT, "hex").toString("base64"))
            .replace("BFT_SIGNATURE_COUNT", config.bftSignatureCount.toString())
            .replace("MIN_BOX_ERG", MIN_BOX_ERG)
            .replace("FEE", config.fee.toString())
            .replace("GUARDIAN_SCRIPT_HASH", guardianScriptHash.toString("base64"))
        const address = await ApiNetwork.pay2ScriptAddress(script)
        const P2SA = wasm.Address.from_base58(address);
        return wasm.Contract.pay_to_address(P2SA);
    }

    static generateGuardianContract = async () => {
        const script: string = guardianScript
            .replace("GUARDIAN_TOKEN", Buffer.from(config.token.guardianToken, "hex").toString("base64"));
        const address = await ApiNetwork.pay2ScriptAddress(script)
        const P2SA = wasm.Address.from_base58(address);
        return wasm.Contract.pay_to_address(P2SA);
    }

    static generateGuardianTokenRepoContract = async () => {
        const script: string = guardianTokenRepo
            .replace("VAA_TOKEN", Buffer.from(config.token.VAAT, "hex").toString("base64"))
        const address = await ApiNetwork.pay2ScriptAddress(script)
        const P2SA = wasm.Address.from_base58(address);
        return wasm.Contract.pay_to_address(P2SA);
    }

    static generateRegisterContract = async () => {
        const script: string = registerScript
            .replace("VAA_TOKEN", Buffer.from(config.token.VAAT, "hex").toString("base64"))
        const address = await ApiNetwork.pay2ScriptAddress(script)
        const P2SA = wasm.Address.from_base58(address);
        return wasm.Contract.pay_to_address(P2SA);
    }

    static generateRegisterVAAContract = async () => {
        const registerContract = await Contracts.generateRegisterContract()
        const registerScriptHash = blake2b(Buffer.from(registerContract.ergo_tree().to_base16_bytes(), "hex"), 32)
        const script: string = registerVAAScript
            .replace("REGISTER_NFT", Buffer.from(config.token.registerNFT, "hex").toString("base64"))
            .replace("BFT_SIGNATURE_COUNT", config.bftSignatureCount.toString())
            .replace("REGISTER_SCRIPT_HASH", registerScriptHash.toString("base64"))
            .replace("MIN_BOX_ERG", MIN_BOX_ERG)
            .replace("FEE", config.fee.toString())
            .replace("WORMHOLE_NFT", Buffer.from(config.token.wormholeNFT, "hex").toString("base64"))
        const address = await ApiNetwork.pay2ScriptAddress(script)
        const P2SA = wasm.Address.from_base58(address);
        return wasm.Contract.pay_to_address(P2SA);
    }
}

export default Contracts;
