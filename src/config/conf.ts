import getenv from "getenv";
import * as wasm from 'ergo-lib-wasm-nodejs';


const config = {
    token: {
        VAAT: '6bb7e2a6245cea46acd5ea363389c274444903210a1d51aeac3c879ba92f2a24',
        wormholeNFT: '68ac2e71be9c2d225255a62623def67ecb5eab42fe4d828078a5b1a1eabbd64d',
        guardianNFT: '96ea478bb2f03b20c1ffff2ebea302880c55746ec0f52d6aeb4fe1d75a780374',
        guardianToken: 'cadeadd7f480be7725cab8bf3254e8fd3e60a878dc89094aeb5b3fc7999f6f80',
        bankNFT: '4662cfff004341503d24338bf8b24f90f3c660e0a1378292832e31419a2486d0',
        registerNFT: '466d0a2ce63bce0fafce842ef249f9cb56a574716f653206589b918240a886c4',

        bankToken: '96c81ac45d955198687d49202d8c1f77e42376046f42dd552801e1bee5e0c301'
    },
    addressSecret: "9ea73fe098b8f409009c85785f8d8dc3ba9a1dd5d8c423d8712b25255a5870b2",
    address: "9gCvobk88Ga4RHrqjdDN6fc4FefV3wfxaj5xmTXy34DwzR8V1Nz",
    node: "http://10.10.9.3:9064",
    explorerApi: "http://10.10.9.3:7000",
    networkType: wasm.NetworkPrefix.Mainnet,
    bftSignatureCount: 4,
    fee: 1100000,
    bridgeId: 10,
    guardian: {
        index: 3,
        // privateKey: "3e600b60d82da99c55959df4bb4ceb139cbe434a948251b371c6d9eeb73cb723",
        // privateKey: "74e7b65055d170d36d4fb926102fe6e047390980f66611f541f1b8268cbd5a25",
        // privateKey: "f5dc049d8f757382d6d537b6ea7324d27b54a59fdefaa60d5ff02a803358a0a0",
        privateKey: "a5cb9a40da8259d8223d57ec7bc1aefee415b9f558572b41b39f72074d0c77bb",
    },
    service: "sign",
    initializer: {
        secret: "9ea73fe098b8f409009c85785f8d8dc3ba9a1dd5d8c423d8712b25255a5870b2",
        address: "9gCvobk88Ga4RHrqjdDN6fc4FefV3wfxaj5xmTXy34DwzR8V1Nz"
    },
    vaaSourceBoxAddress: "9gCvobk88Ga4RHrqjdDN6fc4FefV3wfxaj5xmTXy34DwzR8V1Nz",
    port: 8080,
}

export default config

/*

[
  {
    publicKey: '02fc34b896f565c0b930981cbc76e1715fde18c4ecdcb50acc50e42ea17bbb1848',
    mnemonic: 'climb junk dismiss relax faint fox add youth aware clay second juice coconut abuse blood',
    seed: '3e600b60d82da99c55959df4bb4ceb139cbe434a948251b371c6d9eeb73cb723'
  },
  {
    publicKey: '038b6b9465fbb281540dee04a640935ad8d02381dbf4be46665e73d909c2dbedde',
    mnemonic: 'client flower assume visual hobby nasty couple basket polar exhaust object correct action swear joke',
    seed: '74e7b65055d170d36d4fb926102fe6e047390980f66611f541f1b8268cbd5a25'
  },
  {
    publicKey: '0298e8ccf316b98d730a1bfcb25f92754bb5b26ad5547aa5d4179ff41238ddbca9',
    mnemonic: 'trash victory jaguar output rocket derive fringe educate survey large used choose figure sniff delay',
    seed: 'f5dc049d8f757382d6d537b6ea7324d27b54a59fdefaa60d5ff02a803358a0a0'
  },
  {
    publicKey: '0229b27ec5733194fb7168312b5264864bde7aff7f873d2cc6121ebe92db112afd',
    mnemonic: 'enemy toss divert over square law sleep simple wreck clump six decide cliff sausage nurse',
    seed: 'a5cb9a40da8259d8223d57ec7bc1aefee415b9f558572b41b39f72074d0c77bb'
  },
  {
    publicKey: '025d2ef94c7a3e99814a7152753720ba903f5f5af1b72104c0aff5778c9782fa2a',
    mnemonic: 'palm frown leaf large special total sustain agree transfer violin net virus hamster final better',
    seed: '72f4597ded879c2fb3874ff7cb2347c85a5859762ede4932ca7a4998145a683b'
  },
  {
    publicKey: '02c774e9af70fc30ff39ade71ba5613daea2f7c9fb99efe6f87886bec016458f2f',
    mnemonic: 'once wheat inquiry excess square fall rhythm actress fade silly very latin common crazy filter',
    seed: '5e6c4c283efb4487dcdd27f0444b222b901728081855aaf48808c025ee163dab'
  }
] [
  {
    privateKey: <Buffer 0a f7 23 62 08 4d 34 1d b7 b2 20 7d 17 46 48 5b 4d 8e 42 16 95 cb 5d 8c 24 a1 13 ff 87 e2 55 5b>,
    address: '0x89e5673332cb6456dfdd42c1a4ce3a1350a19666',
    mnemonic: 'bone glow skill danger quiz easily number pulse rate reunion neck nephew neglect miss agree'
  },
  {
    privateKey: <Buffer 0b 79 e5 4c d8 4f 5f 0f 5f b3 8d 3f 96 f9 6e 11 3d fe cd 26 51 91 a4 ba e1 eb 96 3b 6d 8f 12 b4>,
    address: '0xc097c943bf246bf5e7ef1ce1c76b1e344839fd76',
    mnemonic: 'nasty rib twenty ranch trend dress awake hawk ugly spring mad grit behind deliver grain'
  },
  {
    privateKey: <Buffer 85 fd 5d bb ff 95 da b0 e8 f9 67 eb 83 25 f8 33 34 04 6a c4 e4 98 0c 4d 6d e9 75 86 24 df 62 33>,
    address: '0x9420e438a3236f5dbcfef199227d708586fdbb3a',
    mnemonic: 'athlete polar speak estate fire pipe pitch wagon opinion lemon virus bid poverty coast give'
  },
  {
    privateKey: <Buffer 0b bd 58 96 0a 8a 6e 69 65 63 6e 71 56 e3 50 4d 5d 5e 68 33 79 74 da da 8d 8c f5 0d 7b de 27 1e>,
    address: '0x80f686ecea8779f34bc3b8e412a9a609d7a3db2b',
    mnemonic: 'yellow someone swift taste brush lounge devote foil globe vacuum illegal bless toilet update alarm'
  },
  {
    privateKey: <Buffer d1 24 18 d9 c1 5c 3b 09 21 dd d8 29 a8 54 8d 1f fe 69 b8 30 9e c7 30 20 75 d3 8f 14 f6 e9 80 cd>,
    address: '0xa44750f545deb1b2db1c922ae1734c0504ddab68',
    mnemonic: 'toe furnace razor option gas elevator upon rhythm depend dragon gun biology damage simple method'
  },
  {
    privateKey: <Buffer 97 a4 30 76 27 25 0f f0 ae d4 7a c4 db ba bd 52 44 70 77 a6 1e 3a 30 b3 f0 a0 17 84 73 51 48 41>,
    address: '0x73b362a20df341b41722c445f5f031e687d46a74',
    mnemonic: 'faculty imitate voice domain yard erupt fiction expand vapor ring impulse pottery car better tuition'
  }
]
 */
