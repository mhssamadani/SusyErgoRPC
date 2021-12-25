import getenv from "getenv";
import * as wasm from 'ergo-lib-wasm-nodejs';


const config = {
    token: {
        VAAT: "b617f961b4e9d001a764a9e27d726780eef1b2d04613f8dc14dace095be734c8",
        wormholeNFT: "3cb20db790e53ae78db3960a67ce7adb08ea0a072af6237aa5a14bdeb9f9f677",
        guardianNFT: "34a808699da9299a3d1a7cf1296edce0c714adcd80ec604d1c597c129f9a4cc2",
        guardianToken: "b7071529615dc4a665534f3cb39b6d731e0cd41fa2939dd3a8eaef0745fd7168",
        bankNFT: "b7d432da5fff44f2d44781586f60c8ca38bbd15079e57e98f08f3f72dccf5269",
        registerNFT: "77ee077854471a04fbef18a5a971b50fb39f52fc6f6b3b8d0682ce2c48f6ebef",
        bankToken: "1bf7a0ffbd22afe0a553c9a33281e7c295e52f37865ba17be686c2af2b52ae31"
    },
    addressSecret: "bae3ef240ca2e6398ca58446a4b42aa3c24cf90a841aad72e827fbc5b29390b5",
    node: "http://10.10.9.3:9064",
    explorerApi: "http://10.10.9.3:7000",
    networkType: wasm.NetworkPrefix.Mainnet,
    bftSignatureCount: 4,
    fee: 1100000,
    bridgeId: 10,
    guardian: {
        index: 1,
        privateKey: "",
    },
    service: "none",
    initializer: {
        secret: "b1ef2a340ca2e639858446a4b42ac24cf90a84ca1aad72e827fbc5b29390b73e",
        address: "9fo5LQvJJigxgGJ4Qv5KZGq5nMHLHomX4h1nPPo1JKxcPKa3myL"
    },
    vaaSourceBoxAddress: "",
    port: 8080
}

export default config
