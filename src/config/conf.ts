import environments from "getenv";
import * as dotenv from 'dotenv'
import * as wasm from 'ergo-lib-wasm-nodejs';
import BigInteger from "bigi";

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
    privateKey: BigInteger;
}

interface RpcServiceConfig {
    port: number;
}

interface SignServiceConfig {
    guardian: Guardian
}

interface InitializeServiceConfig {
    secret: wasm.SecretKey;
    address?: wasm.Address;
    test: boolean;
    guardian: Guardian;
}

type BaseConfig = {
    service: string;
    token: Token;
    node: string;
    explorerApi: string;
    networkType: wasm.NetworkPrefix;
    bftSignatureCount: number;
    adminBftSignatureCount: number;
    fee: number;
    minBoxValue: number;
    bridgeId: number;
    secret?: wasm.SecretKey;
    address: wasm.Address;
    extra?: InitializeServiceConfig | SignServiceConfig | RpcServiceConfig;
    setToken?: (tokens: Token) => any;
    setSecret?: (secret: string) => any;
    setGuardianIndex?: (index: number) => any;
    getExtraRpc: () => RpcServiceConfig;
    getExtraSign: () => SignServiceConfig;
    getExtraInitialize: () => InitializeServiceConfig;
    guardianLimit: number;
    timeout: number;

}

const conf = dotenv.config().parsed
const get_env = (key: string, fallback?: string) => {
    if(conf) {
        if (conf.hasOwnProperty(key)) {
            return conf[key]
        }
    }
    return environments(key, fallback)
}
const setupInitConfig = (config: BaseConfig) => {
    config.setToken = (tokens: Token) => {
        config.token.VAAT = tokens.VAAT
        config.token.wormholeNFT = tokens.wormholeNFT
        config.token.guardianToken = tokens.guardianToken
        config.token.guardianNFT = tokens.guardianNFT
        config.token.bankNFT = tokens.bankNFT
        config.token.registerNFT = tokens.registerNFT
    }
    config.setSecret = (secretHex: string) => {
        const secret = wasm.SecretKey.dlog_from_bytes(Uint8Array.from(Buffer.from(secretHex, "hex")))
        const extra = config.extra as InitializeServiceConfig;
        extra.address = secret.get_address()
        extra.secret = secret;
        config.address = secret.get_address()
        config.secret = secret
    }
    config.setGuardianIndex = (index: number) => {
        const privateKeys = [
            "3e600b60d82da99c55959df4bb4ceb139cbe434a948251b371c6d9eeb73cb723",
            "74e7b65055d170d36d4fb926102fe6e047390980f66611f541f1b8268cbd5a25",
            "f5dc049d8f757382d6d537b6ea7324d27b54a59fdefaa60d5ff02a803358a0a0",
            "a5cb9a40da8259d8223d57ec7bc1aefee415b9f558572b41b39f72074d0c77bb",
            "72f4597ded879c2fb3874ff7cb2347c85a5859762ede4932ca7a4998145a683b",
            "5e6c4c283efb4487dcdd27f0444b222b901728081855aaf48808c025ee163dab",
        ]
        const extra = config.extra as InitializeServiceConfig
        extra.guardian.index = index
        extra.guardian.privateKey = BigInteger.fromHex(privateKeys[index])
    }

}
const createConfig = () => {
    const notAvailable = () => {
        throw Error("Not Available")
    }
    const secretHex = get_env("SECRET", "")
    const secret = secretHex ? wasm.SecretKey.dlog_from_bytes(Uint8Array.from(Buffer.from(secretHex, "hex"))) : undefined
    const address = secret ? secret.get_address() : wasm.Address.from_base58(get_env("ADDRESS", ""))
    const resultConfig: BaseConfig = {
        service: get_env("SERVICE_TYPE", "init"),
        token: {
            VAAT: get_env("TOKEN_VAAT", ""),
            wormholeNFT: get_env("TOKEN_WORMHOLE_NFT", ""),
            guardianNFT: get_env("TOKEN_GUARDIAN_NFT", ""),
            guardianToken: get_env("TOKEN_GUARDIAN", ""),
            bankNFT: get_env("TOKEN_BANK_NFT", ""),
            registerNFT: get_env("TOKEN_REGISTER_NFT", "")
        },
        node: get_env("ERGO_NODE", "http://213.239.193.208:9053"),
        explorerApi: get_env("EXPLORER_API", "https://api.ergoplatform.com"),
        networkType: get_env("NETWORK_TYPE", "mainnet") == "mainnet" ? wasm.NetworkPrefix.Mainnet : wasm.NetworkPrefix.Testnet,
        bftSignatureCount: parseInt(get_env("BFT_SIGNATURE_COUNT", "4")),
        adminBftSignatureCount: parseInt(get_env("ADMIN_BFT_SIGNATURE_COUNT", "5")),
        fee: parseInt(get_env("FEE", "1100000")),
        minBoxValue: parseInt(get_env("MIN_BOX_VALUE", wasm.BoxValue.SAFE_USER_MIN().as_i64().to_str())),
        bridgeId: parseInt(get_env("BRIDGE_ID", "10")),
        address: address,
        secret: secret,
        guardianLimit: parseInt(get_env("GUARDIAN_LIMIT", "2")),
        timeout: parseInt(get_env("TIMEOUT", "180000")),
        getExtraRpc: notAvailable,
        getExtraInitialize: notAvailable,
        getExtraSign: notAvailable,
    }
    if (resultConfig.service === 'init') {
        const secret = wasm.SecretKey.dlog_from_bytes(Uint8Array.from(Buffer.from(get_env("INITIALIZER_SECRET", ""), "hex")))
        const address = secret.get_address()
        const extra: InitializeServiceConfig = {
            guardian: {
                index: 0,
                privateKey: BigInteger.fromHex("00"),
            },
            secret: secret,
            address: address,
            test: get_env("TEST", "true").toLowerCase() == "true"
        }
        resultConfig.getExtraInitialize = () => extra
        resultConfig.getExtraSign = () => extra as SignServiceConfig
        resultConfig.extra = extra;
        setupInitConfig(resultConfig);
    } else if (resultConfig.service === 'rpc') {
        const extra: RpcServiceConfig = {
            port: parseInt(get_env("RPC_PORT", "8080")),
        }
        resultConfig.extra = extra
        resultConfig.getExtraRpc = () => extra
    }else if(resultConfig.service === 'sign') {
        const privateKey = BigInteger.fromHex(get_env("GUARDIAN_PRIVATE_KEY", ""))
        const extra: SignServiceConfig = {
            guardian: {
                privateKey: privateKey,
                index: parseInt(get_env("GUARDIAN_INDEX", "0"))
            }
        }
        resultConfig.extra = extra
        resultConfig.getExtraSign = () => extra
    }
    return resultConfig
}

const config = createConfig()

export default config
