import {TextEncoder} from "util";
import ApiNetwork from "../network/api";
import * as codec from '../utils/codec';

// TODO: complete Payload implementation if necessary or remove it if not
class Payload {
    bytes: Uint8Array

    constructor(paylaodBytes: Uint8Array) {
        this.bytes = paylaodBytes
    }

    toString() {
        return Buffer.from(this.bytes).toString("hex")
    }
}

export class WormholeSignature {
    index: number;
    signatureData: Uint8Array;

    constructor() {
        this.index = -1
        this.signatureData = new Uint8Array()
    }

    fromString(signatureHexString: string) {
        if (signatureHexString.startsWith("0x")) signatureHexString = signatureHexString.slice(2)
        if(signatureHexString.length > 65 * 2) {
            this.index = parseInt(signatureHexString.slice(0, 2), 16)
            signatureHexString = signatureHexString.slice(2)
        }
        this.signatureData = new Uint8Array(Buffer.from(signatureHexString, "hex"))
    }

    fromBytes(signatureBytes: Uint8Array) {
        this.index = signatureBytes[0]
        this.signatureData = signatureBytes.slice(1)
    }

    toHex() {
        return Buffer.from(this.signatureData).toString("hex")
    }
}

export default class VAA {
    version: number;
    GuardianSetIndex: number;
    Signatures: Array<WormholeSignature>;
    timestamp: number;
    nonce: number;
    consistencyLevel: number;
    EmitterChain: number;
    EmitterAddress: Uint8Array;
    payload: Payload;

    constructor(vaaBytes: Uint8Array) {
        let signaturesSize: number = vaaBytes[5]
        let signatures: Array<WormholeSignature> = this.signatureParser(vaaBytes.slice(6, 6 + signaturesSize * 66))
        let remainingVAABytes: Uint8Array = vaaBytes.slice(6 + signaturesSize * 66)

        this.version = vaaBytes[0]
        this.GuardianSetIndex = codec.arrayToInt(vaaBytes.slice(1, 5), 4)
        this.Signatures = signatures
        this.timestamp = codec.arrayToInt(remainingVAABytes.slice(0, 4), 4)
        this.nonce = codec.arrayToInt(remainingVAABytes.slice(4, 8), 4)
        this.consistencyLevel = remainingVAABytes[8]
        this.EmitterChain = remainingVAABytes[9]
        this.EmitterAddress = remainingVAABytes.slice(10, 42)
        this.payload = new Payload(remainingVAABytes.slice(42))
    }

    signatureParser(signatureBytes: Uint8Array) {
        let signatures: Array<WormholeSignature> = []
        let remainingBytes = signatureBytes
        while (remainingBytes.length > 0) {
            let wormholeSignature = new WormholeSignature()
            wormholeSignature.fromBytes(remainingBytes.slice(0, 66))
            signatures.push(wormholeSignature)
            remainingBytes = remainingBytes.slice(66)
        }
        return signatures
    }

    toJson() {
        return `{
            "version": ${this.version},
            "GuardianSetIndex": ${this.GuardianSetIndex},
            "Signatures": [${this.Signatures.map(res => res.toHex()).join(",")}],
            "timestamp": ${this.timestamp},
            "nonce": ${this.nonce},
            "consistencyLevel": ${this.consistencyLevel},
            "EmitterChain": ${this.EmitterChain},
            "EmitterAddress": ${this.EmitterAddress},
            "payload": ${this.payload},
        }`
    }

    hexData() {
        return this.observation()
    }

    observationWithoutPayload = () => {
        let timestamp = codec.UInt32ToByte(this.timestamp)
        let nonce = codec.UInt32ToByte(this.nonce)
        let consistency = codec.UInt8ToByte(this.consistencyLevel)
        let emitterChain = codec.UInt8ToByte(this.EmitterChain)
        let emitterAddress = Buffer.from(this.EmitterAddress).toString("hex")
        return `${timestamp}${nonce}${consistency}${emitterChain}${emitterAddress}`
    }

    observation = () => {
        return `${this.observationWithoutPayload()}${this.payload.toString()}`
    }
}

