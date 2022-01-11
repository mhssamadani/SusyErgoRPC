import Contracts from "./contracts";
import config from "../config/conf";
import * as wasm from "ergo-lib-wasm-nodejs";
import {ergo, wormhole} from "../config/keys";
import {Buffer} from "buffer";
import * as codec from '../utils/codec';

const MIN_BOX_ERG = wasm.BoxValue.from_i64(wasm.I64.from_str(config.minBoxValue.toString()));

class Boxes {
    // TODO: should checked I64 or number is ok
    static getSponsorBox = async (value: number, height: number = 0): Promise<wasm.ErgoBoxCandidate> => {
        const sponsorValue = wasm.BoxValue.from_i64(wasm.I64.from_str(value.toString()));
        return new wasm.ErgoBoxCandidateBuilder(
            sponsorValue,
            await Contracts.generateSponsorContract(),
            height
        ).build();
    }

    static getBank = async (token: string, amount: wasm.I64, height: number = 0): Promise<wasm.ErgoBoxCandidate> => {
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
        const contract = await Contracts.generateWormholeContract();
        const candidateBuilder = new wasm.ErgoBoxCandidateBuilder(
            MIN_BOX_ERG,
            contract,
            height
        )
        candidateBuilder.add_token(wasm.TokenId.from_str(config.token.wormholeNFT), wasm.TokenAmount.from_i64(wasm.I64.from_str("1")))
        return candidateBuilder.build()
    }

    static getGuardianBox = async (index: number, height: number = 0): Promise<wasm.ErgoBoxCandidate> => {
        const contract: wasm.Contract = await Contracts.generateGuardianContract();
        const wormholePublic = wormhole.map(item => codec.hexStringToByte(item.address.substring(2)))
        const ergoPublic = ergo.map(item => codec.hexStringToByte(item.publicKey))
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

    static getRegisterChainBox = async (id: Buffer, address: Buffer, height: number, oldBox?: wasm.ErgoBox): Promise<wasm.ErgoBoxCandidate> => {
        const builder = new wasm.ErgoBoxCandidateBuilder(
            MIN_BOX_ERG,
            await Contracts.generateRegisterContract(),
            height
        )
        let r4 = oldBox ? oldBox.register_value(4)?.to_coll_coll_byte()! : [];
        let r5 = oldBox ? oldBox.register_value(5)?.to_coll_coll_byte()! : [];
        r4.push(Uint8Array.from(id))
        r5.push(Uint8Array.from(address))
        builder.add_token(wasm.TokenId.from_str(config.token.registerNFT), wasm.TokenAmount.from_i64(wasm.I64.from_str("1")))
        builder.set_register_value(4, wasm.Constant.from_coll_coll_byte(r4))
        builder.set_register_value(5, wasm.Constant.from_coll_coll_byte(r5))
        return builder.build()
    }
}

export {Boxes};
