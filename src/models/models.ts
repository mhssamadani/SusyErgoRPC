import {TextEncoder} from "util";
import ApiNetwork from "../network/api";
import * as codec from '../utils/codec';
import { Readable } from 'stream'

// TODO: complete Payload implementation if necessary or remove it if not
interface Payload {
    payloadLength: number;

    toBytes(): Uint8Array

    toString(): string
}

class transferPayload implements Payload {
    payloadId: number;
    amount: Uint8Array;
    tokenAddress: Uint8Array;
    tokenChain: number;
    to: Uint8Array;
    toChain: number;
    fee: Uint8Array;
    payloadLength: number = 1 + 32 + 32 + 2 + 38 + 2 + 32;

    constructor(payloadBytes: Uint8Array) {
        if (payloadBytes.length != this.payloadLength) throw Error(`Expected ${this.payloadLength} payload length, found: ${payloadBytes.length}`)

        let stream = new Readable()
        stream._read = () => {}
        stream.push(payloadBytes)

        this.payloadId = stream.read(1)[0]
        this.amount = stream.read(32)
        this.tokenAddress = stream.read(32)
        this.tokenChain = codec.arrayToInt(stream.read(2), 2)
        this.to = stream.read(38)
        this.toChain = codec.arrayToInt(stream.read(2), 2)
        this.fee = stream.read(32)
    }

    toBytes(): Uint8Array {
        return new Uint8Array(Buffer.from(this.toString(), 'hex'))
    }

    toString(): string {
        return [
            codec.UInt8ToByte(this.payloadId),
            Buffer.from(this.amount).toString('hex'),
            Buffer.from(this.tokenAddress).toString('hex'),
            codec.UInt16ToByte(this.tokenChain),
            Buffer.from(this.to).toString('hex'),
            codec.UInt16ToByte(this.toChain),
            Buffer.from(this.fee).toString('hex')
        ].join("")
    }
}

class registerChainPayload {
    module: Uint8Array;
    action: number;
    chainId: number;
    emitterChainId: number;
    emitterAddress: Uint8Array;
    payloadLength: number = 32 + 1 + 2 + 2 + 32;

    constructor(payloadBytes: Uint8Array) {
        if (payloadBytes.length != this.payloadLength) throw Error(`Expected ${this.payloadLength} payload length, found: ${payloadBytes.length}`)
        
        let stream = new Readable()
        stream._read = () => {}
        stream.push(payloadBytes)

        this.module = stream.read(32)
        this.action = stream.read(1)[0]
        this.chainId = codec.arrayToInt(stream.read(2), 2)
        this.emitterChainId = codec.arrayToInt(stream.read(2), 2)
        this.emitterAddress = stream.read(32)
    }

    toBytes(): Uint8Array {
        return new Uint8Array(Buffer.from(this.toString(), 'hex'))
    }

    toString(): string {
        return [
            Buffer.from(this.module).toString('hex'),
            codec.UInt8ToByte(this.action),
            codec.UInt16ToByte(this.chainId),
            codec.UInt16ToByte(this.emitterChainId),
            Buffer.from(this.emitterAddress).toString('hex')
        ].join("")
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

class VAA {
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
        this.payload = new transferPayload(stream.read())
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

export { VAA, transferPayload, registerChainPayload }
