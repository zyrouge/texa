import { defineConfig } from "../lib/config";

export default defineConfig({
    root: __dirname,
    public: "./static",
    outputDir: "./dist",
    define: {
        webURL: "https://zyrouge.github.io/texa/",
        author: "Zyrouge",
        navLinks: [
            ["API", "api/index", true],
            ["GitHub", "https://github.com/zyrouge/texa", true],
        ],
    },
});
