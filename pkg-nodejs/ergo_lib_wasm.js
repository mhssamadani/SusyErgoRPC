let imports = {};
imports['__wbindgen_placeholder__'] = module.exports;
let wasm;
const { TextDecoder, TextEncoder } = require(`util`);

const heap = new Array(32).fill(undefined);

heap.push(undefined, null, true, false);

function getObject(idx) { return heap[idx]; }

let heap_next = heap.length;

function dropObject(idx) {
    if (idx < 36) return;
    heap[idx] = heap_next;
    heap_next = idx;
}

function takeObject(idx) {
    const ret = getObject(idx);
    dropObject(idx);
    return ret;
}

let cachedTextDecoder = new TextDecoder('utf-8', { ignoreBOM: true, fatal: true });

cachedTextDecoder.decode();

let cachegetUint8Memory0 = null;
function getUint8Memory0() {
    if (cachegetUint8Memory0 === null || cachegetUint8Memory0.buffer !== wasm.memory.buffer) {
        cachegetUint8Memory0 = new Uint8Array(wasm.memory.buffer);
    }
    return cachegetUint8Memory0;
}

function getStringFromWasm0(ptr, len) {
    return cachedTextDecoder.decode(getUint8Memory0().subarray(ptr, ptr + len));
}

function addHeapObject(obj) {
    if (heap_next === heap.length) heap.push(heap.length + 1);
    const idx = heap_next;
    heap_next = heap[idx];

    heap[idx] = obj;
    return idx;
}

let WASM_VECTOR_LEN = 0;

let cachedTextEncoder = new TextEncoder('utf-8');

const encodeString = (typeof cachedTextEncoder.encodeInto === 'function'
    ? function (arg, view) {
    return cachedTextEncoder.encodeInto(arg, view);
}
    : function (arg, view) {
    const buf = cachedTextEncoder.encode(arg);
    view.set(buf);
    return {
        read: arg.length,
        written: buf.length
    };
});

function passStringToWasm0(arg, malloc, realloc) {

    if (realloc === undefined) {
        const buf = cachedTextEncoder.encode(arg);
        const ptr = malloc(buf.length);
        getUint8Memory0().subarray(ptr, ptr + buf.length).set(buf);
        WASM_VECTOR_LEN = buf.length;
        return ptr;
    }

    let len = arg.length;
    let ptr = malloc(len);

    const mem = getUint8Memory0();

    let offset = 0;

    for (; offset < len; offset++) {
        const code = arg.charCodeAt(offset);
        if (code > 0x7F) break;
        mem[ptr + offset] = code;
    }

    if (offset !== len) {
        if (offset !== 0) {
            arg = arg.slice(offset);
        }
        ptr = realloc(ptr, len, len = offset + arg.length * 3);
        const view = getUint8Memory0().subarray(ptr + offset, ptr + len);
        const ret = encodeString(arg, view);

        offset += ret.written;
    }

    WASM_VECTOR_LEN = offset;
    return ptr;
}

let cachegetInt32Memory0 = null;
function getInt32Memory0() {
    if (cachegetInt32Memory0 === null || cachegetInt32Memory0.buffer !== wasm.memory.buffer) {
        cachegetInt32Memory0 = new Int32Array(wasm.memory.buffer);
    }
    return cachegetInt32Memory0;
}

function isLikeNone(x) {
    return x === undefined || x === null;
}

function debugString(val) {
    // primitive types
    const type = typeof val;
    if (type == 'number' || type == 'boolean' || val == null) {
        return  `${val}`;
    }
    if (type == 'string') {
        return `"${val}"`;
    }
    if (type == 'symbol') {
        const description = val.description;
        if (description == null) {
            return 'Symbol';
        } else {
            return `Symbol(${description})`;
        }
    }
    if (type == 'function') {
        const name = val.name;
        if (typeof name == 'string' && name.length > 0) {
            return `Function(${name})`;
        } else {
            return 'Function';
        }
    }
    // objects
    if (Array.isArray(val)) {
        const length = val.length;
        let debug = '[';
        if (length > 0) {
            debug += debugString(val[0]);
        }
        for(let i = 1; i < length; i++) {
            debug += ', ' + debugString(val[i]);
        }
        debug += ']';
        return debug;
    }
    // Test for built-in
    const builtInMatches = /\[object ([^\]]+)\]/.exec(toString.call(val));
    let className;
    if (builtInMatches.length > 1) {
        className = builtInMatches[1];
    } else {
        // Failed to match the standard '[object ClassName]'
        return toString.call(val);
    }
    if (className == 'Object') {
        // we're a user defined class or Object
        // JSON.stringify avoids problems with cycles, and is generally much
        // easier than looping through ownProperties of `val`.
        try {
            return 'Object(' + JSON.stringify(val) + ')';
        } catch (_) {
            return 'Object';
        }
    }
    // errors
    if (val instanceof Error) {
        return `${val.name}: ${val.message}\n${val.stack}`;
    }
    // TODO we could test for more things here, like `Set`s and `Map`s.
    return className;
}

function _assertClass(instance, klass) {
    if (!(instance instanceof klass)) {
        throw new Error(`expected instance of ${klass.name}`);
    }
    return instance.ptr;
}

let cachegetUint32Memory0 = null;
function getUint32Memory0() {
    if (cachegetUint32Memory0 === null || cachegetUint32Memory0.buffer !== wasm.memory.buffer) {
        cachegetUint32Memory0 = new Uint32Array(wasm.memory.buffer);
    }
    return cachegetUint32Memory0;
}

function passArrayJsValueToWasm0(array, malloc) {
    const ptr = malloc(array.length * 4);
    const mem = getUint32Memory0();
    for (let i = 0; i < array.length; i++) {
        mem[ptr / 4 + i] = addHeapObject(array[i]);
    }
    WASM_VECTOR_LEN = array.length;
    return ptr;
}

function getArrayU8FromWasm0(ptr, len) {
    return getUint8Memory0().subarray(ptr / 1, ptr / 1 + len);
}

function passArray8ToWasm0(arg, malloc) {
    const ptr = malloc(arg.length * 1);
    getUint8Memory0().set(arg, ptr / 1);
    WASM_VECTOR_LEN = arg.length;
    return ptr;
}

function getArrayJsValueFromWasm0(ptr, len) {
    const mem = getUint32Memory0();
    const slice = mem.subarray(ptr / 4, ptr / 4 + len);
    const result = [];
    for (let i = 0; i < slice.length; i++) {
        result.push(takeObject(slice[i]));
    }
    return result;
}

function passArray32ToWasm0(arg, malloc) {
    const ptr = malloc(arg.length * 4);
    getUint32Memory0().set(arg, ptr / 4);
    WASM_VECTOR_LEN = arg.length;
    return ptr;
}

function getArrayI32FromWasm0(ptr, len) {
    return getInt32Memory0().subarray(ptr / 4, ptr / 4 + len);
}

function handleError(f, args) {
    try {
        return f.apply(this, args);
    } catch (e) {
        wasm.__wbindgen_exn_store(addHeapObject(e));
    }
}
/**
* newtype for box registers R4 - R9
*/
module.exports.NonMandatoryRegisterId = Object.freeze({
/**
* id for R4 register
*/
R4:4,"4":"R4",
/**
* id for R5 register
*/
R5:5,"5":"R5",
/**
* id for R6 register
*/
R6:6,"6":"R6",
/**
* id for R7 register
*/
R7:7,"7":"R7",
/**
* id for R8 register
*/
R8:8,"8":"R8",
/**
* id for R9 register
*/
R9:9,"9":"R9", });
/**
* Network type
*/
module.exports.NetworkPrefix = Object.freeze({
/**
* Mainnet
*/
Mainnet:0,"0":"Mainnet",
/**
* Testnet
*/
Testnet:16,"16":"Testnet", });
/**
* Address types
*/
module.exports.AddressTypePrefix = Object.freeze({
/**
* 0x01 - Pay-to-PublicKey(P2PK) address
*/
P2Pk:1,"1":"P2Pk",
/**
* 0x02 - Pay-to-Script-Hash(P2SH)
*/
Pay2Sh:2,"2":"Pay2Sh",
/**
* 0x03 - Pay-to-Script(P2S)
*/
Pay2S:3,"3":"Pay2S", });
/**
*
* * An address is a short string corresponding to some script used to protect a box. Unlike (string-encoded) binary
* * representation of a script, an address has some useful characteristics:
* *
* * - Integrity of an address could be checked., as it is incorporating a checksum.
* * - A prefix of address is showing network and an address type.
* * - An address is using an encoding (namely, Base58) which is avoiding similarly l0Oking characters, friendly to
* * double-clicking and line-breaking in emails.
* *
* *
* *
* * An address is encoding network type, address type, checksum, and enough information to watch for a particular scripts.
* *
* * Possible network types are:
* * Mainnet - 0x00
* * Testnet - 0x10
* *
* * For an address type, we form content bytes as follows:
* *
* * P2PK - serialized (compressed) public key
* * P2SH - first 192 bits of the Blake2b256 hash of serialized script bytes
* * P2S  - serialized script
* *
* * Address examples for testnet:
* *
* * 3   - P2PK (3WvsT2Gm4EpsM9Pg18PdY6XyhNNMqXDsvJTbbf6ihLvAmSb7u5RN)
* * ?   - P2SH (rbcrmKEYduUvADj9Ts3dSVSG27h54pgrq5fPuwB)
* * ?   - P2S (Ms7smJwLGbUAjuWQ)
* *
* * for mainnet:
* *
* * 9  - P2PK (9fRAWhdxEsTcdb8PhGNrZfwqa65zfkuYHAMmkQLcic1gdLSV5vA)
* * ?  - P2SH (8UApt8czfFVuTgQmMwtsRBZ4nfWquNiSwCWUjMg)
* * ?  - P2S (4MQyML64GnzMxZgm, BxKBaHkvrTvLZrDcZjcsxsF7aSsrN73ijeFZXtbj4CXZHHcvBtqSxQ)
* *
* *
* * Prefix byte = network type + address type
* *
* * checksum = blake2b256(prefix byte ++ content bytes)
* *
* * address = prefix byte ++ content bytes ++ checksum
* *
*
*/
class Address {

    static __wrap(ptr) {
        const obj = Object.create(Address.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_address_free(ptr);
    }
    /**
    * Re-create the address from ErgoTree that was built from the address
    *
    * At some point in the past a user entered an address from which the ErgoTree was built.
    * Re-create the address from this ErgoTree.
    * `tree` - ErgoTree that was created from an Address
    * @param {ErgoTree} ergo_tree
    * @returns {Address}
    */
    static recreate_from_ergo_tree(ergo_tree) {
        _assertClass(ergo_tree, ErgoTree);
        var ret = wasm.address_recreate_from_ergo_tree(ergo_tree.ptr);
        return Address.__wrap(ret);
    }
    /**
    * Create a P2PK address from serialized PK bytes(EcPoint/GroupElement)
    * @param {Uint8Array} bytes
    * @returns {Address}
    */
    static p2pk_from_pk_bytes(bytes) {
        var ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.address_p2pk_from_pk_bytes(ptr0, len0);
        return Address.__wrap(ret);
    }
    /**
    * Decode (base58) testnet address from string, checking that address is from the testnet
    * @param {string} s
    * @returns {Address}
    */
    static from_testnet_str(s) {
        var ptr0 = passStringToWasm0(s, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.address_from_testnet_str(ptr0, len0);
        return Address.__wrap(ret);
    }
    /**
    * Decode (base58) mainnet address from string, checking that address is from the mainnet
    * @param {string} s
    * @returns {Address}
    */
    static from_mainnet_str(s) {
        var ptr0 = passStringToWasm0(s, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.address_from_mainnet_str(ptr0, len0);
        return Address.__wrap(ret);
    }
    /**
    * Decode (base58) address from string without checking the network prefix
    * @param {string} s
    * @returns {Address}
    */
    static from_base58(s) {
        var ptr0 = passStringToWasm0(s, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.address_from_base58(ptr0, len0);
        return Address.__wrap(ret);
    }
    /**
    * Encode (base58) address
    * @param {number} network_prefix
    * @returns {string}
    */
    to_base58(network_prefix) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.address_to_base58(retptr, this.ptr, network_prefix);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * Decode from a serialized address (that includes the network prefix)
    * @param {Uint8Array} data
    * @returns {Address}
    */
    static from_bytes(data) {
        var ptr0 = passArray8ToWasm0(data, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.address_from_bytes(ptr0, len0);
        return Address.__wrap(ret);
    }
    /**
    * Encode address as serialized bytes (that includes the network prefix)
    * @param {number} network_prefix
    * @returns {Uint8Array}
    */
    to_bytes(network_prefix) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.address_to_bytes(retptr, this.ptr, network_prefix);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var v0 = getArrayU8FromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 1);
            return v0;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * Get the type of the address
    * @returns {number}
    */
    address_type_prefix() {
        var ret = wasm.address_address_type_prefix(this.ptr);
        return ret >>> 0;
    }
    /**
    * Create an address from a public key
    * @param {Uint8Array} bytes
    * @returns {Address}
    */
    static from_public_key(bytes) {
        var ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.address_from_public_key(ptr0, len0);
        return Address.__wrap(ret);
    }
    /**
    * Creates an ErgoTree script from the address
    * @returns {ErgoTree}
    */
    to_ergo_tree() {
        var ret = wasm.address_to_ergo_tree(this.ptr);
        return ErgoTree.__wrap(ret);
    }
}
module.exports.Address = Address;
/**
* Block header
*/
class BlockHeader {

    static __wrap(ptr) {
        const obj = Object.create(BlockHeader.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_blockheader_free(ptr);
    }
    /**
    * Parse from JSON (Node API)
    * @param {string} json
    * @returns {BlockHeader}
    */
    static from_json(json) {
        var ptr0 = passStringToWasm0(json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.blockheader_from_json(ptr0, len0);
        return BlockHeader.__wrap(ret);
    }
}
module.exports.BlockHeader = BlockHeader;
/**
* Collection of BlockHeaders
*/
class BlockHeaders {

    static __wrap(ptr) {
        const obj = Object.create(BlockHeaders.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_blockheaders_free(ptr);
    }
    /**
    * parse BlockHeader array from JSON (Node API)
    * @param {any[]} json_vals
    * @returns {BlockHeaders}
    */
    static from_json(json_vals) {
        var ptr0 = passArrayJsValueToWasm0(json_vals, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.blockheaders_from_json(ptr0, len0);
        return BlockHeaders.__wrap(ret);
    }
    /**
    * Create new collection with one element
    * @param {BlockHeader} b
    */
    constructor(b) {
        _assertClass(b, BlockHeader);
        var ret = wasm.blockheaders_new(b.ptr);
        return BlockHeaders.__wrap(ret);
    }
    /**
    * Returns the number of elements in the collection
    * @returns {number}
    */
    len() {
        var ret = wasm.blockheaders_len(this.ptr);
        return ret >>> 0;
    }
    /**
    * Add an element to the collection
    * @param {BlockHeader} b
    */
    add(b) {
        _assertClass(b, BlockHeader);
        wasm.blockheaders_add(this.ptr, b.ptr);
    }
    /**
    * Returns the element of the collection with a given index
    * @param {number} index
    * @returns {BlockHeader}
    */
    get(index) {
        var ret = wasm.blockheaders_get(this.ptr, index);
        return BlockHeader.__wrap(ret);
    }
}
module.exports.BlockHeaders = BlockHeaders;
/**
* Box id (32-byte digest)
*/
class BoxId {

    static __wrap(ptr) {
        const obj = Object.create(BoxId.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_boxid_free(ptr);
    }
    /**
    * Parse box id (32 byte digest) from base16-encoded string
    * @param {string} box_id_str
    * @returns {BoxId}
    */
    static from_str(box_id_str) {
        var ptr0 = passStringToWasm0(box_id_str, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.boxid_from_str(ptr0, len0);
        return BoxId.__wrap(ret);
    }
    /**
    * Base16 encoded string
    * @returns {string}
    */
    to_str() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.boxid_to_str(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * Returns byte array (32 bytes)
    * @returns {Uint8Array}
    */
    as_bytes() {
        var ret = wasm.boxid_as_bytes(this.ptr);
        return takeObject(ret);
    }
}
module.exports.BoxId = BoxId;
/**
* Selected boxes with change boxes (by [`BoxSelector`])
*/
class BoxSelection {

    static __wrap(ptr) {
        const obj = Object.create(BoxSelection.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_boxselection_free(ptr);
    }
    /**
    * Create a selection to easily inject custom selection algorithms
    * @param {ErgoBoxes} boxes
    * @param {ErgoBoxAssetsDataList} change
    */
    constructor(boxes, change) {
        _assertClass(boxes, ErgoBoxes);
        _assertClass(change, ErgoBoxAssetsDataList);
        var ret = wasm.boxselection_new(boxes.ptr, change.ptr);
        return BoxSelection.__wrap(ret);
    }
    /**
    * Selected boxes to spend as transaction inputs
    * @returns {ErgoBoxes}
    */
    boxes() {
        var ret = wasm.boxselection_boxes(this.ptr);
        return ErgoBoxes.__wrap(ret);
    }
    /**
    * Selected boxes to use as change
    * @returns {ErgoBoxAssetsDataList}
    */
    change() {
        var ret = wasm.boxselection_change(this.ptr);
        return ErgoBoxAssetsDataList.__wrap(ret);
    }
}
module.exports.BoxSelection = BoxSelection;
/**
* Box value in nanoERGs with bound checks
*/
class BoxValue {

    static __wrap(ptr) {
        const obj = Object.create(BoxValue.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_boxvalue_free(ptr);
    }
    /**
    * Recommended (safe) minimal box value to use in case box size estimation is unavailable.
    * Allows box size upto 2777 bytes with current min box value per byte of 360 nanoERGs
    * @returns {BoxValue}
    */
    static SAFE_USER_MIN() {
        var ret = wasm.boxvalue_SAFE_USER_MIN();
        return BoxValue.__wrap(ret);
    }
    /**
    * Number of units inside one ERGO (i.e. one ERG using nano ERG representation)
    * @returns {I64}
    */
    static UNITS_PER_ERGO() {
        var ret = wasm.boxvalue_UNITS_PER_ERGO();
        return I64.__wrap(ret);
    }
    /**
    * Create from i64 with bounds check
    * @param {I64} v
    * @returns {BoxValue}
    */
    static from_i64(v) {
        _assertClass(v, I64);
        var ret = wasm.boxvalue_from_i64(v.ptr);
        return BoxValue.__wrap(ret);
    }
    /**
    * Get value as signed 64-bit long (I64)
    * @returns {I64}
    */
    as_i64() {
        var ret = wasm.boxvalue_as_i64(this.ptr);
        return I64.__wrap(ret);
    }
    /**
    * big-endian byte array representation
    * @returns {Uint8Array}
    */
    to_bytes() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.boxvalue_to_bytes(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var v0 = getArrayU8FromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 1);
            return v0;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
}
module.exports.BoxValue = BoxValue;
/**
* Ergo constant(evaluated) values
*/
class Constant {

    static __wrap(ptr) {
        const obj = Object.create(Constant.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_constant_free(ptr);
    }
    /**
    * Decode from Base16-encoded ErgoTree serialized value
    * @param {string} base16_bytes_str
    * @returns {Constant}
    */
    static decode_from_base16(base16_bytes_str) {
        var ptr0 = passStringToWasm0(base16_bytes_str, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.constant_decode_from_base16(ptr0, len0);
        return Constant.__wrap(ret);
    }
    /**
    * Encode as Base16-encoded ErgoTree serialized value or return an error if serialization
    * failed
    * @returns {string}
    */
    encode_to_base16() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.constant_encode_to_base16(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * Returns serialized bytes or fails with error if Constant cannot be serialized
    * @returns {Uint8Array}
    */
    sigma_serialize_bytes() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.constant_sigma_serialize_bytes(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var v0 = getArrayU8FromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 1);
            return v0;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * Create from i32 value
    * @param {number} v
    * @returns {Constant}
    */
    static from_i32(v) {
        var ret = wasm.constant_from_i32(v);
        return Constant.__wrap(ret);
    }
    /**
    * Extract i32 value, returning error if wrong type
    * @returns {number}
    */
    to_i32() {
        var ret = wasm.constant_to_i32(this.ptr);
        return ret;
    }
    /**
    * Create from i64
    * @param {I64} v
    * @returns {Constant}
    */
    static from_i64(v) {
        _assertClass(v, I64);
        var ret = wasm.constant_from_i64(v.ptr);
        return Constant.__wrap(ret);
    }
    /**
    * Extract i64 value, returning error if wrong type
    * @returns {I64}
    */
    to_i64() {
        var ret = wasm.constant_to_i64(this.ptr);
        return I64.__wrap(ret);
    }
    /**
    * Create BigInt constant from byte array (signed bytes bit-endian)
    * @param {Uint8Array} num
    * @returns {Constant}
    */
    static from_bigint_signed_bytes_be(num) {
        var ptr0 = passArray8ToWasm0(num, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.constant_from_bigint_signed_bytes_be(ptr0, len0);
        return Constant.__wrap(ret);
    }
    /**
    * Create from byte array
    * @param {Uint8Array} v
    * @returns {Constant}
    */
    static from_byte_array(v) {
        var ptr0 = passArray8ToWasm0(v, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.constant_from_byte_array(ptr0, len0);
        return Constant.__wrap(ret);
    }
    /**
    * Extract byte array, returning error if wrong type
    * @returns {Uint8Array}
    */
    to_byte_array() {
        var ret = wasm.constant_to_byte_array(this.ptr);
        return takeObject(ret);
    }
    /**
    * Create `Coll[Int]` from string array
    * @param {Int32Array} arr
    * @returns {Constant}
    */
    static from_i32_array(arr) {
        var ptr0 = passArray32ToWasm0(arr, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.constant_from_i32_array(ptr0, len0);
        return Constant.__wrap(ret);
    }
    /**
    * Extract `Coll[Int]` as string array
    * @returns {Int32Array}
    */
    to_i32_array() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.constant_to_i32_array(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var v0 = getArrayI32FromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 4);
            return v0;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * Create `Coll[Long]` from string array
    * @param {any[]} arr
    * @returns {Constant}
    */
    static from_i64_str_array(arr) {
        var ptr0 = passArrayJsValueToWasm0(arr, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.constant_from_i64_str_array(ptr0, len0);
        return Constant.__wrap(ret);
    }
    /**
    * Extract `Coll[Long]` as string array
    * @returns {any[]}
    */
    to_i64_str_array() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.constant_to_i64_str_array(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var v0 = getArrayJsValueFromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 4);
            return v0;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * Extract `Coll[Coll[Byte]]` as array of byte arrays
    * @returns {(Uint8Array)[]}
    */
    to_coll_coll_byte() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.constant_to_coll_coll_byte(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var v0 = getArrayJsValueFromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 4);
            return v0;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * test
    * @param {Uint8Array} bytes1
    * @param {Uint8Array} bytes2
    * @returns {Constant}
    */
    static from_coll_coll_byte(bytes1, bytes2) {
        var ptr0 = passArray8ToWasm0(bytes1, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        var ptr1 = passArray8ToWasm0(bytes2, wasm.__wbindgen_malloc);
        var len1 = WASM_VECTOR_LEN;
        var ret = wasm.constant_from_coll_coll_byte(ptr0, len0, ptr1, len1);
        return Constant.__wrap(ret);
    }
    /**
    * Parse raw [`EcPoint`] value from bytes and make [`ProveDlog`] constant
    * @param {Uint8Array} bytes
    * @returns {Constant}
    */
    static from_ecpoint_bytes(bytes) {
        var ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.constant_from_ecpoint_bytes(ptr0, len0);
        return Constant.__wrap(ret);
    }
    /**
    * Create `(Coll[Byte], Coll[Byte])` tuple Constant
    * @param {Uint8Array} bytes1
    * @param {Uint8Array} bytes2
    * @returns {Constant}
    */
    static from_tuple_coll_bytes(bytes1, bytes2) {
        var ptr0 = passArray8ToWasm0(bytes1, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        var ptr1 = passArray8ToWasm0(bytes2, wasm.__wbindgen_malloc);
        var len1 = WASM_VECTOR_LEN;
        var ret = wasm.constant_from_tuple_coll_bytes(ptr0, len0, ptr1, len1);
        return Constant.__wrap(ret);
    }
    /**
    * Extract `(Coll[Byte], Coll[Byte])` tuple from Constant as array of Uint8Array
    * @returns {(Uint8Array)[]}
    */
    to_tuple_coll_bytes() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.constant_to_tuple_coll_bytes(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var v0 = getArrayJsValueFromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 4);
            return v0;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * Create `(Int, Int)` tuple Constant
    * @returns {any[]}
    */
    to_tuple_i32() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.constant_to_tuple_i32(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var v0 = getArrayJsValueFromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 4);
            return v0;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * Create `(Long, Long)` tuple Constant
    * @param {I64} l1
    * @param {I64} l2
    * @returns {Constant}
    */
    static from_tuple_i64(l1, l2) {
        _assertClass(l1, I64);
        _assertClass(l2, I64);
        var ret = wasm.constant_from_tuple_i64(l1.ptr, l2.ptr);
        return Constant.__wrap(ret);
    }
    /**
    * Extract `(Long, Long)` tuple from Constant as array of strings
    * @returns {any[]}
    */
    to_tuple_i64() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.constant_to_tuple_i64(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var v0 = getArrayJsValueFromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 4);
            return v0;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * Create from ErgoBox value
    * @param {ErgoBox} v
    * @returns {Constant}
    */
    static from_ergo_box(v) {
        _assertClass(v, ErgoBox);
        var ret = wasm.constant_from_ergo_box(v.ptr);
        return Constant.__wrap(ret);
    }
    /**
    * Extract ErgoBox value, returning error if wrong type
    * @returns {ErgoBox}
    */
    to_ergo_box() {
        var ret = wasm.constant_to_ergo_box(this.ptr);
        return ErgoBox.__wrap(ret);
    }
}
module.exports.Constant = Constant;
/**
* User-defined variables to be put into context
*/
class ContextExtension {

    static __wrap(ptr) {
        const obj = Object.create(ContextExtension.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_contextextension_free(ptr);
    }
    /**
    * Create new ContextExtension instance
    */
    constructor() {
        var ret = wasm.contextextension_new();
        return ContextExtension.__wrap(ret);
    }
    /**
    * Set the supplied pair in the ContextExtension
    * @param {number} id
    * @param {Constant} value
    */
    set_pair(id, value) {
        _assertClass(value, Constant);
        wasm.contextextension_set_pair(this.ptr, id, value.ptr);
    }
    /**
    * Returns the number of elements in the collection
    * @returns {number}
    */
    len() {
        var ret = wasm.contextextension_len(this.ptr);
        return ret >>> 0;
    }
    /**
    * get from map or fail if key is missing
    * @param {number} key
    * @returns {Constant}
    */
    get(key) {
        var ret = wasm.contextextension_get(this.ptr, key);
        return Constant.__wrap(ret);
    }
    /**
    * Returns all keys in the map
    * @returns {Uint8Array}
    */
    keys() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.contextextension_keys(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var v0 = getArrayU8FromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 1);
            return v0;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * Returns serialized bytes or fails with error if ContextExtension cannot be serialized
    * @returns {Uint8Array}
    */
    sigma_serialize_bytes() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.contextextension_sigma_serialize_bytes(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var v0 = getArrayU8FromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 1);
            return v0;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
}
module.exports.ContextExtension = ContextExtension;
/**
* Defines the contract(script) that will be guarding box contents
*/
class Contract {

    static __wrap(ptr) {
        const obj = Object.create(Contract.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_contract_free(ptr);
    }
    /**
    * Create new contract from ErgoTree
    * @param {ErgoTree} ergo_tree
    * @returns {Contract}
    */
    static new(ergo_tree) {
        _assertClass(ergo_tree, ErgoTree);
        var ptr0 = ergo_tree.ptr;
        ergo_tree.ptr = 0;
        var ret = wasm.contract_new(ptr0);
        return Contract.__wrap(ret);
    }
    /**
    * create new contract that allow spending of the guarded box by a given recipient ([`Address`])
    * @param {Address} recipient
    * @returns {Contract}
    */
    static pay_to_address(recipient) {
        _assertClass(recipient, Address);
        var ret = wasm.contract_pay_to_address(recipient.ptr);
        return Contract.__wrap(ret);
    }
    /**
    * Compiles a contract from ErgoScript source code
    * @param {string} source
    * @returns {Contract}
    */
    static compile(source) {
        var ptr0 = passStringToWasm0(source, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.contract_compile(ptr0, len0);
        return Contract.__wrap(ret);
    }
    /**
    * Get the ErgoTree of the contract
    * @returns {ErgoTree}
    */
    ergo_tree() {
        var ret = wasm.contract_ergo_tree(this.ptr);
        return ErgoTree.__wrap(ret);
    }
}
module.exports.Contract = Contract;
/**
* Inputs, that are used to enrich script context, but won't be spent by the transaction
*/
class DataInput {

    static __wrap(ptr) {
        const obj = Object.create(DataInput.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_datainput_free(ptr);
    }
    /**
    * Parse box id (32 byte digest) from base16-encoded string
    * @param {BoxId} box_id
    */
    constructor(box_id) {
        _assertClass(box_id, BoxId);
        var ptr0 = box_id.ptr;
        box_id.ptr = 0;
        var ret = wasm.datainput_new(ptr0);
        return DataInput.__wrap(ret);
    }
    /**
    * Get box id
    * @returns {BoxId}
    */
    box_id() {
        var ret = wasm.datainput_box_id(this.ptr);
        return BoxId.__wrap(ret);
    }
}
module.exports.DataInput = DataInput;
/**
* DataInput collection
*/
class DataInputs {

    static __wrap(ptr) {
        const obj = Object.create(DataInputs.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_datainputs_free(ptr);
    }
    /**
    * Create empty DataInputs
    */
    constructor() {
        var ret = wasm.datainputs_new();
        return DataInputs.__wrap(ret);
    }
    /**
    * Returns the number of elements in the collection
    * @returns {number}
    */
    len() {
        var ret = wasm.datainputs_len(this.ptr);
        return ret >>> 0;
    }
    /**
    * Returns the element of the collection with a given index
    * @param {number} index
    * @returns {DataInput}
    */
    get(index) {
        var ret = wasm.datainputs_get(this.ptr, index);
        return DataInput.__wrap(ret);
    }
    /**
    * Adds an elements to the collection
    * @param {DataInput} elem
    */
    add(elem) {
        _assertClass(elem, DataInput);
        wasm.datainputs_add(this.ptr, elem.ptr);
    }
}
module.exports.DataInputs = DataInputs;
/**
* According to
* BIP-44 <https://github.com/bitcoin/bips/blob/master/bip-0044.mediawiki>
* and EIP-3 <https://github.com/ergoplatform/eips/blob/master/eip-0003.md>
*/
class DerivationPath {

    static __wrap(ptr) {
        const obj = Object.create(DerivationPath.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_derivationpath_free(ptr);
    }
    /**
    * Create derivation path for a given account index (hardened) and address indices
    * `m / 44' / 429' / acc' / 0 / address[0] / address[1] / ...`
    * or `m / 44' / 429' / acc' / 0` if address indices are empty
    * change is always zero according to EIP-3
    * acc is expected as a 31-bit value (32th bit should not be set)
    * @param {number} acc
    * @param {Uint32Array} address_indices
    * @returns {DerivationPath}
    */
    static new(acc, address_indices) {
        var ptr0 = passArray32ToWasm0(address_indices, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.derivationpath_new(acc, ptr0, len0);
        return DerivationPath.__wrap(ret);
    }
    /**
    * Create root derivation path
    * @returns {DerivationPath}
    */
    static master_path() {
        var ret = wasm.derivationpath_master_path();
        return DerivationPath.__wrap(ret);
    }
    /**
    * Returns the length of the derivation path
    * @returns {number}
    */
    depth() {
        var ret = wasm.derivationpath_depth(this.ptr);
        return ret >>> 0;
    }
    /**
    * Returns a new path with the last element of the deriviation path being increased, e.g. m/1/2 -> m/1/3
    * Returns an empty path error if the path is empty (master node)
    * @returns {DerivationPath}
    */
    next() {
        var ret = wasm.derivationpath_next(this.ptr);
        return DerivationPath.__wrap(ret);
    }
    /**
    * String representation of derivation path
    * E.g m/44'/429'/0'/0/1
    * @returns {string}
    */
    toString() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.derivationpath_toString(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * Create a derivation path from a formatted string
    * E.g "m/44'/429'/0'/0/1"
    * @param {string} path
    * @returns {DerivationPath}
    */
    static from_string(path) {
        var ptr0 = passStringToWasm0(path, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.derivationpath_from_string(ptr0, len0);
        return DerivationPath.__wrap(ret);
    }
    /**
    * For 0x21 Sign Transaction command of Ergo Ledger App Protocol
    * P2PK Sign (0x0D) instruction
    * Sign calculated TX hash with private key for provided BIP44 path.
    * Data:
    *
    * Field
    * Size (B)
    * Description
    *
    * BIP32 path length
    * 1
    * Value: 0x02-0x0A (2-10). Number of path components
    *
    * First derivation index
    * 4
    * Big-endian. Value: 44’
    *
    * Second derivation index
    * 4
    * Big-endian. Value: 429’ (Ergo coin id)
    *
    * Optional Third index
    * 4
    * Big-endian. Any valid bip44 hardened value.
    * ...
    * Optional Last index
    * 4
    * Big-endian. Any valid bip44 value.
    * @returns {Uint8Array}
    */
    ledger_bytes() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.derivationpath_ledger_bytes(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var v0 = getArrayU8FromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 1);
            return v0;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
}
module.exports.DerivationPath = DerivationPath;
/**
* Ergo box, that is taking part in some transaction on the chain
* Differs with [`ErgoBoxCandidate`] by added transaction id and an index in the input of that transaction
*/
class ErgoBox {

    static __wrap(ptr) {
        const obj = Object.create(ErgoBox.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_ergobox_free(ptr);
    }
    /**
    * make a new box with:
    * `value` - amount of money associated with the box
    * `contract` - guarding contract([`Contract`]), which should be evaluated to true in order
    * to open(spend) this box
    * `creation_height` - height when a transaction containing the box is created.
    * `tx_id` - transaction id in which this box was "created" (participated in outputs)
    * `index` - index (in outputs) in the transaction
    * @param {BoxValue} value
    * @param {number} creation_height
    * @param {Contract} contract
    * @param {TxId} tx_id
    * @param {number} index
    * @param {Tokens} tokens
    */
    constructor(value, creation_height, contract, tx_id, index, tokens) {
        _assertClass(value, BoxValue);
        _assertClass(contract, Contract);
        _assertClass(tx_id, TxId);
        _assertClass(tokens, Tokens);
        var ret = wasm.ergobox_new(value.ptr, creation_height, contract.ptr, tx_id.ptr, index, tokens.ptr);
        return ErgoBox.__wrap(ret);
    }
    /**
    * Get box id
    * @returns {BoxId}
    */
    box_id() {
        var ret = wasm.ergobox_box_id(this.ptr);
        return BoxId.__wrap(ret);
    }
    /**
    * Get box creation height
    * @returns {number}
    */
    creation_height() {
        var ret = wasm.ergobox_creation_height(this.ptr);
        return ret >>> 0;
    }
    /**
    * Get tokens for box
    * @returns {Tokens}
    */
    tokens() {
        var ret = wasm.ergobox_tokens(this.ptr);
        return Tokens.__wrap(ret);
    }
    /**
    * Get ergo tree for box
    * @returns {ErgoTree}
    */
    ergo_tree() {
        var ret = wasm.ergobox_ergo_tree(this.ptr);
        return ErgoTree.__wrap(ret);
    }
    /**
    * Get box value in nanoERGs
    * @returns {BoxValue}
    */
    value() {
        var ret = wasm.ergobox_value(this.ptr);
        return BoxValue.__wrap(ret);
    }
    /**
    * Returns value (ErgoTree constant) stored in the register or None if the register is empty
    * @param {number} register_id
    * @returns {Constant | undefined}
    */
    register_value(register_id) {
        var ret = wasm.ergobox_register_value(this.ptr, register_id);
        return ret === 0 ? undefined : Constant.__wrap(ret);
    }
    /**
    * JSON representation as text (compatible with Ergo Node/Explorer API, numbers are encoded as numbers)
    * @returns {string}
    */
    to_json() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.ergobox_to_json(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * JSON representation according to EIP-12 <https://github.com/ergoplatform/eips/pull/23>
    * (similar to [`Self::to_json`], but as JS object with box value and token amounts encoding as strings)
    * @returns {any}
    */
    to_js_eip12() {
        var ret = wasm.ergobox_to_js_eip12(this.ptr);
        return takeObject(ret);
    }
    /**
    * parse from JSON
    * supports Ergo Node/Explorer API and box values and token amount encoded as strings
    * @param {string} json
    * @returns {ErgoBox}
    */
    static from_json(json) {
        var ptr0 = passStringToWasm0(json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.ergobox_from_json(ptr0, len0);
        return ErgoBox.__wrap(ret);
    }
    /**
    * Serialized additional register as defined in ErgoBox serialization (registers count,
    * followed by every non-empyt register value serialized)
    * @returns {Uint8Array}
    */
    serialized_additional_registers() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.ergobox_serialized_additional_registers(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var v0 = getArrayU8FromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 1);
            return v0;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * Returns serialized bytes or fails with error if cannot be serialized
    * @returns {Uint8Array}
    */
    sigma_serialize_bytes() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.ergobox_sigma_serialize_bytes(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var v0 = getArrayU8FromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 1);
            return v0;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * Parses ErgoBox or fails with error
    * @param {Uint8Array} data
    * @returns {ErgoBox}
    */
    static sigma_parse_bytes(data) {
        var ptr0 = passArray8ToWasm0(data, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.ergobox_sigma_parse_bytes(ptr0, len0);
        return ErgoBox.__wrap(ret);
    }
}
module.exports.ErgoBox = ErgoBox;
/**
* Pair of <value, tokens> for an box
*/
class ErgoBoxAssetsData {

    static __wrap(ptr) {
        const obj = Object.create(ErgoBoxAssetsData.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_ergoboxassetsdata_free(ptr);
    }
    /**
    * Create new instance
    * @param {BoxValue} value
    * @param {Tokens} tokens
    */
    constructor(value, tokens) {
        _assertClass(value, BoxValue);
        _assertClass(tokens, Tokens);
        var ret = wasm.ergoboxassetsdata_new(value.ptr, tokens.ptr);
        return ErgoBoxAssetsData.__wrap(ret);
    }
    /**
    * Value part of the box
    * @returns {BoxValue}
    */
    value() {
        var ret = wasm.ergoboxassetsdata_value(this.ptr);
        return BoxValue.__wrap(ret);
    }
    /**
    * Tokens part of the box
    * @returns {Tokens}
    */
    tokens() {
        var ret = wasm.ergoboxassetsdata_tokens(this.ptr);
        return Tokens.__wrap(ret);
    }
}
module.exports.ErgoBoxAssetsData = ErgoBoxAssetsData;
/**
* List of asset data for a box
*/
class ErgoBoxAssetsDataList {

    static __wrap(ptr) {
        const obj = Object.create(ErgoBoxAssetsDataList.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_ergoboxassetsdatalist_free(ptr);
    }
    /**
    * Create empty Tokens
    */
    constructor() {
        var ret = wasm.ergoboxassetsdatalist_new();
        return ErgoBoxAssetsDataList.__wrap(ret);
    }
    /**
    * Returns the number of elements in the collection
    * @returns {number}
    */
    len() {
        var ret = wasm.ergoboxassetsdatalist_len(this.ptr);
        return ret >>> 0;
    }
    /**
    * Returns the element of the collection with a given index
    * @param {number} index
    * @returns {ErgoBoxAssetsData}
    */
    get(index) {
        var ret = wasm.ergoboxassetsdatalist_get(this.ptr, index);
        return ErgoBoxAssetsData.__wrap(ret);
    }
    /**
    * Adds an elements to the collection
    * @param {ErgoBoxAssetsData} elem
    */
    add(elem) {
        _assertClass(elem, ErgoBoxAssetsData);
        wasm.ergoboxassetsdatalist_add(this.ptr, elem.ptr);
    }
}
module.exports.ErgoBoxAssetsDataList = ErgoBoxAssetsDataList;
/**
* ErgoBox candidate not yet included in any transaction on the chain
*/
class ErgoBoxCandidate {

    static __wrap(ptr) {
        const obj = Object.create(ErgoBoxCandidate.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_ergoboxcandidate_free(ptr);
    }
    /**
    * Returns value (ErgoTree constant) stored in the register or None if the register is empty
    * @param {number} register_id
    * @returns {Constant | undefined}
    */
    register_value(register_id) {
        var ret = wasm.ergoboxcandidate_register_value(this.ptr, register_id);
        return ret === 0 ? undefined : Constant.__wrap(ret);
    }
    /**
    * Get box creation height
    * @returns {number}
    */
    creation_height() {
        var ret = wasm.ergoboxcandidate_creation_height(this.ptr);
        return ret >>> 0;
    }
    /**
    * Get tokens for box
    * @returns {Tokens}
    */
    tokens() {
        var ret = wasm.ergoboxcandidate_tokens(this.ptr);
        return Tokens.__wrap(ret);
    }
    /**
    * Get ergo tree for box
    * @returns {ErgoTree}
    */
    ergo_tree() {
        var ret = wasm.ergoboxcandidate_ergo_tree(this.ptr);
        return ErgoTree.__wrap(ret);
    }
    /**
    * Get box value in nanoERGs
    * @returns {BoxValue}
    */
    value() {
        var ret = wasm.ergoboxcandidate_value(this.ptr);
        return BoxValue.__wrap(ret);
    }
}
module.exports.ErgoBoxCandidate = ErgoBoxCandidate;
/**
* ErgoBoxCandidate builder
*/
class ErgoBoxCandidateBuilder {

    static __wrap(ptr) {
        const obj = Object.create(ErgoBoxCandidateBuilder.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_ergoboxcandidatebuilder_free(ptr);
    }
    /**
    * Create builder with required box parameters:
    * `value` - amount of money associated with the box
    * `contract` - guarding contract([`Contract`]), which should be evaluated to true in order
    * to open(spend) this box
    * `creation_height` - height when a transaction containing the box is created.
    * It should not exceed height of the block, containing the transaction with this box.
    * @param {BoxValue} value
    * @param {Contract} contract
    * @param {number} creation_height
    */
    constructor(value, contract, creation_height) {
        _assertClass(value, BoxValue);
        _assertClass(contract, Contract);
        var ret = wasm.ergoboxcandidatebuilder_new(value.ptr, contract.ptr, creation_height);
        return ErgoBoxCandidateBuilder.__wrap(ret);
    }
    /**
    * Set minimal value (per byte of the serialized box size)
    * @param {number} new_min_value_per_byte
    */
    set_min_box_value_per_byte(new_min_value_per_byte) {
        wasm.ergoboxcandidatebuilder_set_min_box_value_per_byte(this.ptr, new_min_value_per_byte);
    }
    /**
    * Get minimal value (per byte of the serialized box size)
    * @returns {number}
    */
    min_box_value_per_byte() {
        var ret = wasm.ergoboxcandidatebuilder_min_box_value_per_byte(this.ptr);
        return ret >>> 0;
    }
    /**
    * Set new box value
    * @param {BoxValue} new_value
    */
    set_value(new_value) {
        _assertClass(new_value, BoxValue);
        var ptr0 = new_value.ptr;
        new_value.ptr = 0;
        wasm.ergoboxcandidatebuilder_set_value(this.ptr, ptr0);
    }
    /**
    * Get box value
    * @returns {BoxValue}
    */
    value() {
        var ret = wasm.ergoboxcandidatebuilder_value(this.ptr);
        return BoxValue.__wrap(ret);
    }
    /**
    * Calculate serialized box size(in bytes)
    * @returns {number}
    */
    calc_box_size_bytes() {
        var ret = wasm.ergoboxcandidatebuilder_calc_box_size_bytes(this.ptr);
        return ret >>> 0;
    }
    /**
    * Calculate minimal box value for the current box serialized size(in bytes)
    * @returns {BoxValue}
    */
    calc_min_box_value() {
        var ret = wasm.ergoboxcandidatebuilder_calc_min_box_value(this.ptr);
        return BoxValue.__wrap(ret);
    }
    /**
    * Set register with a given id (R4-R9) to the given value
    * @param {number} register_id
    * @param {Constant} value
    */
    set_register_value(register_id, value) {
        _assertClass(value, Constant);
        wasm.ergoboxcandidatebuilder_set_register_value(this.ptr, register_id, value.ptr);
    }
    /**
    * Returns register value for the given register id (R4-R9), or None if the register is empty
    * @param {number} register_id
    * @returns {Constant | undefined}
    */
    register_value(register_id) {
        var ret = wasm.ergoboxcandidatebuilder_register_value(this.ptr, register_id);
        return ret === 0 ? undefined : Constant.__wrap(ret);
    }
    /**
    * Delete register value(make register empty) for the given register id (R4-R9)
    * @param {number} register_id
    */
    delete_register_value(register_id) {
        wasm.ergoboxcandidatebuilder_delete_register_value(this.ptr, register_id);
    }
    /**
    * Mint token, as defined in <https://github.com/ergoplatform/eips/blob/master/eip-0004.md>
    * `token` - token id(box id of the first input box in transaction) and token amount,
    * `token_name` - token name (will be encoded in R4),
    * `token_desc` - token description (will be encoded in R5),
    * `num_decimals` - number of decimals (will be encoded in R6)
    * @param {Token} token
    * @param {string} token_name
    * @param {string} token_desc
    * @param {number} num_decimals
    */
    mint_token(token, token_name, token_desc, num_decimals) {
        _assertClass(token, Token);
        var ptr0 = passStringToWasm0(token_name, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        var ptr1 = passStringToWasm0(token_desc, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len1 = WASM_VECTOR_LEN;
        wasm.ergoboxcandidatebuilder_mint_token(this.ptr, token.ptr, ptr0, len0, ptr1, len1, num_decimals);
    }
    /**
    * Add given token id and token amount
    * @param {TokenId} token_id
    * @param {TokenAmount} amount
    */
    add_token(token_id, amount) {
        _assertClass(token_id, TokenId);
        _assertClass(amount, TokenAmount);
        wasm.ergoboxcandidatebuilder_add_token(this.ptr, token_id.ptr, amount.ptr);
    }
    /**
    * Build the box candidate
    * @returns {ErgoBoxCandidate}
    */
    build() {
        var ret = wasm.ergoboxcandidatebuilder_build(this.ptr);
        return ErgoBoxCandidate.__wrap(ret);
    }
}
module.exports.ErgoBoxCandidateBuilder = ErgoBoxCandidateBuilder;
/**
* Collection of ErgoBoxCandidates
*/
class ErgoBoxCandidates {

    static __wrap(ptr) {
        const obj = Object.create(ErgoBoxCandidates.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_ergoboxcandidates_free(ptr);
    }
    /**
    * Create new outputs
    * @param {ErgoBoxCandidate} box_candidate
    */
    constructor(box_candidate) {
        _assertClass(box_candidate, ErgoBoxCandidate);
        var ret = wasm.ergoboxcandidates_new(box_candidate.ptr);
        return ErgoBoxCandidates.__wrap(ret);
    }
    /**
    * sometimes it's useful to keep track of an empty list
    * but keep in mind Ergo transactions need at least 1 output
    * @returns {ErgoBoxCandidates}
    */
    static empty() {
        var ret = wasm.ergoboxcandidates_empty();
        return ErgoBoxCandidates.__wrap(ret);
    }
    /**
    * Returns the number of elements in the collection
    * @returns {number}
    */
    len() {
        var ret = wasm.ergoboxcandidates_len(this.ptr);
        return ret >>> 0;
    }
    /**
    * Returns the element of the collection with a given index
    * @param {number} index
    * @returns {ErgoBoxCandidate}
    */
    get(index) {
        var ret = wasm.ergoboxcandidates_get(this.ptr, index);
        return ErgoBoxCandidate.__wrap(ret);
    }
    /**
    * Add an element to the collection
    * @param {ErgoBoxCandidate} b
    */
    add(b) {
        _assertClass(b, ErgoBoxCandidate);
        wasm.ergoboxcandidates_add(this.ptr, b.ptr);
    }
}
module.exports.ErgoBoxCandidates = ErgoBoxCandidates;
/**
* Collection of ErgoBox'es
*/
class ErgoBoxes {

    static __wrap(ptr) {
        const obj = Object.create(ErgoBoxes.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_ergoboxes_free(ptr);
    }
    /**
    * parse ErgoBox array from json
    * @param {any[]} json_vals
    * @returns {ErgoBoxes}
    */
    static from_boxes_json(json_vals) {
        var ptr0 = passArrayJsValueToWasm0(json_vals, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.ergoboxes_from_boxes_json(ptr0, len0);
        return ErgoBoxes.__wrap(ret);
    }
    /**
    * Create new collection with one element
    * @param {ErgoBox} b
    */
    constructor(b) {
        _assertClass(b, ErgoBox);
        var ret = wasm.ergoboxes_new(b.ptr);
        return ErgoBoxes.__wrap(ret);
    }
    /**
    * Returns the number of elements in the collection
    * @returns {number}
    */
    len() {
        var ret = wasm.ergoboxes_len(this.ptr);
        return ret >>> 0;
    }
    /**
    * Add an element to the collection
    * @param {ErgoBox} b
    */
    add(b) {
        _assertClass(b, ErgoBox);
        wasm.ergoboxes_add(this.ptr, b.ptr);
    }
    /**
    * Returns the element of the collection with a given index
    * @param {number} index
    * @returns {ErgoBox}
    */
    get(index) {
        var ret = wasm.ergoboxes_get(this.ptr, index);
        return ErgoBox.__wrap(ret);
    }
}
module.exports.ErgoBoxes = ErgoBoxes;
/**
* Blockchain state (last headers, etc.)
*/
class ErgoStateContext {

    static __wrap(ptr) {
        const obj = Object.create(ErgoStateContext.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_ergostatecontext_free(ptr);
    }
    /**
    * Create new context from pre-header
    * @param {PreHeader} pre_header
    * @param {BlockHeaders} headers
    */
    constructor(pre_header, headers) {
        _assertClass(pre_header, PreHeader);
        var ptr0 = pre_header.ptr;
        pre_header.ptr = 0;
        _assertClass(headers, BlockHeaders);
        var ptr1 = headers.ptr;
        headers.ptr = 0;
        var ret = wasm.ergostatecontext_new(ptr0, ptr1);
        return ErgoStateContext.__wrap(ret);
    }
}
module.exports.ErgoStateContext = ErgoStateContext;
/**
* The root of ErgoScript IR. Serialized instances of this class are self sufficient and can be passed around.
*/
class ErgoTree {

    static __wrap(ptr) {
        const obj = Object.create(ErgoTree.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_ergotree_free(ptr);
    }
    /**
    * Decode from base16 encoded serialized ErgoTree
    * @param {string} s
    * @returns {ErgoTree}
    */
    static from_base16_bytes(s) {
        var ptr0 = passStringToWasm0(s, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.ergotree_from_base16_bytes(ptr0, len0);
        return ErgoTree.__wrap(ret);
    }
    /**
    * Decode from encoded serialized ErgoTree
    * @param {Uint8Array} data
    * @returns {ErgoTree}
    */
    static from_bytes(data) {
        var ptr0 = passArray8ToWasm0(data, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.ergotree_from_bytes(ptr0, len0);
        return ErgoTree.__wrap(ret);
    }
    /**
    * Returns serialized bytes or fails with error if ErgoTree cannot be serialized
    * @returns {Uint8Array}
    */
    sigma_serialize_bytes() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.ergotree_sigma_serialize_bytes(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var v0 = getArrayU8FromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 1);
            return v0;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * Returns Base16-encoded serialized bytes
    * @returns {string}
    */
    to_base16_bytes() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.ergotree_to_base16_bytes(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * Returns constants number as stored in serialized ErgoTree or error if the parsing of
    * constants is failed
    * @returns {number}
    */
    constants_len() {
        var ret = wasm.ergotree_constants_len(this.ptr);
        return ret >>> 0;
    }
    /**
    * Returns constant with given index (as stored in serialized ErgoTree)
    * or None if index is out of bounds
    * or error if constants parsing were failed
    * @param {number} index
    * @returns {Constant | undefined}
    */
    get_constant(index) {
        var ret = wasm.ergotree_get_constant(this.ptr, index);
        return ret === 0 ? undefined : Constant.__wrap(ret);
    }
    /**
    * Consumes the calling ErgoTree and returns new ErgoTree with a new constant value
    * for a given index in constants list (as stored in serialized ErgoTree), or an error.
    * After the call the calling ErgoTree will be null.
    * @param {number} index
    * @param {Constant} constant
    * @returns {ErgoTree}
    */
    with_constant(index, constant) {
        const ptr = this.__destroy_into_raw();
        _assertClass(constant, Constant);
        var ret = wasm.ergotree_with_constant(ptr, index, constant.ptr);
        return ErgoTree.__wrap(ret);
    }
    /**
    * Serialized proposition expression of SigmaProp type with
    * ConstantPlaceholder nodes instead of Constant nodes
    * @returns {Uint8Array}
    */
    template_bytes() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.ergotree_template_bytes(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var v0 = getArrayU8FromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 1);
            return v0;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
}
module.exports.ErgoTree = ErgoTree;
/**
* Extented public key implemented according to BIP-32
*/
class ExtPubKey {

    static __wrap(ptr) {
        const obj = Object.create(ExtPubKey.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_extpubkey_free(ptr);
    }
    /**
    * Create ExtPubKey from public key bytes (from SEC1 compressed), chain code and derivation
    * path
    * @param {Uint8Array} public_key_bytes
    * @param {Uint8Array} chain_code
    * @param {DerivationPath} derivation_path
    * @returns {ExtPubKey}
    */
    static new(public_key_bytes, chain_code, derivation_path) {
        var ptr0 = passArray8ToWasm0(public_key_bytes, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        var ptr1 = passArray8ToWasm0(chain_code, wasm.__wbindgen_malloc);
        var len1 = WASM_VECTOR_LEN;
        _assertClass(derivation_path, DerivationPath);
        var ret = wasm.extpubkey_new(ptr0, len0, ptr1, len1, derivation_path.ptr);
        return ExtPubKey.__wrap(ret);
    }
    /**
    * Soft derivation of the child public key with a given index
    * index is expected to be a 31-bit value(32th bit should not be set)
    * @param {number} index
    * @returns {ExtPubKey}
    */
    child(index) {
        var ret = wasm.extpubkey_child(this.ptr, index);
        return ExtPubKey.__wrap(ret);
    }
    /**
    * Derive a new extended pub key from the derivation path
    * @param {DerivationPath} path
    * @returns {ExtPubKey}
    */
    derive(path) {
        _assertClass(path, DerivationPath);
        var ptr0 = path.ptr;
        path.ptr = 0;
        var ret = wasm.extpubkey_derive(this.ptr, ptr0);
        return ExtPubKey.__wrap(ret);
    }
    /**
    * Create address (P2PK) from this extended public key
    * @returns {Address}
    */
    to_address() {
        var ret = wasm.extpubkey_to_address(this.ptr);
        return Address.__wrap(ret);
    }
}
module.exports.ExtPubKey = ExtPubKey;
/**
* Extented secret key implemented according to BIP-32
*/
class ExtSecretKey {

    static __wrap(ptr) {
        const obj = Object.create(ExtSecretKey.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_extsecretkey_free(ptr);
    }
    /**
    * Create ExtSecretKey from secret key bytes, chain code and derivation path
    * @param {Uint8Array} secret_key_bytes
    * @param {Uint8Array} chain_code
    * @param {DerivationPath} derivation_path
    * @returns {ExtSecretKey}
    */
    static new(secret_key_bytes, chain_code, derivation_path) {
        var ptr0 = passArray8ToWasm0(secret_key_bytes, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        var ptr1 = passArray8ToWasm0(chain_code, wasm.__wbindgen_malloc);
        var len1 = WASM_VECTOR_LEN;
        _assertClass(derivation_path, DerivationPath);
        var ret = wasm.extsecretkey_new(ptr0, len0, ptr1, len1, derivation_path.ptr);
        return ExtSecretKey.__wrap(ret);
    }
    /**
    * Derive root extended secret key
    * @param {Uint8Array} seed_bytes
    * @returns {ExtSecretKey}
    */
    static derive_master(seed_bytes) {
        var ptr0 = passArray8ToWasm0(seed_bytes, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.extsecretkey_derive_master(ptr0, len0);
        return ExtSecretKey.__wrap(ret);
    }
    /**
    * Derive a new extended secret key from the provided index
    * The index is in the form of soft or hardened indices
    * For example: 4 or 4' respectively
    * @param {string} index
    * @returns {ExtSecretKey}
    */
    child(index) {
        var ptr0 = passStringToWasm0(index, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.extsecretkey_child(this.ptr, ptr0, len0);
        return ExtSecretKey.__wrap(ret);
    }
    /**
    * Derive a new extended secret key from the derivation path
    * @param {DerivationPath} path
    * @returns {ExtSecretKey}
    */
    derive(path) {
        _assertClass(path, DerivationPath);
        var ptr0 = path.ptr;
        path.ptr = 0;
        var ret = wasm.extsecretkey_derive(this.ptr, ptr0);
        return ExtSecretKey.__wrap(ret);
    }
    /**
    * The extended public key associated with this secret key
    * @returns {ExtPubKey}
    */
    public_key() {
        var ret = wasm.extsecretkey_public_key(this.ptr);
        return ExtPubKey.__wrap(ret);
    }
    /**
    * Derivation path associated with the ext secret key
    * @returns {DerivationPath}
    */
    path() {
        var ret = wasm.extsecretkey_path(this.ptr);
        return DerivationPath.__wrap(ret);
    }
}
module.exports.ExtSecretKey = ExtSecretKey;
/**
* Wrapper for i64 for JS/TS
*/
class I64 {

    static __wrap(ptr) {
        const obj = Object.create(I64.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_i64_free(ptr);
    }
    /**
    * Create from a standard rust string representation
    * @param {string} string
    * @returns {I64}
    */
    static from_str(string) {
        var ptr0 = passStringToWasm0(string, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.i64_from_str(ptr0, len0);
        return I64.__wrap(ret);
    }
    /**
    * String representation of the value for use from environments that don't support i64
    * @returns {string}
    */
    to_str() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.i64_to_str(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * Get the value as JS number (64-bit float)
    * @returns {number}
    */
    as_num() {
        var ret = wasm.i64_as_num(this.ptr);
        return takeObject(ret);
    }
    /**
    * Addition with overflow check
    * @param {I64} other
    * @returns {I64}
    */
    checked_add(other) {
        _assertClass(other, I64);
        var ret = wasm.i64_checked_add(this.ptr, other.ptr);
        return I64.__wrap(ret);
    }
}
module.exports.I64 = I64;
/**
* Signed inputs used in signed transactions
*/
class Input {

    static __wrap(ptr) {
        const obj = Object.create(Input.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_input_free(ptr);
    }
    /**
    * Get box id
    * @returns {BoxId}
    */
    box_id() {
        var ret = wasm.input_box_id(this.ptr);
        return BoxId.__wrap(ret);
    }
    /**
    * Get the spending proof
    * @returns {ProverResult}
    */
    spending_proof() {
        var ret = wasm.input_spending_proof(this.ptr);
        return ProverResult.__wrap(ret);
    }
}
module.exports.Input = Input;
/**
* Collection of signed inputs
*/
class Inputs {

    static __wrap(ptr) {
        const obj = Object.create(Inputs.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_inputs_free(ptr);
    }
    /**
    * Create empty Inputs
    */
    constructor() {
        var ret = wasm.inputs_new();
        return Inputs.__wrap(ret);
    }
    /**
    * Returns the number of elements in the collection
    * @returns {number}
    */
    len() {
        var ret = wasm.inputs_len(this.ptr);
        return ret >>> 0;
    }
    /**
    * Returns the element of the collection with a given index
    * @param {number} index
    * @returns {Input}
    */
    get(index) {
        var ret = wasm.inputs_get(this.ptr, index);
        return Input.__wrap(ret);
    }
}
module.exports.Inputs = Inputs;
/**
* helper methods to get the fee address for various networks
*/
class MinerAddress {

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_mineraddress_free(ptr);
    }
    /**
    * address to use in mainnet for the fee
    * @returns {string}
    */
    static mainnet_fee_address() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.mineraddress_mainnet_fee_address(retptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * address to use in testnet for the fee
    * @returns {string}
    */
    static testnet_fee_address() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.mineraddress_testnet_fee_address(retptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
}
module.exports.MinerAddress = MinerAddress;
/**
* Mnemonic
*/
class Mnemonic {

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_mnemonic_free(ptr);
    }
    /**
    * Convert a mnemonic phrase into a mnemonic seed
    * mnemonic_pass is optional and is used to salt the seed
    * @param {string} mnemonic_phrase
    * @param {string} mnemonic_pass
    * @returns {Uint8Array}
    */
    static to_seed(mnemonic_phrase, mnemonic_pass) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            var ptr0 = passStringToWasm0(mnemonic_phrase, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            var len0 = WASM_VECTOR_LEN;
            var ptr1 = passStringToWasm0(mnemonic_pass, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            var len1 = WASM_VECTOR_LEN;
            wasm.mnemonic_to_seed(retptr, ptr0, len0, ptr1, len1);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var v2 = getArrayU8FromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 1);
            return v2;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
}
module.exports.Mnemonic = Mnemonic;
/**
* Combination of an Address with a network
* These two combined together form a base58 encoding
*/
class NetworkAddress {

    static __wrap(ptr) {
        const obj = Object.create(NetworkAddress.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_networkaddress_free(ptr);
    }
    /**
    * create a new NetworkAddress(address + network prefix) for a given network type
    * @param {number} network
    * @param {Address} address
    * @returns {NetworkAddress}
    */
    static new(network, address) {
        _assertClass(address, Address);
        var ret = wasm.networkaddress_new(network, address.ptr);
        return NetworkAddress.__wrap(ret);
    }
    /**
    * Decode (base58) a NetworkAddress (address + network prefix) from string
    * @param {string} s
    * @returns {NetworkAddress}
    */
    static from_base58(s) {
        var ptr0 = passStringToWasm0(s, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.networkaddress_from_base58(ptr0, len0);
        return NetworkAddress.__wrap(ret);
    }
    /**
    * Encode (base58) address
    * @returns {string}
    */
    to_base58() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.networkaddress_to_base58(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * Decode from a serialized address
    * @param {Uint8Array} data
    * @returns {NetworkAddress}
    */
    static from_bytes(data) {
        var ptr0 = passArray8ToWasm0(data, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.networkaddress_from_bytes(ptr0, len0);
        return NetworkAddress.__wrap(ret);
    }
    /**
    * Encode address as serialized bytes
    * @returns {Uint8Array}
    */
    to_bytes() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.networkaddress_to_bytes(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var v0 = getArrayU8FromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 1);
            return v0;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * Network for the address
    * @returns {number}
    */
    network() {
        var ret = wasm.networkaddress_network(this.ptr);
        return ret >>> 0;
    }
    /**
    * Get address without network information
    * @returns {Address}
    */
    address() {
        var ret = wasm.networkaddress_address(this.ptr);
        return Address.__wrap(ret);
    }
}
module.exports.NetworkAddress = NetworkAddress;
/**
* Block header with the current `spendingTransaction`, that can be predicted
* by a miner before it's formation
*/
class PreHeader {

    static __wrap(ptr) {
        const obj = Object.create(PreHeader.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_preheader_free(ptr);
    }
    /**
    * Create using data from block header
    * @param {BlockHeader} block_header
    * @returns {PreHeader}
    */
    static from_block_header(block_header) {
        _assertClass(block_header, BlockHeader);
        var ptr0 = block_header.ptr;
        block_header.ptr = 0;
        var ret = wasm.preheader_from_block_header(ptr0);
        return PreHeader.__wrap(ret);
    }
}
module.exports.PreHeader = PreHeader;
/**
* Proof of correctness of tx spending
*/
class ProverResult {

    static __wrap(ptr) {
        const obj = Object.create(ProverResult.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_proverresult_free(ptr);
    }
    /**
    * Get proof
    * @returns {Uint8Array}
    */
    proof() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.proverresult_proof(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var v0 = getArrayU8FromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 1);
            return v0;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * Get extension
    * @returns {ContextExtension}
    */
    extension() {
        var ret = wasm.proverresult_extension(this.ptr);
        return ContextExtension.__wrap(ret);
    }
    /**
    * JSON representation as text (compatible with Ergo Node/Explorer API, numbers are encoded as numbers)
    * @returns {string}
    */
    to_json() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.proverresult_to_json(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
}
module.exports.ProverResult = ProverResult;
/**
* Represent `reduced` transaction, i.e. unsigned transaction where each unsigned input
* is augmented with ReducedInput which contains a script reduction result.
* After an unsigned transaction is reduced it can be signed without context.
* Thus, it can be serialized and transferred for example to Cold Wallet and signed
* in an environment where secrets are known.
* see EIP-19 for more details -
* <https://github.com/ergoplatform/eips/blob/f280890a4163f2f2e988a0091c078e36912fc531/eip-0019.md>
*/
class ReducedTransaction {

    static __wrap(ptr) {
        const obj = Object.create(ReducedTransaction.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_reducedtransaction_free(ptr);
    }
    /**
    * Returns `reduced` transaction, i.e. unsigned transaction where each unsigned input
    * is augmented with ReducedInput which contains a script reduction result.
    * @param {UnsignedTransaction} unsigned_tx
    * @param {ErgoBoxes} boxes_to_spend
    * @param {ErgoBoxes} data_boxes
    * @param {ErgoStateContext} state_context
    * @returns {ReducedTransaction}
    */
    static from_unsigned_tx(unsigned_tx, boxes_to_spend, data_boxes, state_context) {
        _assertClass(unsigned_tx, UnsignedTransaction);
        _assertClass(boxes_to_spend, ErgoBoxes);
        _assertClass(data_boxes, ErgoBoxes);
        _assertClass(state_context, ErgoStateContext);
        var ret = wasm.reducedtransaction_from_unsigned_tx(unsigned_tx.ptr, boxes_to_spend.ptr, data_boxes.ptr, state_context.ptr);
        return ReducedTransaction.__wrap(ret);
    }
    /**
    * Returns serialized bytes or fails with error if cannot be serialized
    * @returns {Uint8Array}
    */
    sigma_serialize_bytes() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.reducedtransaction_sigma_serialize_bytes(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var v0 = getArrayU8FromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 1);
            return v0;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * Parses ReducedTransaction or fails with error
    * @param {Uint8Array} data
    * @returns {ReducedTransaction}
    */
    static sigma_parse_bytes(data) {
        var ptr0 = passArray8ToWasm0(data, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.reducedtransaction_sigma_parse_bytes(ptr0, len0);
        return ReducedTransaction.__wrap(ret);
    }
    /**
    * Returns the unsigned transation
    * @returns {UnsignedTransaction}
    */
    unsigned_tx() {
        var ret = wasm.reducedtransaction_unsigned_tx(this.ptr);
        return UnsignedTransaction.__wrap(ret);
    }
}
module.exports.ReducedTransaction = ReducedTransaction;
/**
* Secret key for the prover
*/
class SecretKey {

    static __wrap(ptr) {
        const obj = Object.create(SecretKey.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_secretkey_free(ptr);
    }
    /**
    * generate random key
    * @returns {SecretKey}
    */
    static random_dlog() {
        var ret = wasm.secretkey_random_dlog();
        return SecretKey.__wrap(ret);
    }
    /**
    * Parse dlog secret key from bytes (SEC-1-encoded scalar)
    * @param {Uint8Array} bytes
    * @returns {SecretKey}
    */
    static dlog_from_bytes(bytes) {
        var ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.secretkey_dlog_from_bytes(ptr0, len0);
        return SecretKey.__wrap(ret);
    }
    /**
    * Address (encoded public image)
    * @returns {Address}
    */
    get_address() {
        var ret = wasm.secretkey_get_address(this.ptr);
        return Address.__wrap(ret);
    }
    /**
    * Encode from a serialized key
    * @returns {Uint8Array}
    */
    to_bytes() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.secretkey_to_bytes(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var v0 = getArrayU8FromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 1);
            return v0;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
}
module.exports.SecretKey = SecretKey;
/**
* SecretKey collection
*/
class SecretKeys {

    static __wrap(ptr) {
        const obj = Object.create(SecretKeys.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_secretkeys_free(ptr);
    }
    /**
    * Create empty SecretKeys
    */
    constructor() {
        var ret = wasm.secretkeys_new();
        return SecretKeys.__wrap(ret);
    }
    /**
    * Returns the number of elements in the collection
    * @returns {number}
    */
    len() {
        var ret = wasm.secretkeys_len(this.ptr);
        return ret >>> 0;
    }
    /**
    * Returns the element of the collection with a given index
    * @param {number} index
    * @returns {SecretKey}
    */
    get(index) {
        var ret = wasm.secretkeys_get(this.ptr, index);
        return SecretKey.__wrap(ret);
    }
    /**
    * Adds an elements to the collection
    * @param {SecretKey} elem
    */
    add(elem) {
        _assertClass(elem, SecretKey);
        wasm.secretkeys_add(this.ptr, elem.ptr);
    }
}
module.exports.SecretKeys = SecretKeys;
/**
* Naive box selector, collects inputs until target balance is reached
*/
class SimpleBoxSelector {

    static __wrap(ptr) {
        const obj = Object.create(SimpleBoxSelector.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_simpleboxselector_free(ptr);
    }
    /**
    * Create empty SimpleBoxSelector
    */
    constructor() {
        var ret = wasm.simpleboxselector_new();
        return SimpleBoxSelector.__wrap(ret);
    }
    /**
    * Selects inputs to satisfy target balance and tokens.
    * `inputs` - available inputs (returns an error, if empty),
    * `target_balance` - coins (in nanoERGs) needed,
    * `target_tokens` - amount of tokens needed.
    * Returns selected inputs and box assets(value+tokens) with change.
    * @param {ErgoBoxes} inputs
    * @param {BoxValue} target_balance
    * @param {Tokens} target_tokens
    * @returns {BoxSelection}
    */
    select(inputs, target_balance, target_tokens) {
        _assertClass(inputs, ErgoBoxes);
        _assertClass(target_balance, BoxValue);
        _assertClass(target_tokens, Tokens);
        var ret = wasm.simpleboxselector_select(this.ptr, inputs.ptr, target_balance.ptr, target_tokens.ptr);
        return BoxSelection.__wrap(ret);
    }
}
module.exports.SimpleBoxSelector = SimpleBoxSelector;
/**
* Token represented with token id paired with it's amount
*/
class Token {

    static __wrap(ptr) {
        const obj = Object.create(Token.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_token_free(ptr);
    }
    /**
    * Create a token with given token id and amount
    * @param {TokenId} token_id
    * @param {TokenAmount} amount
    */
    constructor(token_id, amount) {
        _assertClass(token_id, TokenId);
        _assertClass(amount, TokenAmount);
        var ret = wasm.token_new(token_id.ptr, amount.ptr);
        return Token.__wrap(ret);
    }
    /**
    * Get token id
    * @returns {TokenId}
    */
    id() {
        var ret = wasm.token_id(this.ptr);
        return TokenId.__wrap(ret);
    }
    /**
    * Get token amount
    * @returns {TokenAmount}
    */
    amount() {
        var ret = wasm.token_amount(this.ptr);
        return TokenAmount.__wrap(ret);
    }
    /**
    * JSON representation as text (compatible with Ergo Node/Explorer API, numbers are encoded as numbers)
    * @returns {string}
    */
    to_json() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.token_to_json(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * JSON representation according to EIP-12 <https://github.com/ergoplatform/eips/pull/23>
    * (similar to [`Self::to_json`], but as JS object with token amount encoding as string)
    * @returns {any}
    */
    to_js_eip12() {
        var ret = wasm.token_to_js_eip12(this.ptr);
        return takeObject(ret);
    }
}
module.exports.Token = Token;
/**
* Token amount with bound checks
*/
class TokenAmount {

    static __wrap(ptr) {
        const obj = Object.create(TokenAmount.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_tokenamount_free(ptr);
    }
    /**
    * Create from i64 with bounds check
    * @param {I64} v
    * @returns {TokenAmount}
    */
    static from_i64(v) {
        _assertClass(v, I64);
        var ret = wasm.tokenamount_from_i64(v.ptr);
        return TokenAmount.__wrap(ret);
    }
    /**
    * Get value as signed 64-bit long (I64)
    * @returns {I64}
    */
    as_i64() {
        var ret = wasm.tokenamount_as_i64(this.ptr);
        return I64.__wrap(ret);
    }
    /**
    * big-endian byte array representation
    * @returns {Uint8Array}
    */
    to_bytes() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.tokenamount_to_bytes(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var v0 = getArrayU8FromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 1);
            return v0;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
}
module.exports.TokenAmount = TokenAmount;
/**
* Token id (32 byte digest)
*/
class TokenId {

    static __wrap(ptr) {
        const obj = Object.create(TokenId.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_tokenid_free(ptr);
    }
    /**
    * Create token id from ergo box id (32 byte digest)
    * @param {BoxId} box_id
    * @returns {TokenId}
    */
    static from_box_id(box_id) {
        _assertClass(box_id, BoxId);
        var ret = wasm.tokenid_from_box_id(box_id.ptr);
        return TokenId.__wrap(ret);
    }
    /**
    * Parse token id (32 byte digest) from base16-encoded string
    * @param {string} str
    * @returns {TokenId}
    */
    static from_str(str) {
        var ptr0 = passStringToWasm0(str, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.tokenid_from_str(ptr0, len0);
        return TokenId.__wrap(ret);
    }
    /**
    * Base16 encoded string
    * @returns {string}
    */
    to_str() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.tokenid_to_str(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * Returns byte array (32 bytes)
    * @returns {Uint8Array}
    */
    as_bytes() {
        var ret = wasm.tokenid_as_bytes(this.ptr);
        return takeObject(ret);
    }
}
module.exports.TokenId = TokenId;
/**
* Array of tokens
*/
class Tokens {

    static __wrap(ptr) {
        const obj = Object.create(Tokens.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_tokens_free(ptr);
    }
    /**
    * Create empty Tokens
    */
    constructor() {
        var ret = wasm.tokens_new();
        return Tokens.__wrap(ret);
    }
    /**
    * Returns the number of elements in the collection
    * @returns {number}
    */
    len() {
        var ret = wasm.tokens_len(this.ptr);
        return ret >>> 0;
    }
    /**
    * Returns the element of the collection with a given index
    * @param {number} index
    * @returns {Token}
    */
    get(index) {
        var ret = wasm.tokens_get(this.ptr, index);
        return Token.__wrap(ret);
    }
    /**
    * Adds an elements to the collection
    * @param {Token} elem
    */
    add(elem) {
        _assertClass(elem, Token);
        wasm.tokens_add(this.ptr, elem.ptr);
    }
}
module.exports.Tokens = Tokens;
/**
*
* * ErgoTransaction is an atomic state transition operation. It destroys Boxes from the state
* * and creates new ones. If transaction is spending boxes protected by some non-trivial scripts,
* * its inputs should also contain proof of spending correctness - context extension (user-defined
* * key-value map) and data inputs (links to existing boxes in the state) that may be used during
* * script reduction to crypto, signatures that satisfies the remaining cryptographic protection
* * of the script.
* * Transactions are not encrypted, so it is possible to browse and view every transaction ever
* * collected into a block.
*
*/
class Transaction {

    static __wrap(ptr) {
        const obj = Object.create(Transaction.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_transaction_free(ptr);
    }
    /**
    * Create Transaction from UnsignedTransaction and an array of proofs in the same order as
    * UnsignedTransaction.inputs with empty proof indicated with empty byte array
    * @param {UnsignedTransaction} unsigned_tx
    * @param {(Uint8Array)[]} proofs
    * @returns {Transaction}
    */
    static from_unsigned_tx(unsigned_tx, proofs) {
        _assertClass(unsigned_tx, UnsignedTransaction);
        var ptr0 = unsigned_tx.ptr;
        unsigned_tx.ptr = 0;
        var ptr1 = passArrayJsValueToWasm0(proofs, wasm.__wbindgen_malloc);
        var len1 = WASM_VECTOR_LEN;
        var ret = wasm.transaction_from_unsigned_tx(ptr0, ptr1, len1);
        return Transaction.__wrap(ret);
    }
    /**
    * Get id for transaction
    * @returns {TxId}
    */
    id() {
        var ret = wasm.transaction_id(this.ptr);
        return TxId.__wrap(ret);
    }
    /**
    * JSON representation as text (compatible with Ergo Node/Explorer API, numbers are encoded as numbers)
    * @returns {string}
    */
    to_json() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.transaction_to_json(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * JSON representation according to EIP-12 <https://github.com/ergoplatform/eips/pull/23>
    * (similar to [`Self::to_json`], but as JS object with box value and token amount encoding as strings)
    * @returns {any}
    */
    to_js_eip12() {
        var ret = wasm.transaction_to_js_eip12(this.ptr);
        return takeObject(ret);
    }
    /**
    * parse from JSON
    * supports Ergo Node/Explorer API and box values and token amount encoded as strings
    * @param {string} json
    * @returns {Transaction}
    */
    static from_json(json) {
        var ptr0 = passStringToWasm0(json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.transaction_from_json(ptr0, len0);
        return Transaction.__wrap(ret);
    }
    /**
    * Inputs for transaction
    * @returns {Inputs}
    */
    inputs() {
        var ret = wasm.transaction_inputs(this.ptr);
        return Inputs.__wrap(ret);
    }
    /**
    * Data inputs for transaction
    * @returns {DataInputs}
    */
    data_inputs() {
        var ret = wasm.transaction_data_inputs(this.ptr);
        return DataInputs.__wrap(ret);
    }
    /**
    * Output candidates for transaction
    * @returns {ErgoBoxCandidates}
    */
    output_candidates() {
        var ret = wasm.transaction_output_candidates(this.ptr);
        return ErgoBoxCandidates.__wrap(ret);
    }
    /**
    * Returns ErgoBox's created from ErgoBoxCandidate's with tx id and indices
    * @returns {ErgoBoxes}
    */
    outputs() {
        var ret = wasm.transaction_outputs(this.ptr);
        return ErgoBoxes.__wrap(ret);
    }
    /**
    * Returns serialized bytes or fails with error if cannot be serialized
    * @returns {Uint8Array}
    */
    sigma_serialize_bytes() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.transaction_sigma_serialize_bytes(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var v0 = getArrayU8FromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 1);
            return v0;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * Parses Transaction or fails with error
    * @param {Uint8Array} data
    * @returns {Transaction}
    */
    static sigma_parse_bytes(data) {
        var ptr0 = passArray8ToWasm0(data, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.transaction_sigma_parse_bytes(ptr0, len0);
        return Transaction.__wrap(ret);
    }
}
module.exports.Transaction = Transaction;
/**
* Unsigned transaction builder
*/
class TxBuilder {

    static __wrap(ptr) {
        const obj = Object.create(TxBuilder.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_txbuilder_free(ptr);
    }
    /**
    * Suggested transaction fee (semi-default value used across wallets and dApps as of Oct 2020)
    * @returns {BoxValue}
    */
    static SUGGESTED_TX_FEE() {
        var ret = wasm.txbuilder_SUGGESTED_TX_FEE();
        return BoxValue.__wrap(ret);
    }
    /**
    * Creates new TxBuilder
    * `box_selection` - selected input boxes (via [`super::box_selector`])
    * `output_candidates` - output boxes to be "created" in this transaction,
    * `current_height` - chain height that will be used in additionally created boxes (change, miner's fee, etc.),
    * `fee_amount` - miner's fee,
    * `change_address` - change (inputs - outputs) will be sent to this address,
    * `min_change_value` - minimal value of the change to be sent to `change_address`, value less than that
    * will be given to miners,
    * @param {BoxSelection} box_selection
    * @param {ErgoBoxCandidates} output_candidates
    * @param {number} current_height
    * @param {BoxValue} fee_amount
    * @param {Address} change_address
    * @param {BoxValue} min_change_value
    * @returns {TxBuilder}
    */
    static new(box_selection, output_candidates, current_height, fee_amount, change_address, min_change_value) {
        _assertClass(box_selection, BoxSelection);
        _assertClass(output_candidates, ErgoBoxCandidates);
        _assertClass(fee_amount, BoxValue);
        _assertClass(change_address, Address);
        _assertClass(min_change_value, BoxValue);
        var ret = wasm.txbuilder_new(box_selection.ptr, output_candidates.ptr, current_height, fee_amount.ptr, change_address.ptr, min_change_value.ptr);
        return TxBuilder.__wrap(ret);
    }
    /**
    * Set transaction's data inputs
    * @param {DataInputs} data_inputs
    */
    set_data_inputs(data_inputs) {
        _assertClass(data_inputs, DataInputs);
        wasm.txbuilder_set_data_inputs(this.ptr, data_inputs.ptr);
    }
    /**
    * Build the unsigned transaction
    * @returns {UnsignedTransaction}
    */
    build() {
        var ret = wasm.txbuilder_build(this.ptr);
        return UnsignedTransaction.__wrap(ret);
    }
    /**
    * Get box selection
    * @returns {BoxSelection}
    */
    box_selection() {
        var ret = wasm.txbuilder_box_selection(this.ptr);
        return BoxSelection.__wrap(ret);
    }
    /**
    * Get data inputs
    * @returns {DataInputs}
    */
    data_inputs() {
        var ret = wasm.txbuilder_data_inputs(this.ptr);
        return DataInputs.__wrap(ret);
    }
    /**
    * Get outputs EXCLUDING fee and change
    * @returns {ErgoBoxCandidates}
    */
    output_candidates() {
        var ret = wasm.txbuilder_output_candidates(this.ptr);
        return ErgoBoxCandidates.__wrap(ret);
    }
    /**
    * Get current height
    * @returns {number}
    */
    current_height() {
        var ret = wasm.txbuilder_current_height(this.ptr);
        return ret >>> 0;
    }
    /**
    * Get fee amount
    * @returns {BoxValue}
    */
    fee_amount() {
        var ret = wasm.txbuilder_fee_amount(this.ptr);
        return BoxValue.__wrap(ret);
    }
    /**
    * Get change address
    * @returns {Address}
    */
    change_address() {
        var ret = wasm.txbuilder_change_address(this.ptr);
        return Address.__wrap(ret);
    }
    /**
    * Get min change value
    * @returns {BoxValue}
    */
    min_change_value() {
        var ret = wasm.txbuilder_min_change_value(this.ptr);
        return BoxValue.__wrap(ret);
    }
}
module.exports.TxBuilder = TxBuilder;
/**
* Transaction id
*/
class TxId {

    static __wrap(ptr) {
        const obj = Object.create(TxId.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_txid_free(ptr);
    }
    /**
    * Zero (empty) transaction id (to use as dummy value in tests)
    * @returns {TxId}
    */
    static zero() {
        var ret = wasm.txid_zero();
        return TxId.__wrap(ret);
    }
    /**
    * get the tx id as bytes
    * @returns {string}
    */
    to_str() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.txid_to_str(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * convert a hex string into a TxId
    * @param {string} s
    * @returns {TxId}
    */
    static from_str(s) {
        var ptr0 = passStringToWasm0(s, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.txid_from_str(ptr0, len0);
        return TxId.__wrap(ret);
    }
}
module.exports.TxId = TxId;
/**
* Unsigned inputs used in constructing unsigned transactions
*/
class UnsignedInput {

    static __wrap(ptr) {
        const obj = Object.create(UnsignedInput.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_unsignedinput_free(ptr);
    }
    /**
    * Get box id
    * @returns {BoxId}
    */
    box_id() {
        var ret = wasm.unsignedinput_box_id(this.ptr);
        return BoxId.__wrap(ret);
    }
    /**
    * Get extension
    * @returns {ContextExtension}
    */
    extension() {
        var ret = wasm.unsignedinput_extension(this.ptr);
        return ContextExtension.__wrap(ret);
    }
}
module.exports.UnsignedInput = UnsignedInput;
/**
* Collection of unsigned signed inputs
*/
class UnsignedInputs {

    static __wrap(ptr) {
        const obj = Object.create(UnsignedInputs.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_unsignedinputs_free(ptr);
    }
    /**
    * Create empty UnsignedInputs
    */
    constructor() {
        var ret = wasm.unsignedinputs_new();
        return UnsignedInputs.__wrap(ret);
    }
    /**
    * Returns the number of elements in the collection
    * @returns {number}
    */
    len() {
        var ret = wasm.unsignedinputs_len(this.ptr);
        return ret >>> 0;
    }
    /**
    * Returns the element of the collection with a given index
    * @param {number} index
    * @returns {UnsignedInput}
    */
    get(index) {
        var ret = wasm.unsignedinputs_get(this.ptr, index);
        return UnsignedInput.__wrap(ret);
    }
}
module.exports.UnsignedInputs = UnsignedInputs;
/**
* Unsigned (inputs without proofs) transaction
*/
class UnsignedTransaction {

    static __wrap(ptr) {
        const obj = Object.create(UnsignedTransaction.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_unsignedtransaction_free(ptr);
    }
    /**
    * Consumes the calling UnsignedTransaction and returns a new UnsignedTransaction containing
    * the ContextExtension in the provided input box id or returns an error if the input box cannot be found.
    * After the call the calling UnsignedTransaction will be null.
    * @param {BoxId} input_id
    * @param {ContextExtension} ext
    * @returns {UnsignedTransaction}
    */
    with_input_context_ext(input_id, ext) {
        const ptr = this.__destroy_into_raw();
        _assertClass(input_id, BoxId);
        _assertClass(ext, ContextExtension);
        var ret = wasm.unsignedtransaction_with_input_context_ext(ptr, input_id.ptr, ext.ptr);
        return UnsignedTransaction.__wrap(ret);
    }
    /**
    * Get id for transaction
    * @returns {TxId}
    */
    id() {
        var ret = wasm.unsignedtransaction_id(this.ptr);
        return TxId.__wrap(ret);
    }
    /**
    * Inputs for transaction
    * @returns {UnsignedInputs}
    */
    inputs() {
        var ret = wasm.unsignedtransaction_inputs(this.ptr);
        return UnsignedInputs.__wrap(ret);
    }
    /**
    * Data inputs for transaction
    * @returns {DataInputs}
    */
    data_inputs() {
        var ret = wasm.unsignedtransaction_data_inputs(this.ptr);
        return DataInputs.__wrap(ret);
    }
    /**
    * Output candidates for transaction
    * @returns {ErgoBoxCandidates}
    */
    output_candidates() {
        var ret = wasm.unsignedtransaction_output_candidates(this.ptr);
        return ErgoBoxCandidates.__wrap(ret);
    }
    /**
    * JSON representation as text (compatible with Ergo Node/Explorer API, numbers are encoded as numbers)
    * @returns {string}
    */
    to_json() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.unsignedtransaction_to_json(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * JSON representation according to EIP-12 <https://github.com/ergoplatform/eips/pull/23>
    * (similar to [`Self::to_json`], but as JS object with box value and token amount encoding as strings)
    * @returns {any}
    */
    to_js_eip12() {
        var ret = wasm.unsignedtransaction_to_js_eip12(this.ptr);
        return takeObject(ret);
    }
    /**
    * parse from JSON
    * supports Ergo Node/Explorer API and box values and token amount encoded as strings
    * @param {string} json
    * @returns {UnsignedTransaction}
    */
    static from_json(json) {
        var ptr0 = passStringToWasm0(json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.unsignedtransaction_from_json(ptr0, len0);
        return UnsignedTransaction.__wrap(ret);
    }
    /**
    * Returns distinct token id from output_candidates as array of byte arrays
    * @returns {(Uint8Array)[]}
    */
    distinct_token_ids() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.unsignedtransaction_distinct_token_ids(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var v0 = getArrayJsValueFromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 4);
            return v0;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
}
module.exports.UnsignedTransaction = UnsignedTransaction;
/**
* A collection of secret keys. This simplified signing by matching the secret keys to the correct inputs automatically.
*/
class Wallet {

    static __wrap(ptr) {
        const obj = Object.create(Wallet.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_wallet_free(ptr);
    }
    /**
    * Create wallet instance loading secret key from mnemonic
    * Returns None if a DlogSecretKey cannot be parsed from the provided phrase
    * @param {string} mnemonic_phrase
    * @param {string} mnemonic_pass
    * @returns {Wallet | undefined}
    */
    static from_mnemonic(mnemonic_phrase, mnemonic_pass) {
        var ptr0 = passStringToWasm0(mnemonic_phrase, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        var ptr1 = passStringToWasm0(mnemonic_pass, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len1 = WASM_VECTOR_LEN;
        var ret = wasm.wallet_from_mnemonic(ptr0, len0, ptr1, len1);
        return ret === 0 ? undefined : Wallet.__wrap(ret);
    }
    /**
    * Create wallet using provided secret key
    * @param {SecretKeys} secret
    * @returns {Wallet}
    */
    static from_secrets(secret) {
        _assertClass(secret, SecretKeys);
        var ret = wasm.wallet_from_secrets(secret.ptr);
        return Wallet.__wrap(ret);
    }
    /**
    * Sign a transaction:
    * `tx` - transaction to sign
    * `boxes_to_spend` - boxes corresponding to [`UnsignedTransaction::inputs`]
    * `data_boxes` - boxes corresponding to [`UnsignedTransaction::data_inputs`]
    * @param {ErgoStateContext} _state_context
    * @param {UnsignedTransaction} tx
    * @param {ErgoBoxes} boxes_to_spend
    * @param {ErgoBoxes} data_boxes
    * @returns {Transaction}
    */
    sign_transaction(_state_context, tx, boxes_to_spend, data_boxes) {
        _assertClass(_state_context, ErgoStateContext);
        _assertClass(tx, UnsignedTransaction);
        _assertClass(boxes_to_spend, ErgoBoxes);
        _assertClass(data_boxes, ErgoBoxes);
        var ret = wasm.wallet_sign_transaction(this.ptr, _state_context.ptr, tx.ptr, boxes_to_spend.ptr, data_boxes.ptr);
        return Transaction.__wrap(ret);
    }
    /**
    * Sign a transaction:
    * `reduced_tx` - reduced transaction, i.e. unsigned transaction where for each unsigned input
    * added a script reduction result.
    * @param {ReducedTransaction} reduced_tx
    * @returns {Transaction}
    */
    sign_reduced_transaction(reduced_tx) {
        _assertClass(reduced_tx, ReducedTransaction);
        var ret = wasm.wallet_sign_reduced_transaction(this.ptr, reduced_tx.ptr);
        return Transaction.__wrap(ret);
    }
}
module.exports.Wallet = Wallet;

module.exports.__wbindgen_object_drop_ref = function(arg0) {
    takeObject(arg0);
};

module.exports.__wbindgen_string_new = function(arg0, arg1) {
    var ret = getStringFromWasm0(arg0, arg1);
    return addHeapObject(ret);
};

module.exports.__wbindgen_json_parse = function(arg0, arg1) {
    var ret = JSON.parse(getStringFromWasm0(arg0, arg1));
    return addHeapObject(ret);
};

module.exports.__wbindgen_json_serialize = function(arg0, arg1) {
    const obj = getObject(arg1);
    var ret = JSON.stringify(obj === undefined ? null : obj);
    var ptr0 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    var len0 = WASM_VECTOR_LEN;
    getInt32Memory0()[arg0 / 4 + 1] = len0;
    getInt32Memory0()[arg0 / 4 + 0] = ptr0;
};

module.exports.__wbindgen_is_string = function(arg0) {
    var ret = typeof(getObject(arg0)) === 'string';
    return ret;
};

module.exports.__wbindgen_string_get = function(arg0, arg1) {
    const obj = getObject(arg1);
    var ret = typeof(obj) === 'string' ? obj : undefined;
    var ptr0 = isLikeNone(ret) ? 0 : passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    var len0 = WASM_VECTOR_LEN;
    getInt32Memory0()[arg0 / 4 + 1] = len0;
    getInt32Memory0()[arg0 / 4 + 0] = ptr0;
};

module.exports.__wbindgen_number_new = function(arg0) {
    var ret = arg0;
    return addHeapObject(ret);
};

module.exports.__wbg_getRandomValues_98117e9a7e993920 = function() { return handleError(function (arg0, arg1) {
    getObject(arg0).getRandomValues(getObject(arg1));
}, arguments) };

module.exports.__wbg_randomFillSync_64cc7d048f228ca8 = function() { return handleError(function (arg0, arg1, arg2) {
    getObject(arg0).randomFillSync(getArrayU8FromWasm0(arg1, arg2));
}, arguments) };

module.exports.__wbg_process_2f24d6544ea7b200 = function(arg0) {
    var ret = getObject(arg0).process;
    return addHeapObject(ret);
};

module.exports.__wbindgen_is_object = function(arg0) {
    const val = getObject(arg0);
    var ret = typeof(val) === 'object' && val !== null;
    return ret;
};

module.exports.__wbg_versions_6164651e75405d4a = function(arg0) {
    var ret = getObject(arg0).versions;
    return addHeapObject(ret);
};

module.exports.__wbg_node_4b517d861cbcb3bc = function(arg0) {
    var ret = getObject(arg0).node;
    return addHeapObject(ret);
};

module.exports.__wbg_modulerequire_3440a4bcf44437db = function() { return handleError(function (arg0, arg1) {
    var ret = module.require(getStringFromWasm0(arg0, arg1));
    return addHeapObject(ret);
}, arguments) };

module.exports.__wbg_crypto_98fc271021c7d2ad = function(arg0) {
    var ret = getObject(arg0).crypto;
    return addHeapObject(ret);
};

module.exports.__wbg_msCrypto_a2cdb043d2bfe57f = function(arg0) {
    var ret = getObject(arg0).msCrypto;
    return addHeapObject(ret);
};

module.exports.__wbg_newnoargs_be86524d73f67598 = function(arg0, arg1) {
    var ret = new Function(getStringFromWasm0(arg0, arg1));
    return addHeapObject(ret);
};

module.exports.__wbg_call_888d259a5fefc347 = function() { return handleError(function (arg0, arg1) {
    var ret = getObject(arg0).call(getObject(arg1));
    return addHeapObject(ret);
}, arguments) };

module.exports.__wbg_new_342a24ca698edd87 = function(arg0, arg1) {
    var ret = new Error(getStringFromWasm0(arg0, arg1));
    return addHeapObject(ret);
};

module.exports.__wbg_self_c6fbdfc2918d5e58 = function() { return handleError(function () {
    var ret = self.self;
    return addHeapObject(ret);
}, arguments) };

module.exports.__wbg_window_baec038b5ab35c54 = function() { return handleError(function () {
    var ret = window.window;
    return addHeapObject(ret);
}, arguments) };

module.exports.__wbg_globalThis_3f735a5746d41fbd = function() { return handleError(function () {
    var ret = globalThis.globalThis;
    return addHeapObject(ret);
}, arguments) };

module.exports.__wbg_global_1bc0b39582740e95 = function() { return handleError(function () {
    var ret = global.global;
    return addHeapObject(ret);
}, arguments) };

module.exports.__wbindgen_is_undefined = function(arg0) {
    var ret = getObject(arg0) === undefined;
    return ret;
};

module.exports.__wbg_buffer_397eaa4d72ee94dd = function(arg0) {
    var ret = getObject(arg0).buffer;
    return addHeapObject(ret);
};

module.exports.__wbg_newwithbyteoffsetandlength_4b9b8c4e3f5adbff = function(arg0, arg1, arg2) {
    var ret = new Uint8Array(getObject(arg0), arg1 >>> 0, arg2 >>> 0);
    return addHeapObject(ret);
};

module.exports.__wbg_new_a7ce447f15ff496f = function(arg0) {
    var ret = new Uint8Array(getObject(arg0));
    return addHeapObject(ret);
};

module.exports.__wbg_set_969ad0a60e51d320 = function(arg0, arg1, arg2) {
    getObject(arg0).set(getObject(arg1), arg2 >>> 0);
};

module.exports.__wbg_length_1eb8fc608a0d4cdb = function(arg0) {
    var ret = getObject(arg0).length;
    return ret;
};

module.exports.__wbg_newwithlength_929232475839a482 = function(arg0) {
    var ret = new Uint8Array(arg0 >>> 0);
    return addHeapObject(ret);
};

module.exports.__wbg_subarray_8b658422a224f479 = function(arg0, arg1, arg2) {
    var ret = getObject(arg0).subarray(arg1 >>> 0, arg2 >>> 0);
    return addHeapObject(ret);
};

module.exports.__wbindgen_object_clone_ref = function(arg0) {
    var ret = getObject(arg0);
    return addHeapObject(ret);
};

module.exports.__wbindgen_debug_string = function(arg0, arg1) {
    var ret = debugString(getObject(arg1));
    var ptr0 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    var len0 = WASM_VECTOR_LEN;
    getInt32Memory0()[arg0 / 4 + 1] = len0;
    getInt32Memory0()[arg0 / 4 + 0] = ptr0;
};

module.exports.__wbindgen_throw = function(arg0, arg1) {
    throw new Error(getStringFromWasm0(arg0, arg1));
};

module.exports.__wbindgen_rethrow = function(arg0) {
    throw takeObject(arg0);
};

module.exports.__wbindgen_memory = function() {
    var ret = wasm.memory;
    return addHeapObject(ret);
};

const path = require('path').join(__dirname, 'ergo_lib_wasm_bg.wasm');
const bytes = require('fs').readFileSync(path);

const wasmModule = new WebAssembly.Module(bytes);
const wasmInstance = new WebAssembly.Instance(wasmModule, imports);
wasm = wasmInstance.exports;
module.exports.__wasm = wasm;

