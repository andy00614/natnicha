import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright E2E 测试配置
 * 用于测试完整的用户交互流程（登录、表单提交、页面导航等）
 *
 * 文档: https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
    // 测试文件目录
    testDir: "./tests",

    // 每个测试的最大执行时间（30秒）
    timeout: 30 * 1000,

    // 失败时自动重试次数
    retries: process.env.CI ? 2 : 0,

    // 并行执行的 worker 数量
    workers: process.env.CI ? 1 : undefined,

    // 测试报告配置
    reporter: [
        ["html", { outputFolder: "playwright-report" }], // HTML 报告
        ["list"], // 控制台输出
    ],

    // 全局配置
    use: {
        // 每个测试的基础 URL
        baseURL: "http://localhost:3000",

        // 浏览器行为配置
        headless: true, // 无头模式（CI 环境推荐）
        viewport: { width: 1280, height: 720 },
        ignoreHTTPSErrors: true,

        // 截图和视频
        screenshot: "only-on-failure", // 失败时截图
        video: "retain-on-failure", // 失败时保留视频

        // 追踪（调试用）
        trace: "on-first-retry", // 第一次重试时启用追踪
    },

    // 测试项目（不同浏览器）
    projects: [
        // Setup project - 在所有测试之前运行
        {
            name: "setup",
            testMatch: /.*\.setup\.ts/,
        },
        // Chromium 测试 - 依赖 setup 项目
        {
            name: "chromium",
            use: {
                ...devices["Desktop Chrome"],
                // 使用保存的认证状态
                storageState: "playwright/.auth/user.json",
            },
            dependencies: ["setup"],
        },
        // 取消注释以添加更多浏览器
        // {
        //     name: "firefox",
        //     use: {
        //         ...devices["Desktop Firefox"],
        //         storageState: "playwright/.auth/user.json",
        //     },
        //     dependencies: ["setup"],
        // },
        // {
        //     name: "webkit",
        //     use: {
        //         ...devices["Desktop Safari"],
        //         storageState: "playwright/.auth/user.json",
        //     },
        //     dependencies: ["setup"],
        // },
    ],

    // 本地开发服务器配置
    webServer: {
        command: "pnpm dev", // 启动 Next.js 开发服务器
        url: "http://localhost:3000",
        reuseExistingServer: !process.env.CI, // 本地开发时复用已存在的服务器
        timeout: 120 * 1000, // 服务器启动超时时间（2分钟）
    },
});
