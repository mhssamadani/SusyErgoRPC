import processVAA from "../susy/vaaService";
import config from "../config/conf";
import jayson from 'jayson';

const setupRPC = () => {
    const server = new jayson.Server({
        vaa: (args: {hex: string}, callback: Function) => {
            const vaa = Buffer.from(args.hex, "hex");
            processVAA(vaa).then(() => callback())
        }
    });

    server.http().listen(config.getExtraRpc().port);
}

export default setupRPC;
