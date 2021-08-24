import config from "./config";
import { TexaBuilder } from "../lib/build";

const start = async () => {
    config.base = config.define.webURL;

    const builder = new TexaBuilder(config);

    builder.subscribe("file", (path) => {
        console.log(`File processed: ${path}`);
    });

    await builder.start();
};

start();
