import { type } from "os";
import * as bridge from "bridge";
import VAA from "./models/models"
import config from "./config/conf.json";

const express = require("express");
const bodyParser = require("body-parser");
const { JSONRPCServer } = require("json-rpc-2.0");

const server = new JSONRPCServer();

server.addMethod("vaa", (args: { bytes: Uint8Array }) => {
  // parse data to VAA
  console.log("vaa called with js: ", args.bytes)
  console.log("types: ", typeof(args.bytes))
  let vaa = new VAA(args.bytes)
  console.log(vaa.toJson())
  // TODO: if this is the verify function, then we don't need to parse VAA data. we just give the bytes to verify function

  // verify signatures
  // TODO: what are these variables ??
  let payer = "????????"
  let guardianSetIndex = 10 // ????
  let guradianData = "????????"
  let signatureSet = "????????"
  // TODO: correct the bridgeId in config file (config/conf.json)
  bridge.verify_signatures_ix(config.bridgeId.toString(), payer, guardianSetIndex, guradianData, signatureSet, args.bytes)

  // issue VAA Box
})

const app = express();
app.use(bodyParser.json());

app.post("/json-rpc", (req: any, res: any) => {
  const jsonRPCRequest = req.body;
  // server.receive takes a JSON-RPC request and returns a promise of a JSON-RPC response.
  // Alternatively, you can use server.receiveJSON, which takes JSON string as is (in this case req.body).
  server.receive(jsonRPCRequest).then((jsonRPCResponse: any) => {
    if (jsonRPCResponse) {
      res.json(jsonRPCResponse);
    } else {
      // If response is absent, it was a JSON-RPC notification method.
      // Respond with no content status (204).
      res.sendStatus(204);
    }
  });
});

app.listen(8080);

