import { ErgoBoxes, ErgoBox, ErgoStateContext } from "ergo-lib-wasm-nodejs";
import config from "../config/conf";
import { Boxes } from "./boxes";
import Contracts from "./contracts";
import ApiNetwork from "../network/api";
import { registerChainPayload, transferPayload, updateGuardianPayload, VAA } from "../models/models";
import * as codec from '../utils/codec';
import { createAndSignTx, sendAndWaitTx, signTx } from "./init/util";
import * as wasm from 'ergo-lib-wasm-nodejs'
import { blake2b } from "ethereum-cryptography/blake2b";
import { VAABox } from "../models/boxes";

const IssueVAA = async (VAASourceBox: ErgoBoxes, VAAMessage: VAA, register: wasm.ErgoBox, contract: wasm.Contract): Promise<wasm.Transaction> => {
    const height = await ApiNetwork.getHeight();
    const vaaTokenRepo = await Contracts.generateVaaCreatorContract()
    const addressHash = blake2b(Buffer.from(vaaTokenRepo.ergo_tree().to_base16_bytes(), "hex"), 32)
    const VAABuilder = new wasm.ErgoBoxCandidateBuilder(
        wasm.BoxValue.from_i64(wasm.I64.from_str(config.minBoxValue.toString())),
        contract,
        height
    );
    const chainId = codec.UInt16ToByte(VAAMessage.getEmitterChain())
    const chainAddress = Buffer.from(VAAMessage.getEmitterAddress()).toString("hex")
    const r5 = register.register_value(5)?.to_coll_coll_byte().map(item => Buffer.from(item).toString("hex"))!;
    const selectedChain = register.register_value(4)?.to_coll_coll_byte().map((item, index) => {
        return {id: Buffer.from(item).toString("hex"), addr: r5[index], index: index}
    }).filter(res => res.id === chainId && res.addr === chainAddress)[0]

    VAABuilder.add_token(wasm.TokenId.from_str(config.token.VAAT), wasm.TokenAmount.from_i64(wasm.I64.from_str("1")));
    VAABuilder.set_register_value(4, wasm.Constant.from_coll_coll_byte([
        codec.strToUint8Array(VAAMessage.observationWithoutPayload()),
        VAAMessage.getPayload().toBytes(),
        codec.strToUint8Array(codec.UInt16ToByte(VAAMessage.getEmitterChain())),
        VAAMessage.getEmitterAddress()
    ]));
    VAABuilder.set_register_value(5, wasm.Constant.from_coll_coll_byte(VAAMessage.getSignatures().map(item => codec.strToUint8Array(item.toHex()))));

    VAABuilder.set_register_value(6, wasm.Constant.from_byte_array(Uint8Array.from(addressHash)));
    VAABuilder.set_register_value(7, wasm.Constant.from_i32_array(Int32Array.from([0, 0, 0, VAAMessage.getGuardianSetIndex(), selectedChain?.index!])));
    const secret = config.secret!
    const outVAA = VAABuilder.build();
    return (await createAndSignTx(
        secret,
        VAASourceBox,
        [outVAA],
        height,
        new wasm.ErgoBoxes(register),
        vaaTokenRepo
    ))
}


const UpdateVAABox = async (
    wormhole: ErgoBox,
    VAABox: ErgoBox,
    sponsor: ErgoBox,
    guardianBox: ErgoBox,
    index: number,
    signA: Uint8Array,
    signZ: Uint8Array,
    ctx?: ErgoStateContext,
    wait: boolean = false,
): Promise<wasm.Transaction> => {
    const outSponsor = await Boxes.getSponsorBox(sponsor.value().as_i64().as_num() - config.fee);
    const signatureCount = VAABox.register_value(7)!.to_i32_array()[1];
    const checksum = VAABox.register_value(7)!.to_i32_array()[0]
    const VAABuilder = new wasm.ErgoBoxCandidateBuilder(VAABox.value(), wasm.Contract.new(VAABox.ergo_tree()), 0);
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
    const tx = GenerateTx(inputBoxes, [outWormhole, outVAA, outSponsor], sponsor);
    const dataInputs = new wasm.DataInputs()
    dataInputs.add(new wasm.DataInput(guardianBox.box_id()))
    tx.set_data_inputs(dataInputs);
    const wallet = wasm.Wallet.from_secrets(new wasm.SecretKeys());
    const tx_data_inputs = new wasm.ErgoBoxes(guardianBox);
    const internalCtx = ctx ? ctx : await ApiNetwork.getErgoStateContext();
    const signedTx = wallet.sign_transaction(internalCtx, tx.build(), inputBoxes, tx_data_inputs)
    try {
        if (wait) {
            await sendAndWaitTx(signedTx)
        } else {
            await ApiNetwork.sendTx(signedTx.to_json())
        }
    } catch (exp: any) {
        console.log(exp)
    }
    console.log(`transaction signed and submitted with id ${signedTx.id().to_str()}`)
    return signedTx
}

const GenerateTx = (inputBoxes: any, outputs: [any, ...any[]], sponsor: any): wasm.TxBuilder => {
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
        codec.ergoTreeToAddress(sponsor.ergo_tree()),
        wasm.BoxValue.SAFE_USER_MIN()
    );
}

const CreatePayment = async (bank: ErgoBox, VAABox: ErgoBox, sponsor: ErgoBox, payload: transferPayload): Promise<any> => {
    const height = await ApiNetwork.getHeight();
    const amount = payload.Amount();
    const tokenId = payload.TokenAddress();
    const fee = payload.Fee();
    const bankTokens = bank.tokens().get(1).amount().as_i64().as_num()
    const outBank = await Boxes.getBank(
        tokenId,
        wasm.I64.from_str((bankTokens - amount).toString())
    );
    const tokenRedeem = await Boxes.getTokenRedeemBox(height)
    const receiverBuilder = new wasm.ErgoBoxCandidateBuilder(
        wasm.BoxValue.from_i64(wasm.I64.from_str(config.minBoxValue.toString())),
        wasm.Contract.pay_to_address(payload.To()),
        height
    );
    receiverBuilder.add_token(
        bank.tokens().get(1).id(),
        wasm.TokenAmount.from_i64(wasm.I64.from_str((amount - fee).toString()))
    )
    const feeBuilder = new wasm.ErgoBoxCandidateBuilder(
        wasm.BoxValue.from_i64(wasm.I64.from_str(config.minBoxValue.toString())),
        await Contracts.generateFeePayment(),
        height
    )
    feeBuilder.add_token(
        bank.tokens().get(1).id(),
        wasm.TokenAmount.from_i64(wasm.I64.from_str(fee.toString()))
    )
    const outSponsor = await Boxes.getSponsorBox(sponsor.value().as_i64().as_num() - config.fee - 2 * config.minBoxValue)
    const inputBoxes = new wasm.ErgoBoxes(bank);
    inputBoxes.add(VAABox);
    inputBoxes.add(sponsor);
    const signed = await createAndSignTx(
        config.secret!,
        inputBoxes,
        [outBank, tokenRedeem, receiverBuilder.build(), outSponsor, feeBuilder.build()],
        height
    )
    await ApiNetwork.sendTx(signed.to_json())
}

const UpdateRegister = async (register: wasm.ErgoBox, vaaBox: VAABox, sponsor: wasm.ErgoBox, height?: number, send: boolean = true) => {
    if (!height) height = await ApiNetwork.getHeight();
    const boxes = new wasm.ErgoBoxes(register)
    boxes.add(vaaBox.getErgoBox())
    boxes.add(sponsor)
    const registerPayload = new registerChainPayload((await vaaBox.getVAA()).getPayload().toBytes())
    const outRegister = await Boxes.getRegisterChainBox(registerPayload.EmitterChainId(), registerPayload.EmitterChainAddress(), height, register)
    const tokenRedeem = await Boxes.getTokenRedeemBox(height)
    const outSponsor = await Boxes.getSponsorBox(sponsor.value().as_i64().as_num() - config.fee)
    const outputs = new wasm.ErgoBoxCandidates(outRegister)
    outputs.add(tokenRedeem)
    outputs.add(outSponsor)
    const selection = new wasm.BoxSelection(boxes, new wasm.ErgoBoxAssetsDataList())
    const builder = wasm.TxBuilder.new(
        selection,
        outputs,
        height,
        wasm.BoxValue.from_i64(wasm.I64.from_str(config.fee.toString())),
        config.secret?.get_address()!,
        wasm.BoxValue.SAFE_USER_MIN()
    )
    const signed = await signTx(config.secret!, builder.build(), selection, wasm.ErgoBoxes.from_boxes_json([]))
    if(send) {
        await ApiNetwork.sendTx(signed.to_json())
    }
    return signed
}


const updateGuardian = async (
    guardianTokenRepoBox: wasm.ErgoBox,
    vaaBox: VAABox,
    sponsor: wasm.ErgoBox,
    lastGuardian: wasm.ErgoBox,
    removingGuardianBox?: wasm.ErgoBox,
    height?: number
) => {
    if (!height) height = await ApiNetwork.getHeight();
    const R4 = guardianTokenRepoBox.register_value(4)?.to_i32_array()!;
    if (R4[0] > R4[1] && removingGuardianBox === undefined) {
        throw Error("max guardian box generated. you must specify an old guardian box to be removed")
    }
    const vaa = await vaaBox.getVAA()
    const payload = (vaa.getPayload() as updateGuardianPayload)

    const boxes = new wasm.ErgoBoxes(guardianTokenRepoBox)
    boxes.add(vaaBox.getErgoBox())
    boxes.add(sponsor)
    if (removingGuardianBox) boxes.add(removingGuardianBox)
    const guardianTokenRepoOut = await Boxes.getGuardianTokenRepo(guardianTokenRepoBox.tokens().get(1).amount().as_i64().as_num() - 1, guardianTokenRepoBox, undefined, height)
    const tokenRedeem = await Boxes.getTokenRedeemBox(height)
    const guardian = await Boxes.getGuardianBox(payload.getNewIndex(), R4[0] + 1, payload.getWormholePublic(), payload.getErgoPublic(), height)
    const sponsorOut = await Boxes.getSponsorBox(sponsor.value().as_i64().as_num() - config.fee - (removingGuardianBox ? 0 : config.minBoxValue))
    const outputs = new wasm.ErgoBoxCandidates(guardianTokenRepoOut);
    outputs.add(tokenRedeem)
    outputs.add(guardian)
    outputs.add(sponsorOut)
    const selection = new wasm.BoxSelection(boxes, new wasm.ErgoBoxAssetsDataList())
    const builder = wasm.TxBuilder.new(
        selection,
        outputs,
        height,
        wasm.BoxValue.from_i64(wasm.I64.from_str(config.fee.toString())),
        config.secret?.get_address()!,
        wasm.BoxValue.SAFE_USER_MIN()
    )
    const data_inputs = new wasm.DataInputs();
    data_inputs.add(new wasm.DataInput(lastGuardian.box_id()))
    builder.set_data_inputs(data_inputs)
    const unsigned = builder.build()
    const signed = await signTx(config.secret!, unsigned, selection, new wasm.ErgoBoxes(lastGuardian))
    await ApiNetwork.sendTx(signed.to_json())
}

export { IssueVAA, UpdateVAABox, CreatePayment, UpdateRegister, updateGuardian };
