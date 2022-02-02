import { processVAA, processRegisterVaa, processGuardianVaa } from "../susy/vaaService";
import config from "../config/conf";
import jayson from 'jayson';

const setupRPC = () => {
    const server = new jayson.Server({
        vaa: (args: { hex: string }, callback: Function) => {
            const vaa = Buffer.from(args.hex, "hex");
            processVAA(vaa).then(() => callback()).catch(err => callback(err))
        },
        register: (args: { hex: string }, callback: Function) => {
            const vaa = Buffer.from(args.hex, "hex")
            processRegisterVaa(vaa).then(() => callback()).catch(err => callback(err))
        },
        guardian: (args: { hex: string }, callback: Function) => {
            const vaa = Buffer.from(args.hex, "hex")
            processGuardianVaa(vaa).then(() => callback()).catch(err => callback(err))
        },
    });

    server.http().listen(config.getExtraRpc().port);
}

export default setupRPC;
