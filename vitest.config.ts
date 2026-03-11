import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
    test: {
        environment: "node",
        alias: {
            "#config": path.resolve(__dirname, "./src/config"),
            "#postgres": path.resolve(__dirname, "./src/postgres"),
            "#services": path.resolve(__dirname, "./src/services"),
            "#types": path.resolve(__dirname, "./src/types"),
            "#utils": path.resolve(__dirname, "./src/utils"),
        },
    },
});
