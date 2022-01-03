import setupRPC from "./network/rpc"
import config, {setGuardianIndex} from "./config/conf";
import signService, {signMsg} from "./susy/signService";
import * as wasm from 'ergo-lib-wasm-nodejs'
import {Boxes} from "./susy/boxes";
import {getSecret} from "./susy/init/util";
import ApiNetwork from "./network/api";
import {generateVaa} from "./susy/init";
import {issueVAA, updateVAABox} from "./susy/transaction";
import {VAA, registerChainPayload, transferPayload, updateGuardianPayload} from "./models/models";
import * as codec from "./utils/codec";
import BigInteger from 'bigi';
import Contracts from "./susy/contracts";
import { GuardianBox, VAABox } from "./models/boxes";

const inputBoxes = wasm.ErgoBoxes.from_boxes_json([JSON.stringify({
    "boxId": "da7c86513d48f5081825effbec947f36c4f201abb49a1d0863f427dc4ffa750a",
    "transactionId": "c427c64f8934fce495417ea5e36d2655d7e85ed9d3a6627eff038d577932d4e2",
    "blockId": "8fa4a885c6a0a331d40c11497ed4fde9920752dedf2f7d079784955f95b72af7",
    "value": 3978000000,
    "index": 1,
    "globalIndex": 251545,
    "creationHeight": 0,
    "settlementHeight": 109673,
    "ergoTree": "0008cd02aae3107235e1eebb54a87fbd34d0656ef20e871c3568090b63302e6767720d0f",
    "address": "9fpKbN9rDg5pSjrfNPZQWZpQxWfv2QeQK7wwYtPdbPsxMMFe7Eq",
    "assets": [{
        "tokenId": "cadeadd7f480be7725cab8bf3254e8fd3e60a878dc89094aeb5b3fc7999f6f80",
        "index": 0,
        "amount": 999,
        "name": "Guardian Token",
        "decimals": 0,
        "type": "EIP-004"
    }, {
        "tokenId": "4662cfff004341503d24338bf8b24f90f3c660e0a1378292832e31419a2486d0",
        "index": 1,
        "amount": 9999,
        "name": "Bank Identifier",
        "decimals": 0,
        "type": "EIP-004"
    }, {
        "tokenId": "466d0a2ce63bce0fafce842ef249f9cb56a574716f653206589b918240a886c4",
        "index": 2,
        "amount": 1,
        "name": "register NFT",
        "decimals": 0,
        "type": "EIP-004"
    }, {
        "tokenId": "96ea478bb2f03b20c1ffff2ebea302880c55746ec0f52d6aeb4fe1d75a780374",
        "index": 3,
        "amount": 1,
        "name": "Guardian NFT",
        "decimals": 0,
        "type": "EIP-004"
    }, {
        "tokenId": "6bb7e2a6245cea46acd5ea363389c274444903210a1d51aeac3c879ba92f2a24",
        "index": 4,
        "amount": 9997,
        "name": "VAA Identifier",
        "decimals": 0,
        "type": "EIP-004"
    }],
    "additionalRegisters": {},
    "spentTransactionId": null,
    "mainChain": true
})])
const fee = wasm.BoxValue.from_i64(wasm.I64.from_str(config.fee.toString()))
let ctx: wasm.ErgoStateContext | null = null
const emptyBoxes = wasm.ErgoBoxes.from_boxes_json([])

const getCtx = async () => {
    if (!ctx) {
        ctx = await ApiNetwork.getErgoStateContext();
    }
    return ctx!
}

const fakeBox = async (candidate: wasm.ErgoBoxCandidate) => {
    const boxSelection = new wasm.BoxSelection(inputBoxes, new wasm.ErgoBoxAssetsDataList());
    const txOutput = new wasm.ErgoBoxCandidates(candidate);
    const builder = wasm.TxBuilder.new(
        boxSelection,
        txOutput,
        0,
        fee,
        getSecret().get_address(),
        wasm.BoxValue.SAFE_USER_MIN()
    )
    const sks = new wasm.SecretKeys();
    const secret = getSecret()
    console.log(secret.get_address().to_base58(config.networkType))
    sks.add(secret);
    const wallet = wasm.Wallet.from_secrets(sks);
    const signedTx = wallet.sign_transaction(await getCtx(), builder.build(), inputBoxes, emptyBoxes);
    return signedTx.outputs().get(0)
}

const fakeWormhole = async () => {
    const wormhole = await Boxes.getWormholeBox()
    return fakeBox(wormhole)
}

const fakeSponsor = async () => {
    const sponsor = await Boxes.getSponsorBox(1e9)
    return fakeBox(sponsor)
}

const fakeGuardian = async () => {
    const guardian = await Boxes.getGuardianBox(0)
    return fakeBox(guardian)
}

const fakeVAA = async (vaa: string) => {
    const tou8 = require('buffer-to-uint8array');
    const tx = await issueVAA(inputBoxes, new VAA(tou8(Buffer.from(vaa, "hex")), 'transfer'), config.initializer.address)
    return tx.outputs().get(0)
}

const test_update_vaa = async () => {
    const tokenId = "803935d89d5e33acc6e24bbb835212ee3997abbc7f756ccc37a07258fb7b9fd3"
    const vaaBytesHex = await generateVaa(tokenId)
    const wormholeBox = await fakeWormhole()
    let vaaBox = await fakeVAA(vaaBytesHex)
    const vaaBoxObject = new VAABox(JSON.parse(vaaBox.to_json()))
    let msg = codec.strToUint8Array(vaaBoxObject.getObservation())
    const sponsorBox = await fakeSponsor()
    const guardianBox = await fakeGuardian()
    for(let i = 0; i < 6; i++) {
        console.log(`start processing guardian ${i}`)
        setGuardianIndex(i)
        let signatureData = signMsg(msg, config.guardian.privateKey)
        try {
            const tx = await updateVAABox(
                wormholeBox,
                vaaBox,
                sponsorBox,
                guardianBox,
                config.guardian.index,
                Uint8Array.from(Buffer.from(signatureData[0], "hex")),
                Uint8Array.from(Buffer.from(signatureData[1], "hex")),
            )
            vaaBox = tx.outputs().get(1)
        }catch (exp: any) {
            console.log(exp)
        }
    }
}

// TODO: should change to testcase
const test_payloads = () => {
    const transferString = "00000000000000007800000000000000000000000000000000000000000000000037d3f4eeb9ba3e4f860f21c634d9a77e05294736cf399051d25f3b2cef30496100020102764ea2b0b9b06b5730a4257bba71fd7797eb1ec12bc3ae6025a01d7fba53830e229592eb00030000000000000005000000000000000000000000000000000000000000000000"
    const transferBytes = Buffer.from(transferString, 'hex')

    const transfer = new transferPayload(transferBytes)
    if (transfer.toHex() !== transferString) console.log("[-] transferPayload test failed")

    const registerChainString = "000000000000000000000000000000000000000000546f6b656e42726964676501000000080102030400000000000000000000000000000000000000000000000000000000"
    const registerChainBytes = Buffer.from(registerChainString, 'hex')

    const registerChain = new registerChainPayload(registerChainBytes)
    if (registerChain.toHex() !== registerChainString) console.log("[-] registerChainPayload test failed")

    const updateGuardianString = "000000000000000000000000000000000000000000546f6b656e427269646765320003000000013602992ac27c178c07371da6c9d623d05174e2fae90cc656346e9edf5a5a5c76f202a5a670080865606db7b6fe14d238589a875b9cf810e55e9247b68a0dbb0d18036c6c34d1dcda1d0d5d855ade5ff4f66734be43458ae2ab3c902526b81712d6036c6c34d1dcda1d0d5d855ade5ff4f66734be43458ae2ab3c902526b81712d602a5a670080865606db7b6fe14d238589a875b9cf810e55e9247b68a0dbb0d18036c6c34d1dcda1d0d5d855ade5ff4f66734be43458ae2ab3c902526b81712d6"
    const updateGuardianBytes = Buffer.from(updateGuardianString, 'hex')

    const updateGuardian = new updateGuardianPayload(updateGuardianBytes)
    if (updateGuardian.toHex() !== updateGuardianString) console.log("[-] updateGuardianPayload test failed")
}

const test_vaa_box_parse = () => {
    const boxJsonString = `{"boxId":"13bd5a8a2958f4087ff7944df11d03d47c8367254d9e0a0dc4273020f092b619","transactionId":"b248e1f049b6be0c701c739e3215d6c9307b7aa1235c7dbceb28f8d060080977","blockId":"9f335d93e2dc381acde31691b3cb9da6be12a7e3377e5500db88764afc19a7fe","value":1100000,"index":1,"globalIndex":248127,"creationHeight":0,"settlementHeight":108072,"ergoTree":"102904000402044204820104000e20cafb170f38fc39f75325f4468f971a45a4235ba8c41ea22902acf01e2ef81dcf0402040004020404040804100420044004040400040004040400040004020402040204060406040404000402044204d201048a02040204020402040804860104ce010400040004000402d804d601db6308b2a5730000d602e4c6a7041ad603b27202730100d604b472037302730395938cb27201730400017305d805d605b2a5730600d606e4c6a70710d607b27206730700d608e4c672050710d609b283060473087309730a730b730c730db27208730e0000d19683090193c27205c2a793e4c67205041a720293e4c67205051ae4c6a7051a93e4c67205060ee4c6a7060e938cb2db63087205730f00018cb2db6308a773100001939e9d720772097311731293b272087313009a7207720993b272087314009ab27206731500731693b27208731700b27206731800d805d605b2a5731900d606b2db63087205731a00d607997cb47203731b731c7cb47203731d731ed608b2a5731f00d609b27201732000d19683080192b2e4c6a707107321007322938c7206017204938c720602720793c27205b472037323732493c27208e4c6a7060e938cb2db63087208732500018cb2db6308a773260001938c720902998cb2db6308b2a4732700732800027207938c7209017204","address":"B1sDRpzFMXv2kKniKxBkf4hSpJ8kZcm1RFo7f8EDmFa2qeYfBrRHWJj8VB6Sjq6g5yUCzeJboq4qqsa9vYFGsee1efqqpDq2K6Q63Se4sEXZ1bz828MtW2UQjRjKjj1W7ZpJhJh7kC8phYVYdFJQQdh5yTjKQqWfjXhzQxAFHzqYc6p69taj5auej52v3GSPoNKnf9AkkKTBcwXpHsAkuqtGHM91PmAFwFBJNTi4ocWYowvw2eDgGEqtiCtpbGeU3wT3BqtkUyrjZikYZhhMrXZkz7gWb4K1bhgYdBDdeaThVv7E3M1Fw67uVd1Y4x9i8GtcRq8rsRCc2ooVyMwDojJE4L46Z7PvkYVpSb8BdotWppN2EVHFvrUQFgmuirm6eFPi37XfNbchTzgwUq85pTup4QFJneeu3yNVXUzRrL1FM9By1tNath4F61FfkC166shQv1Me1FWT8aisPwQ21LYLi722MECid41A8hAnvaAYy1HxvDK8HpAVGuUQZ4GN5Na7RJBbznF35QDL4zLGM7sgrGU14tnFph2oW6CUwqRciMXuarjE4ftYLw4cV5ksThAnjDUe4VMuejyWNyNhLnscAcEjhED7hCNVFhZZM4JwSLRzTD32ffzax8aTr8czsk1a3aBPpZ8NXUxWGf8ne8jo8hCEgFuJPBSfgVQafrgbcQFmN","assets":[{"tokenId":"39d180612dd83ed8cadc80c2cf5663ae6118e9e44c7200342daf6d412e6521e1","index":0,"amount":1,"name":"VAA Identifier","decimals":0,"type":"EIP-004"}],"additionalRegisters":{"R5":{"serializedValue":"1a0641733073602527991ba3aec2c11358b30a98336e86b47879b2642b6b67e1f200ab6ebaed6cfba727ce088d3254556fff492d28bd578b827dc2fc4ed315059289c71c412578d485efefd5733cf64f800b27b146da2689b82c632e88c3ac84c1d2c6c5bc59a0fe536a610b2ab8fe05f70e88dc94dc3805537e4e91cff8ad97e267f80c171b41ba33fb8ffdf61cc59f00a099ce6ba3e38bd82621522d5459b70fed0c227e018b70b443f8beda5475d7de9f0e8e13cb1750b5dd587bcdb33efb5a176a3158ebd21b41e212e5c6b67843fd9a054b07d55a5df30050122a18ca63c99aaaa157795431f95cb9b714c713f0ff00f8b7912ac618882598843b58a586bc786c84a6730732741c4107466f2d405b9a650da04d44ebc527a5c4ebfb5ea2be2b3ef75cfae71ffd106b04dfda8f97e8a58c78f4c3a8d438ef06465975cdafeda905e2952a8114479f961b41ac609bb379a2d4234b25c63139cc2681b89eeeb96dc625bb5e8633f7f6febe59344e036d95fd60093ebf29a01e98d9214ccb459db588d44c872f6fd53962aa751c","sigmaType":"Coll[Coll[SByte]]","renderedValue":"[733073602527991ba3aec2c11358b30a98336e86b47879b2642b6b67e1f200ab6ebaed6cfba727ce088d3254556fff492d28bd578b827dc2fc4ed315059289c71c,2578d485efefd5733cf64f800b27b146da2689b82c632e88c3ac84c1d2c6c5bc59a0fe536a610b2ab8fe05f70e88dc94dc3805537e4e91cff8ad97e267f80c171b,ba33fb8ffdf61cc59f00a099ce6ba3e38bd82621522d5459b70fed0c227e018b70b443f8beda5475d7de9f0e8e13cb1750b5dd587bcdb33efb5a176a3158ebd21b,e212e5c6b67843fd9a054b07d55a5df30050122a18ca63c99aaaa157795431f95cb9b714c713f0ff00f8b7912ac618882598843b58a586bc786c84a6730732741c,07466f2d405b9a650da04d44ebc527a5c4ebfb5ea2be2b3ef75cfae71ffd106b04dfda8f97e8a58c78f4c3a8d438ef06465975cdafeda905e2952a8114479f961b,ac609bb379a2d4234b25c63139cc2681b89eeeb96dc625bb5e8633f7f6febe59344e036d95fd60093ebf29a01e98d9214ccb459db588d44c872f6fd53962aa751c]"},"R6":{"serializedValue":"0e260102de381861e093c2d35d76d4664a246f56fd15dd53b928ed539bd621f9190b06f803ef410b","sigmaType":"Coll[SByte]","renderedValue":"0102de381861e093c2d35d76d4664a246f56fd15dd53b928ed539bd621f9190b06f803ef410b"},"R8":{"serializedValue":"0702bebed6be006e4450f89a549b5d9ad1665de8e6b165457f8ff4a034cc175f6edc","sigmaType":"SGroupElement","renderedValue":"02bebed6be006e4450f89a549b5d9ad1665de8e6b165457f8ff4a034cc175f6edc"},"R7":{"serializedValue":"10051e08060002","sigmaType":"Coll[SInt]","renderedValue":"[15,4,3,0,1]"},"R9":{"serializedValue":"06201e40bf1c6542867ec4315bb470a4a213f3c0f141b0ec57d7629dc662a269d77f","sigmaType":"SBigInt","renderedValue":"CBigInt(13683782668738460335337828849008100621013788955977982938688526869072699840383)"},"R4":{"serializedValue":"1a022a0012cbd5000062ef000174e7b65055d170d36d4fb926102fe6e047390980f66611f541f1b8268cbd5a258b0100000000000000007800000000000000000000000000000000000000000000000096c81ac45d955198687d49202d8c1f77e42376046f42dd552801e1bee5e0c30100020102764ea2b0b9b06b5730a4257bba71fd7797eb1ec12bc3ae6025a01d7fba53830e229592eb00030000000000000005000000000000000000000000000000000000000000000000","sigmaType":"Coll[Coll[SByte]]","renderedValue":"[0012cbd5000062ef000174e7b65055d170d36d4fb926102fe6e047390980f66611f541f1b8268cbd5a25,00000000000000007800000000000000000000000000000000000000000000000096c81ac45d955198687d49202d8c1f77e42376046f42dd552801e1bee5e0c30100020102764ea2b0b9b06b5730a4257bba71fd7797eb1ec12bc3ae6025a01d7fba53830e229592eb00030000000000000005000000000000000000000000000000000000000000000000]"}},"spentTransactionId":null,"mainChain":true}`
    const boxJson = JSON.parse(boxJsonString)

    const vaaBox = new VAABox(boxJson)
    vaaBox.getVAA().then(vaa => {
        const observation = vaa.observationWithoutPayload()
        if (observation !== "0012cbd5000062ef000174e7b65055d170d36d4fb926102fe6e047390980f66611f541f1b8268cbd5a25") console.log("[-] test_vaa_box_parse (observation parse) test failed")

        const payload = vaa.getPayload()
        if (payload.toHex() !== "00000000000000007800000000000000000000000000000000000000000000000096c81ac45d955198687d49202d8c1f77e42376046f42dd552801e1bee5e0c30100020102764ea2b0b9b06b5730a4257bba71fd7797eb1ec12bc3ae6025a01d7fba53830e229592eb00030000000000000005000000000000000000000000000000000000000000000000") console.log("[-] test_vaa_box_parse (payload parse) test failed")

        const signatures = vaa.getSignatures().map(signature => signature.toHex().slice(2)).join(",")
        if (signatures != "733073602527991ba3aec2c11358b30a98336e86b47879b2642b6b67e1f200ab6ebaed6cfba727ce088d3254556fff492d28bd578b827dc2fc4ed315059289c71c,2578d485efefd5733cf64f800b27b146da2689b82c632e88c3ac84c1d2c6c5bc59a0fe536a610b2ab8fe05f70e88dc94dc3805537e4e91cff8ad97e267f80c171b,ba33fb8ffdf61cc59f00a099ce6ba3e38bd82621522d5459b70fed0c227e018b70b443f8beda5475d7de9f0e8e13cb1750b5dd587bcdb33efb5a176a3158ebd21b,e212e5c6b67843fd9a054b07d55a5df30050122a18ca63c99aaaa157795431f95cb9b714c713f0ff00f8b7912ac618882598843b58a586bc786c84a6730732741c,07466f2d405b9a650da04d44ebc527a5c4ebfb5ea2be2b3ef75cfae71ffd106b04dfda8f97e8a58c78f4c3a8d438ef06465975cdafeda905e2952a8114479f961b,ac609bb379a2d4234b25c63139cc2681b89eeeb96dc625bb5e8633f7f6febe59344e036d95fd60093ebf29a01e98d9214ccb459db588d44c872f6fd53962aa751c")  console.log("[-] test_vaa_box_parse (signature parse) test failed")
    })
}

const test_guardian_box_parse = () => {
    const boxJsonString = `{"boxId":"0e84bb3f541cb4bbc446774035960a570fe5b324e5f38657b1de2719df7af714","transactionId":"fed297efc5db6e8f184d77e0255df5788205f4c2fee16b0971c0ef44c7623ef2","blockId":"e4630383f0f6dd45a088c34d754c3d36ea39d6c4d0b74156fce5b0231035579e","value":1100000,"index":0,"globalIndex":246786,"creationHeight":0,"settlementHeight":107429,"ergoTree":"1005040004000e20aac61c50e994fb544c7641219a427f42a0c6909678112e113ef3bff37063ee8b04000402d801d601e4c6b2a47300000410d196830201938cb2db6308a773010001730293e4c6a7060499b27201730300b27201730400","address":"2ZiVB9Yezdodt1aQePz6zh798Myt9pU2w8GUZwDcLxoeewHVEpwHny8nyRfkjD3hriopaEHchsx9pRdcrhW6z7s7ddXY4GjoUpJZ8jppQ1eg2UgHPaMtiKB1Y7Etn7qPKQ1D1rw","assets":[{"tokenId":"aac61c50e994fb544c7641219a427f42a0c6909678112e113ef3bff37063ee8b","index":0,"amount":1,"name":"Guardian Token","decimals":0,"type":"EIP-004"}],"additionalRegisters":{"R4":{"serializedValue":"1a061489e5673332cb6456dfdd42c1a4ce3a1350a1966614c097c943bf246bf5e7ef1ce1c76b1e344839fd76149420e438a3236f5dbcfef199227d708586fdbb3a1480f686ecea8779f34bc3b8e412a9a609d7a3db2b14a44750f545deb1b2db1c922ae1734c0504ddab681473b362a20df341b41722c445f5f031e687d46a74","sigmaType":"Coll[Coll[SByte]]","renderedValue":"[89e5673332cb6456dfdd42c1a4ce3a1350a19666,c097c943bf246bf5e7ef1ce1c76b1e344839fd76,9420e438a3236f5dbcfef199227d708586fdbb3a,80f686ecea8779f34bc3b8e412a9a609d7a3db2b,a44750f545deb1b2db1c922ae1734c0504ddab68,73b362a20df341b41722c445f5f031e687d46a74]"},"R5":{"serializedValue":"1a062102fc34b896f565c0b930981cbc76e1715fde18c4ecdcb50acc50e42ea17bbb184821038b6b9465fbb281540dee04a640935ad8d02381dbf4be46665e73d909c2dbedde210298e8ccf316b98d730a1bfcb25f92754bb5b26ad5547aa5d4179ff41238ddbca9210229b27ec5733194fb7168312b5264864bde7aff7f873d2cc6121ebe92db112afd21025d2ef94c7a3e99814a7152753720ba903f5f5af1b72104c0aff5778c9782fa2a2102c774e9af70fc30ff39ade71ba5613daea2f7c9fb99efe6f87886bec016458f2f","sigmaType":"Coll[Coll[SByte]]","renderedValue":"[02fc34b896f565c0b930981cbc76e1715fde18c4ecdcb50acc50e42ea17bbb1848,038b6b9465fbb281540dee04a640935ad8d02381dbf4be46665e73d909c2dbedde,0298e8ccf316b98d730a1bfcb25f92754bb5b26ad5547aa5d4179ff41238ddbca9,0229b27ec5733194fb7168312b5264864bde7aff7f873d2cc6121ebe92db112afd,025d2ef94c7a3e99814a7152753720ba903f5f5af1b72104c0aff5778c9782fa2a,02c774e9af70fc30ff39ade71ba5613daea2f7c9fb99efe6f87886bec016458f2f]"},"R6":{"serializedValue":"0400","sigmaType":"SInt","renderedValue":"0"}},"spentTransactionId":null,"mainChain":true}`
    const boxJson = JSON.parse(boxJsonString)

    const guardianBox = new GuardianBox(boxJson)
    
    const addresses = guardianBox.getWormholeAddresses().join(",")
    if (addresses != "89e5673332cb6456dfdd42c1a4ce3a1350a19666,c097c943bf246bf5e7ef1ce1c76b1e344839fd76,9420e438a3236f5dbcfef199227d708586fdbb3a,80f686ecea8779f34bc3b8e412a9a609d7a3db2b,a44750f545deb1b2db1c922ae1734c0504ddab68,73b362a20df341b41722c445f5f031e687d46a74")  console.log("[-] test_guardian_box_parse (address parse) test failed")
    
}

test_update_vaa().then(() => null)

//test_payloads()

//Contracts.generateGuardianContract().then(contract => console.log(wasm.Address.recreate_from_ergo_tree(contract.ergo_tree()).to_base58(config.networkType)))

//test_vaa_box_parse()
//test_guardian_box_parse()

// test_payloads()
