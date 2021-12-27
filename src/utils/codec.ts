import {WormholeSignature} from "../models/models"
import * as wasm from 'ergo-lib-wasm-nodejs'

export function hexStringToByte(str: string) {
    let a = [];
    for (let i = 0, len = str.length; i < len; i += 2) {
        a.push(parseInt(str.substr(i, 2), 16));
    }
    return new Uint8Array(a);
}

export function getGuardianAddresses(guardianBox: any) {
    let addresses: Array<string> = []

    let arr = guardianBox.additionalRegisters.R4.renderedValue
    arr.slice(1, arr.length - 1).split(",").forEach((element: string) => {
        addresses.push(element)
    });
    return addresses
}

export const getBoxSignatures = (box: wasm.ErgoBox) => {
    let arr = box.register_value(5)?.to_coll_coll_byte()!
    let signatures: Array<WormholeSignature> = []
    arr.map((item, index) => {
        let wormholeSignature = new WormholeSignature(index)
        wormholeSignature.fromString(Buffer.from(item).toString('hex'))
        signatures.push(wormholeSignature)
    })
    return signatures
}

export function getVAADataFromBox(box: wasm.ErgoBox) {
    let R4 = box.register_value(4)?.to_coll_coll_byte()!
    return Buffer.from(R4[0]).toString('hex') + Buffer.from(R4[1]).toString('hex')
}

export function strToUint8Array(str: string) {
    return new Uint8Array(Buffer.from(str, "hex"))
}

const arrayToInt = (bytes: Uint8Array, length: number) => {
    return Buffer.from(bytes).readUIntBE(0, length)
}

const UInt32ToByte = (val: number) => {
    const buff = Buffer.alloc(4, 0);
    buff.writeUInt32BE(val)
    return buff.toString("hex")
}

const UInt8ToByte = (val: number) => {
    const buff = Buffer.alloc(1, 0);
    buff.writeUInt8(val)
    return buff.toString("hex")
}

export {
    arrayToInt,
    UInt8ToByte,
    UInt32ToByte,
}
