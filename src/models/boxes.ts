import * as codec from '../utils/codec';
import { Readable } from 'stream'
import { ErgoBox } from 'ergo-lib-wasm-nodejs';
import { VAA } from './models';

abstract class Box {
    protected ergoBox: ErgoBox;

    constructor(boxJson: JSON) {
        this.ergoBox = ErgoBox.from_json(JSON.stringify(boxJson))
    }

    getErgoBox: () => ErgoBox = () => {
        return this.ergoBox
    }
}

class VAABox extends Box {
    constructor(boxJson: JSON) {
        super(boxJson)
    }

    getVAA = (): Promise<VAA> => {
        return VAA.fromBox(this.ergoBox)
    }
}

export { VAABox }
