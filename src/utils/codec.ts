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
    strToUint8Array,
    arrayToInt,
    UInt8ToByte,
    UInt16ToByte,
    UInt32ToByte,
    ergoTreeToAddress
}
