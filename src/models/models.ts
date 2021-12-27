import {TextEncoder} from "util";
import ApiNetwork from "../network/api";
import * as codec from '../utils/codec';
import { Readable } from 'stream'

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

    constructor(index: number) {
        this.index = index
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
        if (signatureBytes.length == 66) {
            this.index = signatureBytes[0]
            this.signatureData = signatureBytes.slice(1)
        }
        else if (signatureBytes.length == 65) {
            this.signatureData = signatureBytes
        }
        else {
            throw Error("Wrong signature size")
        }
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
        let stream = new Readable()
        stream._read = () => {}
        stream.push(vaaBytes)

        this.version = stream.read(1)[0]
        this.GuardianSetIndex = codec.arrayToInt(stream.read(4), 4)
        let signaturesSize: number = stream.read(1)[0]
        this.Signatures = []

        for (var i = 0; i < signaturesSize; i++ ) {
            let wormholeSignature = new WormholeSignature(stream.read(1)[0])
            wormholeSignature.fromBytes(stream.read(65))
            this.Signatures.push(wormholeSignature)
        }

        this.timestamp = codec.arrayToInt(stream.read(4), 4)
        this.nonce = codec.arrayToInt(stream.read(4), 4)
        this.consistencyLevel = stream.read(1)[0]
        this.EmitterChain = stream.read(1)[0]
        this.EmitterAddress = new Uint8Array(stream.read(32))
        this.payload = new Payload(stream.read())
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

