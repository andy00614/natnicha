import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
    plugins: [react()],
    test: {
        // 使用 happy-dom 作为测试环境（轻量级，比 jsdom 快）
        environment: "happy-dom",

        // 自动导入测试 API（describe, it, expect 等）
        globals: true,

        // 设置文件
        setupFiles: ["./vitest.setup.ts"],

        // 包含的测试文件模式
        include: ["**/*.{test,spec}.{ts,tsx}"],

        // 排除的文件
        exclude: [
            "node_modules",
            ".next",
            ".open-next",
            "dist",
            "coverage",
            "tests/**/*", // Playwright E2E 测试
        ],

        // 覆盖率配置
        coverage: {
            provider: "v8",
            reporter: ["text", "json", "html"],
            include: ["src/**/*.{ts,tsx}"],
            exclude: [
                "src/**/*.d.ts",
                "src/**/*.config.{ts,tsx}",
                "src/**/*.test.{ts,tsx}",
                "src/**/*.spec.{ts,tsx}",
                "src/test-typescript-errors.ts",
            ],
        },
    },
    resolve: {
        // 支持 @/ 路径别名（与 tsconfig.json 保持一致）
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
});
