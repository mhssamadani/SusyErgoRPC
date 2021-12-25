// 424poBqNcfgMNuNYqk3vPeWAg73oywJUAHmjU8hs8XBhRq7nhPQtgpjDx3bsMtH1XxUkyxionf5L1DcyaxTUYGXH89Y9SMHK8gSQLXvknyasRCPshtuHJHp2KZCtCepD8YABNuAYYTtfPtg7vizGtMbENVpNKt18F9arKSvjdFXrPkdJjx54u3HrgpfrC8BExB2FMqu6d8yz6r7d48uSLe94wW9cysizCiZo5q4ijNnjboSEVkikt82v7L1YtGHtsJ7GZi9DiUJn42b5ngP79ZL5mTrYD6tur7LcVSWTK2UwFrHtg6XZ76RnwRprRxwstdJiCqRg74wGHfcQSdrYhEe1WkgvCu4ru5RZ27mvU8nHQDk
export const bankScript = `
{
  val wormholeNFT = fromBase64("WORMHOLE_NFT");
  val bankNFT = fromBase64("BANK_NFT");
  val VAAToken = fromBase64("VAA_TOKEN");
  val selfReplication = allOf(Coll(
    OUTPUTS(0).value == SELF.value,
    OUTPUTS(0).tokens(0)._1 == SELF.tokens(0)._1,
    OUTPUTS(0).propositionBytes == SELF.propositionBytes,
  ))
  // INPUTS: [Bank, applicant] --> OUTPUTS: [Bank]
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

  // INPUTS: [Bank, VAABox, sponsor] --> OUTPUTS: [Bank, VAATokenokenRedeem, payment, sponsor]
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

// tG5iDQcvRtxAvzrFQWyJKyutYEQmdQRNNhXMoCXcRQ2TViUEQHZvV7MHZu7ycaGxXUPj5yTjQzs84wjFhVW177Tg9VCFR7h1MkhkevoRapCNoDm7qdryF2aY2ERz5MvNvRHEeoArMb36jjPb44S6tvmCMC8QzwENmMr2yTVSv67MYaSbpck8ayzh3nrx3sUNg6tAn6i7SXaoxmSRvTVDj6KHMdPThvK6XLrXoaHzojoSWadhFQ3vMqBbmr5qgHQyQcAmbL9G2CNSMvkPdLePKso718x5tKqv7KjGMs8fdvqwfQkEKt23VMKJto5Lbfv39stYDX5YW1gLGgg5uKQ5v1k9quh9Xs3DwfRxwCA71DYY36rujTjDhzwbPqDdYbzB7mFoz12taTXrKSY7NttJRpPf4vS7sGvtzZk2TyyAuwfvzikcKPewK41reYt3GqQeszZNMgaMbs3jdG4F25xtzUC4d5e5W6bVZrFePvpw2jZsMGW1yMNJM4k7HydLyvPgsoPKwqRvAQNnhLKCvB7a3x7xQzMd3bLcptCf45uDrek4ngw6LKw5TyQ3gkVVMdqtxLib5Vvs68kdRrTy4VgifQPTZUQxbmoMWYQRWZD8FMLcrB4VeMUKMtCwKct7aH3iqFuUBayfzcJxGxfKFEb7DJUJcqWeGJyRZmRGRMSuf3sWMRRQvknznCuh7kXKm3TAGcWv8MsveVmDaXVMi2EomC2J364dhvYHUGPmNFaTZG17xwWnBnEDzHvFrpmvV1FxaQ9Jg3gn
export const VAAScript = `
{
  val wormholeNFT = fromBase64("WORMHOLE_NFT");
  val bftSignatureCount = BFT_SIGNATURE_COUNT
  val payload = SELF.R4[Coll[Coll[Byte]]].get(1)
  val amount = byteArrayToLong(payload.slice(1, 33))
  val tokenId = payload.slice(33, 65)
  val address = payload.slice(67, 103)
  val fee = byteArrayToLong(payload.slice(105, 133))
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
      OUTPUTS(1).R7[Coll[Int]].get(3) == SELF.R7[Coll[Int]].get(3)
    )))
  }
  else {
    val emitterIndex = SELF.R7[Coll[Int]].get(4)
    sigmaProp(allOf(Coll(
      // INPUTS: [Bank, VAABox, sponsor] --> OUTPUTS: [Bank, VAATokenokenRedeem, payment, sponsor]
      // DataINPUTS: register

      // Verify emitter
      SELF.R4[Coll[Coll[Byte]]].get(2) == CONTEXT.dataInputs(0).R4[Coll[Coll[Byte]]].get(emitterIndex),
      SELF.R4[Coll[Coll[Byte]]].get(3) == CONTEXT.dataInputs(0).R5[Coll[Coll[Byte]]].get(emitterIndex),

      // Verify Payment
      SELF.R7[Coll[Int]].get(1) >= bftSignatureCount,
      OUTPUTS(2).tokens(0)._1 == tokenId,
      OUTPUTS(2).tokens(0)._2 == amount - fee,
      OUTPUTS(2).propositionBytes == address,

      // verify VAA Authority and token redeem
      OUTPUTS(1).propositionBytes == SELF.R6[Coll[Byte]].get,
      OUTPUTS(1).tokens(0)._1 == SELF.tokens(0)._1,

      // bank token conditions
      OUTPUTS(0).tokens(1)._2 == INPUTS(0).tokens(1)._2 - (amount - fee),
      OUTPUTS(0).tokens(1)._1 == tokenId,
    )))
  }
}`;

export const wormholeScript = `
{
  val VAAT = fromBase64( VAATToken )
  val wormholeNFT = fromBase64( WORMHOLENFT )
  val GuardianOracleNFT = fromBase64( GUARDIANORACLENFT )
  val validateSign = {(v: ((Coll[Byte], GroupElement), (GroupElement, BigInt))) => {
    val e: Coll[Byte] = blake2b256(v._1._1) // weak Fiat-Shamir
    val eInt = byteArrayToBigInt(e) // challenge as big integer
    val g: GroupElement = groupGenerator
    val l = g.exp(v._2._2)
    val r = v._2._1.multiply(v._1._2.exp(eInt))
    if (l == r) true else false
  }}
  val VAADigest = blake2b256(INPUTS(1).R4[Coll[Coll[Byte]]].get(0) ++ INPUTS(1).R4[Coll[Coll[Byte]]].get(1))
  val signatureIndex = OUTPUTS(1).R7[Coll[Int]].get(2)
  val Pk: GroupElement = decodePoint(CONTEXT.dataInputs(0).R5[Coll[Coll[Byte]]].get(signatureIndex))
  val selfReplication = allOf(Coll(
    OUTPUTS(0).value == SELF.value,
    OUTPUTS(0).tokens(0)._1 == SELF.tokens(0)._1,
    OUTPUTS(0).propositionBytes == SELF.propositionBytes
  ))
  if(INPUTS(0).tokens(0)._1 == wormholeNFT) {
    // INPUTS: [wormhole, VAABox, sponsor] --> OUTPUTS: [wormhole, VAABox, sponsor]
    sigmaProp(
      allOf(
        Coll(
          // Verify SelfReplication
          selfReplication,
          // Verify dataInput
          CONTEXT.dataInputs(0).tokens(0)._1 == GuardianOracleNFT,
          // Verify VAA
          OUTPUTS(1).tokens(0)._1 == VAAT,
          // Verify Sign
          validateSign(( (VAADigest, Pk), (OUTPUTS(1).R8[GroupElement].get, OUTPUTS(1).R9[BigInt].get) ))
        )
      )
    )
  } else {
    sigmaProp(false)
  }
}`;

export const guardianScript = `
{
  val GuardianOracleNFT = fromBase64( GUARDIANORACLENFT )
  sigmaProp(
    allOf(
      Coll(
        SELF.tokens(0)._1 == GuardianOracleNFT
      )
    )
  )
}`;

// FxNN9gGTwcfAZVMj7rv9Bka98BWyZhFxpvrZzWqvVgMvJdcT3Mcp4jcCCfGetALnkNvqFhELA2x2iggo6qxnzQXYz4V5EcY4edP9PEsfmu3EtctULBMW5G6U9HhVW9Kh9YcKGrM74mxmfoPKvaiLQMm7Dv1VvmfWGiW96GkwJ9SNnsxt3ZbsMhnuhL5LB1kCCgHcEJRfJxMnhWmjYpLwZrxAo5UgDSu3gXn8toHwJJGup97mVX7GRQwG3EmBBuQC9wJ6oZiaYphG2mo833j11JiGbUjQmvvtnRuLqqTAWupBfgQfXg8UjCXAidHCz5Aqw856aCCZuwV5Ui4hUgTejLn57j83W7U9D5rfAk1J12sA4VfKvgWmbYp8DHpf8Tsc3P1MXLJvRKW7EKyZbxSWRRT7wDcJFJhGyR7Sc5wYT1HCMKQMnuFDvMNCJTV9tch23oKKN23a4FYaqsUQBUeC67o8R45iCc5CsMoVekM4EcCsQAoJZRDQZrTGvfLVwf
export const sponserScript = `
{
  val wormholeNFT = fromBase64("WORMHOLE_NFT")
  val bankNFT = fromBase64("BANK_NFT")
  val guardianNFT = fromBase64("GUARDIAN_NFT")
  val registerNFT = fromBase64("REGISTER_NFT")
  val fee = FEE
  // INPUTS: [wormhole, VAABox, sponsor] --> OUTPUTS: [wormhole, VAABox, sponsor]
  val VAACreation = {
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

  // INPUTS: [Bank, VAABox, sponsor] --> OUTPUTS: [Bank, VAATokenokenRedeem, payment, sponsor]
  val paymentCreation = {
    if(OUTPUTS(0).tokens(0)._1 == bankNFT){
      allOf(Coll(
        INPUTS.size == 3,
        OUTPUTS(3).propositionBytes == SELF.propositionBytes,
        OUTPUTS(3).value >= SELF.value - 2 * fee,
      ))
    }
    else false
  }

  // INPUTS: [GuardianTokenRepo, VAA-Guardian, sponsor], optional[Guardian] --> OUTPUTS: [GuardianTokenRepo, Guardian, VAA-refund, sponsor]
  val guardianCreation = {
    if(OUTPUTS(0).tokens(0)._1 == guardianNFT){
      allOf(Coll(
        OUTPUTS(3).propositionBytes == SELF.propositionBytes,
        // Add register replication
        OUTPUTS(3).value >= SELF.value - 2 * fee,
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
        OUTPUTS(2).value >= SELF.value - fee
      ))
    }
    else false
  }

  sigmaProp(VAACreation || paymentCreation || guardianCreation || registerUpdate)
}`;
