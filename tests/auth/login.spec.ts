/**
 * E2E 测试 1: 登录流程测试
 *
 * 这个测试展示了如何使用 Playwright 测试完整的用户登录流程
 *
 * 学习要点：
 * 1. 页面导航 (page.goto)
 * 2. 元素定位 (page.getByRole, page.getByLabel)
 * 3. 用户交互 (fill, click)
 * 4. 断言 (expect)
 * 5. 等待页面加载和重定向
 */

import { test, expect } from "@playwright/test";

test.describe("用户登录流程", () => {
    /**
     * 测试场景 1: 访问登录页面
     * 验证登录页面能够正常加载
     */
    test("应该能够访问登录页面", async ({ page }) => {
        // Arrange & Act: 导航到登录页面
        await page.goto("/login");

        // Assert: 验证页面标题或关键元素存在
        await expect(page).toHaveTitle(/WildVoice|Login/i);

        // 验证登录表单存在（通过查找邮箱输入框）
        const emailInput = page.getByLabel(/email/i);
        await expect(emailInput).toBeVisible();

        // 验证密码输入框存在
        const passwordInput = page.getByLabel(/password/i);
        await expect(passwordInput).toBeVisible();

        // 验证登录按钮存在
        const loginButton = page.getByRole("button", {
            name: /sign in|login/i,
        });
        await expect(loginButton).toBeVisible();
    });

    /**
     * 测试场景 2: 尝试登录（模拟场景）
     * 注意：这个测试可能会失败，因为我们没有真实的测试账号
     * 这里主要演示如何填写表单和提交
     */
    test("应该能够填写登录表单", async ({ page }) => {
        // Arrange: 导航到登录页面
        await page.goto("/login");

        // Act: 填写表单
        await page.getByLabel(/email/i).fill("test@example.com");
        await page.getByLabel(/password/i).fill("password123");

        // 可选：截图（用于调试）
        await page.screenshot({
            path: "tests/screenshots/login-form-filled.png",
        });

        // Assert: 验证输入的值
        const emailInput = page.getByLabel(/email/i);
        await expect(emailInput).toHaveValue("test@example.com");

        const passwordInput = page.getByLabel(/password/i);
        await expect(passwordInput).toHaveValue("password123");
    });

    /**
     * 测试场景 3: 验证登录按钮状态
     * 测试按钮在表单填写过程中的状态变化
     */
    test("登录按钮应该始终可见且可点击", async ({ page }) => {
        // Arrange
        await page.goto("/login");

        // Act: 获取登录按钮
        const loginButton = page.getByRole("button", {
            name: /sign in|login/i,
        });

        // Assert: 验证按钮可见
        await expect(loginButton).toBeVisible();

        // 验证按钮可以被点击（不是 disabled）
        await expect(loginButton).toBeEnabled();
    });

    /**
     * 测试场景 4: 检查注册链接
     * 验证用户可以从登录页面导航到注册页面
     */
    test("应该有导航到注册页面的链接", async ({ page }) => {
        // Arrange
        await page.goto("/login");

        // Act: 查找注册链接
        const signupLink = page.getByRole("link", {
            name: /sign up|register|create account/i,
        });

        // Assert: 验证链接存在
        await expect(signupLink).toBeVisible();

        // 点击链接
        await signupLink.click();

        // 验证已导航到注册页面
        await expect(page).toHaveURL(/signup/i);
    });
});

/**
 * 高级示例：测试实际登录流程（需要真实账号）
 *
 * 注意：这个测试需要以下条件才能运行：
 * 1. 数据库中存在测试用户
 * 2. 环境变量配置了测试账号信息
 *
 * 使用方式：
 * 1. 创建 .env.test 文件
 * 2. 添加 TEST_USER_EMAIL 和 TEST_USER_PASSWORD
 * 3. 运行测试前确保数据库有对应用户
 */
test.describe("完整登录流程（需要真实账号）", () => {
    // 跳过这个测试套件，因为需要真实账号
    test.skip("成功登录并重定向到 dashboard", async ({ page }) => {
        // Arrange: 从环境变量获取测试账号
        const testEmail = process.env.TEST_USER_EMAIL || "test@example.com";
        const testPassword = process.env.TEST_USER_PASSWORD || "password123";

        // Act: 导航到登录页面
        await page.goto("/login");

        // 填写表单
        await page.getByLabel(/email/i).fill(testEmail);
        await page.getByLabel(/password/i).fill(testPassword);

        // 点击登录按钮
        await page.getByRole("button", { name: /sign in|login/i }).click();

        // Assert: 等待重定向到 dashboard
        await page.waitForURL("/dashboard", { timeout: 10000 });

        // 验证已经登录（例如检查用户名显示）
        await expect(page.getByText(/welcome|dashboard/i)).toBeVisible();

        // 验证登出按钮存在
        const logoutButton = page.getByRole("button", {
            name: /logout|sign out/i,
        });
        await expect(logoutButton).toBeVisible();
    });
});

/**
 * 💡 Playwright 常用 API 速查：
 *
 * 1. 页面导航：
 *    - page.goto(url)
 *    - page.reload()
 *    - page.goBack()
 *
 * 2. 元素定位：
 *    - page.getByRole('button', { name: '登录' })
 *    - page.getByLabel('邮箱')
 *    - page.getByText('欢迎')
 *    - page.getByPlaceholder('请输入邮箱')
 *    - page.locator('css-selector')
 *
 * 3. 用户交互：
 *    - element.click()
 *    - element.fill('text')
 *    - element.press('Enter')
 *    - element.check() / element.uncheck()
 *
 * 4. 断言：
 *    - expect(element).toBeVisible()
 *    - expect(element).toHaveText('text')
 *    - expect(page).toHaveURL(/pattern/)
 *    - expect(element).toBeEnabled()
 *
 * 5. 等待：
 *    - page.waitForURL(url)
 *    - page.waitForSelector('selector')
 *    - page.waitForLoadState('networkidle')
 */
