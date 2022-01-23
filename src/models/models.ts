import * as codec from '../utils/codec';
import {Readable} from 'stream'
import Contracts from '../susy/contracts';

import * as wasm from 'ergo-lib-wasm-nodejs'
import {VAABox} from './boxes';

abstract class Payload {
    protected byteToStream: (payloadBytes: Uint8Array) => Readable = (payloadBytes: Uint8Array) => {
        const stream = new Readable()
        stream._read = () => {
        }
        stream.push(payloadBytes)
        return stream
    }

    abstract toHex: () => string

    toBytes: () => Uint8Array = () => {
        return new Uint8Array(Buffer.from(this.toHex(), 'hex'))
    }
}

class transferPayload extends Payload {
    static readonly payloadLength: number = 1 + 32 + 32 + 2 + 36 + 2 + 32;
    private payloadId: number;
    private amount: Uint8Array;
    private tokenAddress: Uint8Array;
    private tokenChain: number;
    private readonly to: Uint8Array;
    private toChain: number;
    private fee: Uint8Array;

    constructor(payloadBytes: Uint8Array) {
        super()
        if (payloadBytes.length != transferPayload.payloadLength) throw Error(`Expected ${transferPayload.payloadLength} payload length, found: ${payloadBytes.length}`)

        const stream = this.byteToStream(payloadBytes)

        this.payloadId = stream.read(1)[0]
        this.amount = stream.read(32)
        this.tokenAddress = stream.read(32)
        this.tokenChain = codec.arrayToInt(stream.read(2), 2)
        this.to = stream.read(36)
        this.toChain = codec.arrayToInt(stream.read(2), 2)
        this.fee = stream.read(32)
    }

    toHex = () => {
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

    TokenAddress = () => {
        return Buffer.from(this.tokenAddress).toString("hex")
    }

    To = () => {
        const tree = wasm.ErgoTree.from_bytes(this.to)
        return codec.ergoTreeToAddress(tree)
    }

    Amount = () => {
        const buf = Buffer.from(this.amount)
        return Number(buf.readBigUInt64BE(0).toString())
    }

    Fee = () => {
        const buf = Buffer.from(this.fee)
        return Number(buf.readBigUInt64BE(0).toString())
    }

}

class registerChainPayload extends Payload {
    static readonly payloadLength: number = 32 + 1 + 2 + 2 + 32;
    private module: Uint8Array;
    private action: number;
    private chainId: number;
    private emitterChainId: number;
    private emitterAddress: Uint8Array;

    constructor(payloadBytes: Uint8Array) {
        super()
        if (payloadBytes.length != registerChainPayload.payloadLength) throw Error(`Expected ${registerChainPayload.payloadLength} payload length, found: ${payloadBytes.length}`)

        let stream = new Readable()
        stream._read = () => {
        }
        stream.push(payloadBytes)

        this.module = stream.read(32)
        this.action = stream.read(1)[0]
        this.chainId = codec.arrayToInt(stream.read(2), 2)
        this.emitterChainId = codec.arrayToInt(stream.read(2), 2)
        this.emitterAddress = stream.read(32)
    }

    EmitterChainId = (): number => {
        return this.emitterChainId
    }

    EmitterChainAddress = (): Buffer => {
        return Buffer.from(this.emitterAddress)
    }

    toHex = () => {
        return [
            Buffer.from(this.module).toString('hex'),
            codec.UInt8ToByte(this.action),
            codec.UInt16ToByte(this.chainId),
            codec.UInt16ToByte(this.emitterChainId),
            Buffer.from(this.emitterAddress).toString('hex')
        ].join("")
    }
}

class updateGuardianPayload extends Payload {
    static readonly payloadLength: number = 32 + 1 + 2 + 4 + 1 + 6 * (32);
    private module: Uint8Array;
    private action: number;
    private chainId: number;
    private newIndex: number;
    private keyLength: number;
    private guardianPublicKeys: Array<{ wormhole: Uint8Array, ergo: Uint8Array }>;

    constructor(payloadBytes: Uint8Array) {
        super()
        if (payloadBytes.length != updateGuardianPayload.payloadLength) throw Error(`Expected ${updateGuardianPayload.payloadLength} payload length, found: ${payloadBytes.length}`)

        let stream = new Readable()
        stream._read = () => {
        }
        stream.push(payloadBytes)

        this.module = stream.read(32)
        this.action = stream.read(1)[0]
        this.chainId = codec.arrayToInt(stream.read(2), 2)
        this.newIndex = codec.arrayToInt(stream.read(4), 4)
        this.keyLength = stream.read(1)[0]

        this.guardianPublicKeys = []
        for (let i = 0; i < 6; i++) this.guardianPublicKeys.push({wormhole: stream.read(32), ergo: stream.read(33)});
    }

    toHex = () => {
        return [
            Buffer.from(this.module).toString('hex'),
            codec.UInt8ToByte(this.action),
            codec.UInt16ToByte(this.chainId),
            codec.UInt32ToByte(this.newIndex),
            codec.UInt8ToByte(this.keyLength),
            this.guardianPublicKeys.map(publicKey => Buffer.from(publicKey.wormhole).toString('hex') + Buffer.from(publicKey.ergo).toString('hex')).join("")
        ].join("")
    }

    getNewIndex = () => this.newIndex;

    getWormholePublic = (): Array<Uint8Array> => {
        return this.guardianPublicKeys.map(item => item.wormhole)
    }

    getErgoPublic = (): Array<Uint8Array> => {
        return this.guardianPublicKeys.map(item => item.ergo)
    }
}

class WormholeSignature {
    private index: number;
    private signatureData: Uint8Array;

    constructor(index: number) {
        this.index = index
        this.signatureData = new Uint8Array()
    }

    getIndex = () => {
        return this.index
    }

    getSignatureHexData = () => {
        return Buffer.from(this.signatureData).toString("hex")
    }

    fromString = (signatureHexString: string) => {
        if (signatureHexString.startsWith("0x")) signatureHexString = signatureHexString.slice(2)
        if (signatureHexString.length > 65 * 2) {
            this.index = parseInt(signatureHexString.slice(0, 2), 16)
            signatureHexString = signatureHexString.slice(2)
        }
        this.signatureData = new Uint8Array(Buffer.from(signatureHexString, "hex"))
    }

    fromBytes = (signatureBytes: Uint8Array) => {
        if (signatureBytes.length == 66) {
            this.index = signatureBytes[0]
            this.signatureData = signatureBytes.slice(1)
        } else if (signatureBytes.length == 65) {
            this.signatureData = signatureBytes
        } else {
            throw Error(`Wrong length of signature bytes ${signatureBytes.length}`)
        }
    }

    toHex = () => {
        return codec.UInt8ToByte(this.index) + this.getSignatureHexData()
    }
}

class VAA {
    private readonly version: number;
    private readonly GuardianSetIndex: number;
    private readonly Signatures: Array<WormholeSignature>;
    private readonly timestamp: number;
    private readonly nonce: number;
    private readonly consistencyLevel: number;
    private readonly EmitterChain: number;
    private readonly EmitterAddress: Uint8Array;
    private readonly payload: Payload;

    constructor(vaaBytes: Uint8Array, payloadType: string) {
        const stream = new Readable()
        stream._read = () => {
        }
        stream.push(vaaBytes)

        this.version = stream.read(1)[0]
        this.GuardianSetIndex = codec.arrayToInt(stream.read(4), 4)
        const signaturesSize: number = stream.read(1)[0]
        if (signaturesSize > 6 || signaturesSize < 0) throw Error(`Wrong signature size ${signaturesSize}`)
        this.Signatures = []

        for (var i = 0; i < signaturesSize; i++) {
            let wormholeSignature = new WormholeSignature(stream.read(1)[0])
            wormholeSignature.fromBytes(stream.read(65))
            this.Signatures.push(wormholeSignature)
        }

        this.timestamp = codec.arrayToInt(stream.read(4), 4)
        this.nonce = codec.arrayToInt(stream.read(4), 4)
        this.consistencyLevel = stream.read(1)[0]
        this.EmitterChain = stream.read(1)[0]
        this.EmitterAddress = new Uint8Array(stream.read(32))

        if (payloadType === "transfer") this.payload = new transferPayload(stream.read())
        else if (payloadType === "register_chain") this.payload = new registerChainPayload(stream.read())
        else if (payloadType === "update_guardian") this.payload = new updateGuardianPayload(stream.read())
        else throw Error(`Unknown payloadType ${payloadType}`)
    }

    static fromBox = async (box: VAABox): Promise<VAA> => {
        const r4: Array<Uint8Array> = box.getObservationPayloadTuple()
        const observation: Uint8Array = r4[0]
        const payload: Uint8Array = r4[1]
        const boxAddress: string = codec.ergoTreeToBase58Address(box.getErgoTree())

        const transferAddress: string = codec.ergoTreeToBase58Address((await Contracts.generateVAAContract()).ergo_tree())
        const registerChainAddress: string = codec.ergoTreeToBase58Address((await Contracts.generateRegisterVAAContract()).ergo_tree())
        const guardianUpdateAddress: string = codec.ergoTreeToBase58Address((await Contracts.generateGuardianVAAContract()).ergo_tree())
        const payloadType: string = (boxAddress === transferAddress) ? "transfer"
            : (boxAddress === registerChainAddress) ? "register_chain"
                : (boxAddress === guardianUpdateAddress) ? "update_guardian"
                    : ""
        if (payloadType == "") throw Error(`Box address was not compatible to any Payload types ${boxAddress}`)

        const guardianSetIndex: number = box.getGuardianSetIndex()
        const version: number = 0 // we don't have version, so we set it 0

        const signatures: Array<WormholeSignature> = box.getSignatures()

        const vaaMessage: Uint8Array = new Uint8Array(Buffer.from([
            codec.UInt8ToByte(version),
            codec.UInt32ToByte(guardianSetIndex),
            codec.UInt8ToByte(signatures.length),
            signatures.map(signature => signature.toHex()).join(""),
            Buffer.from(observation).toString("hex"),
            Buffer.from(payload).toString("hex")
        ].join(""), "hex"))

        return new VAA(vaaMessage, payloadType)
    }

    toJson = () => {
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

    hexData = () => {
        return this.observation()
    }

    getGuardianSetIndex = () => {
        return this.GuardianSetIndex
    }

    getEmitterChain = () => {
        return this.EmitterChain
    }

    getEmitterAddress = () => {
        return this.EmitterAddress
    }

    getSignatures = () => {
        return this.Signatures
    }

    getPayload = () => {
        return this.payload
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
        return `${this.observationWithoutPayload()}${this.payload.toHex()}`
    }
}

export {VAA, WormholeSignature, transferPayload, registerChainPayload, updateGuardianPayload}
