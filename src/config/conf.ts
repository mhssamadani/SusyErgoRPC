import getenv from "getenv";
import * as wasm from 'ergo-lib-wasm-nodejs';


const config = {
    token: {
        "VAAT": "4c30864784045f31ceb0914071bedb1bd46ad3b33440365048d4c1a3fb3df1b0",
        "wormholeNFT": "40e091e7ee51337d44f31a73640f40faca591f860111246bc1a36af05caa81a6",
        "guardianNFT": "da46feaf1e6e0379771ec828ed5bc7f30d05ac43a5f6a3c9a2727e39932b4163",
        "guardianToken": "8da18dfa9b6e9f8f1fb8989dcc3fac162b6191b273d7c4bac69ea33baa34d36d",
        "bankNFT": "da7c86513d48f5081825effbec947f36c4f201abb49a1d0863f427dc4ffa750a",
        "registerNFT": "77d1777f31cc56e8285cccb3251e376e00cf5e54bf00e482006d6a455b2f744b"
    },
    addressSecret: "fe098b9a1dd5d8c4c8d8dc3ba85785f9ea7323d8718f4090092b25255a5870b2",
    address: "9fpKbN9rDg5pSjrfNPZQWZpQxWfv2QeQK7wwYtPdbPsxMMFe7Eq",
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
    service: "payment",
    initializer: {
        secret: "fe098b9a1dd5d8c4c8d8dc3ba85785f9ea7323d8718f4090092b25255a5870b2",
        // secret: "7ec7bc1aa5cb9e415b259de1b39f728f9f558572b4223d5a40da8e074d0c77bb",
        address: "9fpKbN9rDg5pSjrfNPZQWZpQxWfv2QeQK7wwYtPdbPsxMMFe7Eq"
    },
    vaaSourceBoxAddress: "9fpKbN9rDg5pSjrfNPZQWZpQxWfv2QeQK7wwYtPdbPsxMMFe7Eq",
    port: 8080,
    test: true
}

const setTokens = (tokens: { VAAT: string, wormholeNFT: string, guardianNFT: string, guardianToken: string, bankNFT: string, registerNFT: string }) => {
    config.token = tokens
}

const setSecret = (secret: string, address: string) => {
    config.initializer.secret = secret
    config.addressSecret = secret
    config.initializer.address = address
    config.vaaSourceBoxAddress = address
    config.address = address
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
    setGuardianIndex,
    setSecret
}

