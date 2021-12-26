import * as util from 'ethereumjs-util';

const verify = (message: string, signature: string, address: string) => {
    if(!signature.startsWith("0x")){
        signature = `0x${signature}`;
    }
    if(signature.length !== 132){
        throw Error(`Signature size must be 132 character hex string including 0x at beginning but ${signature.length} passed`)
    }
    if(!message.startsWith('0x')){
        message = `0x${message}`
    }
    const signatureParts = util.fromRpcSig(signature);
    const publicKeyRecovered = util.ecrecover(util.keccak256(util.toBuffer(message)), signatureParts.v,signatureParts.r, signatureParts.s)
    const addrBuf = util.pubToAddress(publicKeyRecovered);
    const addr    = util.bufferToHex(addrBuf);
    if(!address.startsWith("0x")){
        address = `0x${address}`;
    }
    return addr.toLowerCase() === address.toLowerCase();
}

const sign = (message: Buffer, privateKey: Buffer) => {
    const sign = util.ecsign(util.keccak256(message), privateKey)
    const hexString = util.toRpcSig(sign.v, sign.r,  sign.s)
    return hexString.substring(2)
}

export {
    verify, sign
}

