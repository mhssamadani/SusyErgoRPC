"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const models_1 = __importDefault(require("./models/models"));
const api_1 = __importDefault(require("./network/api"));
const express = require("express");
const bodyParser = require("body-parser");
const { JSONRPCServer } = require("json-rpc-2.0");
const server = new JSONRPCServer();
server.addMethod("vaa", (args) => {
    // parse data to VAA
    console.log("vaa called with js: ", args.bytes); //TODO: remove console.log
    console.log("types: ", typeof (args.bytes)); //TODO: remove console.log
    let vaa = new models_1.default(args.bytes);
    let pubKeys = api_1.default.getGuardianPubkeys();
    // verify signatures
    // issue VAA Box
});
const app = express();
app.use(bodyParser.json());
app.post("/json-rpc", (req, res) => {
    const jsonRPCRequest = req.body;
    // server.receive takes a JSON-RPC request and returns a promise of a JSON-RPC response.
    // Alternatively, you can use server.receiveJSON, which takes JSON string as is (in this case req.body).
    server.receive(jsonRPCRequest).then((jsonRPCResponse) => {
        if (jsonRPCResponse) {
            res.json(jsonRPCResponse);
        }
        else {
            // If response is absent, it was a JSON-RPC notification method.
            // Respond with no content status (204).
            res.sendStatus(204);
        }
    });
});
app.listen(8080);
