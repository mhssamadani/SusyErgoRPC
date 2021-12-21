"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// TODO: complete Payload implementation if necessary or remove it if not
class Payload {
    constructor(paylaodBytes) {
        this.bytes = paylaodBytes;
    }
}
class WormholeSignature {
    constructor(signatureBytes) {
        this.index = parseInt(signatureBytes[0].toString(), 16); //TODO: this parsing is wrong
        this.signatureData = signatureBytes.slice(1);
    }
}
class VAA {
    constructor(vaaBytes) {
        let signaturesSize = (vaaBytes.length - 56 - 133);
        if (signaturesSize % 65 != 0)
            throw new Error(`cannot parse vaa signatures (length is ${signaturesSize} it's not dividable by 65)`);
        let signatures = this.signatureParser(vaaBytes.slice(5, 5 + signaturesSize));
        let remainingVAABytes = vaaBytes.slice(5 + signaturesSize);
        this.version = parseInt(vaaBytes[0].toString(16), 16); //TODO: this parsing is wrong
        this.GuardianSetIndex = this.arrayToInt(vaaBytes.slice(1, 5), 4);
        this.Signatures = signatures;
        this.timestamp = this.arrayToInt(remainingVAABytes.slice(0, 4), 4);
        this.nonce = this.arrayToInt(remainingVAABytes.slice(4, 8), 4);
        this.consistencyLevel = remainingVAABytes[8]; //TODO: this parsing is wrong
        this.EmitterChain = this.arrayToInt(remainingVAABytes.slice(9, 11), 2);
        this.EmitterAddress = remainingVAABytes.slice(11, 43);
        this.payload = new Payload(remainingVAABytes.slice(43));
    }
    arrayToInt(bytes, length) {
        return Buffer.from(bytes).readUIntLE(0, length);
    }
    signatureParser(signatureBytes) {
        let signatures = [];
        let remainingBytes = signatureBytes;
        while (remainingBytes.length > 0) {
            signatures.push(new WormholeSignature(remainingBytes.slice(0, 65)));
            remainingBytes = remainingBytes.slice(65);
        }
        return signatures;
    }
    toJson() {
        return `{
            "version": ${this.version},
            "GuardianSetIndex": ${this.GuardianSetIndex},
            "Signatures": ${this.Signatures},
            "timestamp": ${this.timestamp},
            "nonce": ${this.nonce},
            "consistencyLevel": ${this.consistencyLevel},
            "EmitterChain": ${this.EmitterChain},
            "EmitterAddress": ${this.EmitterAddress},
            "payload": ${this.payload},
        }`;
    }
}
exports.default = VAA;
