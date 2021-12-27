import { WormholeSignature } from "../models/models"

export function hexStringToByte(str:string) {
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

export function getBoxSignatures(box: any) {
    let signatures: Array<WormholeSignature> = []

    let arr = box.additionalRegisters.R5.renderedValue
    arr.slice(1, arr.length - 1).split(",").array.forEach((element: string) => {
        let wormholeSignature = new WormholeSignature()
        wormholeSignature.fromString(element)
        signatures.push(wormholeSignature)
    });
    return signatures
}

export function getVAADataFromBox(box: any) {
    let arr = box.additionalRegisters.R4.renderedValue
    let R4 = arr.slice(1, arr.length - 1).split(",")
    return R4[0].concat(R4[1])
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
