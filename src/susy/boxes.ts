import Contracts from "./contracts";
import config from "../config/conf";
import * as wasm from "ergo-lib-wasm-nodejs";
import {ergo, wormhole} from "../config/keys";
import {Buffer} from "buffer";

class Boxes {
    // TODO: should checked I64 or number is ok
    static getSponsorBox = async (value: number) => {
        const sponsorValue = wasm.BoxValue.from_i64(wasm.I64.from_str(value.toString()));
        return new wasm.ErgoBoxCandidateBuilder(
            sponsorValue,
            await Contracts.generateSponsorContract(),
            0
        ).build();
    }

    static getBank = async (tokenCount: wasm.I64) => {
        const value = wasm.BoxValue.from_i64(wasm.I64.from_str("1000000000"));
        const bankBuilder = new wasm.ErgoBoxCandidateBuilder(
            value,
            await Contracts.generateBankContract(),
            0
        );
        bankBuilder.add_token(
            wasm.TokenId.from_str(config.token.bankNFT),
            wasm.TokenAmount.from_i64(wasm.I64.from_str("1"))
        );
        // bankBuilder.add_token(
        //     wasm.token.from_str(config.token.bankToken),
        //     wasm.token.TokenAmount.from_i64(
        //     tokenCount
        //     )
        // );
        return bankBuilder.build();
    }

    static getWormholeBox = async () => {
        const contract = await Contracts.generateWormholeContract();
        const candidateBuilder = new wasm.ErgoBoxCandidateBuilder(
            wasm.BoxValue.from_i64(wasm.I64.from_str(config.fee.toString())),
            contract,
            0
        )
        candidateBuilder.add_token(wasm.TokenId.from_str(config.token.wormholeNFT), wasm.TokenAmount.from_i64(wasm.I64.from_str("1")))
        return candidateBuilder.build()
    }

    static getGuardianBox = async (index: number) => {
        const contract: wasm.Contract = await Contracts.generateGuardianContract();
        const tou8 = require('buffer-to-uint8array');
        const wormholePublic = wormhole.map(item => tou8(Buffer.from(item.address.substring(2), "hex")))
        const ergoPublic = ergo.map(item => tou8(Buffer.from(item.publicKey, "hex")))
        const builder = new wasm.ErgoBoxCandidateBuilder(
            wasm.BoxValue.from_i64(wasm.I64.from_str(config.fee.toString())),
            contract,
            0
        )
        builder.set_register_value(4, wasm.Constant.from_coll_coll_byte(wormholePublic))
        builder.set_register_value(5, wasm.Constant.from_coll_coll_byte(ergoPublic))
        builder.set_register_value(6, wasm.Constant.from_i32(index))
        builder.add_token(wasm.TokenId.from_str(config.token.guardianToken), wasm.TokenAmount.from_i64(wasm.I64.from_str("1")))
        return builder.build()
    }
}

export {Boxes};
