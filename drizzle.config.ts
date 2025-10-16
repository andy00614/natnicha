/** biome-ignore-all lint/style/noNonNullAssertion: Ignore for this file */

import { readFileSync } from "node:fs";
import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

// Load environment variables from .dev.vars for drizzle studio
config({ path: ".dev.vars" });

function stripJsonComments(source: string) {
    let inString = false;
    let result = "";
    for (let i = 0; i < source.length; i++) {
        const char = source[i];
        const next = source[i + 1];

        if (!inString && char === "/" && next === "/") {
            while (i < source.length && source[i] !== "\n") {
                i++;
            }
            result += "\n";
            continue;
        }

        if (!inString && char === "/" && next === "*") {
            i += 2;
            while (i < source.length) {
                if (source[i] === "*" && source[i + 1] === "/") {
                    i++;
                    break;
                }
                i++;
            }
            continue;
        }

        if (char === '"' && source[i - 1] !== "\\") {
            inString = !inString;
        }

        result += char;
    }
    return result;
}

function getD1DatabaseId() {
    const explicit = process.env.CLOUDFLARE_D1_DATABASE_ID;
    if (explicit) {
        return explicit;
    }

    const rawConfig = readFileSync("wrangler.jsonc", "utf-8");
    const parsed = JSON.parse(stripJsonComments(rawConfig));
    const entry = parsed.d1_databases?.find(
        (database: { binding?: string }) => database?.binding === "DB",
    );

    if (!entry?.database_id) {
        throw new Error(
            "Unable to resolve D1 database_id. Set CLOUDFLARE_D1_DATABASE_ID or update wrangler.jsonc.",
        );
    }

    return entry.database_id as string;
}

console.log("Using D1 Database ID:", getD1DatabaseId());

export default defineConfig({
    schema: "./src/db/schema.ts",
    out: "./src/drizzle",
    dialect: "sqlite",
    driver: "d1-http",
    dbCredentials: {
        accountId: process.env.CLOUDFLARE_ACCOUNT_ID!,
        databaseId: getD1DatabaseId(),
        token: process.env.CLOUDFLARE_API_TOKEN!,
    },
});
