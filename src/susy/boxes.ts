import Contracts from "./contracts";
import config from "../config/conf";
import {I64} from "ergo-lib-wasm-nodejs";

const ergoLib = require("ergo-lib-wasm-nodejs");

export class Boxes {
    // TODO: should checked I64 or number is ok
    static async getSponsor(value: number) {
        const sponsorValue = ergoLib.BoxValue.from_i64(ergoLib.I64.from_str(value.toString()));
        return new ergoLib.ErgoBoxCandidateBuilder(
            sponsorValue,
            await Contracts.generateSponsorContract(),
            0
        ).build();
    }

    static async getBank(tokenCount: I64) {
        const value = ergoLib.BoxValue.from_i64(ergoLib.I64.from_str("1000000000"));
        const bankBuilder = new ergoLib.ErgoBoxCandidateBuilder(
            value,
            await Contracts.generateBankContract(),
            0
        );
        bankBuilder.add_token(
            ergoLib.token.from_str(config.token.bankNFT),
            ergoLib.token.TokenAmount.from_i64(
                ergoLib.I64.from_str(
                    "1"
                )
            )
        );
        // bankBuilder.add_token(
        //     ergoLib.token.from_str(config.token.bankToken),
        //     ergoLib.token.TokenAmount.from_i64(
        //     tokenCount
        //     )
        // );
        return bankBuilder.build();
    }
}
