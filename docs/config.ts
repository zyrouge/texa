import { defineConfig } from "../lib/config";

export default defineConfig({
    root: __dirname,
    public: "./static",
    outputDir: "./dist",
    define: {
        webURL: "https://zyrouge.github.io/texa/",
        author: "Zyrouge",
        navLinks: [
            ["Home", "index"],
            ["API", "api/index"],
        ],
    },
});
