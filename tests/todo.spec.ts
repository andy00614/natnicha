/**
 * Todo 应用 E2E 测试
 *
 * 使用 Playwright 测试完整用户流程
 * 认证状态通过 auth.setup.ts 预先配置
 */

import { test, expect } from '@playwright/test';

test.describe('Todo Application', () => {
  // 使用时间戳确保每次测试的数据唯一
  const timestamp = Date.now();

  test.beforeEach(async ({ page }) => {
    // 访问 Todos 页面（已通过 storageState 自动认证）
    await page.goto('/todos');

    // 等待页面加载完成
    await page.waitForLoadState('networkidle');
  });

  test('应该创建新 Todo', async ({ page }) => {
    const todoTitle = `Buy groceries ${timestamp}`;

    // 填写表单 (使用 label 定位)
    await page.getByLabel('Title').fill(todoTitle);
    await page.getByLabel('Description').fill('Milk, eggs, bread');

    // Priority 使用 Select 组件，需要点击打开下拉菜单
    await page.getByRole('combobox', { name: /priority/i }).click();
    await page.getByRole('option', { name: /high/i }).click();

    // 提交
    await page.getByRole('button', { name: /add todo/i }).click();

    // 等待 Todo 创建成功
    await page.waitForTimeout(500);

    // 验证 Todo 出现在列表中 - 只验证标题唯一
    await expect(page.getByText(todoTitle)).toBeVisible();
  });

  test('应该切换 Todo 完成状态', async ({ page }) => {
    const toggleTitle = `Test Todo For Toggle ${timestamp}`;

    // 创建一个 Todo
    await page.getByLabel('Title').fill(toggleTitle);
    await page.getByRole('button', { name: /add todo/i }).click();

    // 等待 Todo 出现
    await page.waitForTimeout(1000);

    // 找到最后一个 checkbox (刚创建的) 并点击
    const checkbox = page.getByRole('checkbox').last();
    await checkbox.click();

    // 等待更新完成并验证文字有删除线
    await page.waitForTimeout(1000);

    // 验证标题文字有 line-through 类
    const todoTitleElement = page.locator('h3', { hasText: toggleTitle });
    await expect(todoTitleElement).toHaveClass(/line-through/);
  });

  test('应该筛选 Todos', async ({ page }) => {
    const activeTitle = `Active Todo ${timestamp}`;
    const completedTitle = `Completed Todo ${timestamp}`;

    // 创建两个 Todos
    await page.getByLabel('Title').fill(activeTitle);
    await page.getByRole('button', { name: /add todo/i }).click();
    await page.waitForTimeout(500);

    await page.getByLabel('Title').fill(completedTitle);
    await page.getByRole('button', { name: /add todo/i }).click();
    await page.waitForTimeout(500);

    // 完成第二个 (找到对应的 checkbox)
    const checkboxes = page.getByRole('checkbox');
    await checkboxes.last().click();
    await page.waitForTimeout(500);

    // 点击 "Active" 筛选
    await page.getByRole('button', { name: /^Active$/i }).click();
    await page.waitForTimeout(500);

    // 验证只显示未完成的
    await expect(page.getByText(activeTitle)).toBeVisible();
    await expect(page.getByText(completedTitle)).not.toBeVisible();
  });

  test('应该删除 Todo', async ({ page }) => {
    const deleteTitle = `To be deleted ${timestamp}`;

    // 创建一个 Todo
    await page.getByLabel('Title').fill(deleteTitle);
    await page.getByRole('button', { name: /add todo/i }).click();
    await page.waitForTimeout(1000);

    // 监听 confirm 对话框
    page.on('dialog', dialog => dialog.accept());

    // 找到包含该标题的 h3，然后找到最近的删除按钮
    const todoHeading = page.locator('h3', { hasText: deleteTitle });
    const deleteButton = todoHeading.locator('..').locator('..').getByRole('button', { name: /delete/i });
    await deleteButton.click();

    // 等待操作完成
    await page.waitForTimeout(1000);

    // 验证 Todo 消失
    await expect(page.getByText(deleteTitle)).not.toBeVisible();
  });
});
