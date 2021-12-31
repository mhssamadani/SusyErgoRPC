/*
*   def createPayment(): Unit = {
    while (true) {
      val VAABox = getSpecBox("VAA")
      println(VAABox)
      val payload = VAABox.getRegisters.get(0).getValue.asInstanceOf[Coll[Coll[Byte]]](1).toArray
      val tokenId = payload.slice(33, 65)
      val bankBox = getSpecBox("bank", tokenId)
      val registerBox = getSpecBox("register")
      val sponsorBox = getSpecBox("sponsor")
      try {
        createPaymentTx(bankBox, VAABox, sponsorBox, registerBox)
        Thread.sleep((2.5 * 60 * 1000).toInt)
      }
      catch {
        case e: Throwable => println(s"Payment error: \n${e.getMessage}")
      }
    }
  }
*/

import ApiNetwork from "../network/api";
import {getVAADataFromBox} from "../utils/codec";
import * as wasm from 'ergo-lib-wasm-nodejs'
import {transferPayload} from "../models/models";
import {Boxes} from "./boxes";
import {createPayment} from "./transaction";
import config from "../config/conf";

const processPayments = async () => {
    const vaaBoxes = await ApiNetwork.getVAABoxes()
    for (const boxJson of vaaBoxes) {
        const box = wasm.ErgoBox.from_json(JSON.stringify(boxJson))
        const R4 = box.register_value(4)?.to_coll_coll_byte()!
        const payload = new transferPayload(R4[1])
        const tokenId = payload.TokenAddress()
        console.log(tokenId)
        const bank = await ApiNetwork.getBankBox(tokenId, payload.Amount.toString())
        const sponsor = wasm.ErgoBox.from_json(JSON.stringify(await ApiNetwork.getSponsorBox()))
        if (box.register_value(7)?.to_i32_array()[1]! >= config.bftSignatureCount && bank) {
            await createPayment(bank, box, sponsor, payload)
        }
    }
}


export {
    processPayments
}
