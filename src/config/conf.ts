import getenv from "getenv";
import * as wasm from 'ergo-lib-wasm-nodejs';


const config = {
    token: {
        "VAAT": "36e4832b7df8d59ee0e76649a5795a535766999bc61499d91a8c7a8772fd242e",
        "wormholeNFT": "73ab52c6a9d134944952260cc05404bb2c0c9ce507be66e49f56e9334391b76e",
        "guardianNFT": "a146130f7c939d041e0a2ab974d9fb3fc93bc13239e43ac04a3b636ce749226b",
        "guardianToken": "9e3a47b44ea0454c5b67e17992f7942a9d0c967ecc073ee1f1cbce599e06d2b4",
        "bankNFT": "503600f0fb7fa7a47ed77b6174718d03d61994e397c4feda2058ac925c6a28e5",
        "registerNFT": "822b3128d27a5a2e857172424db8af2eb2d7d76fd60aea72d82060f7f8df88a8"
    },
    addressSecret: "7ec7bc1aa5cb9e415b259de1b39f728f9f558572b4223d5a40da8e074d0c77bb",
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
        // secret: "fe098b9a1dd5d8c4c8d8dc3ba85785f9ea7323d8718f4090092b25255a5870b2",
        secret: "7ec7bc1aa5cb9e415b259de1b39f728f9f558572b4223d5a40da8e074d0c77bb",
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

