
// TODO: complete Payload implementation if necessary or remove it if not
class Payload  {
    bytes: Uint8Array

    constructor(paylaodBytes: Uint8Array) {
        this.bytes = paylaodBytes
    }
}

class WormholeSignature {
    index: number;
    signatureData: Uint8Array;

    constructor(signatureBytes: Uint8Array) {
        this.index = parseInt(signatureBytes[0].toString())
        this.signatureData = signatureBytes.subarray(1)
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
        let signaturesSize: number = (vaaBytes.length - 56 - 133)
        if (signaturesSize % 65 != 0) throw new Error("cannot parse vaa signatures (length is not dividable by 65)")
        
        let signatures: Array<WormholeSignature> = this.signatureParser(vaaBytes.subarray(5, 5 + signaturesSize))
        let remainingVAABytes: Uint8Array = vaaBytes.subarray(5 + signaturesSize)

        this.version = parseInt(vaaBytes[0].toString())
        this.GuardianSetIndex = parseInt(vaaBytes[0].toString())
        this.Signatures = signatures
        this.timestamp = parseInt(remainingVAABytes.subarray(0, 4).toString())
        this.nonce = parseInt(remainingVAABytes.subarray(4, 8).toString())
        this.consistencyLevel = parseInt(remainingVAABytes[8].toString())
        this.EmitterChain = parseInt(remainingVAABytes.subarray(9, 11).toString())
        this.EmitterAddress = remainingVAABytes.subarray(11, 43)
        this.payload = new Payload(remainingVAABytes.subarray(43))
    }    

    signatureParser(signatureBytes: Uint8Array) {
        let signatures: Array<WormholeSignature> = []
        let remainingBytes = signatureBytes
        while (remainingBytes.length > 0) {
            signatures.push(new WormholeSignature(remainingBytes.subarray(0, 65)))
            remainingBytes = remainingBytes.subarray(65)
        }
        return signatures
    }
}

