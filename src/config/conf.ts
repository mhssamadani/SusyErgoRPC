const getenv = require('getenv');


const config = {
    token: {
        VAAT: "44ee077854471a04fbef18a5a971b50fb39f52fc6f6b3b8d0682ce2c48f6ebef",
        wormholeNFT: "55ee077854471a04fbef18a5a971b50fb39f52fc6f6b3b8d0682ce2c48f6ebef",
        guardianNFT: "11ee077854471a04fbef18a5a971b50fb39f52fc6f6b3b8d0682ce2c48f6ebef",
        bankNFT: "33ee077854471a04fbef18a5a971b50fb39f52fc6f6b3b8d0682ce2c48f6ebef"
    },
    updateSK: "",
    node: "http://10.10.9.3:9064",
    explorerApi: "http://10.10.9.3:7000",
    bftSignatureCount: 4,
    fee: 1100000,
    bridgeId: 10,
    guardian: {
        index: 1,
        privateKey: "",
    },
    service: "rpc"
}


export default config
