/**
 * E2E 测试认证辅助函数
 */

import type { Page } from "@playwright/test";

export interface TestUser {
    email: string;
    password: string;
    username: string;
}

// 测试用户（需要在数据库中存在或通过注册创建）
export const testUser: TestUser = {
    email: "test@example.com",
    password: "Test123456",
    username: "testuser",
};

/**
 * 登录测试用户
 */
export async function loginTestUser(page: Page) {
    // 访问登录页面
    await page.goto("/login");
    await page.waitForLoadState("networkidle");

    // 填写登录表单
    await page.getByLabel("Email").fill(testUser.email);
    await page.getByLabel("Password").fill(testUser.password);

    // 提交表单
    await page.getByRole("button", { name: /^Login$/i }).click();

    // 等待跳转到主页或 dashboard
    await page.waitForURL(/\/(dashboard|todos)/, { timeout: 10000 });

    // 等待网络请求完成，确保 cookies 已设置
    await page.waitForLoadState("networkidle");

    // 额外等待确保session已建立
    await page.waitForTimeout(1000);
}

/**
 * 注册测试用户（如果不存在）
 */
export async function registerTestUser(page: Page) {
    await page.goto("/signup");
    await page.waitForLoadState("networkidle");

    await page.getByLabel("Username").fill(testUser.username);
    await page.getByLabel("Email").fill(testUser.email);
    await page.getByLabel("Password").fill(testUser.password);

    await page.getByRole("button", { name: /sign up/i }).click();

    // 等待注册成功
    await page.waitForURL(/\/(dashboard|todos)/, { timeout: 10000 });

    // 等待网络请求完成，确保 cookies 已设置
    await page.waitForLoadState("networkidle");

    // 额外等待确保session已建立
    await page.waitForTimeout(1000);
}

/**
 * 确保用户已登录（如果未登录则登录）
 */
export async function ensureAuthenticated(page: Page) {
    // 访问受保护的页面
    await page.goto("/todos", { waitUntil: "networkidle" });

    // 检查是否被重定向到登录页面
    const currentUrl = page.url();

    if (currentUrl.includes("/login") || currentUrl.includes("/signup")) {
        // 未登录，尝试登录
        try {
            await loginTestUser(page);
        } catch (loginError) {
            // 登录失败，可能用户不存在，尝试注册
            console.log("Login failed, trying to register:", loginError);
            try {
                await registerTestUser(page);
            } catch (registerError) {
                console.log("Registration failed:", registerError);
                // 注册失败，最后再尝试登录一次
                await loginTestUser(page);
            }
        }

        // 登录/注册成功后，再次导航到 todos 页面
        await page.goto("/todos", { waitUntil: "networkidle" });
    }

    // 验证已经在 todos 页面
    await page.waitForURL("/todos", { timeout: 5000 });
}
