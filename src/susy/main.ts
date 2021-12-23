import {ErgoBox} from "ergo-lib-wasm-nodejs";
import config from "../config/conf";
import {Boxes} from "./boxes";
import blake from "blakejs";
import Contracts from "./contracts";
import ApiNetwork from "../network/api";
import {hexStringToByte} from "../utils/decodeEncode";


const ergoLib = require("ergo-lib-wasm-nodejs");

async function updateVAABox(
    wormhole: ErgoBox,
    VAABox: ErgoBox,
    sponsor: ErgoBox,
    guardianBox: ErgoBox,
    guardianSecret: bigint,
    index: number,
    signA: Uint8Array,
    signZ: Uint8Array
) {
    const outSponsor = await Boxes.getSponsor(sponsor.value().as_i64().as_num() - config.fee);
    const observation = VAABox.register_value(0)!.to_coll_coll_byte()[0];
    const payload = VAABox.register_value(0)!.to_coll_coll_byte()[1];
    const hashMsg = blake.blake2bHex(new Uint8Array([...observation, ...payload]), null!, 32);

    const signatureCount = VAABox.register_value(3)!.to_i32_array()[1];
    const checksum = VAABox.register_value(3)!.to_i32_array()[0]

    const VAABuilder = new ergoLib.ErgoBoxCandidateBuilder(
        VAABox.value(),
        await Contracts.generateVAAContract(),
        0
    );
    VAABuilder.add_token(
        ergoLib.token.from_str(config.token.VAAT),
        ergoLib.token.TokenAmount.from_i64(
            ergoLib.I64.from_str(
                "1"
            )
        )
    );
    for (let i = 0; i < 3; i++) {
        VAABuilder.set_register_value(i, VAABox.register_value(i)!);
    }
    VAABuilder.set_register_value(3,
        ergoLib.Constant.from_i32_array(
            [Math.pow(2, index), checksum, (signatureCount + 1), index]
        )
    );
    // TODO: should check
    VAABuilder.set_register_value(4, ergoLib.Constant.from_ecpoint_bytes(signA));
    VAABuilder.set_register_value(5, ergoLib.Constant.from_byte_array_bigint(signZ));
    const outVAA = VAABuilder.build();
    const wormholeBuilder = new ergoLib.ErgoBoxCandidateBuilder(
        wormhole.value(),
        await Contracts.generateWormholeContract(),
        0
    );
    wormholeBuilder.add_token(wormhole.tokens().get(0).id(), wormhole.tokens().get(0).amount());
    const outWormhole = wormholeBuilder.build();
    const inputBoxes = ergoLib.ErgoBoxes.new(wormhole);
    inputBoxes.add(VAABox);
    inputBoxes.add(sponsor);
    inputBoxes.add(guardianBox);
    const boxSelection = new ergoLib.BoxSelection(inputBoxes, new ergoLib.ErgoBoxAssetsDataList());
    const txOutput = new ergoLib.ErgoBoxCandidates(outWormhole);
    txOutput.add(outVAA);
    txOutput.add(outSponsor);
    const tx = ergoLib.TxBuilder.new(
        boxSelection,
        txOutput,
        0,
        ergoLib.BoxValue.from_i64(
            ergoLib.I64.from_str(
                config.fee.toString()
            )
        ),
        ergoLib.Address.recreate_from_ergo_tree(sponsor.ergo_tree()),
        ergoLib.BoxValue.SAFE_USER_MIN()
    );
    // TODO:should check signer secret key
    const sks = new ergoLib.SecretKeys();
    sks.add(ergoLib.SecretKey.dlog_from_bytes(hexStringToByte(ergoLib.Address.config.updateSK)));
    const wallet = ergoLib.Wallet.from_secrets(sks);
    const tx_data_inputs = new ergoLib.ErgoBoxes(guardianBox);
    const ctx = await ApiNetwork.getErgoStateContexet();
    const signedTx = wallet.sign_transaction(ctx, tx, inputBoxes, tx_data_inputs)
    return signedTx.to_json();

}
