import {
    bankScript,
    guardianScript,
    guardianTokenRepo,
    guardianVAAScript, registerScript, registerVAAScript,
    sponserScript,
    VAAScript,
    wormholeScript
} from "./scripts";
import ApiNetwork from "../network/api";
import config from "../config/conf";
import {blake2b} from "ethereum-cryptography/blake2b";
import * as wasm from "ergo-lib-wasm-nodejs"

class Contracts {
    static generateBankContract = () => {
        const script: string = bankScript
            .replace("WORMHOLE_NFT", Buffer.from(config.token.wormholeNFT, "hex").toString("base64"))
            .replace("BANK_NFT", Buffer.from(config.token.bankNFT, "hex").toString("base64"))
            .replace("VAA_TOKEN", Buffer.from(config.token.VAAT, "hex").toString("base64"))
        return ApiNetwork.pay2ScriptAddress(script).then(res => {
            const P2SA = wasm.Address.from_base58(res);
            return wasm.Contract.pay_to_address(P2SA);
        });
    }

    static generateVAAContract = () => {
        const script: string = VAAScript.replace("WORMHOLE_NFT", Buffer.from(config.token.wormholeNFT, "hex").toString("base64"))
            .replace("BFT_SIGNATURE_COUNT", config.bftSignatureCount.toString());
        return ApiNetwork.pay2ScriptAddress(script).then(res => {
            const P2SA = wasm.Address.from_base58(res);
            return wasm.Contract.pay_to_address(P2SA);
        });
    }

    static generateWormholeContract = () => {
        const script: string = wormholeScript
            .replace("WORMHOLE_NFT", Buffer.from(config.token.wormholeNFT, "hex").toString("base64"))
            .replace("BANK_NFT", Buffer.from(config.token.bankNFT, "hex").toString("base64"))
            .replace("VAA_TOKEN", Buffer.from(config.token.VAAT, "hex").toString("base64"))
            .replace("GUARDIAN_TOKEN", Buffer.from(config.token.guardianToken, "hex").toString("base64"))

        return ApiNetwork.pay2ScriptAddress(script).then(res => {
            const P2SA = wasm.Address.from_base58(res);
            return wasm.Contract.pay_to_address(P2SA);
        });
    }

    static generateSponsorContract = () => {
        const script = sponserScript
            .replace("WORMHOLE_NFT", Buffer.from(config.token.wormholeNFT, "hex").toString("base64"))
            .replace("BANK_NFT", Buffer.from(config.token.bankNFT, "hex").toString("base64"))
            .replace("GUARDIAN_NFT", Buffer.from(config.token.guardianNFT, "hex").toString("base64"))
            .replace("REGISTER_NFT", Buffer.from(config.token.registerNFT, "hex").toString("base64"))
            .replace("FEE", config.fee.toString())
        return ApiNetwork.pay2ScriptAddress(script).then(res => {
            const P2SA = wasm.Address.from_base58(res);
            return wasm.Contract.pay_to_address(P2SA);
        });
    }

    static generateGuardianVAAContract = async() => {
        const guardianContract = await Contracts.generateGuardianContract()
        const guardianScriptHash = blake2b(Buffer.from(guardianContract.ergo_tree().to_base16_bytes(), "hex"), 32)
        const script: string = guardianVAAScript
            .replace("WORMHOLE_NFT", Buffer.from(config.token.wormholeNFT, "hex").toString("base64"))
            .replace("GUARDIAN_NFT", Buffer.from(config.token.guardianNFT, "hex").toString("base64"))
            .replace("BFT_SIGNATURE_COUNT", config.bftSignatureCount.toString())
            .replace("GUARDIAN_SCRIPT_HASH", guardianScriptHash.toString("base64"))
        return ApiNetwork.pay2ScriptAddress(script).then(res => {
            const P2SA = wasm.Address.from_base58(res);
            return wasm.Contract.pay_to_address(P2SA);
        });
    }

    static generateGuardianContract = () => {
        const script: string = guardianScript
            .replace("GUARDIAN_TOKEN", Buffer.from(config.token.guardianToken, "hex").toString("base64"));
        return ApiNetwork.pay2ScriptAddress(script).then(res => {
            const P2SA = wasm.Address.from_base58(res);
            return wasm.Contract.pay_to_address(P2SA);
        })

    }

    static generateGuardianTokenRepoContract = () => {
        const script: string = guardianTokenRepo
            .replace("VAA_TOKEN", Buffer.from(config.token.VAAT, "hex").toString("base64"))
        return ApiNetwork.pay2ScriptAddress(script).then(res => {
            const P2SA = wasm.Address.from_base58(res);
            return wasm.Contract.pay_to_address(P2SA);
        });
    }

    static generateRegisterContract = () => {
        const script: string = registerScript
            .replace("VAA_TOKEN", Buffer.from(config.token.VAAT, "hex").toString("base64"))
        return ApiNetwork.pay2ScriptAddress(script).then(res => {
            const P2SA = wasm.Address.from_base58(res);
            return wasm.Contract.pay_to_address(P2SA);
        });
    }

    static generateRegisterVAAContract = async () => {
        const registerContract = await Contracts.generateRegisterContract()
        const registerScriptHash = blake2b(Buffer.from(registerContract.ergo_tree().to_base16_bytes(), "hex"), 32)
        const script: string = registerVAAScript
            .replace("REGISTER_NFT", Buffer.from(config.token.registerNFT, "hex").toString("base64"))
            .replace("BFT_SIGNATURE_COUNT", config.bftSignatureCount.toString())
            .replace("REGISTER_SCRIPT_HASH", registerScriptHash.toString("base64"))
            .replace("WORMHOLE_NFT", Buffer.from(config.token.wormholeNFT, "hex").toString("base64"))
        return ApiNetwork.pay2ScriptAddress(script).then(res => {
            const P2SA = wasm.Address.from_base58(res);
            return wasm.Contract.pay_to_address(P2SA);
        })
    }
}

export default Contracts;
