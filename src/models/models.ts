import * as codec from '../utils/codec';
import { Readable } from 'stream'
import { ErgoBox } from 'ergo-lib-wasm-nodejs';
import Contracts from '../susy/contracts';
import * as wasm from 'ergo-lib-wasm-nodejs'
import config from '../config/conf';

abstract class Payload {
    protected byteToStream: (payloadBytes: Uint8Array) => Readable = (payloadBytes: Uint8Array) => {
        const stream = new Readable()
        stream._read = () => {}
        stream.push(payloadBytes)
        return stream
    }

    abstract toHex: () => string

    toBytes: () => Uint8Array = () => {
        return new Uint8Array(Buffer.from(this.toHex(), 'hex'))
    }
}

class transferPayload extends Payload {
    static readonly payloadLength: number = 1 + 32 + 32 + 2 + 38 + 2 + 32;
    private payloadId: number;
    private amount: Uint8Array;
    private tokenAddress: Uint8Array;
    private tokenChain: number;
    private to: Uint8Array;
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
        this.to = stream.read(38)
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
        stream._read = () => {}
        stream.push(payloadBytes)

        this.module = stream.read(32)
        this.action = stream.read(1)[0]
        this.chainId = codec.arrayToInt(stream.read(2), 2)
        this.emitterChainId = codec.arrayToInt(stream.read(2), 2)
        this.emitterAddress = stream.read(32)
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
    static readonly payloadLength: number = 32 + 1 + 2 + 4 + 1 + 6*(32);
    private module: Uint8Array;
    private action: number;
    private chainId: number;
    private newIndex: number;
    private keyLength: number;
    private guardianPubkeys: Array<Uint8Array>;

    constructor(payloadBytes: Uint8Array) {
        super()
        if (payloadBytes.length != updateGuardianPayload.payloadLength) throw Error(`Expected ${updateGuardianPayload.payloadLength} payload length, found: ${payloadBytes.length}`)
        
        let stream = new Readable()
        stream._read = () => {}
        stream.push(payloadBytes)

        this.module = stream.read(32)
        this.action = stream.read(1)[0]
        this.chainId = codec.arrayToInt(stream.read(2), 2)
        this.newIndex = codec.arrayToInt(stream.read(4), 4)
        this.keyLength = stream.read(1)[0]

        this.guardianPubkeys = []
        for (var i = 0; i < 6; i++) this.guardianPubkeys.push(stream.read(32))
    }

    toHex = () => {
        return [
            Buffer.from(this.module).toString('hex'),
            codec.UInt8ToByte(this.action),
            codec.UInt16ToByte(this.chainId),
            codec.UInt32ToByte(this.newIndex),
            codec.UInt8ToByte(this.keyLength),
            this.guardianPubkeys.map(pubkey => Buffer.from(pubkey).toString('hex')).join("")
        ].join("")
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

    fromString = (signatureHexString: string) => {
        if (signatureHexString.startsWith("0x")) signatureHexString = signatureHexString.slice(2)
        if(signatureHexString.length > 65 * 2) {
            this.index = parseInt(signatureHexString.slice(0, 2), 16)
            signatureHexString = signatureHexString.slice(2)
        }
        this.signatureData = new Uint8Array(Buffer.from(signatureHexString, "hex"))
    }

    fromBytes = (signatureBytes: Uint8Array) => {
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

    toHex = () => {
        return Buffer.from(this.signatureData).toString("hex")
    }
}

class VAA {
    private version: number;
    private GuardianSetIndex: number;
    private Signatures: Array<WormholeSignature>;
    private timestamp: number;
    private nonce: number;
    private consistencyLevel: number;
    private EmitterChain: number;
    private EmitterAddress: Uint8Array;
    private payload: Payload;

    constructor(vaaBytes: Uint8Array, payloadType: string) {
        const stream = new Readable()
        stream._read = () => {}
        stream.push(vaaBytes)

        this.version = stream.read(1)[0]
        this.GuardianSetIndex = codec.arrayToInt(stream.read(4), 4)
        const signaturesSize: number = stream.read(1)[0]
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
        
        if (payloadType === "transfer") this.payload = new transferPayload(stream.read())
        else if (payloadType === "register_chain") this.payload = new registerChainPayload(stream.read())
        else if (payloadType === "update_guardian") this.payload = new updateGuardianPayload(stream.read())
        else throw Error(`Unknown payloadType ${payloadType}`)
    }

    static fromBox = async (box: ErgoBox): Promise<VAA> => {
        const r4: Array<Uint8Array> = box.register_value(4)?.to_coll_coll_byte()!
        const observation: Uint8Array = r4[0]
        const payload: Uint8Array = r4[1]
        const boxErgoTree: wasm.ErgoTree = box.ergo_tree()

        const transferVAAErgoTree: wasm.ErgoTree = (await Contracts.generateVAAContract()).ergo_tree()
        const registerChainVAAErgoTree: wasm.ErgoTree = (await Contracts.generateRegisterVAAContract()).ergo_tree()
        const guardianUpdateVAAErgoTree: wasm.ErgoTree = (await Contracts.generateGuardianVAAContract()).ergo_tree()
        const payloadType: string = (boxErgoTree === transferVAAErgoTree) ? "transfer"
            : (boxErgoTree === transferVAAErgoTree) ? "register_chain"
            : (boxErgoTree === transferVAAErgoTree) ? "update_guardian"
            : ""
        if (payloadType == "") throw Error(`Box address was not compatible to any Payload types ${wasm.Address.recreate_from_ergo_tree(boxErgoTree).to_base58(config.networkType)}`)

        const guardianSetIndex: number = box.register_value(7)?.to_i32_array()[3]!
        const version: number = 0 // we don't have version, so we set it 0
        
        const signatures: Array<WormholeSignature> = [] // TODO: parse signatures from R5

        // TODO: concat all data

        // TODO: call vaa constructor
        return new VAA(new Uint8Array(Buffer.from("", 'hex')), payloadType)
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

export { VAA, WormholeSignature, transferPayload, registerChainPayload, updateGuardianPayload }
