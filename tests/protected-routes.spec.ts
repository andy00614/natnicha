/**
 * E2E 测试 3: 受保护路由测试
 *
 * 这个测试展示了如何测试应用的认证和授权逻辑
 *
 * 学习要点：
 * 1. 测试未登录用户的重定向
 * 2. 测试登录后的访问权限
 * 3. 测试页面间导航
 * 4. 使用 Playwright 的存储状态（模拟已登录用户）
 */

import { test, expect } from "@playwright/test";

test.describe("受保护路由 - 未登录用户", () => {
    /**
     * 测试场景 1: 访问根路径
     * 未登录用户访问首页应该被重定向到登录页面
     */
    test("访问根路径应该重定向到登录页面", async ({ page }) => {
        // Act: 导航到根路径
        await page.goto("/");

        // Assert: 验证被重定向到登录页面
        // 使用正则表达式匹配，因为 URL 可能包含查询参数
        await expect(page).toHaveURL(/\/login/, { timeout: 5000 });
    });

    /**
     * 测试场景 2: 直接访问 dashboard
     * 未登录用户尝试访问 dashboard 应该被重定向
     */
    test("未登录访问 dashboard 应该重定向到登录页面", async ({ page }) => {
        // Act: 尝试直接访问 dashboard
        await page.goto("/dashboard");

        // Assert: 应该被重定向到登录页面
        await expect(page).toHaveURL(/\/login/, { timeout: 5000 });

        // 可选：验证页面显示了登录表单
        await expect(page.getByLabel(/email/i)).toBeVisible();
    });

    /**
     * 测试场景 3: 访问其他受保护的路由
     * 测试应用中的其他受保护页面
     */
    test("访问受保护的路由应该重定向", async ({ page }) => {
        // 这里列出你的应用中可能存在的其他受保护路由
        const protectedRoutes = [
            "/dashboard",
            "/dashboard/voices",
            "/dashboard/settings",
            "/profile",
        ];

        for (const route of protectedRoutes) {
            // Act: 尝试访问每个受保护路由
            await page.goto(route);

            // Assert: 应该被重定向到登录页面或显示401错误
            const url = page.url();
            const isRedirectedToLogin = url.includes("/login");
            const is404 = await page
                .locator("text=/404|not found/i")
                .isVisible()
                .catch(() => false);

            // 验证要么重定向到登录，要么是404（路由不存在）
            expect(isRedirectedToLogin || is404).toBeTruthy();
        }
    });
});

test.describe("公开页面访问", () => {
    /**
     * 测试场景 4: 公开页面应该可以访问
     * 某些页面（如登录、注册）应该对所有人开放
     */
    test("登录页面应该可以公开访问", async ({ page }) => {
        // Act
        await page.goto("/login");

        // Assert: 页面应该正常加载，不会重定向
        await expect(page).toHaveURL(/\/login/);
        await expect(page.getByLabel(/email/i)).toBeVisible();
    });

    test("注册页面应该可以公开访问", async ({ page }) => {
        // Act
        await page.goto("/signup");

        // Assert
        await expect(page).toHaveURL(/\/signup/);
        await expect(page.getByLabel(/email/i)).toBeVisible();
    });
});

/**
 * 高级测试：模拟已登录用户
 *
 * 注意：这些测试需要先创建登录状态
 * 在实际项目中，你可能需要：
 * 1. 使用 test.use({ storageState: 'auth.json' })
 * 2. 或在 beforeAll 中执行登录并保存状态
 */
test.describe("受保护路由 - 已登录用户", () => {
    // 跳过这个测试套件，因为需要真实的登录状态
    test.skip("已登录用户应该能访问 dashboard", async ({ page }) => {
        // 假设已经通过某种方式设置了登录状态
        // 例如：通过 API 登录并保存 cookies

        // Act: 访问 dashboard
        await page.goto("/dashboard");

        // Assert: 应该能够成功访问
        await expect(page).toHaveURL(/\/dashboard/);

        // 验证页面显示了 dashboard 内容（不是登录表单）
        await expect(page.getByText(/dashboard|welcome|欢迎/i)).toBeVisible();

        // 验证存在登出按钮
        await expect(
            page.getByRole("button", { name: /logout|sign out/i }),
        ).toBeVisible();
    });

    test.skip("已登录用户访问登录页面应该重定向到 dashboard", async ({
        page,
    }) => {
        // 某些应用会将已登录用户从登录页面重定向到 dashboard
        await page.goto("/login");

        // 可能会重定向到 dashboard
        // 这取决于你的应用逻辑
        const url = page.url();
        expect(url).toMatch(/\/(login|dashboard)/);
    });
});

/**
 * 导航测试
 */
test.describe("页面间导航", () => {
    test("从登录页面导航到注册页面", async ({ page }) => {
        // Arrange: 访问登录页面
        await page.goto("/login");

        // Act: 点击"注册"链接
        const signupLink = page.getByRole("link", {
            name: /sign up|register|create.*account/i,
        });

        if (await signupLink.isVisible().catch(() => false)) {
            await signupLink.click();

            // Assert: 验证已导航到注册页面
            await expect(page).toHaveURL(/\/signup/);
        } else {
            test.skip();
        }
    });

    test("从注册页面导航回登录页面", async ({ page }) => {
        // Arrange
        await page.goto("/signup");

        // Act: 查找"已有账号？登录"链接
        const loginLink = page.getByRole("link", {
            name: /sign in|login|already.*account/i,
        });

        if (await loginLink.isVisible().catch(() => false)) {
            await loginLink.click();

            // Assert
            await expect(page).toHaveURL(/\/login/);
        } else {
            test.skip();
        }
    });
});

/**
 * 💡 测试认证和授权的最佳实践：
 *
 * 1. 测试所有访问控制场景：
 *    - 未登录用户访问受保护页面
 *    - 已登录用户访问公开页面
 *    - 不同角色的用户访问权限
 *
 * 2. 测试重定向逻辑：
 *    - 重定向目标是否正确
 *    - 重定向后是否保留原始 URL（用于登录后返回）
 *
 * 3. 使用存储状态：
 *    - 保存登录状态以加速测试
 *    - 为不同用户角色创建不同的状态文件
 *
 * 4. 测试会话过期：
 *    - 会话过期后的行为
 *    - 自动登出逻辑
 *
 * 5. 测试跨页面状态：
 *    - 登录状态在页面刷新后是否保持
 *    - 多标签页的登录状态同步
 *
 * ## 如何创建登录状态（高级用法）
 *
 * ```typescript
 * // setup/auth.setup.ts
 * import { test as setup } from '@playwright/test';
 *
 * setup('authenticate', async ({ page }) => {
 *   await page.goto('/login');
 *   await page.getByLabel('email').fill('test@example.com');
 *   await page.getByLabel('password').fill('password123');
 *   await page.getByRole('button', { name: 'login' }).click();
 *   await page.waitForURL('/dashboard');
 *
 *   // 保存登录状态
 *   await page.context().storageState({ path: 'auth.json' });
 * });
 * ```
 *
 * 然后在测试中使用：
 * ```typescript
 * test.use({ storageState: 'auth.json' });
 * ```
 */
