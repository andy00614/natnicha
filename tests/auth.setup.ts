/**
 * Playwright 认证 Setup
 *
 * 本地环境：使用预定义的 cookie 值
 * CI 环境：通过登录流程创建 session
 */

import { test as setup } from "@playwright/test";

const authFile = "playwright/.auth/user.json";

// CI 环境检测
const isCI = !!process.env.CI;

// 测试用户凭据
const TEST_USER = {
    email: process.env.E2E_TEST_EMAIL || "test@example.com",
    password: process.env.E2E_TEST_PASSWORD || "Test123456",
};

// 本地环境的固定 cookies
const LOCAL_COOKIES = [
    {
        name: "better-auth.session_token",
        value: "gywDeVhFBD0rwJBwEPIEgGQbkSMVGksQ.BxI%2BdIpqmEIZPviV%2BJ8EwU1nDDb5gDJ8sBYNSiFqTzM%3D",
        domain: "localhost",
        path: "/",
        httpOnly: true,
        secure: false,
        sameSite: "Lax" as const,
    },
    {
        name: "better-auth.state",
        value: "psL9gFfJiF52AT0zkRuvHsJ6GGMd4F3L.OgAbuw4RBGOwgAdjzsT6JXRiWQh6RiQGq5%2F0rOyD5gI%3D",
        domain: "localhost",
        path: "/",
        httpOnly: true,
        secure: false,
        sameSite: "Lax" as const,
    },
];

setup("authenticate", async ({ page, context }) => {
    if (isCI) {
        // CI 环境：通过登录流程
        console.log("🔐 CI: Setting up authentication via login...");

        await page.goto("/login");
        await page.waitForLoadState("networkidle");

        // 填写登录表单
        await page.getByLabel("Email").fill(TEST_USER.email);
        await page.getByLabel("Password").fill(TEST_USER.password);

        // 提交登录
        await page.getByRole("button", { name: /^Login$/i }).click();

        // 等待跳转到 todos 页面
        await page.waitForURL(/\/todos/, { timeout: 10000 });
        await page.waitForLoadState("networkidle");

        console.log("✅ CI: Login successful!");
    } else {
        // 本地环境：使用固定 cookies
        console.log("🔐 Local: Setting up authentication with cookies...");

        await context.addCookies(LOCAL_COOKIES);

        // 访问页面验证 cookies
        await page.goto("/todos");
        await page.waitForLoadState("networkidle");

        if (page.url().includes("/login")) {
            throw new Error(
                "❌ Authentication failed - cookies may be expired",
            );
        }

        console.log("✅ Local: Authentication successful with cookies!");
    }

    console.log("Current URL:", page.url());

    // 保存认证状态到文件
    await context.storageState({ path: authFile });

    console.log(`💾 Saved auth state to ${authFile}`);
});
