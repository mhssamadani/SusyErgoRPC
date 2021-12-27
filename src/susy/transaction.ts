import {ErgoBoxes, ErgoBox, ErgoStateContext} from "ergo-lib-wasm-nodejs";
import config from "../config/conf";
import {Boxes} from "./boxes";
import Contracts from "./contracts";
import ApiNetwork from "../network/api";
import {hexStringToByte, strToUint8Array} from "../utils/codec";
import VAA from "../models/models";
import * as codec from '../utils/codec';
import {createAndSignTx} from "./init/util";
import * as wasm from 'ergo-lib-wasm-nodejs'

const issueVAA = async (VAASourceBox: ErgoBoxes, VAAMessage: VAA, VAAAuthorityAddress: string) => {
    const height = await ApiNetwork.getHeight();
    const VAAAuthorityAddressSigma = wasm.Address.from_base58(VAAAuthorityAddress);
    const VAABuilder = new wasm.ErgoBoxCandidateBuilder(
        wasm.BoxValue.from_i64(wasm.I64.from_str(config.fee.toString())),
        await Contracts.generateVAAContract(),
        0
    );

    VAABuilder.add_token(wasm.TokenId.from_str(config.token.VAAT), wasm.TokenAmount.from_i64(wasm.I64.from_str("1")));
    VAABuilder.set_register_value(4, wasm.Constant.from_coll_coll_byte([codec.strToUint8Array(VAAMessage.observationWithoutPayload()), VAAMessage.payload.bytes]));
    VAABuilder.set_register_value(5, wasm.Constant.from_coll_coll_byte(VAAMessage.Signatures.map(item => codec.strToUint8Array(item.toHex()))));

    VAABuilder.set_register_value(6, wasm.Constant.from_byte_array(VAAAuthorityAddressSigma.to_bytes(0)));
    VAABuilder.set_register_value(7, wasm.Constant.from_i32_array(Int32Array.from([0, 0, 0, VAAMessage.GuardianSetIndex, VAAMessage.EmitterChain])));
    const secret = wasm.SecretKey.dlog_from_bytes(hexStringToByte(config.addressSecret))
    const outVAA = VAABuilder.build();
    return (await createAndSignTx(secret, VAASourceBox, [outVAA], height)).to_json()
}


const updateVAABox = async (
    wormhole: ErgoBox,
    VAABox: ErgoBox,
    sponsor: ErgoBox,
    guardianBox: ErgoBox,
    index: number,
    signA: Uint8Array,
    signZ: Uint8Array,
    ctx?: ErgoStateContext
): Promise<any> => {
    const outSponsor = await Boxes.getSponsorBox(sponsor.value().as_i64().as_num() - config.fee);
    const signatureCount = VAABox.register_value(7)!.to_i32_array()[1];
    const checksum = VAABox.register_value(7)!.to_i32_array()[0]

    const VAABuilder = new wasm.ErgoBoxCandidateBuilder(VAABox.value(), await Contracts.generateVAAContract(), 0);
    VAABuilder.add_token(wasm.TokenId.from_str(config.token.VAAT), wasm.TokenAmount.from_i64(wasm.I64.from_str("1")));
    for (let i = 4; i < 7; i++) VAABuilder.set_register_value(i, VAABox.register_value(i)!);
    const R7 = VAABox.register_value(7)?.to_i32_array()!
    const guardianIndex = R7[3]
    const emitterIndex = R7[4]
    VAABuilder.set_register_value(7, wasm.Constant.from_i32_array(Int32Array.from([Math.pow(2, index) + checksum, (signatureCount + 1), index, guardianIndex, emitterIndex])));
    // TODO: should check
    VAABuilder.set_register_value(8, wasm.Constant.from_ecpoint_bytes_group_element(signA));
    VAABuilder.set_register_value(9, wasm.Constant.from_bigint_signed_bytes_be(signZ));
    const outVAA = VAABuilder.build();
    const wormholeBuilder = new wasm.ErgoBoxCandidateBuilder(
        wormhole.value(),
        await Contracts.generateWormholeContract(),
        0
    );
    wormholeBuilder.add_token(wormhole.tokens().get(0).id(), wormhole.tokens().get(0).amount());
    const outWormhole = wormholeBuilder.build();
    const inputBoxes = new wasm.ErgoBoxes(wormhole);
    inputBoxes.add(VAABox);
    inputBoxes.add(sponsor);
    // inputBoxes.add(guardianBox);
    const tx = generateTx(inputBoxes, [outWormhole, outVAA, outSponsor], sponsor);
    const dataInputs = new wasm.DataInputs()
    dataInputs.add(new wasm.DataInput(guardianBox.box_id()))
    tx.set_data_inputs(dataInputs);
    const sks = new wasm.SecretKeys();
    const wallet = wasm.Wallet.from_secrets(sks);
    const tx_data_inputs = new wasm.ErgoBoxes(guardianBox);
    const internalCtx =  ctx ? ctx : await ApiNetwork.getErgoStateContext();
    console.log(tx.build().to_json())
    const signedTx = wallet.sign_transaction(internalCtx, tx.build(), inputBoxes, tx_data_inputs)
    return console.log(signedTx.to_json());
}

function generateTx(inputBoxes: any, outputs: [any, ...any[]], sponsor: any) {
    const boxSelection = new wasm.BoxSelection(inputBoxes, new wasm.ErgoBoxAssetsDataList());
    const txOutput = new wasm.ErgoBoxCandidates(outputs[0]);
    for (let i = 1; i < outputs.length; i++) txOutput.add(outputs[i]);
    return wasm.TxBuilder.new(
        boxSelection,
        txOutput,
        0,
        wasm.BoxValue.from_i64(
            wasm.I64.from_str(
                config.fee.toString()
            )
        ),
        wasm.Address.recreate_from_ergo_tree(sponsor.ergo_tree()),
        wasm.BoxValue.SAFE_USER_MIN()
    );
}

const createPayment = async (bank: ErgoBox, VAABox: ErgoBox, sponsor: ErgoBox, guardianBox: ErgoBox): Promise<any> => {
    // TODO:is register value index same as sacala version?
    if (VAABox.register_value(3)?.to_i32_array()[1]! < config.bftSignatureCount) {
        throw("Not enough signature");
    }
    const payload = VAABox.register_value(0)?.to_coll_coll_byte()[1]!;
    const amount = new DataView(payload.slice(1, 33)).getInt32(0, false);
    const tokenId = payload.slice(33, 65);
    const userAddress = payload.slice(67, 103);
    const fee = new DataView(payload.slice(105, 137)).getInt32(0, false);
    const receiverBuilder = new wasm.ErgoBoxCandidateBuilder(
        wasm.BoxValue.from_i64(
            wasm.I64.from_str(
                config.fee.toString()
            )
        ),
        wasm.Contract.pay_to_address(wasm.Address.from_bytes(userAddress)),
        0
    );
    // TODO:i64
    receiverBuilder.add_token(
        wasm.TokenId.from_str(Buffer.from(tokenId).toString('hex')),
        wasm.TokenAmount.from_i64(wasm.I64.from_str((amount - fee).toString()))
    );
    const outReceiver = receiverBuilder.build();
    const outBank = await Boxes.getBank(
        bank.tokens().get(1).amount().as_i64().checked_add(
            wasm.I64.from_str((amount - fee).toString())
        )
    );
    const VAABuilder = new wasm.ErgoBoxCandidateBuilder(
        VAABox.value(),
        await Contracts.generateVAAContract(),
        0
    );
    VAABuilder.add_token(
        VAABox.tokens().get(0).id(),
        VAABox.tokens().get(0).amount()
    );

    for (let i = 0; i < 3; i++) VAABuilder.set_register_value(i, VAABox.register_value(i)!);
    const outVAA = VAABuilder.build();
    const outSponsor = await Boxes.getSponsorBox(sponsor.value().as_i64().as_num() - config.fee * 2);
    const inputBoxes = new wasm.ErgoBoxes(bank);
    inputBoxes.add(VAABox);
    inputBoxes.add(sponsor);
    const tx = generateTx(inputBoxes, [outBank, outVAA, outReceiver, outSponsor], sponsor);
    const dataInputs = new wasm.DataInputs()
    dataInputs.add(new wasm.DataInput(guardianBox.box_id()))
    tx.set_data_inputs(dataInputs);
    // TODO:should check signer secret key
    const sks = new wasm.SecretKeys();
    sks.add(wasm.SecretKey.dlog_from_bytes(strToUint8Array(config.addressSecret)));
    const wallet = wasm.Wallet.from_secrets(sks);
    const tx_data_inputs = new wasm.ErgoBoxes(guardianBox);
    const ctx = await ApiNetwork.getErgoStateContext();
    const signedTx = wallet.sign_transaction(ctx, tx.build(), inputBoxes, tx_data_inputs)
    return signedTx.to_json();

}

const createRequest = async (bank: ErgoBox, application: ErgoBox, amount: number, fee: number) => {
    // hex string of "6obZ6DUGj8qLVwVB28U2tCwa13jVrAFvo3jzMuxTgSeY"
    const receiverAddress = strToUint8Array("563a38ab1f1be9e8c57f66f6cd56ed08e2b906e7e0310067f50171245906c21d");
    console.log(receiverAddress)
    const receiverChainId = new Uint8Array([0, 1]);
    console.log(receiverChainId)
    const bankBuilder = new wasm.ErgoBoxCandidateBuilder(
        bank.value(),
        wasm.Contract.pay_to_address(wasm.Address.recreate_from_ergo_tree(bank.ergo_tree())),
        0
    );
    // TODO:i64
    bankBuilder.add_token(
        bank.tokens().get(0).id(),
        bank.tokens().get(0).amount()
    );
    bankBuilder.add_token(
        bank.tokens().get(1).id(),
        wasm.TokenAmount.from_i64(bank.tokens().get(1).amount().as_i64().checked_add(wasm.I64.from_str((amount).toString())))
    );
    bankBuilder.set_register_value(
        4,
        wasm.Constant.from_i64_str_array([amount.toString(), fee.toString()])
    );
    // TODO: should work with tuple coll
    // bankBuilder.set_register_value(
    //     5,
    //     wasm.Constant.from_coll_coll_byte(receiverChainId, receiverAddress)
    // );
    const outBank = bankBuilder.build();
    const inputBoxes = new wasm.ErgoBoxes(bank);
    inputBoxes.add(application);
    const txOutput = new wasm.ErgoBoxCandidates(outBank);
    const boxSelection = new wasm.BoxSelection(inputBoxes, new wasm.ErgoBoxAssetsDataList());
    const tx = wasm.TxBuilder.new(
        boxSelection,
        txOutput,
        0,
        wasm.BoxValue.from_i64(
            wasm.I64.from_str(
                config.fee.toString()
            )
        ),
        wasm.Address.recreate_from_ergo_tree(application.ergo_tree()),
        wasm.BoxValue.SAFE_USER_MIN()
    ).build();
    console.log(tx.to_json());
    const sks = new wasm.SecretKeys();
    sks.add(wasm.SecretKey.dlog_from_bytes(strToUint8Array(config.addressSecret)));
    const wallet = wasm.Wallet.from_secrets(sks);
    const tx_data_inputs = wasm.ErgoBoxes.from_boxes_json([])

    const ctx = await ApiNetwork.getErgoStateContext();
    const signedTx = wallet.sign_transaction(ctx, tx, inputBoxes, tx_data_inputs)
    return signedTx.to_json();

}

export {createRequest, issueVAA, updateVAABox};
