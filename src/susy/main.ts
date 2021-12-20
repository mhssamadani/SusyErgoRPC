import {ErgoBox} from "ergo-lib-wasm-nodejs";
import config from "../config/conf.json";
import {Boxes} from "./boxes";
const ergoLib = require("ergo-lib-wasm-nodejs");

async function updateVAABox(wormhole: ErgoBox, VAABox: ErgoBox, sponsor: ErgoBox, guardianBox: ErgoBox, guardianSecret: bigint, index: number) {
    const outSponsor = await Boxes.getSponsor(sponsor.value().as_i64().as_num() - config.fee);
    // const observation = VAABox.register_value(0).
}
