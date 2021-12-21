import {ErgoBox} from "ergo-lib-wasm-nodejs";
import config from "../config/conf.json";
import {Boxes} from "./boxes";
import blake from "blakejs";
import Contracts from "./contracts";
const ergoLib = require("ergo-lib-wasm-nodejs");

async function updateVAABox(wormhole: ErgoBox, VAABox: ErgoBox, sponsor: ErgoBox, guardianBox: ErgoBox, guardianSecret: bigint, index: number) {
    const outSponsor = await Boxes.getSponsor(sponsor.value().as_i64().as_num() - config.fee);
    // TODO: not sure this is right, should asked from mostafa
    const observation = VAABox.register_value(0)!.to_tuple_coll_bytes()[0];
    const payload= VAABox.register_value(0)!.to_tuple_coll_bytes()[1];
    const hashMsg=blake.blake2bHex(new Uint8Array([...observation,...payload]),null!,32);
    // TODO: sign should be get from input

    // TODO: Completing after sigma_rust PR
    // const signatureCount=VAABox.register_value(3)!.
    // const checksum
    const checksum=1;
    const outVAA=new ergoLib.ErgoBoxCandidateBuilder(VAABox.value(),await Contracts.generateVAAContract(),0);
    for(let i=0;i<3;i++){
        outVAA.set_register_value(i,VAABox.register_value(i)!);
    }

}
