import * as codec from '../utils/codec';
import { Readable } from 'stream'
import { ErgoBox, ErgoTree } from 'ergo-lib-wasm-nodejs';
import { VAA, WormholeSignature } from './models';

abstract class Box {
    protected ergoBox: ErgoBox;

    constructor(boxJson: JSON) {
        this.ergoBox = ErgoBox.from_json(JSON.stringify(boxJson))
    }

    getErgoBox = (): ErgoBox => {
        return this.ergoBox
    }

    getErgoTree = (): ErgoTree => {
        return this.ergoBox.ergo_tree()
    }
}

class VAABox extends Box {
    constructor(boxJson: JSON) {
        super(boxJson)
    }

    getVAA = (): Promise<VAA> => {
        return VAA.fromBox(this)
    }

    getSignatures = (): Array<WormholeSignature> => {
        const signatures: Array<Uint8Array> = (this.ergoBox.register_value(5)?.to_coll_coll_byte()!)
        let wormholeSignatures: Array<WormholeSignature> = []

        for (let i = 0; i < signatures.length; i++) {
            if (Buffer.from(signatures[i]).toString("hex") != "00".repeat(65)) {
                let newSignature = new WormholeSignature(i)
                newSignature.fromBytes(signatures[i])
                wormholeSignatures.push(newSignature)
            }
        }

        return wormholeSignatures
    }

    getGuardianSetIndex = (): number => {
        return this.ergoBox.register_value(7)?.to_i32_array()[3]!
    }

    getObservationPayloadTuple = (): Array<Uint8Array> => {
        return this.ergoBox.register_value(4)?.to_coll_coll_byte()!
    }

    getObservation = (): string => {
        const r4 = this.getObservationPayloadTuple()
        return Buffer.from(r4[0]).toString("hex") + Buffer.from(r4[1]).toString("hex")
    }
}

class GuardianBox extends Box {
    constructor(boxJson: JSON) {
        super(boxJson)
    }

    getWormholeAddresses = (): Array<string> => {
        return (this.ergoBox.register_value(4)?.to_coll_coll_byte()!).map(addressByte => Buffer.from(addressByte).toString("hex"))
    }
}

export { VAABox, GuardianBox }
