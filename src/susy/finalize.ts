import ApiNetwork from "../network/api";
import {transferPayload, VAA} from "../models/models";
import {CreatePayment, updateGuardian, UpdateRegister} from "./transaction";
import config from "../config/conf";
import {VAABox} from "../models/boxes";
import Contracts from "./contracts";


const processPayment = async (vaaBox: VAABox) => {
    const box = vaaBox.getErgoBox();
    if(box.ergo_tree() == (await Contracts.generateVAAContract()).ergo_tree()) {
        const R4 = box.register_value(4)?.to_coll_coll_byte()!;
        const payload = new transferPayload(R4[1]);
        const tokenId = payload.TokenAddress();
        const bank = await ApiNetwork.getBankBox(tokenId, payload.Amount().toString());
        const sponsor = await ApiNetwork.getSponsorBox();
        if (box.register_value(7)?.to_i32_array()[1]! >= config.bftSignatureCount && bank) {
            await CreatePayment(bank, box, sponsor, payload);
        }
    }
}

const processRegister = async (vaaBox: VAABox) => {
    const box = vaaBox.getErgoBox();
    if(box.ergo_tree() === (await Contracts.generateRegisterVAAContract()).ergo_tree()){
        const register = await ApiNetwork.getRegisterBox();
        const sponsor = await ApiNetwork.getSponsorBox();
        await UpdateRegister(register, vaaBox, sponsor)
    }
}

const processGuardian = async (vaaBox: VAABox) => {
    const box = vaaBox.getErgoBox();
    if(box.ergo_tree() === (await Contracts.generateGuardianVAAContract()).ergo_tree()){
        const tokenRepo = await ApiNetwork.getGuardianTokenRepo();
        const R4 = tokenRepo.register_value(4)?.to_i32_array()!;
        const oldGuardian = (R4[0] < R4[1] ? undefined : (await ApiNetwork.getGuardianBox(R4[0] - R4[1])))?.getErgoBox()
        await updateGuardian(
            tokenRepo,
            vaaBox,
            await ApiNetwork.getSponsorBox(),
            oldGuardian
        )
    }
}
const processPayments = async () => {
    const vaaBoxes = await ApiNetwork.getVAABoxes()
    for (const vaaBox of vaaBoxes) {
        switch (vaaBox.getErgoBox().ergo_tree().to_base16_bytes()) {
            case (await Contracts.generateVAAContract()).ergo_tree().to_base16_bytes():
                await processPayment(vaaBox);
                break;
            case (await Contracts.generateRegisterVAAContract()).ergo_tree().to_base16_bytes():
                await processRegister(vaaBox);
                break;
            case (await Contracts.generateGuardianVAAContract()).ergo_tree().to_base16_bytes():
                await processGuardian(vaaBox);
                break;
        }
    }
}


export {
    processPayments
}
