import { TextEncoder } from "util";
import ApiNetwork from "../network/api";

// TODO: complete Payload implementation if necessary or remove it if not
class Payload  {
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
        if(signatureHexString.startsWith("0x")) signatureHexString = signatureHexString.slice(2)
        this.index = parseInt(signatureHexString.slice(0, 2), 16)
        this.signatureData = new Uint8Array(Buffer.from(signatureHexString.slice(2), "hex"))
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
        let signatures: Array<WormholeSignature> = this.signatureParser(vaaBytes.slice(6, 6 + signaturesSize*65))
        let remainingVAABytes: Uint8Array = vaaBytes.slice(6 + 6 + signaturesSize*65)

        this.version = vaaBytes[0]
        this.GuardianSetIndex = this.arrayToInt(vaaBytes.slice(1, 5), 4)
        this.Signatures = signatures
        this.timestamp = this.arrayToInt(remainingVAABytes.slice(0, 4), 4)
        this.nonce = this.arrayToInt(remainingVAABytes.slice(4, 8), 4)
        this.consistencyLevel = remainingVAABytes[8]
        this.EmitterChain = remainingVAABytes[9]
        this.EmitterAddress = remainingVAABytes.slice(10, 42)
        this.payload = new Payload(remainingVAABytes.slice(42))
    }    

    arrayToInt(bytes: Uint8Array, length: number) {
        return Buffer.from(bytes).readUIntLE(0, length)
    }
    
    signatureParser(signatureBytes: Uint8Array) {
        let signatures: Array<WormholeSignature> = []
        let remainingBytes = signatureBytes
        while (remainingBytes.length > 0) {
            let wormholeSignature = new WormholeSignature()
            wormholeSignature.fromBytes(remainingBytes.slice(0, 65))
            signatures.push(wormholeSignature)
            remainingBytes = remainingBytes.slice(65)
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
        let timestamp = this.timestamp.toString(16)
        let nonce = this.nonce.toString(16)
        let consistency = this.consistencyLevel.toString(16)
        let emitterChain = this.EmitterChain.toString(16)
        let emitterAddress = Buffer.from(this.EmitterAddress).toString("hex")
        let payload = this.payload.toString()
        return `${timestamp}${nonce}${consistency}${emitterChain}${payload}${payload}`
    }
    
}

