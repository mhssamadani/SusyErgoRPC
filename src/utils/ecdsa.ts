import * as util from 'ethereumjs-util';

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

export {
    verify
}

