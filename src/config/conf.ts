import getenv from "getenv";
import * as wasm from 'ergo-lib-wasm-nodejs';


const config = {
    token: {
        "VAAT": "6bb7e2a6245cea46acd5ea363389c274444903210a1d51aeac3c879ba92f2a24",
        "wormholeNFT": "466d0a2ce63bce0fafce842ef249f9cb56a574716f653206589b918240a886c4",
        "guardianNFT": "96ea478bb2f03b20c1ffff2ebea302880c55746ec0f52d6aeb4fe1d75a780374",
        "guardianToken": "cadeadd7f480be7725cab8bf3254e8fd3e60a878dc89094aeb5b3fc7999f6f80",
        "bankNFT": "4662cfff004341503d24338bf8b24f90f3c660e0a1378292832e31419a2486d0",
        "registerNFT": "466d0a2ce63bce0fafce842ef249f9cb56a574716f653206589b918240a886c4"
    },
    addressSecret: "fe098b9a1dd5d8c4c8d8dc3ba85785f9ea7323d8718f4090092b25255a5870b2",
    address: "9hVvqWL35JUJB6ZBG4TfqR71dyYzhQuv54Sg7mkhAnZTREMW6XA",
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
    service: "init",
    initializer: {
        secret: "fe098b9a1dd5d8c4c8d8dc3ba85785f9ea7323d8718f4090092b25255a5870b2",
        // secret: "7ec7bc1aa5cb9e415b259de1b39f728f9f558572b4223d5a40da8e074d0c77bb",
        address: "9hVvqWL35JUJB6ZBG4TfqR71dyYzhQuv54Sg7mkhAnZTREMW6XA"
    },
    vaaSourceBoxAddress: "9hVvqWL35JUJB6ZBG4TfqR71dyYzhQuv54Sg7mkhAnZTREMW6XA",
    port: 8080,
    test: true
}

const setTokens = (tokens: { VAAT: string, wormholeNFT: string, guardianNFT: string, guardianToken: string, bankNFT: string, registerNFT: string }) => {
    config.token = tokens
}

const setGuardianIndex = (index: number) => {
    const privateKeys = [
        "3e600b60d82da99c55959df4bb4ceb139cbe434a948251b371c6d9eeb73cb723",
        "74e7b65055d170d36d4fb926102fe6e047390980f66611f541f1b8268cbd5a25",
        "f5dc049d8f757382d6d537b6ea7324d27b54a59fdefaa60d5ff02a803358a0a0",
        "a5cb9a40da8259d8223d57ec7bc1aefee415b9f558572b41b39f72074d0c77bb",
        "72f4597ded879c2fb3874ff7cb2347c85a5859762ede4932ca7a4998145a683b",
        "5e6c4c283efb4487dcdd27f0444b222b901728081855aaf48808c025ee163dab",
    ]
    config.guardian.privateKey = privateKeys[index]
    config.guardian.index = index;
}
export default config

export {
    setTokens,
    setGuardianIndex
}

