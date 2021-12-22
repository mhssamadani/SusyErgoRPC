import * as util from 'ethereumjs-util';
import * as Utils from '../utils/decodeEncode'

const verify = (message: string, signature: string, address: string) => {
    if(!signature.startsWith("0x")){
        signature = `0x${signature}`;
    }
    if(signature.length !== 132){
        throw Error("Signature size must be 132 character hex string including 0x at beginning")
    }
    const signatureParts = util.fromRpcSig(signature);
    const publicKeyRecovered = util.ecrecover(util.toBuffer(message), signatureParts.v,signatureParts.r, signatureParts.s)
    const addrBuf = util.pubToAddress(publicKeyRecovered);
    const addr    = util.bufferToHex(addrBuf);
    if(!address.startsWith("0x")){
        address = `0x${address}`;
    }
    return addr.toLowerCase() === address.toLowerCase();
}

export function verifyBoxSignatures(box: any, guardianBox: any): boolean {
    let signatures = Utils.getBoxSignatures(box)
    let guardianAddresses = Utils.getGuardianAddresses(guardianBox)
    let vaaData = Utils.getVAADataFromBox(box)

    for (const sign of signatures) {
        if (!verify(vaaData, sign.toHex(), guardianAddresses[sign.index])) return false
    }
    return true
}

