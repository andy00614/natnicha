/**
 * Playwright 认证 Setup
 *
 * 使用预定义的 cookie 值来设置认证状态
 * 这些 cookie 值来自真实的登录会话
 */

import { test as setup } from '@playwright/test';

const authFile = 'playwright/.auth/user.json';

setup('authenticate', async ({ page, context }) => {
  console.log('🔐 Setting up authentication with cookies...');

  // 直接添加认证 cookies
  await context.addCookies([
    {
      name: 'better-auth.session_token',
      value: 'gywDeVhFBD0rwJBwEPIEgGQbkSMVGksQ.BxI%2BdIpqmEIZPviV%2BJ8EwU1nDDb5gDJ8sBYNSiFqTzM%3D',
      domain: 'localhost',
      path: '/',
      httpOnly: true,
      secure: false,
      sameSite: 'Lax',
    },
    {
      name: 'better-auth.state',
      value: 'psL9gFfJiF52AT0zkRuvHsJ6GGMd4F3L.OgAbuw4RBGOwgAdjzsT6JXRiWQh6RiQGq5%2F0rOyD5gI%3D',
      domain: 'localhost',
      path: '/',
      httpOnly: true,
      secure: false,
      sameSite: 'Lax',
    },
  ]);

  // 访问一个页面来验证 cookies 生效
  await page.goto('/todos');
  await page.waitForLoadState('networkidle');

  // 检查是否被重定向到登录页（如果是，说明 cookies 无效）
  if (page.url().includes('/login')) {
    throw new Error('❌ Authentication failed - cookies may be expired');
  }

  console.log('✅ Authentication successful with cookies!');
  console.log('Current URL:', page.url());

  // 保存认证状态到文件
  await context.storageState({ path: authFile });

  console.log(`💾 Saved auth state to ${authFile}`);
});
