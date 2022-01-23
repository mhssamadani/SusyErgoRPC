import Contracts from "./contracts";
import config from "../config/conf";
import * as wasm from "ergo-lib-wasm-nodejs";
import {ergo, wormhole} from "../config/keys";
import {Buffer} from "buffer";
import * as codec from '../utils/codec';
import ApiNetwork from "../network/api";

const MIN_BOX_ERG = wasm.BoxValue.from_i64(wasm.I64.from_str(config.minBoxValue.toString()));

class Boxes {
    // TODO: should checked I64 or number is ok
    static getSponsorBox = async (value: number, height: number = 0): Promise<wasm.ErgoBoxCandidate> => {
        if (!height) height = await ApiNetwork.getHeight()
        const sponsorValue = wasm.BoxValue.from_i64(wasm.I64.from_str(value.toString()));
        return new wasm.ErgoBoxCandidateBuilder(
            sponsorValue,
            await Contracts.generateSponsorContract(),
            height
        ).build();
    }

    static getBank = async (token: string, amount: wasm.I64, height: number = 0): Promise<wasm.ErgoBoxCandidate> => {
        if (!height) height = await ApiNetwork.getHeight()
        const bankBuilder = new wasm.ErgoBoxCandidateBuilder(
            MIN_BOX_ERG,
            await Contracts.generateBankContract(),
            height,
        );
        bankBuilder.add_token(
            wasm.TokenId.from_str(config.token.bankNFT),
            wasm.TokenAmount.from_i64(wasm.I64.from_str("1"))
        );
        bankBuilder.add_token(
            wasm.TokenId.from_str(token),
            wasm.TokenAmount.from_i64(amount)
        );
        return bankBuilder.build();
    }

    static getWormholeBox = async (height: number = 0): Promise<wasm.ErgoBoxCandidate> => {
        if (!height) height = await ApiNetwork.getHeight()
        const contract = await Contracts.generateWormholeContract();
        const candidateBuilder = new wasm.ErgoBoxCandidateBuilder(
            MIN_BOX_ERG,
            contract,
            height
        )
        candidateBuilder.add_token(wasm.TokenId.from_str(config.token.wormholeNFT), wasm.TokenAmount.from_i64(wasm.I64.from_str("1")))
        return candidateBuilder.build()
    }

    static getGuardianBox = async (index: number, wormholePublic?: Array<Uint8Array>, ergoPublic?: Array<Uint8Array>, height: number = 0): Promise<wasm.ErgoBoxCandidate> => {
        if (!height) height = await ApiNetwork.getHeight()
        const contract: wasm.Contract = await Contracts.generateGuardianContract();
        wormholePublic = wormholePublic ? wormholePublic : wormhole.map(item => codec.hexStringToByte(item.address.substring(2)))
        ergoPublic = ergoPublic ? ergoPublic : ergo.map(item => codec.hexStringToByte(item.publicKey))
        const builder = new wasm.ErgoBoxCandidateBuilder(
            MIN_BOX_ERG,
            contract,
            height
        )
        builder.set_register_value(4, wasm.Constant.from_coll_coll_byte(wormholePublic))
        builder.set_register_value(5, wasm.Constant.from_coll_coll_byte(ergoPublic))
        builder.set_register_value(6, wasm.Constant.from_i32(index))
        builder.add_token(wasm.TokenId.from_str(config.token.guardianToken), wasm.TokenAmount.from_i64(wasm.I64.from_str("1")))
        return builder.build()
    }

    static getRegisterChainBox = async (id?: number, address?: Buffer, height?: number, oldBox?: wasm.ErgoBox): Promise<wasm.ErgoBoxCandidate> => {
        if (!height) height = await ApiNetwork.getHeight()
        const builder = new wasm.ErgoBoxCandidateBuilder(
            MIN_BOX_ERG,
            await Contracts.generateRegisterContract(),
            height
        )
        let r4 = oldBox ? oldBox.register_value(4)?.to_coll_coll_byte()! : [];
        let r5 = oldBox ? oldBox.register_value(5)?.to_coll_coll_byte()! : [];
        if (id && address) {
            r4.push(Uint8Array.from(Buffer.from(codec.UInt16ToByte(id), "hex")))
            r5.push(Uint8Array.from(address))
        }
        builder.add_token(wasm.TokenId.from_str(config.token.registerNFT), wasm.TokenAmount.from_i64(wasm.I64.from_str("1")))
        builder.set_register_value(4, wasm.Constant.from_coll_coll_byte(r4))
        builder.set_register_value(5, wasm.Constant.from_coll_coll_byte(r5))
        return builder.build()
    }

    static getTokenRedeemBox = async (height?: number, tokenCount?: number, value?: number) => {
        if (!height) height = await ApiNetwork.getHeight();
        tokenCount = tokenCount ? tokenCount : 1
        const vaaSourceAuthorityContract = await Contracts.generateVaaCreatorContract()
        const vaaTokenRedeemBuilder = new wasm.ErgoBoxCandidateBuilder(
            wasm.BoxValue.from_i64(wasm.I64.from_str((value ? value : config.minBoxValue).toString())),
            vaaSourceAuthorityContract,
            height
        )
        vaaTokenRedeemBuilder.add_token(
            wasm.TokenId.from_str(config.token.VAAT),
            wasm.TokenAmount.from_i64(wasm.I64.from_str(tokenCount.toString()))
        );
        return vaaTokenRedeemBuilder.build()
    }

    static getGuardianTokenRepo = async (tokenCount: number, oldBox?: wasm.ErgoBox, value?: number, height?: number) => {
        if (!height) height = await ApiNetwork.getHeight();
        const builder = new wasm.ErgoBoxCandidateBuilder(
            wasm.BoxValue.from_i64(wasm.I64.from_str((value ? value : config.minBoxValue).toString())),
            await Contracts.generateGuardianTokenRepoContract(),
            height
        );
        builder.add_token(wasm.TokenId.from_str(config.token.guardianNFT), wasm.TokenAmount.from_i64(wasm.I64.from_str("1")));
        builder.add_token(wasm.TokenId.from_str(config.token.guardianToken), wasm.TokenAmount.from_i64(wasm.I64.from_str(tokenCount.toString())));
        const R4: Int32Array = oldBox ? oldBox.register_value(4)?.to_i32_array()! : new Int32Array([0, config.guardianLimit]);
        builder.set_register_value(4, wasm.Constant.from_i32_array(new Int32Array([R4[0] + 1, R4[1]])));
        return builder.build()
    }
}

export {Boxes};
