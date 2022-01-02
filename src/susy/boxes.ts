import Contracts from "./contracts";
import config from "../config/conf";
import * as wasm from "ergo-lib-wasm-nodejs";
import {ergo, wormhole} from "../config/keys";
import {Buffer} from "buffer";

class Boxes {
    // TODO: should checked I64 or number is ok
    static getSponsorBox = async (value: number, height: number = 0) => {
        const sponsorValue = wasm.BoxValue.from_i64(wasm.I64.from_str(value.toString()));
        return new wasm.ErgoBoxCandidateBuilder(
            sponsorValue,
            await Contracts.generateSponsorContract(),
            height
        ).build();
    }

    static getBank = async (token: string, amount: wasm.I64, height: number = 0) => {
        const value = wasm.BoxValue.from_i64(wasm.I64.from_str("1000000000"));
        const bankBuilder = new wasm.ErgoBoxCandidateBuilder(
            value,
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

    static getWormholeBox = async (height: number = 0) => {
        const contract = await Contracts.generateWormholeContract();
        const candidateBuilder = new wasm.ErgoBoxCandidateBuilder(
            wasm.BoxValue.from_i64(wasm.I64.from_str(config.fee.toString())),
            contract,
            height
        )
        candidateBuilder.add_token(wasm.TokenId.from_str(config.token.wormholeNFT), wasm.TokenAmount.from_i64(wasm.I64.from_str("1")))
        return candidateBuilder.build()
    }

    static getGuardianBox = async (index: number, height: number = 0) => {
        const contract: wasm.Contract = await Contracts.generateGuardianContract();
        const tou8 = require('buffer-to-uint8array');
        const wormholePublic = wormhole.map(item => tou8(Buffer.from(item.address.substring(2), "hex")))
        const ergoPublic = ergo.map(item => tou8(Buffer.from(item.publicKey, "hex")))
        const builder = new wasm.ErgoBoxCandidateBuilder(
            wasm.BoxValue.from_i64(wasm.I64.from_str(config.fee.toString())),
            contract,
            height
        )
        builder.set_register_value(4, wasm.Constant.from_coll_coll_byte(wormholePublic))
        builder.set_register_value(5, wasm.Constant.from_coll_coll_byte(ergoPublic))
        builder.set_register_value(6, wasm.Constant.from_i32(index))
        builder.add_token(wasm.TokenId.from_str(config.token.guardianToken), wasm.TokenAmount.from_i64(wasm.I64.from_str("1")))
        return builder.build()
    }
}

export {Boxes};
