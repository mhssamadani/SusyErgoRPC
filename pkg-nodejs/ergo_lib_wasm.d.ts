/* tslint:disable */
/* eslint-disable */
/**
* newtype for box registers R4 - R9
*/
export enum NonMandatoryRegisterId {
/**
* id for R4 register
*/
  R4,
/**
* id for R5 register
*/
  R5,
/**
* id for R6 register
*/
  R6,
/**
* id for R7 register
*/
  R7,
/**
* id for R8 register
*/
  R8,
/**
* id for R9 register
*/
  R9,
}
/**
* Network type
*/
export enum NetworkPrefix {
/**
* Mainnet
*/
  Mainnet,
/**
* Testnet
*/
  Testnet,
}
/**
* Address types
*/
export enum AddressTypePrefix {
/**
* 0x01 - Pay-to-PublicKey(P2PK) address
*/
  P2Pk,
/**
* 0x02 - Pay-to-Script-Hash(P2SH)
*/
  Pay2Sh,
/**
* 0x03 - Pay-to-Script(P2S)
*/
  Pay2S,
}
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
export class Address {
  free(): void;
/**
* Re-create the address from ErgoTree that was built from the address
*
* At some point in the past a user entered an address from which the ErgoTree was built.
* Re-create the address from this ErgoTree.
* `tree` - ErgoTree that was created from an Address
* @param {ErgoTree} ergo_tree
* @returns {Address}
*/
  static recreate_from_ergo_tree(ergo_tree: ErgoTree): Address;
/**
* Create a P2PK address from serialized PK bytes(EcPoint/GroupElement)
* @param {Uint8Array} bytes
* @returns {Address}
*/
  static p2pk_from_pk_bytes(bytes: Uint8Array): Address;
/**
* Decode (base58) testnet address from string, checking that address is from the testnet
* @param {string} s
* @returns {Address}
*/
  static from_testnet_str(s: string): Address;
/**
* Decode (base58) mainnet address from string, checking that address is from the mainnet
* @param {string} s
* @returns {Address}
*/
  static from_mainnet_str(s: string): Address;
/**
* Decode (base58) address from string without checking the network prefix
* @param {string} s
* @returns {Address}
*/
  static from_base58(s: string): Address;
/**
* Encode (base58) address
* @param {number} network_prefix
* @returns {string}
*/
  to_base58(network_prefix: number): string;
/**
* Decode from a serialized address (that includes the network prefix)
* @param {Uint8Array} data
* @returns {Address}
*/
  static from_bytes(data: Uint8Array): Address;
/**
* Encode address as serialized bytes (that includes the network prefix)
* @param {number} network_prefix
* @returns {Uint8Array}
*/
  to_bytes(network_prefix: number): Uint8Array;
/**
* Get the type of the address
* @returns {number}
*/
  address_type_prefix(): number;
/**
* Create an address from a public key
* @param {Uint8Array} bytes
* @returns {Address}
*/
  static from_public_key(bytes: Uint8Array): Address;
/**
* Creates an ErgoTree script from the address
* @returns {ErgoTree}
*/
  to_ergo_tree(): ErgoTree;
}
/**
* Block header
*/
export class BlockHeader {
  free(): void;
/**
* Parse from JSON (Node API)
* @param {string} json
* @returns {BlockHeader}
*/
  static from_json(json: string): BlockHeader;
}
/**
* Collection of BlockHeaders
*/
export class BlockHeaders {
  free(): void;
/**
* parse BlockHeader array from JSON (Node API)
* @param {any[]} json_vals
* @returns {BlockHeaders}
*/
  static from_json(json_vals: any[]): BlockHeaders;
/**
* Create new collection with one element
* @param {BlockHeader} b
*/
  constructor(b: BlockHeader);
/**
* Returns the number of elements in the collection
* @returns {number}
*/
  len(): number;
/**
* Add an element to the collection
* @param {BlockHeader} b
*/
  add(b: BlockHeader): void;
/**
* Returns the element of the collection with a given index
* @param {number} index
* @returns {BlockHeader}
*/
  get(index: number): BlockHeader;
}
/**
* Box id (32-byte digest)
*/
export class BoxId {
  free(): void;
/**
* Parse box id (32 byte digest) from base16-encoded string
* @param {string} box_id_str
* @returns {BoxId}
*/
  static from_str(box_id_str: string): BoxId;
/**
* Base16 encoded string
* @returns {string}
*/
  to_str(): string;
/**
* Returns byte array (32 bytes)
* @returns {Uint8Array}
*/
  as_bytes(): Uint8Array;
}
/**
* Selected boxes with change boxes (by [`BoxSelector`])
*/
export class BoxSelection {
  free(): void;
/**
* Create a selection to easily inject custom selection algorithms
* @param {ErgoBoxes} boxes
* @param {ErgoBoxAssetsDataList} change
*/
  constructor(boxes: ErgoBoxes, change: ErgoBoxAssetsDataList);
/**
* Selected boxes to spend as transaction inputs
* @returns {ErgoBoxes}
*/
  boxes(): ErgoBoxes;
/**
* Selected boxes to use as change
* @returns {ErgoBoxAssetsDataList}
*/
  change(): ErgoBoxAssetsDataList;
}
/**
* Box value in nanoERGs with bound checks
*/
export class BoxValue {
  free(): void;
/**
* Recommended (safe) minimal box value to use in case box size estimation is unavailable.
* Allows box size upto 2777 bytes with current min box value per byte of 360 nanoERGs
* @returns {BoxValue}
*/
  static SAFE_USER_MIN(): BoxValue;
/**
* Number of units inside one ERGO (i.e. one ERG using nano ERG representation)
* @returns {I64}
*/
  static UNITS_PER_ERGO(): I64;
/**
* Create from i64 with bounds check
* @param {I64} v
* @returns {BoxValue}
*/
  static from_i64(v: I64): BoxValue;
/**
* Get value as signed 64-bit long (I64)
* @returns {I64}
*/
  as_i64(): I64;
/**
* big-endian byte array representation
* @returns {Uint8Array}
*/
  to_bytes(): Uint8Array;
}
/**
* Ergo constant(evaluated) values
*/
export class Constant {
  free(): void;
/**
* Decode from Base16-encoded ErgoTree serialized value
* @param {string} base16_bytes_str
* @returns {Constant}
*/
  static decode_from_base16(base16_bytes_str: string): Constant;
/**
* Encode as Base16-encoded ErgoTree serialized value or return an error if serialization
* failed
* @returns {string}
*/
  encode_to_base16(): string;
/**
* Returns serialized bytes or fails with error if Constant cannot be serialized
* @returns {Uint8Array}
*/
  sigma_serialize_bytes(): Uint8Array;
/**
* Create from i32 value
* @param {number} v
* @returns {Constant}
*/
  static from_i32(v: number): Constant;
/**
* Extract i32 value, returning error if wrong type
* @returns {number}
*/
  to_i32(): number;
/**
* Create from i64
* @param {I64} v
* @returns {Constant}
*/
  static from_i64(v: I64): Constant;
/**
* Extract i64 value, returning error if wrong type
* @returns {I64}
*/
  to_i64(): I64;
/**
* Create BigInt constant from byte array (signed bytes bit-endian)
* @param {Uint8Array} num
* @returns {Constant}
*/
  static from_bigint_signed_bytes_be(num: Uint8Array): Constant;
/**
* Create from byte array
* @param {Uint8Array} v
* @returns {Constant}
*/
  static from_byte_array(v: Uint8Array): Constant;
/**
* Extract byte array, returning error if wrong type
* @returns {Uint8Array}
*/
  to_byte_array(): Uint8Array;
/**
* Create `Coll[Int]` from string array
* @param {Int32Array} arr
* @returns {Constant}
*/
  static from_i32_array(arr: Int32Array): Constant;
/**
* Extract `Coll[Int]` as string array
* @returns {Int32Array}
*/
  to_i32_array(): Int32Array;
/**
* Create `Coll[Long]` from string array
* @param {any[]} arr
* @returns {Constant}
*/
  static from_i64_str_array(arr: any[]): Constant;
/**
* Extract `Coll[Long]` as string array
* @returns {any[]}
*/
  to_i64_str_array(): any[];
/**
* Extract `Coll[Coll[Byte]]` as array of byte arrays
* @returns {(Uint8Array)[]}
*/
  to_coll_coll_byte(): (Uint8Array)[];
/**
* test
* @param {Uint8Array} bytes1
* @param {Uint8Array} bytes2
* @returns {Constant}
*/
  static from_coll_coll_byte(bytes1: Uint8Array, bytes2: Uint8Array): Constant;
/**
* Parse raw [`EcPoint`] value from bytes and make [`ProveDlog`] constant
* @param {Uint8Array} bytes
* @returns {Constant}
*/
  static from_ecpoint_bytes(bytes: Uint8Array): Constant;
/**
* Create `(Coll[Byte], Coll[Byte])` tuple Constant
* @param {Uint8Array} bytes1
* @param {Uint8Array} bytes2
* @returns {Constant}
*/
  static from_tuple_coll_bytes(bytes1: Uint8Array, bytes2: Uint8Array): Constant;
/**
* Extract `(Coll[Byte], Coll[Byte])` tuple from Constant as array of Uint8Array
* @returns {(Uint8Array)[]}
*/
  to_tuple_coll_bytes(): (Uint8Array)[];
/**
* Create `(Int, Int)` tuple Constant
* @returns {any[]}
*/
  to_tuple_i32(): any[];
/**
* Create `(Long, Long)` tuple Constant
* @param {I64} l1
* @param {I64} l2
* @returns {Constant}
*/
  static from_tuple_i64(l1: I64, l2: I64): Constant;
/**
* Extract `(Long, Long)` tuple from Constant as array of strings
* @returns {any[]}
*/
  to_tuple_i64(): any[];
/**
* Create from ErgoBox value
* @param {ErgoBox} v
* @returns {Constant}
*/
  static from_ergo_box(v: ErgoBox): Constant;
/**
* Extract ErgoBox value, returning error if wrong type
* @returns {ErgoBox}
*/
  to_ergo_box(): ErgoBox;
}
/**
* User-defined variables to be put into context
*/
export class ContextExtension {
  free(): void;
/**
* Create new ContextExtension instance
*/
  constructor();
/**
* Set the supplied pair in the ContextExtension
* @param {number} id
* @param {Constant} value
*/
  set_pair(id: number, value: Constant): void;
/**
* Returns the number of elements in the collection
* @returns {number}
*/
  len(): number;
/**
* get from map or fail if key is missing
* @param {number} key
* @returns {Constant}
*/
  get(key: number): Constant;
/**
* Returns all keys in the map
* @returns {Uint8Array}
*/
  keys(): Uint8Array;
/**
* Returns serialized bytes or fails with error if ContextExtension cannot be serialized
* @returns {Uint8Array}
*/
  sigma_serialize_bytes(): Uint8Array;
}
/**
* Defines the contract(script) that will be guarding box contents
*/
export class Contract {
  free(): void;
/**
* Create new contract from ErgoTree
* @param {ErgoTree} ergo_tree
* @returns {Contract}
*/
  static new(ergo_tree: ErgoTree): Contract;
/**
* create new contract that allow spending of the guarded box by a given recipient ([`Address`])
* @param {Address} recipient
* @returns {Contract}
*/
  static pay_to_address(recipient: Address): Contract;
/**
* Compiles a contract from ErgoScript source code
* @param {string} source
* @returns {Contract}
*/
  static compile(source: string): Contract;
/**
* Get the ErgoTree of the contract
* @returns {ErgoTree}
*/
  ergo_tree(): ErgoTree;
}
/**
* Inputs, that are used to enrich script context, but won't be spent by the transaction
*/
export class DataInput {
  free(): void;
/**
* Parse box id (32 byte digest) from base16-encoded string
* @param {BoxId} box_id
*/
  constructor(box_id: BoxId);
/**
* Get box id
* @returns {BoxId}
*/
  box_id(): BoxId;
}
/**
* DataInput collection
*/
export class DataInputs {
  free(): void;
/**
* Create empty DataInputs
*/
  constructor();
/**
* Returns the number of elements in the collection
* @returns {number}
*/
  len(): number;
/**
* Returns the element of the collection with a given index
* @param {number} index
* @returns {DataInput}
*/
  get(index: number): DataInput;
/**
* Adds an elements to the collection
* @param {DataInput} elem
*/
  add(elem: DataInput): void;
}
/**
* According to
* BIP-44 <https://github.com/bitcoin/bips/blob/master/bip-0044.mediawiki>
* and EIP-3 <https://github.com/ergoplatform/eips/blob/master/eip-0003.md>
*/
export class DerivationPath {
  free(): void;
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
  static new(acc: number, address_indices: Uint32Array): DerivationPath;
/**
* Create root derivation path
* @returns {DerivationPath}
*/
  static master_path(): DerivationPath;
/**
* Returns the length of the derivation path
* @returns {number}
*/
  depth(): number;
/**
* Returns a new path with the last element of the deriviation path being increased, e.g. m/1/2 -> m/1/3
* Returns an empty path error if the path is empty (master node)
* @returns {DerivationPath}
*/
  next(): DerivationPath;
/**
* String representation of derivation path
* E.g m/44'/429'/0'/0/1
* @returns {string}
*/
  toString(): string;
/**
* Create a derivation path from a formatted string
* E.g "m/44'/429'/0'/0/1"
* @param {string} path
* @returns {DerivationPath}
*/
  static from_string(path: string): DerivationPath;
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
  ledger_bytes(): Uint8Array;
}
/**
* Ergo box, that is taking part in some transaction on the chain
* Differs with [`ErgoBoxCandidate`] by added transaction id and an index in the input of that transaction
*/
export class ErgoBox {
  free(): void;
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
  constructor(value: BoxValue, creation_height: number, contract: Contract, tx_id: TxId, index: number, tokens: Tokens);
/**
* Get box id
* @returns {BoxId}
*/
  box_id(): BoxId;
/**
* Get box creation height
* @returns {number}
*/
  creation_height(): number;
/**
* Get tokens for box
* @returns {Tokens}
*/
  tokens(): Tokens;
/**
* Get ergo tree for box
* @returns {ErgoTree}
*/
  ergo_tree(): ErgoTree;
/**
* Get box value in nanoERGs
* @returns {BoxValue}
*/
  value(): BoxValue;
/**
* Returns value (ErgoTree constant) stored in the register or None if the register is empty
* @param {number} register_id
* @returns {Constant | undefined}
*/
  register_value(register_id: number): Constant | undefined;
/**
* JSON representation as text (compatible with Ergo Node/Explorer API, numbers are encoded as numbers)
* @returns {string}
*/
  to_json(): string;
/**
* JSON representation according to EIP-12 <https://github.com/ergoplatform/eips/pull/23>
* (similar to [`Self::to_json`], but as JS object with box value and token amounts encoding as strings)
* @returns {any}
*/
  to_js_eip12(): any;
/**
* parse from JSON
* supports Ergo Node/Explorer API and box values and token amount encoded as strings
* @param {string} json
* @returns {ErgoBox}
*/
  static from_json(json: string): ErgoBox;
/**
* Serialized additional register as defined in ErgoBox serialization (registers count,
* followed by every non-empyt register value serialized)
* @returns {Uint8Array}
*/
  serialized_additional_registers(): Uint8Array;
/**
* Returns serialized bytes or fails with error if cannot be serialized
* @returns {Uint8Array}
*/
  sigma_serialize_bytes(): Uint8Array;
/**
* Parses ErgoBox or fails with error
* @param {Uint8Array} data
* @returns {ErgoBox}
*/
  static sigma_parse_bytes(data: Uint8Array): ErgoBox;
}
/**
* Pair of <value, tokens> for an box
*/
export class ErgoBoxAssetsData {
  free(): void;
/**
* Create new instance
* @param {BoxValue} value
* @param {Tokens} tokens
*/
  constructor(value: BoxValue, tokens: Tokens);
/**
* Value part of the box
* @returns {BoxValue}
*/
  value(): BoxValue;
/**
* Tokens part of the box
* @returns {Tokens}
*/
  tokens(): Tokens;
}
/**
* List of asset data for a box
*/
export class ErgoBoxAssetsDataList {
  free(): void;
/**
* Create empty Tokens
*/
  constructor();
/**
* Returns the number of elements in the collection
* @returns {number}
*/
  len(): number;
/**
* Returns the element of the collection with a given index
* @param {number} index
* @returns {ErgoBoxAssetsData}
*/
  get(index: number): ErgoBoxAssetsData;
/**
* Adds an elements to the collection
* @param {ErgoBoxAssetsData} elem
*/
  add(elem: ErgoBoxAssetsData): void;
}
/**
* ErgoBox candidate not yet included in any transaction on the chain
*/
export class ErgoBoxCandidate {
  free(): void;
/**
* Returns value (ErgoTree constant) stored in the register or None if the register is empty
* @param {number} register_id
* @returns {Constant | undefined}
*/
  register_value(register_id: number): Constant | undefined;
/**
* Get box creation height
* @returns {number}
*/
  creation_height(): number;
/**
* Get tokens for box
* @returns {Tokens}
*/
  tokens(): Tokens;
/**
* Get ergo tree for box
* @returns {ErgoTree}
*/
  ergo_tree(): ErgoTree;
/**
* Get box value in nanoERGs
* @returns {BoxValue}
*/
  value(): BoxValue;
}
/**
* ErgoBoxCandidate builder
*/
export class ErgoBoxCandidateBuilder {
  free(): void;
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
  constructor(value: BoxValue, contract: Contract, creation_height: number);
/**
* Set minimal value (per byte of the serialized box size)
* @param {number} new_min_value_per_byte
*/
  set_min_box_value_per_byte(new_min_value_per_byte: number): void;
/**
* Get minimal value (per byte of the serialized box size)
* @returns {number}
*/
  min_box_value_per_byte(): number;
/**
* Set new box value
* @param {BoxValue} new_value
*/
  set_value(new_value: BoxValue): void;
/**
* Get box value
* @returns {BoxValue}
*/
  value(): BoxValue;
/**
* Calculate serialized box size(in bytes)
* @returns {number}
*/
  calc_box_size_bytes(): number;
/**
* Calculate minimal box value for the current box serialized size(in bytes)
* @returns {BoxValue}
*/
  calc_min_box_value(): BoxValue;
/**
* Set register with a given id (R4-R9) to the given value
* @param {number} register_id
* @param {Constant} value
*/
  set_register_value(register_id: number, value: Constant): void;
/**
* Returns register value for the given register id (R4-R9), or None if the register is empty
* @param {number} register_id
* @returns {Constant | undefined}
*/
  register_value(register_id: number): Constant | undefined;
/**
* Delete register value(make register empty) for the given register id (R4-R9)
* @param {number} register_id
*/
  delete_register_value(register_id: number): void;
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
  mint_token(token: Token, token_name: string, token_desc: string, num_decimals: number): void;
/**
* Add given token id and token amount
* @param {TokenId} token_id
* @param {TokenAmount} amount
*/
  add_token(token_id: TokenId, amount: TokenAmount): void;
/**
* Build the box candidate
* @returns {ErgoBoxCandidate}
*/
  build(): ErgoBoxCandidate;
}
/**
* Collection of ErgoBoxCandidates
*/
export class ErgoBoxCandidates {
  free(): void;
/**
* Create new outputs
* @param {ErgoBoxCandidate} box_candidate
*/
  constructor(box_candidate: ErgoBoxCandidate);
/**
* sometimes it's useful to keep track of an empty list
* but keep in mind Ergo transactions need at least 1 output
* @returns {ErgoBoxCandidates}
*/
  static empty(): ErgoBoxCandidates;
/**
* Returns the number of elements in the collection
* @returns {number}
*/
  len(): number;
/**
* Returns the element of the collection with a given index
* @param {number} index
* @returns {ErgoBoxCandidate}
*/
  get(index: number): ErgoBoxCandidate;
/**
* Add an element to the collection
* @param {ErgoBoxCandidate} b
*/
  add(b: ErgoBoxCandidate): void;
}
/**
* Collection of ErgoBox'es
*/
export class ErgoBoxes {
  free(): void;
/**
* parse ErgoBox array from json
* @param {any[]} json_vals
* @returns {ErgoBoxes}
*/
  static from_boxes_json(json_vals: any[]): ErgoBoxes;
/**
* Create new collection with one element
* @param {ErgoBox} b
*/
  constructor(b: ErgoBox);
/**
* Returns the number of elements in the collection
* @returns {number}
*/
  len(): number;
/**
* Add an element to the collection
* @param {ErgoBox} b
*/
  add(b: ErgoBox): void;
/**
* Returns the element of the collection with a given index
* @param {number} index
* @returns {ErgoBox}
*/
  get(index: number): ErgoBox;
}
/**
* Blockchain state (last headers, etc.)
*/
export class ErgoStateContext {
  free(): void;
/**
* Create new context from pre-header
* @param {PreHeader} pre_header
* @param {BlockHeaders} headers
*/
  constructor(pre_header: PreHeader, headers: BlockHeaders);
}
/**
* The root of ErgoScript IR. Serialized instances of this class are self sufficient and can be passed around.
*/
export class ErgoTree {
  free(): void;
/**
* Decode from base16 encoded serialized ErgoTree
* @param {string} s
* @returns {ErgoTree}
*/
  static from_base16_bytes(s: string): ErgoTree;
/**
* Decode from encoded serialized ErgoTree
* @param {Uint8Array} data
* @returns {ErgoTree}
*/
  static from_bytes(data: Uint8Array): ErgoTree;
/**
* Returns serialized bytes or fails with error if ErgoTree cannot be serialized
* @returns {Uint8Array}
*/
  sigma_serialize_bytes(): Uint8Array;
/**
* Returns Base16-encoded serialized bytes
* @returns {string}
*/
  to_base16_bytes(): string;
/**
* Returns constants number as stored in serialized ErgoTree or error if the parsing of
* constants is failed
* @returns {number}
*/
  constants_len(): number;
/**
* Returns constant with given index (as stored in serialized ErgoTree)
* or None if index is out of bounds
* or error if constants parsing were failed
* @param {number} index
* @returns {Constant | undefined}
*/
  get_constant(index: number): Constant | undefined;
/**
* Consumes the calling ErgoTree and returns new ErgoTree with a new constant value
* for a given index in constants list (as stored in serialized ErgoTree), or an error.
* After the call the calling ErgoTree will be null.
* @param {number} index
* @param {Constant} constant
* @returns {ErgoTree}
*/
  with_constant(index: number, constant: Constant): ErgoTree;
/**
* Serialized proposition expression of SigmaProp type with
* ConstantPlaceholder nodes instead of Constant nodes
* @returns {Uint8Array}
*/
  template_bytes(): Uint8Array;
}
/**
* Extented public key implemented according to BIP-32
*/
export class ExtPubKey {
  free(): void;
/**
* Create ExtPubKey from public key bytes (from SEC1 compressed), chain code and derivation
* path
* @param {Uint8Array} public_key_bytes
* @param {Uint8Array} chain_code
* @param {DerivationPath} derivation_path
* @returns {ExtPubKey}
*/
  static new(public_key_bytes: Uint8Array, chain_code: Uint8Array, derivation_path: DerivationPath): ExtPubKey;
/**
* Soft derivation of the child public key with a given index
* index is expected to be a 31-bit value(32th bit should not be set)
* @param {number} index
* @returns {ExtPubKey}
*/
  child(index: number): ExtPubKey;
/**
* Derive a new extended pub key from the derivation path
* @param {DerivationPath} path
* @returns {ExtPubKey}
*/
  derive(path: DerivationPath): ExtPubKey;
/**
* Create address (P2PK) from this extended public key
* @returns {Address}
*/
  to_address(): Address;
}
/**
* Extented secret key implemented according to BIP-32
*/
export class ExtSecretKey {
  free(): void;
/**
* Create ExtSecretKey from secret key bytes, chain code and derivation path
* @param {Uint8Array} secret_key_bytes
* @param {Uint8Array} chain_code
* @param {DerivationPath} derivation_path
* @returns {ExtSecretKey}
*/
  static new(secret_key_bytes: Uint8Array, chain_code: Uint8Array, derivation_path: DerivationPath): ExtSecretKey;
/**
* Derive root extended secret key
* @param {Uint8Array} seed_bytes
* @returns {ExtSecretKey}
*/
  static derive_master(seed_bytes: Uint8Array): ExtSecretKey;
/**
* Derive a new extended secret key from the provided index
* The index is in the form of soft or hardened indices
* For example: 4 or 4' respectively
* @param {string} index
* @returns {ExtSecretKey}
*/
  child(index: string): ExtSecretKey;
/**
* Derive a new extended secret key from the derivation path
* @param {DerivationPath} path
* @returns {ExtSecretKey}
*/
  derive(path: DerivationPath): ExtSecretKey;
/**
* The extended public key associated with this secret key
* @returns {ExtPubKey}
*/
  public_key(): ExtPubKey;
/**
* Derivation path associated with the ext secret key
* @returns {DerivationPath}
*/
  path(): DerivationPath;
}
/**
* Wrapper for i64 for JS/TS
*/
export class I64 {
  free(): void;
/**
* Create from a standard rust string representation
* @param {string} string
* @returns {I64}
*/
  static from_str(string: string): I64;
/**
* String representation of the value for use from environments that don't support i64
* @returns {string}
*/
  to_str(): string;
/**
* Get the value as JS number (64-bit float)
* @returns {number}
*/
  as_num(): number;
/**
* Addition with overflow check
* @param {I64} other
* @returns {I64}
*/
  checked_add(other: I64): I64;
}
/**
* Signed inputs used in signed transactions
*/
export class Input {
  free(): void;
/**
* Get box id
* @returns {BoxId}
*/
  box_id(): BoxId;
/**
* Get the spending proof
* @returns {ProverResult}
*/
  spending_proof(): ProverResult;
}
/**
* Collection of signed inputs
*/
export class Inputs {
  free(): void;
/**
* Create empty Inputs
*/
  constructor();
/**
* Returns the number of elements in the collection
* @returns {number}
*/
  len(): number;
/**
* Returns the element of the collection with a given index
* @param {number} index
* @returns {Input}
*/
  get(index: number): Input;
}
/**
* helper methods to get the fee address for various networks
*/
export class MinerAddress {
  free(): void;
/**
* address to use in mainnet for the fee
* @returns {string}
*/
  static mainnet_fee_address(): string;
/**
* address to use in testnet for the fee
* @returns {string}
*/
  static testnet_fee_address(): string;
}
/**
* Mnemonic
*/
export class Mnemonic {
  free(): void;
/**
* Convert a mnemonic phrase into a mnemonic seed
* mnemonic_pass is optional and is used to salt the seed
* @param {string} mnemonic_phrase
* @param {string} mnemonic_pass
* @returns {Uint8Array}
*/
  static to_seed(mnemonic_phrase: string, mnemonic_pass: string): Uint8Array;
}
/**
* Combination of an Address with a network
* These two combined together form a base58 encoding
*/
export class NetworkAddress {
  free(): void;
/**
* create a new NetworkAddress(address + network prefix) for a given network type
* @param {number} network
* @param {Address} address
* @returns {NetworkAddress}
*/
  static new(network: number, address: Address): NetworkAddress;
/**
* Decode (base58) a NetworkAddress (address + network prefix) from string
* @param {string} s
* @returns {NetworkAddress}
*/
  static from_base58(s: string): NetworkAddress;
/**
* Encode (base58) address
* @returns {string}
*/
  to_base58(): string;
/**
* Decode from a serialized address
* @param {Uint8Array} data
* @returns {NetworkAddress}
*/
  static from_bytes(data: Uint8Array): NetworkAddress;
/**
* Encode address as serialized bytes
* @returns {Uint8Array}
*/
  to_bytes(): Uint8Array;
/**
* Network for the address
* @returns {number}
*/
  network(): number;
/**
* Get address without network information
* @returns {Address}
*/
  address(): Address;
}
/**
* Block header with the current `spendingTransaction`, that can be predicted
* by a miner before it's formation
*/
export class PreHeader {
  free(): void;
/**
* Create using data from block header
* @param {BlockHeader} block_header
* @returns {PreHeader}
*/
  static from_block_header(block_header: BlockHeader): PreHeader;
}
/**
* Proof of correctness of tx spending
*/
export class ProverResult {
  free(): void;
/**
* Get proof
* @returns {Uint8Array}
*/
  proof(): Uint8Array;
/**
* Get extension
* @returns {ContextExtension}
*/
  extension(): ContextExtension;
/**
* JSON representation as text (compatible with Ergo Node/Explorer API, numbers are encoded as numbers)
* @returns {string}
*/
  to_json(): string;
}
/**
* Represent `reduced` transaction, i.e. unsigned transaction where each unsigned input
* is augmented with ReducedInput which contains a script reduction result.
* After an unsigned transaction is reduced it can be signed without context.
* Thus, it can be serialized and transferred for example to Cold Wallet and signed
* in an environment where secrets are known.
* see EIP-19 for more details -
* <https://github.com/ergoplatform/eips/blob/f280890a4163f2f2e988a0091c078e36912fc531/eip-0019.md>
*/
export class ReducedTransaction {
  free(): void;
/**
* Returns `reduced` transaction, i.e. unsigned transaction where each unsigned input
* is augmented with ReducedInput which contains a script reduction result.
* @param {UnsignedTransaction} unsigned_tx
* @param {ErgoBoxes} boxes_to_spend
* @param {ErgoBoxes} data_boxes
* @param {ErgoStateContext} state_context
* @returns {ReducedTransaction}
*/
  static from_unsigned_tx(unsigned_tx: UnsignedTransaction, boxes_to_spend: ErgoBoxes, data_boxes: ErgoBoxes, state_context: ErgoStateContext): ReducedTransaction;
/**
* Returns serialized bytes or fails with error if cannot be serialized
* @returns {Uint8Array}
*/
  sigma_serialize_bytes(): Uint8Array;
/**
* Parses ReducedTransaction or fails with error
* @param {Uint8Array} data
* @returns {ReducedTransaction}
*/
  static sigma_parse_bytes(data: Uint8Array): ReducedTransaction;
/**
* Returns the unsigned transation
* @returns {UnsignedTransaction}
*/
  unsigned_tx(): UnsignedTransaction;
}
/**
* Secret key for the prover
*/
export class SecretKey {
  free(): void;
/**
* generate random key
* @returns {SecretKey}
*/
  static random_dlog(): SecretKey;
/**
* Parse dlog secret key from bytes (SEC-1-encoded scalar)
* @param {Uint8Array} bytes
* @returns {SecretKey}
*/
  static dlog_from_bytes(bytes: Uint8Array): SecretKey;
/**
* Address (encoded public image)
* @returns {Address}
*/
  get_address(): Address;
/**
* Encode from a serialized key
* @returns {Uint8Array}
*/
  to_bytes(): Uint8Array;
}
/**
* SecretKey collection
*/
export class SecretKeys {
  free(): void;
/**
* Create empty SecretKeys
*/
  constructor();
/**
* Returns the number of elements in the collection
* @returns {number}
*/
  len(): number;
/**
* Returns the element of the collection with a given index
* @param {number} index
* @returns {SecretKey}
*/
  get(index: number): SecretKey;
/**
* Adds an elements to the collection
* @param {SecretKey} elem
*/
  add(elem: SecretKey): void;
}
/**
* Naive box selector, collects inputs until target balance is reached
*/
export class SimpleBoxSelector {
  free(): void;
/**
* Create empty SimpleBoxSelector
*/
  constructor();
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
  select(inputs: ErgoBoxes, target_balance: BoxValue, target_tokens: Tokens): BoxSelection;
}
/**
* Token represented with token id paired with it's amount
*/
export class Token {
  free(): void;
/**
* Create a token with given token id and amount
* @param {TokenId} token_id
* @param {TokenAmount} amount
*/
  constructor(token_id: TokenId, amount: TokenAmount);
/**
* Get token id
* @returns {TokenId}
*/
  id(): TokenId;
/**
* Get token amount
* @returns {TokenAmount}
*/
  amount(): TokenAmount;
/**
* JSON representation as text (compatible with Ergo Node/Explorer API, numbers are encoded as numbers)
* @returns {string}
*/
  to_json(): string;
/**
* JSON representation according to EIP-12 <https://github.com/ergoplatform/eips/pull/23>
* (similar to [`Self::to_json`], but as JS object with token amount encoding as string)
* @returns {any}
*/
  to_js_eip12(): any;
}
/**
* Token amount with bound checks
*/
export class TokenAmount {
  free(): void;
/**
* Create from i64 with bounds check
* @param {I64} v
* @returns {TokenAmount}
*/
  static from_i64(v: I64): TokenAmount;
/**
* Get value as signed 64-bit long (I64)
* @returns {I64}
*/
  as_i64(): I64;
/**
* big-endian byte array representation
* @returns {Uint8Array}
*/
  to_bytes(): Uint8Array;
}
/**
* Token id (32 byte digest)
*/
export class TokenId {
  free(): void;
/**
* Create token id from ergo box id (32 byte digest)
* @param {BoxId} box_id
* @returns {TokenId}
*/
  static from_box_id(box_id: BoxId): TokenId;
/**
* Parse token id (32 byte digest) from base16-encoded string
* @param {string} str
* @returns {TokenId}
*/
  static from_str(str: string): TokenId;
/**
* Base16 encoded string
* @returns {string}
*/
  to_str(): string;
/**
* Returns byte array (32 bytes)
* @returns {Uint8Array}
*/
  as_bytes(): Uint8Array;
}
/**
* Array of tokens
*/
export class Tokens {
  free(): void;
/**
* Create empty Tokens
*/
  constructor();
/**
* Returns the number of elements in the collection
* @returns {number}
*/
  len(): number;
/**
* Returns the element of the collection with a given index
* @param {number} index
* @returns {Token}
*/
  get(index: number): Token;
/**
* Adds an elements to the collection
* @param {Token} elem
*/
  add(elem: Token): void;
}
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
export class Transaction {
  free(): void;
/**
* Create Transaction from UnsignedTransaction and an array of proofs in the same order as
* UnsignedTransaction.inputs with empty proof indicated with empty byte array
* @param {UnsignedTransaction} unsigned_tx
* @param {(Uint8Array)[]} proofs
* @returns {Transaction}
*/
  static from_unsigned_tx(unsigned_tx: UnsignedTransaction, proofs: (Uint8Array)[]): Transaction;
/**
* Get id for transaction
* @returns {TxId}
*/
  id(): TxId;
/**
* JSON representation as text (compatible with Ergo Node/Explorer API, numbers are encoded as numbers)
* @returns {string}
*/
  to_json(): string;
/**
* JSON representation according to EIP-12 <https://github.com/ergoplatform/eips/pull/23>
* (similar to [`Self::to_json`], but as JS object with box value and token amount encoding as strings)
* @returns {any}
*/
  to_js_eip12(): any;
/**
* parse from JSON
* supports Ergo Node/Explorer API and box values and token amount encoded as strings
* @param {string} json
* @returns {Transaction}
*/
  static from_json(json: string): Transaction;
/**
* Inputs for transaction
* @returns {Inputs}
*/
  inputs(): Inputs;
/**
* Data inputs for transaction
* @returns {DataInputs}
*/
  data_inputs(): DataInputs;
/**
* Output candidates for transaction
* @returns {ErgoBoxCandidates}
*/
  output_candidates(): ErgoBoxCandidates;
/**
* Returns ErgoBox's created from ErgoBoxCandidate's with tx id and indices
* @returns {ErgoBoxes}
*/
  outputs(): ErgoBoxes;
/**
* Returns serialized bytes or fails with error if cannot be serialized
* @returns {Uint8Array}
*/
  sigma_serialize_bytes(): Uint8Array;
/**
* Parses Transaction or fails with error
* @param {Uint8Array} data
* @returns {Transaction}
*/
  static sigma_parse_bytes(data: Uint8Array): Transaction;
}
/**
* Unsigned transaction builder
*/
export class TxBuilder {
  free(): void;
/**
* Suggested transaction fee (semi-default value used across wallets and dApps as of Oct 2020)
* @returns {BoxValue}
*/
  static SUGGESTED_TX_FEE(): BoxValue;
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
  static new(box_selection: BoxSelection, output_candidates: ErgoBoxCandidates, current_height: number, fee_amount: BoxValue, change_address: Address, min_change_value: BoxValue): TxBuilder;
/**
* Set transaction's data inputs
* @param {DataInputs} data_inputs
*/
  set_data_inputs(data_inputs: DataInputs): void;
/**
* Build the unsigned transaction
* @returns {UnsignedTransaction}
*/
  build(): UnsignedTransaction;
/**
* Get box selection
* @returns {BoxSelection}
*/
  box_selection(): BoxSelection;
/**
* Get data inputs
* @returns {DataInputs}
*/
  data_inputs(): DataInputs;
/**
* Get outputs EXCLUDING fee and change
* @returns {ErgoBoxCandidates}
*/
  output_candidates(): ErgoBoxCandidates;
/**
* Get current height
* @returns {number}
*/
  current_height(): number;
/**
* Get fee amount
* @returns {BoxValue}
*/
  fee_amount(): BoxValue;
/**
* Get change address
* @returns {Address}
*/
  change_address(): Address;
/**
* Get min change value
* @returns {BoxValue}
*/
  min_change_value(): BoxValue;
}
/**
* Transaction id
*/
export class TxId {
  free(): void;
/**
* Zero (empty) transaction id (to use as dummy value in tests)
* @returns {TxId}
*/
  static zero(): TxId;
/**
* get the tx id as bytes
* @returns {string}
*/
  to_str(): string;
/**
* convert a hex string into a TxId
* @param {string} s
* @returns {TxId}
*/
  static from_str(s: string): TxId;
}
/**
* Unsigned inputs used in constructing unsigned transactions
*/
export class UnsignedInput {
  free(): void;
/**
* Get box id
* @returns {BoxId}
*/
  box_id(): BoxId;
/**
* Get extension
* @returns {ContextExtension}
*/
  extension(): ContextExtension;
}
/**
* Collection of unsigned signed inputs
*/
export class UnsignedInputs {
  free(): void;
/**
* Create empty UnsignedInputs
*/
  constructor();
/**
* Returns the number of elements in the collection
* @returns {number}
*/
  len(): number;
/**
* Returns the element of the collection with a given index
* @param {number} index
* @returns {UnsignedInput}
*/
  get(index: number): UnsignedInput;
}
/**
* Unsigned (inputs without proofs) transaction
*/
export class UnsignedTransaction {
  free(): void;
/**
* Consumes the calling UnsignedTransaction and returns a new UnsignedTransaction containing
* the ContextExtension in the provided input box id or returns an error if the input box cannot be found.
* After the call the calling UnsignedTransaction will be null.
* @param {BoxId} input_id
* @param {ContextExtension} ext
* @returns {UnsignedTransaction}
*/
  with_input_context_ext(input_id: BoxId, ext: ContextExtension): UnsignedTransaction;
/**
* Get id for transaction
* @returns {TxId}
*/
  id(): TxId;
/**
* Inputs for transaction
* @returns {UnsignedInputs}
*/
  inputs(): UnsignedInputs;
/**
* Data inputs for transaction
* @returns {DataInputs}
*/
  data_inputs(): DataInputs;
/**
* Output candidates for transaction
* @returns {ErgoBoxCandidates}
*/
  output_candidates(): ErgoBoxCandidates;
/**
* JSON representation as text (compatible with Ergo Node/Explorer API, numbers are encoded as numbers)
* @returns {string}
*/
  to_json(): string;
/**
* JSON representation according to EIP-12 <https://github.com/ergoplatform/eips/pull/23>
* (similar to [`Self::to_json`], but as JS object with box value and token amount encoding as strings)
* @returns {any}
*/
  to_js_eip12(): any;
/**
* parse from JSON
* supports Ergo Node/Explorer API and box values and token amount encoded as strings
* @param {string} json
* @returns {UnsignedTransaction}
*/
  static from_json(json: string): UnsignedTransaction;
/**
* Returns distinct token id from output_candidates as array of byte arrays
* @returns {(Uint8Array)[]}
*/
  distinct_token_ids(): (Uint8Array)[];
}
/**
* A collection of secret keys. This simplified signing by matching the secret keys to the correct inputs automatically.
*/
export class Wallet {
  free(): void;
/**
* Create wallet instance loading secret key from mnemonic
* Returns None if a DlogSecretKey cannot be parsed from the provided phrase
* @param {string} mnemonic_phrase
* @param {string} mnemonic_pass
* @returns {Wallet | undefined}
*/
  static from_mnemonic(mnemonic_phrase: string, mnemonic_pass: string): Wallet | undefined;
/**
* Create wallet using provided secret key
* @param {SecretKeys} secret
* @returns {Wallet}
*/
  static from_secrets(secret: SecretKeys): Wallet;
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
  sign_transaction(_state_context: ErgoStateContext, tx: UnsignedTransaction, boxes_to_spend: ErgoBoxes, data_boxes: ErgoBoxes): Transaction;
/**
* Sign a transaction:
* `reduced_tx` - reduced transaction, i.e. unsigned transaction where for each unsigned input
* added a script reduction result.
* @param {ReducedTransaction} reduced_tx
* @returns {Transaction}
*/
  sign_reduced_transaction(reduced_tx: ReducedTransaction): Transaction;
}
