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

// 54R3MWnymHDwGQAgR9PDXy1C2cVGQXoHnBuYZcH1hW5kAeMysJ44b9i4tMQzttkNtjCerGjHrcQw9Xt16hdkzoP5iUvJL2i1s3eP8gmbSjFajPCRyScYiwMVPEibwYiFAbmZu1okY5wNkcm4HgC571382n1oE5RsyQiqaB1B6LNJBVm1YsJtCLGtrPc63gPHCVac71vyobUyy5XVTrbYYEUZFBWt7Xfxqs2tBqG4e8GiwouU8FiRoWdy7JDNwDvHBwQJdmB45Un5wSwa6uwzQXTVQM6w3x91MmCFDCwGTFW4p7mmu6R4YgcNbY8aMHtPLXSto7t6nHxTpr2p45g3ggKNRkwg2UJgocBnWFkMpnYJsHNuETV22TMgNxfzbkeHZw2frrPkgn4N2qGtkRpEighHpdgeLrmc24wH2m15Q47JrBxQbJjbzCww1tLjr9DF2vGszAStgNENBfgJ1Rpc8cvDQsL26UXKCbR7zhjff3Y2RpHLPmTJMpGHhYHdecAnq8MzTZnuBfUXcUUigKpen4v6TU4
export const wormholeScript = `
{
  val wormholeNFT = fromBase64("WORMHOLE_NFT");
  val bankNFT = fromBase64("BANK_NFT");
  val VAAToken = fromBase64("VAA_TOKEN");
  val guardianToken = fromBase64("GUARDIAN_TOKEN");
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
    val e: Coll[Byte] = blake2b256(VAADigest) // weak Fiat-Shamir
    val eInt = byteArrayToBigInt(e) // challenge as big integer
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
          // (OUTPUTS(1).tokens(0)._1 == VAAToken) || (OUTPUTS(1).tokens(0)._1 == guardianToken),
          // Verify Sign
          l != r,
        )
      )
    )
  } else {
    sigmaProp(false)
  }
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

// 2ZiVB9YezdoduvxwaRjnyS99YsLgiQUacFXTwKMguj6gYrCaWcvcbs6gSjLrE2kpMFNS78fVQNduzusrjLMDEfDkcqMYSmEDZZ7dJRhAirLu42FrLdsmeY84NkkkpC2kG4MeGz1
export const guardianScript = `
{
  val guardianToken = fromBase64("GUARDIAN_TOKEN");
  // INPUTS: [GuardianSetTokenRepo, VAA-Guardian, sponsor], optional[Guardian] --> OUTPUTS: [GuardianSetTokenRepo, Guardian, sponsor]
  sigmaProp(
    allOf(Coll(
      SELF.tokens(0)._1 == guardianToken,
      SELF.R6[Int].get == INPUTS(0).R4[Coll[Int]].get(0) - INPUTS(0).R4[Coll[Int]].get(1),
    ))
  )
}`;

// EuvzrKh36QcDcau6VpYDErLwJoce7rHcGheduPkYfFrTKveLW2nKbpkCJEkKXBz5HYjxx6hiSWDyFP26VAtRaHREzc1DeRkBucPDaXaKC947jCHGmS7d8K5z1kDKyhv21G1VRvk7FV4WQcZqKVCYvAcRdWHa8g3gPsPu3arMUQTNRRGWFYzSpXBHraSMuCK6Zsu8RqSdqCCJHd39SuC8PUKFTpNh2r4tKCfttjrvYYxM7XAQWa5P8kNwRBDM7fhyKbjAisWXTD9nuF3h9Tw8X83aDc7uv62fdLqbGTWESWg8q6oPJu4vjTpWNtctAz1FqLzbkWuASEn9SGqY3xWpbHksNAPdvLC7fXqRSg2uRiz2nnPmXRYuMRnx7LZzYKsEtbw8nTSHY3z62N7jQANVE2Nf9rSirU4ryV8niy6HKiVvD4swL1M95qTJs8p6v2oJ2AGu1cVWLyBP9KZ3c8b2DbFkyNuHRMZ6WmJhKhBZGTew8EoM8csWc3bWzgJKYSx4P8y6aGXjkV2VnXkJYtrZrfwbCbjD7oP1ctbhRoLRsNMCvcXtyfvt2h4nqCZhFrQP6vta3hw3yAHrmFqBY8F24Nv7FEc3et6bwgVVMLEYuVUL2KDZuUwdTAwBM6f4NwsdpmeCsynb6XyoGrbN7q1LhhyxU1c3VHE5EZXjcbRPfK1prMHgEs2Qzm2eR2ETg6SxDe1P72EBsp9XEcGamqe4Kddn2Pvv59VM1qRHM4Xjzp7ktJD82utJeCAjLFu742Eyy3ajBFMRYugfEwUVYbw7gFj5ekGAU3A6oS6dM
export const guardianVAAScript: string = `
{
  val wormholeNFT = fromBase64("WORMHOLE_NFT");
  val guardianNFT = fromBase64("GUARDIAN_NFT");
  val bftSignatureCount = BFT_SIGNATURE_COUNT;
  val guardianScriptHash = fromBase64("GUARDIAN_SCRIPT_HASH");
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
    //val guardianNewIndex = longToByteArray(payload.slice(35, 39)).toInt
    val guardianKeys = Coll(payload.slice(40, 72), payload.slice(72, 104),
                       payload.slice(104, 136), payload.slice(136, 168),
                       payload.slice(168, 200), payload.slice(200, 232))
    sigmaProp(allOf(Coll(
      // INPUTS: [GuardianTokenRepo, VAA-Guardian, sponsor], optional[Guardian] --> OUTPUTS: [GuardianTokenRepo, VAA-refund, Guardian, sponsor]
      // DATAINPUT: [oldGuardianBOx]
      // Verifying GuardianSetTokenRepo
      OUTPUTS(0).tokens(0)._1 == guardianNFT,
      // Verifying signature count
      SELF.R7[Coll[Int]].get(1) >= bftSignatureCount,
      // Verifying Guardian Set
      OUTPUTS(2).tokens(0)._1 == OUTPUTS(0).tokens(1)._1,
      OUTPUTS(2).R4[Coll[Coll[Byte]]].get == guardianKeys,
      // check ergo guardians
      OUTPUTS(2).R5[Coll[Coll[Byte]]].get == CONTEXT.dataInputs(0).R5[Coll[Coll[Byte]]].get,
      blake2b256(OUTPUTS(2).propositionBytes) == guardianScriptHash,

      // verify VAA Authority and token redeem
      OUTPUTS(1).propositionBytes == SELF.R6[Coll[Byte]].get,
      OUTPUTS(1).tokens(0)._1 == SELF.tokens(0)._1,
    )))
  }
}`


// 27Mukch3tuhwwUo8EZVBMC74hB6Hk44Pyt747WtxUJ5M2UY9Rx9k5KohC8p4VnB5AHesqPFmyGRfa8x3TAjdgWJVWECWwT4JgvM7oTqZJQdrtEE2rVYAK3avNmKnNSiyiJJCZThkeU6Cc5xC5zykmjXmLBRxAsar6JtbSXM384hvq9nbTbwHzkc64hSdsZGDnkzFRUF7f6toHr4Qgg3T2Y16J9VGtTmtx3dw1c9R5pkDBDGP8axMqL8bp17qYTKNgsb7E5aGGEf1v82YAnS34jFFchG4DTJmQksuoXTpk3K25DtyBvk3Q2TSchTGw55BWNdDtpZokoxt9oDjMF2XSdQQsSRFSRLUfckKcSgwvrJnn814pN2VzJR2MsHJWoQYU
export const guardianTokenRepo: string = `
{
  val VAAToken = fromBase64("VAA_TOKEN");
  // INPUTS: [GuardianSetTokenRepo, VAA-Guardian, sponsor], optional[Guardian] --> OUTPUTS: [GuardianSetTokenRepo, VAA-refund, Guardian, sponsor]
  val guardianSetIndex = SELF.R4[Coll[Int]].get(0)
  val guardianSetLimit = SELF.R4[Coll[Int]].get(1)
  val tokenCheck = {
    if(guardianSetIndex >= guardianSetLimit){
      allOf(Coll(
        OUTPUTS(0).tokens(1)._2 == SELF.tokens(1)._2
      ))
    } else{
      allOf(Coll(
        OUTPUTS(0).tokens(1)._2 == SELF.tokens(1)._2 - 1
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
      OUTPUTS(0).R4[Coll[Int]].get(1) == guardianSetLimit,
      // Verifying VAA-Guardian
      INPUTS(1).tokens(0)._1 == VAAToken,
      // Guardian token
      OUTPUTS(2).tokens(0)._1 == SELF.tokens(1)._1,
      tokenCheck,
      // Guardian index
      OUTPUTS(2).R6[Int].get == guardianSetIndex,
      // Guardian index of the next round stored on the oracle box
      OUTPUTS(0).R4[Coll[Int]].get(0) == guardianSetIndex + 1,
    ))
  )
}
`

// 3V35Y2v8GYj83YwFMzhtRHeEXcLib248XJY9AC1HErEN3FC8Vfu5hWrN3dfs4iwCev8hpRjx73ajgtZypKuDoW2CHZzfTtjNatHozpcB5BrN3prWQD5KNkQ9yeqQYP5M6gcyWY1uRoXXawSP2fLZbr1WNDAe56aDF55zLYFmgWiV6rqyqdSScUQFg9WaXAHQdfREUHLuacesuAtkh1CY9iKYX9bFABQLJKkVLkEXsajR9mdQtYzSrenMJkL5BhfEV7bijeV6LQPfVr6qyeHcSRx5qTqq1rqLsVHEeg4qfqgV8stEeLBfsMaCuANQDSPda25nmtY57kQ7K3WKpP59Q6eSPF3oE8N9r5GdY7Pxd5HVg5vDkv1usiLt8vwkFUQeaoLg7ZEsRSAydctoiigyQCU3TWdSp9j6LEtuKtZBpXt8qgdkFNxz3Vi4Wa9WTXDrF3N8qzT69vbgigFyDxp5MRhJTmAAiVrY1x5bTQfjgcG6AVNdSAzhZGTR36z9hi5neNMEFKKnAEMgamboNtTc6BNCCRaw5NGc3teyUn1qsFkM1wTJKjXZCiswH1u3F5gXSh5YhtrSdd7A7hqbndy85NDSYyqe39vgtfP6NeNiqkYqtfqE2iEC9sBhj946WbXZkYLbBA8FnUdjSahr8Bwdwa8shgGYagAPvujkv71ntS7P6EP25DK48Q2BjA68uGd
export const registerVAAScript: string = `
{
  val registerNFT = fromBase64("REGISTER_NFT");
  val bftSignatureCount = BFT_SIGNATURE_COUNT;
  val registerScriptHash = fromBase64("REGISTER_SCRIPT_HASH");
  val wormholeNFT = fromBase64("WORMHOLE_NFT");
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
      OUTPUTS(1).propositionBytes == SELF.R6[Coll[Byte]].get,
      OUTPUTS(1).tokens(0)._1 == SELF.tokens(0)._1,
    )))
  }
}
`

// 2iHn5dMjC1E7oxFkCVJmUeMVbozbhDxBgR55vANH6WaBrtb76mTv3UDHBX2SExRSfD4zKVCGfTAQ6TrpDSrmEaqmboNnPTQX5f9DQXXrM3fnobQ2QsYAD7moHkom4SHNH3tAzKwytwc2ANNchQFNtS
export const registerScript: string = `
{
  val VAAToken = fromBase64("VAA_TOKEN");
  // INPUTS: [Register, VAA-register, sponsor] --> OUTPUTS: [Register, VAA-register, sponsor]
  sigmaProp(
    allOf(Coll(
      // Verifying self-replication
      OUTPUTS(0).tokens(0)._1 == SELF.tokens(0)._1,
      OUTPUTS(0).propositionBytes == SELF.propositionBytes,
      // VVA
      INPUTS(1).tokens(0)._1 == VAAToken
    ))
  )
}`
