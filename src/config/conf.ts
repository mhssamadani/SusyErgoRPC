import getenv from "getenv";
import * as wasm from 'ergo-lib-wasm-nodejs';

interface Token {
    VAAT: string;
    wormholeNFT: string;
    guardianNFT: string;
    guardianToken: string;
    bankNFT: string;
    registerNFT: string;
}

interface Guardian {
    index: number;
    privateKey: string;
}

interface BaseConfig {
    service: string;
    token: Token;
    node: string;
    explorerApi: string;
    networkType: wasm.NetworkPrefix;
    bftSignatureCount: number;
    fee: number;
    minBox: number;
    bridgeId: string;
}

interface RpcServiceConfig extends BaseConfig {
    port: number;
    secret: string;
    address: string
}

interface SignServiceConfig extends BaseConfig {
    guardian: Guardian
}

interface InitializeServiceConfig extends BaseConfig {
    initializer: { secret: string };
    test: boolean;
    guardian: Guardian;
}

//
// const config: RpcServiceConfig | SignServiceConfig | InitializeServiceConfig = {
//     service: getenv("SERVICE_TYPE", "init"),
//     token: {
//         VAAT: getenv("TOKEN_VAAT", ""),
//         wormholeNFT: getenv("TOKEN_WORMHOLE_NFT", ""),
//         guardianNFT: getenv("TOKEN_GUARDIAN_NFT", ""),
//         guardianToken: getenv("TOKEN_GUARDIAN", ""),
//         bankNFT: getenv("TOKEN_BANK_NFT", ""),
//         registerNFT: getenv("TOKEN_REGISTER_NFT", "")
//     },
//     // addressSecret: getenv("ADDRESS_SECRET", ""),
//     // address: getenv("ADDRESS", ""),
//     node: getenv("NODE", "http://213.239.193.208:9053"),
//     explorerApi: getenv("EXPLORER_API", "https://api.ergoplatform.com"),
//     networkType: getenv("NETWORK_TYPE", "mainnet") == "mainnet" ? wasm.NetworkPrefix.Mainnet : wasm.NetworkPrefix.Testnet,
//     bftSignatureCount: parseInt(getenv("BFT_SIGNATURE_COUNT", "4")),
//     fee: parseInt(getenv("FEE", "1100000")),
//     bridgeId: getenv("BRIDGE_ID", "10"),
//     guardian: {
//         index: parseInt(getenv("GUARDIAN_INDEX", "0")),
//         privateKey: getenv("GUARDIAN_PRIVATE_KEY", ""),
//     },
//     initializer: {
//         secret: getenv("INITIALIZER_SECRET", ""),
//     },
//     // vaaSourceBoxAddress: getenv("VAA_SOURCE_BOX_ADDRESS", ""),
//     port: parseInt(getenv("RPC_PORT", "8080")),
//     test: getenv("TEST", "true").toLowerCase() == "true"
// };

const config = {
    service: getenv("SERVICE_TYPE", "init"),
    token: {
        VAAT: getenv("TOKEN_VAAT", ""),
        wormholeNFT: getenv("TOKEN_WORMHOLE_NFT", ""),
        guardianNFT: getenv("TOKEN_GUARDIAN_NFT", ""),
        guardianToken: getenv("TOKEN_GUARDIAN", ""),
        bankNFT: getenv("TOKEN_BANK_NFT", ""),
        registerNFT: getenv("TOKEN_REGISTER_NFT", "")
    },
    addressSecret: getenv("ADDRESS_SECRET", ""),
    address: getenv("ADDRESS", ""),
    node: getenv("NODEEEE", "http://213.239.193.208:9053"),
    explorerApi: getenv("EXPLORER_API", "https://api.ergoplatform.com"),
    networkType: getenv("NETWORK_TYPE", "mainnet") == "mainnet" ? wasm.NetworkPrefix.Mainnet : wasm.NetworkPrefix.Testnet,
    bftSignatureCount: parseInt(getenv("BFT_SIGNATURE_COUNT", "1")),
    fee: parseInt(getenv("FEE", "1100000")),
    minBoxValue: parseInt(getenv("MIN_BOX_VALUE", wasm.BoxValue.SAFE_USER_MIN().as_i64().to_str())),
    bridgeId: parseInt(getenv("BRIDGE_ID", "10")),
    guardian: {
        index: parseInt(getenv("GUARDIAN_INDEX", "0")),
        privateKey: getenv("GUARDIAN_PRIVATE_KEY", ""),
    },
    initializer: {
        secret: getenv("INITIALIZER_SECRET", ""),
        address: getenv("INITIALIZER_ADDRESS", "")
    },
    vaaSourceBoxAddress: getenv("VAA_SOURCE_BOX_ADDRESS", ""),
    port: parseInt(getenv("RPC_PORT", "8080")),
    test: getenv("TEST", "true").toLowerCase() == "true"
};

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

