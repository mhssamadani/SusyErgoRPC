/* tslint:disable */
/* eslint-disable */
export const memory: WebAssembly.Memory;
export function __wbg_constant_free(a: number): void;
export function constant_decode_from_base16(a: number, b: number): number;
export function constant_encode_to_base16(a: number, b: number): void;
export function constant_sigma_serialize_bytes(a: number, b: number): void;
export function constant_from_i32(a: number): number;
export function constant_to_i32(a: number): number;
export function constant_from_i64(a: number): number;
export function constant_to_i64(a: number): number;
export function constant_from_bigint_signed_bytes_be(a: number, b: number): number;
export function constant_from_byte_array(a: number, b: number): number;
export function constant_to_byte_array(a: number): number;
export function constant_from_i32_array(a: number, b: number): number;
export function constant_to_i32_array(a: number, b: number): void;
export function constant_from_i64_str_array(a: number, b: number): number;
export function constant_to_i64_str_array(a: number, b: number): void;
export function constant_to_coll_coll_byte(a: number, b: number): void;
export function constant_from_ecpoint_bytes(a: number, b: number): number;
export function constant_from_tuple_coll_bytes(a: number, b: number, c: number, d: number): number;
export function constant_to_tuple_coll_bytes(a: number, b: number): void;
export function constant_to_tuple_i32(a: number, b: number): void;
export function constant_from_tuple_i64(a: number, b: number): number;
export function constant_to_tuple_i64(a: number, b: number): void;
export function constant_from_ergo_box(a: number): number;
export function constant_to_ergo_box(a: number): number;
export function __wbg_txid_free(a: number): void;
export function txid_zero(): number;
export function txid_to_str(a: number, b: number): void;
export function txid_from_str(a: number, b: number): number;
export function __wbg_transaction_free(a: number): void;
export function transaction_from_unsigned_tx(a: number, b: number, c: number): number;
export function transaction_id(a: number): number;
export function transaction_to_json(a: number, b: number): void;
export function transaction_to_js_eip12(a: number): number;
export function transaction_from_json(a: number, b: number): number;
export function transaction_inputs(a: number): number;
export function transaction_data_inputs(a: number): number;
export function transaction_output_candidates(a: number): number;
export function transaction_outputs(a: number): number;
export function transaction_sigma_serialize_bytes(a: number, b: number): void;
export function transaction_sigma_parse_bytes(a: number, b: number): number;
export function __wbg_unsignedtransaction_free(a: number): void;
export function unsignedtransaction_with_input_context_ext(a: number, b: number, c: number): number;
export function unsignedtransaction_id(a: number): number;
export function unsignedtransaction_inputs(a: number): number;
export function unsignedtransaction_data_inputs(a: number): number;
export function unsignedtransaction_output_candidates(a: number): number;
export function unsignedtransaction_to_json(a: number, b: number): void;
export function unsignedtransaction_to_js_eip12(a: number): number;
export function unsignedtransaction_from_json(a: number, b: number): number;
export function unsignedtransaction_distinct_token_ids(a: number, b: number): void;
export function __wbg_tokenid_free(a: number): void;
export function tokenid_from_box_id(a: number): number;
export function tokenid_from_str(a: number, b: number): number;
export function tokenid_to_str(a: number, b: number): void;
export function tokenid_as_bytes(a: number): number;
export function __wbg_tokenamount_free(a: number): void;
export function tokenamount_from_i64(a: number): number;
export function tokenamount_as_i64(a: number): number;
export function tokenamount_to_bytes(a: number, b: number): void;
export function __wbg_token_free(a: number): void;
export function token_new(a: number, b: number): number;
export function token_id(a: number): number;
export function token_amount(a: number): number;
export function token_to_json(a: number, b: number): void;
export function token_to_js_eip12(a: number): number;
export function __wbg_tokens_free(a: number): void;
export function tokens_new(): number;
export function tokens_len(a: number): number;
export function tokens_get(a: number, b: number): number;
export function tokens_add(a: number, b: number): void;
export function __wbg_preheader_free(a: number): void;
export function preheader_from_block_header(a: number): number;
export function __wbg_boxid_free(a: number): void;
export function boxid_from_str(a: number, b: number): number;
export function boxid_to_str(a: number, b: number): void;
export function boxid_as_bytes(a: number): number;
export function __wbg_ergoboxcandidate_free(a: number): void;
export function ergoboxcandidate_register_value(a: number, b: number): number;
export function ergoboxcandidate_creation_height(a: number): number;
export function ergoboxcandidate_tokens(a: number): number;
export function ergoboxcandidate_ergo_tree(a: number): number;
export function ergoboxcandidate_value(a: number): number;
export function __wbg_ergobox_free(a: number): void;
export function ergobox_new(a: number, b: number, c: number, d: number, e: number, f: number): number;
export function ergobox_box_id(a: number): number;
export function ergobox_creation_height(a: number): number;
export function ergobox_tokens(a: number): number;
export function ergobox_ergo_tree(a: number): number;
export function ergobox_value(a: number): number;
export function ergobox_register_value(a: number, b: number): number;
export function ergobox_to_json(a: number, b: number): void;
export function ergobox_to_js_eip12(a: number): number;
export function ergobox_from_json(a: number, b: number): number;
export function ergobox_serialized_additional_registers(a: number, b: number): void;
export function ergobox_sigma_serialize_bytes(a: number, b: number): void;
export function ergobox_sigma_parse_bytes(a: number, b: number): number;
export function __wbg_boxvalue_free(a: number): void;
export function boxvalue_SAFE_USER_MIN(): number;
export function boxvalue_UNITS_PER_ERGO(): number;
export function boxvalue_from_i64(a: number): number;
export function boxvalue_as_i64(a: number): number;
export function boxvalue_to_bytes(a: number, b: number): void;
export function __wbg_ergoboxassetsdata_free(a: number): void;
export function ergoboxassetsdata_new(a: number, b: number): number;
export function ergoboxassetsdata_value(a: number): number;
export function ergoboxassetsdata_tokens(a: number): number;
export function __wbg_ergoboxassetsdatalist_free(a: number): void;
export function ergoboxassetsdatalist_new(): number;
export function ergoboxassetsdatalist_len(a: number): number;
export function ergoboxassetsdatalist_get(a: number, b: number): number;
export function ergoboxassetsdatalist_add(a: number, b: number): void;
export function __wbg_txbuilder_free(a: number): void;
export function txbuilder_SUGGESTED_TX_FEE(): number;
export function txbuilder_new(a: number, b: number, c: number, d: number, e: number, f: number): number;
export function txbuilder_set_data_inputs(a: number, b: number): void;
export function txbuilder_build(a: number): number;
export function txbuilder_box_selection(a: number): number;
export function txbuilder_data_inputs(a: number): number;
export function txbuilder_output_candidates(a: number): number;
export function txbuilder_current_height(a: number): number;
export function txbuilder_fee_amount(a: number): number;
export function txbuilder_change_address(a: number): number;
export function txbuilder_min_change_value(a: number): number;
export function __wbg_extsecretkey_free(a: number): void;
export function extsecretkey_new(a: number, b: number, c: number, d: number, e: number): number;
export function extsecretkey_derive_master(a: number, b: number): number;
export function extsecretkey_child(a: number, b: number, c: number): number;
export function extsecretkey_derive(a: number, b: number): number;
export function extsecretkey_public_key(a: number): number;
export function extsecretkey_path(a: number): number;
export function __wbg_blockheader_free(a: number): void;
export function blockheader_from_json(a: number, b: number): number;
export function __wbg_blockheaders_free(a: number): void;
export function blockheaders_from_json(a: number, b: number): number;
export function blockheaders_new(a: number): number;
export function blockheaders_len(a: number): number;
export function blockheaders_add(a: number, b: number): void;
export function blockheaders_get(a: number, b: number): number;
export function __wbg_contract_free(a: number): void;
export function contract_new(a: number): number;
export function contract_pay_to_address(a: number): number;
export function contract_compile(a: number, b: number): number;
export function contract_ergo_tree(a: number): number;
export function __wbg_secretkey_free(a: number): void;
export function secretkey_random_dlog(): number;
export function secretkey_dlog_from_bytes(a: number, b: number): number;
export function secretkey_get_address(a: number): number;
export function secretkey_to_bytes(a: number, b: number): void;
export function __wbg_secretkeys_free(a: number): void;
export function secretkeys_new(): number;
export function secretkeys_len(a: number): number;
export function secretkeys_get(a: number, b: number): number;
export function secretkeys_add(a: number, b: number): void;
export function __wbg_mnemonic_free(a: number): void;
export function mnemonic_to_seed(a: number, b: number, c: number, d: number, e: number): void;
export function __wbg_address_free(a: number): void;
export function address_recreate_from_ergo_tree(a: number): number;
export function address_p2pk_from_pk_bytes(a: number, b: number): number;
export function address_from_testnet_str(a: number, b: number): number;
export function address_from_mainnet_str(a: number, b: number): number;
export function address_from_base58(a: number, b: number): number;
export function address_to_base58(a: number, b: number, c: number): void;
export function address_from_bytes(a: number, b: number): number;
export function address_to_bytes(a: number, b: number, c: number): void;
export function address_address_type_prefix(a: number): number;
export function address_from_public_key(a: number, b: number): number;
export function address_to_ergo_tree(a: number): number;
export function __wbg_networkaddress_free(a: number): void;
export function networkaddress_new(a: number, b: number): number;
export function networkaddress_from_base58(a: number, b: number): number;
export function networkaddress_to_base58(a: number, b: number): void;
export function networkaddress_from_bytes(a: number, b: number): number;
export function networkaddress_to_bytes(a: number, b: number): void;
export function networkaddress_network(a: number): number;
export function networkaddress_address(a: number): number;
export function __wbg_boxselection_free(a: number): void;
export function boxselection_new(a: number, b: number): number;
export function boxselection_boxes(a: number): number;
export function boxselection_change(a: number): number;
export function __wbg_simpleboxselector_free(a: number): void;
export function simpleboxselector_new(): number;
export function simpleboxselector_select(a: number, b: number, c: number, d: number): number;
export function __wbg_ergostatecontext_free(a: number): void;
export function ergostatecontext_new(a: number, b: number): number;
export function __wbg_ergotree_free(a: number): void;
export function ergotree_from_base16_bytes(a: number, b: number): number;
export function ergotree_from_bytes(a: number, b: number): number;
export function ergotree_sigma_serialize_bytes(a: number, b: number): void;
export function ergotree_to_base16_bytes(a: number, b: number): void;
export function ergotree_constants_len(a: number): number;
export function ergotree_get_constant(a: number, b: number): number;
export function ergotree_with_constant(a: number, b: number, c: number): number;
export function ergotree_template_bytes(a: number, b: number): void;
export function __wbg_proverresult_free(a: number): void;
export function proverresult_proof(a: number, b: number): void;
export function proverresult_extension(a: number): number;
export function proverresult_to_json(a: number, b: number): void;
export function __wbg_mineraddress_free(a: number): void;
export function mineraddress_mainnet_fee_address(a: number): void;
export function mineraddress_testnet_fee_address(a: number): void;
export function __wbg_i64_free(a: number): void;
export function i64_from_str(a: number, b: number): number;
export function i64_to_str(a: number, b: number): void;
export function i64_as_num(a: number): number;
export function i64_checked_add(a: number, b: number): number;
export function __wbg_derivationpath_free(a: number): void;
export function derivationpath_new(a: number, b: number, c: number): number;
export function derivationpath_master_path(): number;
export function derivationpath_depth(a: number): number;
export function derivationpath_next(a: number): number;
export function derivationpath_toString(a: number, b: number): void;
export function derivationpath_from_string(a: number, b: number): number;
export function derivationpath_ledger_bytes(a: number, b: number): void;
export function __wbg_wallet_free(a: number): void;
export function wallet_from_mnemonic(a: number, b: number, c: number, d: number): number;
export function wallet_from_secrets(a: number): number;
export function wallet_sign_transaction(a: number, b: number, c: number, d: number, e: number): number;
export function wallet_sign_reduced_transaction(a: number, b: number): number;
export function __wbg_datainput_free(a: number): void;
export function datainput_new(a: number): number;
export function datainput_box_id(a: number): number;
export function __wbg_datainputs_free(a: number): void;
export function datainputs_new(): number;
export function datainputs_len(a: number): number;
export function datainputs_get(a: number, b: number): number;
export function datainputs_add(a: number, b: number): void;
export function __wbg_unsignedinput_free(a: number): void;
export function unsignedinput_box_id(a: number): number;
export function unsignedinput_extension(a: number): number;
export function __wbg_unsignedinputs_free(a: number): void;
export function unsignedinputs_new(): number;
export function unsignedinputs_len(a: number): number;
export function unsignedinputs_get(a: number, b: number): number;
export function __wbg_input_free(a: number): void;
export function input_box_id(a: number): number;
export function input_spending_proof(a: number): number;
export function __wbg_inputs_free(a: number): void;
export function inputs_new(): number;
export function inputs_len(a: number): number;
export function inputs_get(a: number, b: number): number;
export function __wbg_reducedtransaction_free(a: number): void;
export function reducedtransaction_from_unsigned_tx(a: number, b: number, c: number, d: number): number;
export function reducedtransaction_sigma_serialize_bytes(a: number, b: number): void;
export function reducedtransaction_sigma_parse_bytes(a: number, b: number): number;
export function reducedtransaction_unsigned_tx(a: number): number;
export function __wbg_extpubkey_free(a: number): void;
export function extpubkey_new(a: number, b: number, c: number, d: number, e: number): number;
export function extpubkey_child(a: number, b: number): number;
export function extpubkey_derive(a: number, b: number): number;
export function extpubkey_to_address(a: number): number;
export function __wbg_contextextension_free(a: number): void;
export function contextextension_new(): number;
export function contextextension_set_pair(a: number, b: number, c: number): void;
export function contextextension_len(a: number): number;
export function contextextension_get(a: number, b: number): number;
export function contextextension_keys(a: number, b: number): void;
export function contextextension_sigma_serialize_bytes(a: number, b: number): void;
export function __wbg_ergoboxcandidatebuilder_free(a: number): void;
export function ergoboxcandidatebuilder_new(a: number, b: number, c: number): number;
export function ergoboxcandidatebuilder_set_min_box_value_per_byte(a: number, b: number): void;
export function ergoboxcandidatebuilder_min_box_value_per_byte(a: number): number;
export function ergoboxcandidatebuilder_set_value(a: number, b: number): void;
export function ergoboxcandidatebuilder_value(a: number): number;
export function ergoboxcandidatebuilder_calc_box_size_bytes(a: number): number;
export function ergoboxcandidatebuilder_calc_min_box_value(a: number): number;
export function ergoboxcandidatebuilder_set_register_value(a: number, b: number, c: number): void;
export function ergoboxcandidatebuilder_register_value(a: number, b: number): number;
export function ergoboxcandidatebuilder_delete_register_value(a: number, b: number): void;
export function ergoboxcandidatebuilder_mint_token(a: number, b: number, c: number, d: number, e: number, f: number, g: number): void;
export function ergoboxcandidatebuilder_add_token(a: number, b: number, c: number): void;
export function ergoboxcandidatebuilder_build(a: number): number;
export function __wbg_ergoboxes_free(a: number): void;
export function ergoboxes_from_boxes_json(a: number, b: number): number;
export function ergoboxes_new(a: number): number;
export function ergoboxes_len(a: number): number;
export function ergoboxes_add(a: number, b: number): void;
export function ergoboxes_get(a: number, b: number): number;
export function __wbg_ergoboxcandidates_free(a: number): void;
export function ergoboxcandidates_new(a: number): number;
export function ergoboxcandidates_empty(): number;
export function ergoboxcandidates_len(a: number): number;
export function ergoboxcandidates_get(a: number, b: number): number;
export function ergoboxcandidates_add(a: number, b: number): void;
export function __wbindgen_malloc(a: number): number;
export function __wbindgen_realloc(a: number, b: number, c: number): number;
export function __wbindgen_add_to_stack_pointer(a: number): number;
export function __wbindgen_free(a: number, b: number): void;
export function __wbindgen_exn_store(a: number): void;
