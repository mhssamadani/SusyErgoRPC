import * as scripts from './scripts';
import ApiNetwork from "../network/api";
import config from "../config/conf";
import { blake2b } from "ethereum-cryptography/blake2b";
import * as wasm from "ergo-lib-wasm-nodejs"
import { Contract } from "ergo-lib-wasm-nodejs";

const getContractScriptHashBase64 = (contract: wasm.Contract) => blake2b(Buffer.from(contract.ergo_tree().to_base16_bytes(), "hex"), 32).toString("base64")

const MIN_BOX_ERG = config.minBoxValue.toString();

interface addressesCache {
    vaaCreator?: Contract,
    bank?: Contract,
    vaa?: Contract,
    wormhole?: Contract,
    sponsor?: Contract,
    guardianVaa?: Contract,
    guardian?: Contract,
    guardianTokenRepo?: Contract,
    register?: Contract,
    registerVAA?: Contract,
    feePayment?: Contract
}

class Contracts {

    static cache: addressesCache = {}

    static generateFeePayment = async () => {
        if (this.cache.feePayment) return this.cache.feePayment;
        else {
            try {
                const script: string = scripts.feePayment.replace(
                    "GUARDIAN_TOKEN",
                    Buffer.from(config.token.guardianToken, "hex").toString("base64")
                );
                const res = await ApiNetwork.pay2ScriptAddress(script);
                const P2SA = wasm.Address.from_base58(res);
                this.cache.feePayment = wasm.Contract.pay_to_address(P2SA);
                return this.cache.feePayment;
            } catch (e) {
                console.log(e)
                throw e
            }
        }
    }

    static generateVaaCreatorContract = async () => {
        if (this.cache.vaaCreator) return this.cache.vaaCreator;
        else {
            try {
                const pubKey = Buffer.from(config.address.to_bytes(config.networkType)).slice(1, 34)
                const script: string = scripts.VAACreator
                    .replace("FEE", config.fee.toString())
                    .replace("PAYMENT_VAA", getContractScriptHashBase64(await this.generateVAAContract()))
                    .replace("REGISTER_VAA", getContractScriptHashBase64(await this.generateRegisterVAAContract()))
                    .replace("GUARDIAN_VAA", getContractScriptHashBase64(await this.generateGuardianVAAContract()))
                    .replace("CREATOR_AUTHORITY_PK", pubKey.toString("base64"))
                    .replace("MIN_BOX_ERG", MIN_BOX_ERG)
                const res = await ApiNetwork.pay2ScriptAddress(script);
                const P2SA = wasm.Address.from_base58(res);
                this.cache.vaaCreator = wasm.Contract.pay_to_address(P2SA);
                return this.cache.vaaCreator;
            } catch (e) {
                console.log(e)
                throw e
            }
        }
    }

    static generateBankContract = async () => {
        if (this.cache.bank) return this.cache.bank;
        else {
            const script: string = scripts.bankScript
                .replace("WORMHOLE_NFT", Buffer.from(config.token.wormholeNFT, "hex").toString("base64"))
                .replace("BANK_NFT", Buffer.from(config.token.bankNFT, "hex").toString("base64"))
                .replace("VAA_TOKEN", Buffer.from(config.token.VAAT, "hex").toString("base64"))
            const address = await ApiNetwork.pay2ScriptAddress(script);
            const P2SA = wasm.Address.from_base58(address);
            this.cache.bank = wasm.Contract.pay_to_address(P2SA);
            return this.cache.bank;
        }
    }

    static generateVAAContract = async () => {
        if (this.cache.vaa) return this.cache.vaa;
        else {
            const feePaymentContract = await Contracts.generateFeePayment();
            const feePaymentHash = blake2b(Buffer.from(feePaymentContract.ergo_tree().to_base16_bytes(), "hex"), 32)
            const script: string = scripts.VAAScript
                .replace("WORMHOLE_NFT", Buffer.from(config.token.wormholeNFT, "hex").toString("base64"))
                .replace("BFT_SIGNATURE_COUNT", config.bftSignatureCount.toString())
                .replace("TRANSACTION_FEE", config.fee.toString())
                .replace("MIN_BOX_ERG", MIN_BOX_ERG)
                .replace("FEE_PAYMENT_HASH", feePaymentHash.toString("base64"));
            const address = await ApiNetwork.pay2ScriptAddress(script)
            const P2SA = wasm.Address.from_base58(address);
            this.cache.vaa = wasm.Contract.pay_to_address(P2SA);
            return this.cache.vaa;
        }
    }

    static generateWormholeContract = async () => {
        if (this.cache.wormhole) return this.cache.wormhole;
        else {
            const script: string = scripts.wormholeScript
                .replace("WORMHOLE_NFT", Buffer.from(config.token.wormholeNFT, "hex").toString("base64"))
                .replace("BANK_NFT", Buffer.from(config.token.bankNFT, "hex").toString("base64"))
                .replace("VAA_TOKEN", Buffer.from(config.token.VAAT, "hex").toString("base64"))
                .replace("GUARDIAN_TOKEN", Buffer.from(config.token.guardianToken, "hex").toString("base64"))

            const address = await ApiNetwork.pay2ScriptAddress(script)
            const P2SA = wasm.Address.from_base58(address);
            this.cache.wormhole = wasm.Contract.pay_to_address(P2SA);
            return this.cache.wormhole;
        }
    }

    static generateSponsorContract = async () => {
        if (this.cache.sponsor) return this.cache.sponsor;
        else {
            const script = scripts.sponsorScript
                .replace("WORMHOLE_NFT", Buffer.from(config.token.wormholeNFT, "hex").toString("base64"))
                .replace("BANK_NFT", Buffer.from(config.token.bankNFT, "hex").toString("base64"))
                .replace("GUARDIAN_NFT", Buffer.from(config.token.guardianNFT, "hex").toString("base64"))
                .replace("REGISTER_NFT", Buffer.from(config.token.registerNFT, "hex").toString("base64"))
                .replace("FEE", config.fee.toString())
                .replace("MIN_BOX_ERG", config.minBoxValue.toString())
            const address = await ApiNetwork.pay2ScriptAddress(script)
            const P2SA = wasm.Address.from_base58(address);
            this.cache.sponsor = wasm.Contract.pay_to_address(P2SA);
            return this.cache.sponsor;
        }
    }

    static generateGuardianVAAContract = async () => {
        if (this.cache.guardianVaa) return this.cache.guardianVaa;
        else {
            const guardianContract = await Contracts.generateGuardianContract()
            const guardianScriptHash = blake2b(Buffer.from(guardianContract.ergo_tree().to_base16_bytes(), "hex"), 32)
            const script: string = scripts.guardianVAAScript
                .replace("WORMHOLE_NFT", Buffer.from(config.token.wormholeNFT, "hex").toString("base64"))
                .replace("GUARDIAN_NFT", Buffer.from(config.token.guardianNFT, "hex").toString("base64"))
                .replace("BFT_SIGNATURE_COUNT", config.adminBftSignatureCount.toString())
                .replace("MIN_BOX_ERG", MIN_BOX_ERG)
                .replace("FEE", config.fee.toString())
                .replace("GUARDIAN_SCRIPT_HASH", guardianScriptHash.toString("base64"))
            const address = await ApiNetwork.pay2ScriptAddress(script)
            const P2SA = wasm.Address.from_base58(address);
            this.cache.guardianVaa = wasm.Contract.pay_to_address(P2SA);
            return this.cache.guardianVaa;
        }
    }

    static generateGuardianContract = async () => {
        if (this.cache.guardian) return this.cache.guardian;
        else {
            const script: string = scripts.guardianScript
                .replace("GUARDIAN_NFT", Buffer.from(config.token.guardianNFT, "hex").toString("base64"));
            const address = await ApiNetwork.pay2ScriptAddress(script)
            const P2SA = wasm.Address.from_base58(address);
            this.cache.guardian = wasm.Contract.pay_to_address(P2SA);
            return this.cache.guardian;
        }
    }

    static generateGuardianTokenRepoContract = async () => {
        if (this.cache.guardianTokenRepo) return this.cache.guardianTokenRepo;
        else {
            const script: string = scripts.guardianTokenRepo
                .replace("VAA_TOKEN", Buffer.from(config.token.VAAT, "hex").toString("base64"))
            const address = await ApiNetwork.pay2ScriptAddress(script)
            const P2SA = wasm.Address.from_base58(address);
            this.cache.guardianTokenRepo = wasm.Contract.pay_to_address(P2SA);
            return this.cache.guardianTokenRepo;
        }
    }

    static generateRegisterContract = async () => {
        if (this.cache.register) return this.cache.register;
        else {
            const script: string = scripts.registerScript
                .replace("VAA_TOKEN", Buffer.from(config.token.VAAT, "hex").toString("base64"))
            const address = await ApiNetwork.pay2ScriptAddress(script)
            const P2SA = wasm.Address.from_base58(address);
            this.cache.register = wasm.Contract.pay_to_address(P2SA);
            return this.cache.register;
        }
    }

    static generateRegisterVAAContract = async () => {
        if (this.cache.registerVAA) return this.cache.registerVAA;
        else {
            const registerContract = await Contracts.generateRegisterContract()
            const registerScriptHash = blake2b(Buffer.from(registerContract.ergo_tree().to_base16_bytes(), "hex"), 32)
            const script: string = scripts.registerVAAScript
                .replace("REGISTER_NFT", Buffer.from(config.token.registerNFT, "hex").toString("base64"))
                .replace("BFT_SIGNATURE_COUNT", config.adminBftSignatureCount.toString())
                .replace("REGISTER_SCRIPT_HASH", registerScriptHash.toString("base64"))
                .replace("MIN_BOX_ERG", MIN_BOX_ERG)
                .replace("FEE", config.fee.toString())
                .replace("WORMHOLE_NFT", Buffer.from(config.token.wormholeNFT, "hex").toString("base64"))
            const address = await ApiNetwork.pay2ScriptAddress(script)
            const P2SA = wasm.Address.from_base58(address);
            this.cache.registerVAA = wasm.Contract.pay_to_address(P2SA);
            return this.cache.registerVAA;
        }
    }
}

export default Contracts;
