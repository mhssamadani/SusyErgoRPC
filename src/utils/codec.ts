import {WormholeSignature} from "../models/models"
import * as wasm from 'ergo-lib-wasm-nodejs'
import config from "../config/conf";

const hexStringToByte = (str: string): Uint8Array => {
    let a = [];
    for (let i = 0, len = str.length; i < len; i += 2) {
        a.push(parseInt(str.substr(i, 2), 16));
    }
    return new Uint8Array(a);
}

const getGuardianAddresses = (guardianBox: any): Array<string> => {
    let addresses: Array<string> = []

    let arr = guardianBox.additionalRegisters.R4.renderedValue
    arr.slice(1, arr.length - 1).split(",").forEach((element: string) => {
        addresses.push(element)
    });
    return addresses
}

const getBoxSignatures = (box: wasm.ErgoBox): Array<WormholeSignature> => {
    let arr = box.register_value(5)?.to_coll_coll_byte()!
    let signatures: Array<WormholeSignature> = []
    arr.map((item, index) => {
        let wormholeSignature = new WormholeSignature(index)
        wormholeSignature.fromString(Buffer.from(item).toString('hex'))
        signatures.push(wormholeSignature)
    })
    return signatures
}

const getVAADataFromBox = (box: wasm.ErgoBox): string => {
    const R4 = box.register_value(4)?.to_coll_coll_byte()!
    return Buffer.from(R4[0]).toString('hex') + Buffer.from(R4[1]).toString('hex')
}

const strToUint8Array = (str: string): Uint8Array => {
    return new Uint8Array(Buffer.from(str, "hex"))
}

const arrayToInt = (bytes: Uint8Array, length: number): number => {
    return Buffer.from(bytes).readUIntBE(0, length)
}

const UInt32ToByte = (val: number): string => {
    const buff = Buffer.alloc(4, 0);
    buff.writeUInt32BE(val)
    return buff.toString("hex")
}

const UInt16ToByte = (val: number): string => {
    const buff = Buffer.alloc(2, 0);
    buff.writeUInt16BE(val)
    return buff.toString("hex")
}

const UInt8ToByte = (val: number): string => {
    const buff = Buffer.alloc(1, 0);
    buff.writeUInt8(val)
    return buff.toString("hex")
}

const ergoTreeToAddress = (ergoTree: wasm.ErgoTree): string => {
    return wasm.Address.recreate_from_ergo_tree(ergoTree).to_base58(config.networkType)
}

export {
    hexStringToByte,
    getGuardianAddresses,
    getBoxSignatures,
    getVAADataFromBox,
    strToUint8Array,
    arrayToInt,
    UInt8ToByte,
    UInt16ToByte,
    UInt32ToByte,
    ergoTreeToAddress
}
