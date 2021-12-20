import Contracts from "./contracts";

const ergoLib = require("ergo-lib-wasm-nodejs");

export class Boxes {
    static async getSponsor(value: number) {
        const sponsorValue = ergoLib.BoxValue.from_i64(ergoLib.I64.from_str(value.toString()));
        return new ergoLib.ErgoBoxCandidateBuilder(
            sponsorValue,
            await Contracts.generateSponsorContract(),
            0
        )
            .build();
    }
}
