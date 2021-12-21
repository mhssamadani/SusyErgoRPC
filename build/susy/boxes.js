"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Boxes = void 0;
const contracts_1 = __importDefault(require("./contracts"));
const ergoLib = require("ergo-lib-wasm-nodejs");
class Boxes {
    static getSponsor(value) {
        return __awaiter(this, void 0, void 0, function* () {
            const sponsorValue = ergoLib.BoxValue.from_i64(ergoLib.I64.from_str(value.toString()));
            return new ergoLib.ErgoBoxCandidateBuilder(sponsorValue, yield contracts_1.default.generateSponsorContract(), 0)
                .build();
        });
    }
}
exports.Boxes = Boxes;
