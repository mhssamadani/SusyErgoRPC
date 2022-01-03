import getenv from "getenv";
import * as wasm from 'ergo-lib-wasm-nodejs';


const config = {
    token: {
        "VAAT": "7d0fa3e572c94138fa9d5960190f125d3d2b1d73dbba2705c22b1b31f10f11f4" ,
        "wormholeNFT": "d2dcb5e1212ddd27a1e77659db335a053f4f008653312db907b8e984109a20f0" ,
        "guardianNFT": "9f7fe0b1398660f3b25e50d6500ac3ac45f46ff887ea2da44f73d0d500992179" ,
        "guardianToken": "b054e2c62f803b239aa45e579e485c099b4032b9fe619ee75e7bff6a000ece45" ,
        "bankNFT": "63c235fad927e8dcc7f3ab04b93a9821a28ccebc3dc974a56689b9fcf135d4bb" ,
        "registerNFT": "29219547d4119fdd907df046b26723b1c80ae60c3b60b754d2ebe6069f4e8857"
    },
    addressSecret: "cd1774b543d4a51bc8573ac755acfe3adab59d545ae0cf4ca960e02f60d51aa7",
    address: "9geVqctvHRFEZppmoPYzMmZ3LKGgDZj6FTsCrFPA8HsgQCbfbXB",
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
        secret: "cd1774b543d4a51bc8573ac755acfe3adab59d545ae0cf4ca960e02f60d51aa7",
        // secret: "7ec7bc1aa5cb9e415b259de1b39f728f9f558572b4223d5a40da8e074d0c77bb",
        address: "9geVqctvHRFEZppmoPYzMmZ3LKGgDZj6FTsCrFPA8HsgQCbfbXB"
    },
    vaaSourceBoxAddress: "9geVqctvHRFEZppmoPYzMmZ3LKGgDZj6FTsCrFPA8HsgQCbfbXB",
    port: 8080,
    test: true
}

const setTokens = (tokens: { VAAT: string, wormholeNFT: string, guardianNFT: string, guardianToken: string, bankNFT: string, registerNFT: string }) => {
    config.token.VAAT = tokens.VAAT
    config.token.wormholeNFT = tokens.wormholeNFT
    config.token.guardianToken = tokens.guardianToken
    config.token.guardianNFT = tokens.guardianNFT
    config.token.bankNFT = tokens.bankNFT
    config.token.registerNFT = tokens.registerNFT
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

