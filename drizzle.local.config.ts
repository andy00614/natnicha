import { defineConfig } from "drizzle-kit";
import path from "path";
import * as fs from "node:fs";

export function getLocalD1DB() {
    try {
        const basePath = path.resolve(".wrangler");
        const dbFile = fs
            .readdirSync(basePath, { encoding: "utf-8", recursive: true })
            .find((f) => f.endsWith(".sqlite"));

        const url = path.resolve(basePath, dbFile || "");
        return url;
    } catch (error) {
        console.error("Error reading local D1 database file:", error);
    }
}

export default defineConfig({
    schema: "./src/db/schema.ts",
    out: "./src/drizzle",
    dialect: "sqlite",
    dbCredentials: {
        url: getLocalD1DB()!,
    },
});
