export const feePayment: string = `{
  val guardianToken = fromBase64("GUARDIAN_TOKEN");
  val Pk1 = proveDlog(decodePoint(CONTEXT.dataInputs(0).R5[Coll[Coll[Byte]]].get(0)))
  val Pk2 = proveDlog(decodePoint(CONTEXT.dataInputs(0).R5[Coll[Coll[Byte]]].get(1)))
  val Pk3 = proveDlog(decodePoint(CONTEXT.dataInputs(0).R5[Coll[Coll[Byte]]].get(2)))
  val Pk4 = proveDlog(decodePoint(CONTEXT.dataInputs(0).R5[Coll[Coll[Byte]]].get(3)))
  val Pk5 = proveDlog(decodePoint(CONTEXT.dataInputs(0).R5[Coll[Coll[Byte]]].get(4)))
  val Pk6 = proveDlog(decodePoint(CONTEXT.dataInputs(0).R5[Coll[Coll[Byte]]].get(5)))

  atLeast(4, Coll(Pk1, Pk2, Pk3, Pk4, Pk5, Pk6)) && sigmaProp(CONTEXT.dataInputs(0).tokens(0)._1 == guardianToken)
}`;

export const VAACreator: string = `{
  // INPUTS: [VAACreator] --> OUTPUTS: [VAA, VAACreator(Optional)]
  val fee = FEE
  val paymentVAA = fromBase64("PAYMENT_VAA")
  val registerVAA = fromBase64("REGISTER_VAA")
  val guardianVAA = fromBase64("GUARDIAN_VAA")
  val minBoxErg = MIN_BOX_ERG
  val creatorAuthorityPk = proveDlog(decodePoint(fromBase64("CREATOR_AUTHORITY_PK")))
  val VAAAddressHash = blake2b256(OUTPUTS(0).propositionBytes)
  val VAAInitialization =
    allOf(Coll(
      // Checkpoint
      OUTPUTS(0).R7[Coll[Int]].get(0) == 0,
      // signatureCount
      OUTPUTS(0).R7[Coll[Int]].get(1) == 0,
      // Redeem Address
      OUTPUTS(0).R6[Coll[Byte]].get == blake2b256(SELF.propositionBytes),
      // value
      OUTPUTS(0).value == minBoxErg,
      // Token
      OUTPUTS(0).tokens(0)._2 == 1
    ))
  val selfReplication =
    if(OUTPUTS.size == 3){
      allOf(Coll(
        OUTPUTS(2).value == fee,
        OUTPUTS(2).tokens.size == 0,
        OUTPUTS(1).propositionBytes == SELF.propositionBytes,
      ))
    } else if(OUTPUTS.size == 2) {
      allOf(Coll(
        OUTPUTS(1).value == fee,
        OUTPUTS(1).tokens.size == 0
      ))
    }
    else {false}

  val VAACreation =
    if(VAAAddressHash == registerVAA || VAAAddressHash == guardianVAA) {
      sigmaProp(VAAInitialization && selfReplication)
    } else if(VAAAddressHash == paymentVAA){
      val emitterIndex = OUTPUTS(0).R7[Coll[Int]].get(4)
      sigmaProp(allOf(Coll(
        VAAInitialization,
        selfReplication,
        OUTPUTS(0).R4[Coll[Coll[Byte]]].get(2) == CONTEXT.dataInputs(0).R4[Coll[Coll[Byte]]].get(emitterIndex),
        OUTPUTS(0).R4[Coll[Coll[Byte]]].get(3) == CONTEXT.dataInputs(0).R5[Coll[Coll[Byte]]].get(emitterIndex)
      )))
    } else {sigmaProp(false)}

  creatorAuthorityPk && VAACreation
}`;

export const VAAScript: string = `{
  val wormholeNFT = fromBase64("WORMHOLE_NFT");
  val bftSignatureCount = BFT_SIGNATURE_COUNT;
  val minBoxErg = MIN_BOX_ERG;
  val feePaymentHash = fromBase64("FEE_PAYMENT_HASH");
  val payload = SELF.R4[Coll[Coll[Byte]]].get(1)
  val amount = byteArrayToLong(payload.slice(1, 33))
  val tokenId = payload.slice(33, 65)
  val address = payload.slice(67, 103)
  val fee = byteArrayToLong(payload.slice(105, 137))
  //val address = SELF.R4[Coll[Coll[Byte]]].get(2)
  if(OUTPUTS(0).tokens(0)._1 == wormholeNFT){
    // INPUTS: [wormhole, VAABox, sponsor] --> OUTPUTS: [wormhole, VAABox, sponsor]
    val signatureIndex = OUTPUTS(1).R7[Coll[Int]].get(2)
    val signatureMask = Coll[Int](1, 2, 4, 8, 16, 32)(signatureIndex)
    sigmaProp(allOf(Coll(
      // validating self replication
      OUTPUTS(1).propositionBytes == SELF.propositionBytes,
      OUTPUTS(1).R4[Coll[Coll[Byte]]].get == SELF.R4[Coll[Coll[Byte]]].get,
      OUTPUTS(1).R5[Coll[Coll[Byte]]].get == SELF.R5[Coll[Coll[Byte]]].get,
      OUTPUTS(1).R6[Coll[Byte]].get == SELF.R6[Coll[Byte]].get,
      OUTPUTS(1).tokens(0)._1 == SELF.tokens(0)._1,
      // Verifying checkpoint
      (SELF.R7[Coll[Int]].get(0) / signatureMask) % 2 == 0,
      OUTPUTS(1).R7[Coll[Int]].get(0) == SELF.R7[Coll[Int]].get(0) + signatureMask,
      // verifying signature count
      OUTPUTS(1).R7[Coll[Int]].get(1) == SELF.R7[Coll[Int]].get(1) + 1,
      OUTPUTS(1).R7[Coll[Int]].get(3) == SELF.R7[Coll[Int]].get(3),
      OUTPUTS(1).R7[Coll[Int]].get(4) == SELF.R7[Coll[Int]].get(4)
    )))
  }
  else {
    sigmaProp(allOf(Coll(
      // INPUTS: [Bank, VAABox, sponsor] --> OUTPUTS: [Bank, VAATokenRedeem, payment, sponsor, feePayment]
      // Verify Payment
      SELF.R7[Coll[Int]].get(1) >= bftSignatureCount,
      OUTPUTS(2).tokens(0)._1 == tokenId,
      OUTPUTS(2).tokens(0)._2 == amount - fee,
      OUTPUTS(2).propositionBytes == address,

      // verify VAA Authority and token redeem
      blake2b256(OUTPUTS(1).propositionBytes) == SELF.R6[Coll[Byte]].get,
      OUTPUTS(1).tokens(0)._1 == SELF.tokens(0)._1,
      OUTPUTS(1).value == minBoxErg,

      // bank token conditions
      OUTPUTS(0).tokens(1)._2 == INPUTS(0).tokens(1)._2 - amount,
      OUTPUTS(0).tokens(1)._1 == tokenId,

      // verify fee payment
      OUTPUTS(4).tokens(0)._1 == tokenId,
      OUTPUTS(4).tokens(0)._2 == fee,
      blake2b256(OUTPUTS(4).propositionBytes) == feePaymentHash
    )))
  }
}`;

export const bankScript: string = `{
  // INPUTS: [Bank, applicant] --> OUTPUTS: [Bank]
  val wormholeNFT = fromBase64("WORMHOLE_NFT");
  val bankNFT = fromBase64("BANK_NFT");
  val VAAToken = fromBase64("VAA_TOKEN");
  val selfReplication = allOf(Coll(
    OUTPUTS(0).value == SELF.value,
    OUTPUTS(0).tokens(0)._1 == SELF.tokens(0)._1,
    OUTPUTS(0).propositionBytes == SELF.propositionBytes,
  ))
  val createRequest = {
    if(OUTPUTS(0).tokens(1)._2 > SELF.tokens(1)._2){
     allOf(Coll(
       // Self replication checking
       selfReplication,
       OUTPUTS(0).R4[Coll[Long]].isDefined,
       OUTPUTS(0).tokens(1)._2 == SELF.tokens(1)._2 + OUTPUTS(0).R4[Coll[Long]].get(0),
       OUTPUTS(0).R5[Coll[Coll[Byte]]].isDefined,
       OUTPUTS(0).R5[Coll[Coll[Byte]]].get.size == 2,
       OUTPUTS(0).R4[Coll[Long]].get.size == 2,
     ))
    }
    else false
  }

  // INPUTS: [Bank, VAABox, sponsor] --> OUTPUTS: [Bank, VAATokenRedeem, payment, sponsor, feePayment]
  val tokenPayment ={
   if (INPUTS(1).tokens(0)._1 == VAAToken){
     allOf(Coll(
       // Self replication checking
       selfReplication,
       // token checking
       INPUTS(1).tokens(0)._1 == VAAToken,
       OUTPUTS(0).tokens(1)._1 == OUTPUTS(2).tokens(0)._1,
     ))
   }
   else false
  }

  sigmaProp(tokenPayment || createRequest)
}`;

export const guardianVAAScript: string = `{
  val wormholeNFT = fromBase64("WORMHOLE_NFT");
  val guardianNFT = fromBase64("GUARDIAN_NFT");
  val bftSignatureCount = BFT_SIGNATURE_COUNT;
  val guardianScriptHash = fromBase64("GUARDIAN_SCRIPT_HASH");
  val minBoxErg = MIN_BOX_ERG;
  if(OUTPUTS(0).tokens(0)._1 == wormholeNFT){
    // INPUTS: [wormhole, guardianVAABox, sponsor] --> OUTPUTS: [wormhole, guardianVAABox, sponsor]
    val signatureIndex = OUTPUTS(1).R7[Coll[Int]].get(2)
    val signatureMask = Coll[Int](1, 2, 4, 8, 16, 32)(signatureIndex)

    sigmaProp(allOf(Coll(
      // validating self replication
      OUTPUTS(1).propositionBytes == SELF.propositionBytes,
      OUTPUTS(1).R4[Coll[Coll[Byte]]].get == SELF.R4[Coll[Coll[Byte]]].get,
      OUTPUTS(1).R5[Coll[Coll[Byte]]].get == SELF.R5[Coll[Coll[Byte]]].get,
      OUTPUTS(1).R6[Coll[Byte]].get == SELF.R6[Coll[Byte]].get,
      OUTPUTS(1).tokens(0)._1 == SELF.tokens(0)._1,
      // Verifying checkpoint
      (SELF.R7[Coll[Int]].get(0) / signatureMask) % 2 == 0,
      OUTPUTS(1).R7[Coll[Int]].get(0) == SELF.R7[Coll[Int]].get(0) + signatureMask,
      // verifying signature count
      OUTPUTS(1).R7[Coll[Int]].get(1) == SELF.R7[Coll[Int]].get(1) + 1,
      OUTPUTS(1).R7[Coll[Int]].get(3) == SELF.R7[Coll[Int]].get(3)
    )))
  }
  else {
    val payload = SELF.R4[Coll[Coll[Byte]]].get(1)
    val wormholeGuardianKeys = Coll(payload.slice(40, 72), payload.slice(105, 137),
                                    payload.slice(170, 202), payload.slice(235, 267),
                                    payload.slice(300, 332), payload.slice(365, 397))
    val ergoGuardianKeys = Coll(payload.slice(72, 105), payload.slice(137, 170),
                                payload.slice(202, 235), payload.slice(267, 300),
                                payload.slice(332, 365), payload.slice(397, 430))
    sigmaProp(allOf(Coll(
      // INPUTS: [GuardianTokenRepo, VAA-Guardian, sponsor], optional[Guardian] --> OUTPUTS: [GuardianTokenRepo, VAA-refund, Guardian, sponsor]
      // DATA_INPUTS: [oldGuardianBox]
      // Verifying GuardianSetTokenRepo
      OUTPUTS(0).tokens(0)._1 == guardianNFT,
      // Verifying signature count
      SELF.R7[Coll[Int]].get(1) >= bftSignatureCount,
      // Verifying Guardian Set
      OUTPUTS(2).tokens(0)._1 == OUTPUTS(0).tokens(1)._1,
      OUTPUTS(2).R4[Coll[Coll[Byte]]].get == wormholeGuardianKeys,
      OUTPUTS(2).R5[Coll[Coll[Byte]]].get == ergoGuardianKeys,
      blake2b256(OUTPUTS(2).propositionBytes) == guardianScriptHash,

      // verify VAA Authority and token redeem
      blake2b256(OUTPUTS(1).propositionBytes) == SELF.R6[Coll[Byte]].get,
      OUTPUTS(1).tokens(0)._1 == SELF.tokens(0)._1,
      OUTPUTS(1).value == minBoxErg,
    )))
  }
}`;

export const guardianTokenRepo: string = `{
  // INPUTS: [GuardianSetTokenRepo, VAA-Guardian, sponsor], optional[Guardian] --> OUTPUTS: [GuardianSetTokenRepo, VAA-refund, Guardian, sponsor]
  val VAAToken = fromBase64("VAA_TOKEN");
  val guardianIndex = SELF.R4[Coll[Int]].get(0)
  val guardianLimit = SELF.R4[Coll[Int]].get(1)
  val tokenCheck = {
    if(guardianIndex > guardianLimit){
      allOf(Coll(
        OUTPUTS(0).tokens(1)._2 == SELF.tokens(1)._2,
        INPUTS(3).R7[Int].get == guardianIndex - guardianLimit
      ))
    } else{
      allOf(Coll(
        OUTPUTS(0).tokens(1)._2 == SELF.tokens(1)._2 - 1,
      ))
    }
  }
  sigmaProp(
    allOf(Coll(
      // Verifying self-replication
      OUTPUTS(0).value == SELF.value,
      OUTPUTS(0).tokens(0)._1 == SELF.tokens(0)._1,
      OUTPUTS(0).tokens(1)._1 == SELF.tokens(1)._1,
      OUTPUTS(0).propositionBytes == SELF.propositionBytes,
      OUTPUTS(0).R4[Coll[Int]].get(1) == guardianLimit,
      // Guardian index of the next round stored on the oracle box
      OUTPUTS(0).R4[Coll[Int]].get(0) == guardianIndex + 1,
      // Verifying VAA-Guardian
      INPUTS(1).tokens(0)._1 == VAAToken,
      // Guardian token
      OUTPUTS(2).tokens(0)._1 == SELF.tokens(1)._1,
      // DATA_INPUTS: [oldGuardianBox]
      CONTEXT.dataInputs(0).R7[Int].get == guardianIndex,
      OUTPUTS(2).R6[Int].get > CONTEXT.dataInputs(0).R6[Int].get,
      OUTPUTS(2).R7[Int].get == guardianIndex + 1,
      tokenCheck,
    ))
  )
}`;

export const registerVAAScript: string = `{
  val registerNFT = fromBase64("REGISTER_NFT");
  val bftSignatureCount = BFT_SIGNATURE_COUNT;
  val registerScriptHash = fromBase64("REGISTER_SCRIPT_HASH");
  val wormholeNFT = fromBase64("WORMHOLE_NFT");
  val minBoxErg = MIN_BOX_ERG;

  if(OUTPUTS(0).tokens(0)._1 == wormholeNFT){
    // INPUTS: [wormhole, guardianVAABox, sponsor] --> OUTPUTS: [wormhole, guardianVAABox, sponsor]
    val signatureIndex = OUTPUTS(1).R7[Coll[Int]].get(2)
    val signatureMask = Coll[Int](1, 2, 4, 8, 16, 32)(signatureIndex)

    sigmaProp(allOf(Coll(
      // validating self replication
      OUTPUTS(1).propositionBytes == SELF.propositionBytes,
      OUTPUTS(1).R4[Coll[Coll[Byte]]].get == SELF.R4[Coll[Coll[Byte]]].get,
      OUTPUTS(1).R5[Coll[Coll[Byte]]].get == SELF.R5[Coll[Coll[Byte]]].get,
      OUTPUTS(1).R6[Coll[Byte]].get == SELF.R6[Coll[Byte]].get,
      OUTPUTS(1).tokens(0)._1 == SELF.tokens(0)._1,
      // Verifying checkpoint
      (SELF.R7[Coll[Int]].get(0) / signatureMask) % 2 == 0,
      OUTPUTS(1).R7[Coll[Int]].get(0) == SELF.R7[Coll[Int]].get(0) + signatureMask,
      // verifying signature count
      OUTPUTS(1).R7[Coll[Int]].get(1) == SELF.R7[Coll[Int]].get(1) + 1,
      OUTPUTS(1).R7[Coll[Int]].get(3) == SELF.R7[Coll[Int]].get(3)
    )))
  }
  else {
    val payload = SELF.R4[Coll[Coll[Byte]]].get(1)
    val newChainId = Coll[Coll[Byte]](payload.slice(35, 37))
    val newChainAddress = Coll[Coll[Byte]](payload.slice(37, 69))
    sigmaProp(allOf(Coll(
      // INPUTS: [register, VAA-register, sponsor] --> OUTPUTS: [register, VAA-register, sponsor]
      // Verifying signature count
      SELF.R7[Coll[Int]].get(1) >= bftSignatureCount,
      // Verifying Guardian Set
      OUTPUTS(0).tokens(0)._1 == registerNFT,
      // Adding the new chain
      OUTPUTS(0).R4[Coll[Coll[Byte]]].get == INPUTS(0).R4[Coll[Coll[Byte]]].get.append(newChainId),
      OUTPUTS(0).R5[Coll[Coll[Byte]]].get == INPUTS(0).R5[Coll[Coll[Byte]]].get.append(newChainAddress),
      blake2b256(OUTPUTS(0).propositionBytes) == registerScriptHash,

      // verify VAA Authority and token redeem
      blake2b256(OUTPUTS(1).propositionBytes) == SELF.R6[Coll[Byte]].get,
      OUTPUTS(1).tokens(0)._1 == SELF.tokens(0)._1,
      OUTPUTS(1).value == minBoxErg,
    )))
  }
}`;

export const registerScript: string = `{
  // INPUTS: [Register, VAA-register, sponsor] --> OUTPUTS: [Register, VAA-register, sponsor]
  val VAAToken = fromBase64("VAA_TOKEN");
  sigmaProp(
    allOf(Coll(
      // Verifying self-replication
      OUTPUTS(0).tokens(0)._1 == SELF.tokens(0)._1,
      OUTPUTS(0).propositionBytes == SELF.propositionBytes,
      // VVA
      INPUTS(1).tokens(0)._1 == VAAToken
    ))
  )
}`;

export const guardianScript: string = `{
  // INPUTS: [GuardianSetTokenRepo, VAA-Guardian, sponsor], optional[Guardian] --> OUTPUTS: [GuardianSetTokenRepo, Guardian, sponsor]
  val guardianIndex: Coll[Byte] = INPUTS(1).R4[Coll[Coll[Byte]]].get(1).slice(35, 39)
  val zeroPad: Coll[Byte] = Coll[Byte](0.toByte,0.toByte,0.toByte,0.toByte)
  val guardianIndexLong = zeroPad ++ guardianIndex
  val guardianNFT = fromBase64("GUARDIAN_NFT");

  sigmaProp(
    allOf(Coll(
      INPUTS(0).tokens(0)._1 == guardianNFT,
      OUTPUTS(2).R6[Int].get == byteArrayToLong(guardianIndexLong).toInt,
    ))
  )
}`;

export const wormholeScript: string = `{
  val wormholeNFT = fromBase64("WORMHOLE_NFT");
  val bankNFT = fromBase64("BANK_NFT");
  val VAAToken = fromBase64("VAA_TOKEN");
  val guardianToken = fromBase64("GUARDIAN_TOKEN");
  val VAADigest = INPUTS(1).R4[Coll[Coll[Byte]]].get(0) ++ INPUTS(1).R4[Coll[Coll[Byte]]].get(1)
  val signatureIndex = OUTPUTS(1).R7[Coll[Int]].get(2)
  val Pk: GroupElement = decodePoint(CONTEXT.dataInputs(0).R5[Coll[Coll[Byte]]].get(signatureIndex))
  val selfReplication = allOf(Coll(
    OUTPUTS(0).value == SELF.value,
    OUTPUTS(0).tokens(0)._1 == SELF.tokens(0)._1,
    OUTPUTS(0).propositionBytes == SELF.propositionBytes
  ))
  if(INPUTS(0).tokens(0)._1 == wormholeNFT) {
    // INPUTS: [wormhole, VAABox, sponsor] --> OUTPUTS: [wormhole, VAABox, sponsor]
    val e: Coll[Byte] = blake2b256(VAADigest) // weak Fiat-Shamir
    val test:Coll[Byte] = Coll(0.toByte)
    val eInt = byteArrayToBigInt(test ++ e.slice(1, 32)) // challenge as big integer
    val g: GroupElement = groupGenerator
    val l = g.exp(OUTPUTS(1).R9[BigInt].get)
    val r = OUTPUTS(1).R8[GroupElement].get.multiply(Pk.exp(eInt))
    sigmaProp(
      allOf(
        Coll(
          // Verify SelfReplication
          selfReplication,
          // Verify dataInput
          CONTEXT.dataInputs(0).tokens(0)._1 == guardianToken,
          CONTEXT.dataInputs(0).R6[Int].get == OUTPUTS(1).R7[Coll[Int]].get(3),
          // Verify VAA
          OUTPUTS(1).tokens(0)._1 == VAAToken,
          // Verify Sign
          l == r,
        )
      )
    )
  } else {
    sigmaProp(false)
  }
}`;

export const sponsorScript: string = `{
  // INPUTS: [wormhole, VAABox, sponsor] --> OUTPUTS: [wormhole, VAABox, sponsor]
  val wormholeNFT = fromBase64("WORMHOLE_NFT")
  val bankNFT = fromBase64("BANK_NFT")
  val guardianNFT = fromBase64("GUARDIAN_NFT")
  val registerNFT = fromBase64("REGISTER_NFT")
  val minBoxErg = MIN_BOX_ERG
  val fee = FEE
  val VAASign = {
    if(OUTPUTS(0).tokens(0)._1 == wormholeNFT){
      allOf(Coll(
        INPUTS.size == 3,
        OUTPUTS(2).propositionBytes == SELF.propositionBytes,
        // Add register replication
        OUTPUTS(2).value >= SELF.value - fee,
      ))
    }
    else false
  }

  // INPUTS: [Bank, VAABox, sponsor] --> OUTPUTS: [Bank, VAATokenRedeem, payment, sponsor, feePayment]
  val paymentCreation = {
    if(OUTPUTS(0).tokens(0)._1 == bankNFT){
      allOf(Coll(
        INPUTS.size == 3,
        OUTPUTS(3).propositionBytes == SELF.propositionBytes,
        OUTPUTS(3).value >= SELF.value - 2 * fee - minBoxErg,
      ))
    }
    else false
  }

  // INPUTS: [GuardianTokenRepo, VAA-Guardian, sponsor], optional[Guardian] --> OUTPUTS: [GuardianTokenRepo, Guardian, VAA-refund, sponsor]
  val guardianCreation = {
    if(OUTPUTS(0).tokens(0)._1 == guardianNFT){
      val sponsorValue = {
        if(INPUTS.size == 3)
          SELF.value - fee - minBoxErg
        else
          SELF.value - fee
      }
      allOf(Coll(
        OUTPUTS(3).propositionBytes == SELF.propositionBytes,
        // Add register replication
        OUTPUTS(3).value >= sponsorValue,
      ))
    }
    else false
  }

  // INPUTS: [Register, VAA-register, sponsor] --> OUTPUTS: [Register, VAA-register, sponsor]
  val registerUpdate = {
    if(OUTPUTS(0).tokens(0)._1 == registerNFT){
      allOf(Coll(
        OUTPUTS(2).propositionBytes == SELF.propositionBytes,
        // Add register replication
        OUTPUTS(2).value >= SELF.value - 1 * fee
      ))
    }
    else false
  }
  sigmaProp(VAASign || paymentCreation || guardianCreation || registerUpdate)
}`;
