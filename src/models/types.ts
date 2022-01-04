type INPUTS = {
    boxId: string,
    address: string
}

type ASSETS = {
    tokenId: string,
    index: number,
    amount: number,
    name: string | null,
    decimals: number | null
    type: string | null
}

type OUTPUTS = {
    boxId: string,
    transactionId: string,
    value: number,
    index: number,
    creationHeight: number,
    ergoTree: string,
    address: string,
    assets: Array<ASSETS>,
    spentTransactionId: string | null
}

type TX = {
    inputs: Array<INPUTS>,
    outputs: Array<OUTPUTS>
}

export { INPUTS, ASSETS, OUTPUTS, TX }
