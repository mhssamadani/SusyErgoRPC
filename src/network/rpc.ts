import {processVAA, processRegisterVaa, processGuardianVaa} from "../susy/vaaService";
import config from "../config/conf";
import jayson from 'jayson';

const setupRPC = () => {
    const server = new jayson.Server({
        vaa: (args: { hex: string }, callback: Function) => {
            const vaa = Buffer.from(args.hex, "hex");
            processVAA(vaa).then(() => callback())
        },
        register: (args: { hex: string }, callback: Function) => {
            const vaa = Buffer.from(args.hex, "hex")
            processRegisterVaa(vaa).then(() => callback())
        },
        guardian: (args: { hex: string }, callback: Function) => {
            const vaa = Buffer.from(args.hex, "hex")
            processGuardianVaa(vaa).then(() => callback())
        },
    });

    server.http().listen(config.getExtraRpc().port);
}

export default setupRPC;
