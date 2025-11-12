#!/usr/bin/env node

const { existsSync, readFileSync } = require("node:fs");
const { spawnSync } = require("node:child_process");

const DEV_VARS_FILE = ".dev.vars";
const REQUIRED_SECRETS = [
    "CLOUDFLARE_API_TOKEN",
    "CLOUDFLARE_ACCOUNT_ID",
    "BETTER_AUTH_SECRET",
    "GOOGLE_CLIENT_ID",
    "GOOGLE_CLIENT_SECRET",
    "CLOUDFLARE_R2_URL",
];
const REPO_NAME = process.env.GITHUB_REPOSITORY || "andy00614/natnicha";

const parseDevVars = () => {
    if (!existsSync(DEV_VARS_FILE)) {
        throw new Error(
            `Missing ${DEV_VARS_FILE}. Run cp .dev.vars.example .dev.vars to create it.`,
        );
    }

    const records = {};
    const content = readFileSync(DEV_VARS_FILE, "utf-8");

    for (const rawLine of content.split("\n")) {
        const line = rawLine.trim();
        if (!line || line.startsWith("#")) continue;

        const match = line.match(/^([^=]+)=(.*)$/);
        if (!match) continue;

        const [, key, value] = match;
        records[key.trim()] = value.trim();
    }

    return records;
};

const ensureGitHubCli = () => {
    const result = spawnSync("gh", ["--version"], {
        stdio: ["ignore", "pipe", "pipe"],
    });

    if (result.error || result.status !== 0) {
        const message =
            result.stderr?.toString().trim() || "GitHub CLI not available";
        throw new Error(`${message}. Install it from https://cli.github.com/`);
    }
};

const syncSecret = (key, value) => {
    const result = spawnSync(
        "gh",
        ["secret", "set", key, "--repo", REPO_NAME],
        {
            input: `${value}`,
            stdio: ["pipe", "inherit", "inherit"],
            encoding: "utf-8",
        },
    );

    if (result.error || result.status !== 0) {
        throw new Error(`Failed to sync ${key}`);
    }
};

const main = () => {
    console.log("🐙 Syncing GitHub repository secrets...");
    ensureGitHubCli();
    const secrets = parseDevVars();

    const missing = REQUIRED_SECRETS.filter((key) => !secrets[key]);
    if (missing.length) {
        throw new Error(
            `Missing values for: ${missing.join(", ")}. Update ${DEV_VARS_FILE} first.`,
        );
    }

    for (const key of REQUIRED_SECRETS) {
        process.stdout.write(`→ ${key}... `);
        syncSecret(key, secrets[key]);
        console.log("done");
    }

    console.log(`✅ GitHub secrets synced to ${REPO_NAME}`);
};

try {
    main();
} catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`❌ ${message}`);
    process.exit(1);
}
