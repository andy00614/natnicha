# 测试框架使用指南

本项目已配置完整的测试框架，包括单元测试（Vitest）和 E2E 测试（Playwright）。

---

## 📦 已安装的工具

| 工具 | 版本 | 用途 |
|------|------|------|
| **Vitest** | 4.0.8 | 单元测试和集成测试 |
| **Playwright** | 1.56.1 | 端到端（E2E）测试 |
| **@testing-library/react** | 16.3.0 | React 组件测试工具 |
| **@testing-library/jest-dom** | 6.9.1 | DOM 断言扩展 |
| **happy-dom** | 20.0.10 | 轻量级 DOM 环境 |

---

## 🚀 快速开始

### 运行所有单元测试
```bash
pnpm test          # 监视模式（开发推荐）
pnpm test:run      # 运行一次（CI/CD）
pnpm test:ui       # 打开 Vitest UI 界面
pnpm test:coverage # 生成测试覆盖率报告
```

### 运行 E2E 测试
```bash
pnpm test:e2e         # 运行所有 E2E 测试
pnpm test:e2e:ui      # 打开 Playwright UI
pnpm test:e2e:debug   # 调试模式
```

---

## 📁 项目结构

```
├── src/
│   ├── lib/
│   │   ├── utils.ts              # 工具函数
│   │   ├── utils.test.ts         # ✅ 单元测试
│   │   ├── api-response.ts
│   │   └── api-response.test.ts  # ✅ 单元测试
│   └── modules/
│       └── auth/
│           └── models/
│               ├── auth.model.ts
│               └── auth.model.test.ts  # ✅ 单元测试
├── tests/
│   ├── auth/
│   │   ├── login.spec.ts          # ✅ E2E 登录流程
│   │   └── validation.spec.ts     # ✅ E2E 表单验证
│   └── protected-routes.spec.ts   # ✅ E2E 路由保护
├── vitest.config.ts               # Vitest 配置
├── vitest.setup.ts                # Vitest 全局设置
└── playwright.config.ts           # Playwright 配置
```

---

## 📝 测试示例说明

### 1. **cn() 工具函数测试** ([src/lib/utils.test.ts](src/lib/utils.test.ts))

**测试内容**:
- ✅ 基本 class 合并
- ✅ 条件 class（对象语法）
- ✅ Tailwind class 冲突解决
- ✅ 处理 undefined 和 null
- ✅ 数组输入
- ✅ 实际使用案例（variant + size）

**学习要点**: 纯函数测试、AAA 模式（Arrange-Act-Assert）

### 2. **API Response 辅助函数测试** ([src/lib/api-response.test.ts](src/lib/api-response.test.ts))

**测试内容**:
- ✅ successResponse() 格式验证
- ✅ errorResponse() 格式验证
- ✅ HTTP 状态码处理
- ✅ 泛型类型推断
- ✅ 专用错误响应（401, 404, 500）

**学习要点**: 异步函数测试、Response 对象解析、TypeScript 泛型

### 3. **Zod Schema 验证测试** ([src/modules/auth/models/auth.model.test.ts](src/modules/auth/models/auth.model.test.ts))

**测试内容**:
- ✅ signInSchema 验证规则
- ✅ signUpSchema 验证规则
- ✅ 错误消息验证
- ✅ .parse() 抛出错误测试
- ✅ 边界条件测试

**学习要点**: 表单验证测试、Zod 错误对象处理、边界值测试

### 4. **登录流程 E2E 测试** ([tests/auth/login.spec.ts](tests/auth/login.spec.ts))

**测试内容**:
- ✅ 访问登录页面
- ✅ 填写登录表单
- ✅ 验证按钮状态
- ✅ 导航到注册页面

**学习要点**: 页面导航、元素定位、用户交互模拟

### 5. **表单验证 E2E 测试** ([tests/auth/validation.spec.ts](tests/auth/validation.spec.ts))

**测试内容**:
- ✅ 空表单提交
- ✅ 无效邮箱格式
- ✅ 密码长度验证
- ✅ 用户名验证

**学习要点**: 客户端验证测试、错误消息显示

### 6. **受保护路由 E2E 测试** ([tests/protected-routes.spec.ts](tests/protected-routes.spec.ts))

**测试内容**:
- ✅ 未登录用户重定向
- ✅ 公开页面访问
- ✅ 页面间导航
- ✅ 认证流程

**学习要点**: 路由保护测试、重定向验证、导航测试

---

## 🎯 测试覆盖率

当前覆盖的模块：
- ✅ `src/lib/utils.ts` - 工具函数（7 个测试）
- ✅ `src/lib/api-response.ts` - API 响应（14 个测试）
- ✅ `src/modules/auth/models/auth.model.ts` - 表单验证（18 个测试）
- ✅ E2E 测试（登录、验证、路由保护）

**总计**: **39 个单元测试** + **多个 E2E 测试场景**

---

## 💻 如何编写新测试

### 单元测试示例

```typescript
// src/lib/my-function.test.ts
import { describe, it, expect } from 'vitest';
import { myFunction } from './my-function';

describe('myFunction', () => {
  it('应该返回正确的结果', () => {
    // Arrange: 准备测试数据
    const input = 'test';

    // Act: 执行被测试的函数
    const result = myFunction(input);

    // Assert: 验证结果
    expect(result).toBe('expected output');
  });
});
```

### E2E 测试示例

```typescript
// tests/my-feature.spec.ts
import { test, expect } from '@playwright/test';

test('应该能够完成某个流程', async ({ page }) => {
  // 导航到页面
  await page.goto('/my-page');

  // 与页面交互
  await page.getByLabel('输入框').fill('测试内容');
  await page.getByRole('button', { name: '提交' }).click();

  // 验证结果
  await expect(page).toHaveURL('/success');
});
```

---

## 🔧 配置说明

### Vitest 配置 ([vitest.config.ts](vitest.config.ts))

```typescript
{
  environment: "happy-dom",    // 使用轻量级 DOM
  globals: true,               // 全局 API（describe, it, expect）
  setupFiles: ["./vitest.setup.ts"],
  coverage: {
    provider: "v8",
    include: ["src/**/*.{ts,tsx}"]
  }
}
```

### Playwright 配置 ([playwright.config.ts](playwright.config.ts))

```typescript
{
  baseURL: "http://localhost:3000",
  webServer: {
    command: "pnpm dev",       // 自动启动开发服务器
    reuseExistingServer: true
  },
  use: {
    screenshot: "only-on-failure",
    video: "retain-on-failure"
  }
}
```

---

## 🚦 CI/CD 集成

测试已集成到 GitHub Actions ([.github/workflows/deploy.yml](.github/workflows/deploy.yml)):

```yaml
- name: TypeScript type check
  run: pnpm type-check

- name: Lint code
  run: pnpm lint

- name: Run unit tests
  run: pnpm test:run         # ✅ 新增

- name: Build application
  run: pnpm run build:cf
```

**质量门禁流程**:
1. ✅ TypeScript 类型检查
2. ✅ Biome 代码格式化和 Lint
3. ✅ **单元测试**（新增）
4. ✅ 构建应用
5. ✅ 部署

---

## 📚 进一步学习

### Vitest 文档
- 官网: https://vitest.dev
- API 参考: https://vitest.dev/api/
- 配置: https://vitest.dev/config/

### Playwright 文档
- 官网: https://playwright.dev
- 最佳实践: https://playwright.dev/docs/best-practices
- 调试: https://playwright.dev/docs/debug

### Testing Library
- React Testing Library: https://testing-library.com/react
- Jest DOM Matchers: https://github.com/testing-library/jest-dom

---

## 🐛 常见问题

### Q: 如何只运行特定的测试？

```bash
# Vitest - 运行特定文件
pnpm test utils.test.ts

# Vitest - 运行特定测试（使用 it.only）
it.only('这个测试会被单独运行', () => {
  // ...
});

# Playwright - 运行特定文件
pnpm test:e2e tests/auth/login.spec.ts

# Playwright - 运行特定测试
test.only('只运行这个测试', async ({ page }) => {
  // ...
});
```

### Q: 如何查看测试覆盖率？

```bash
pnpm test:coverage
# 打开 coverage/index.html 查看详细报告
```

### Q: E2E 测试失败时如何调试？

```bash
# 方法 1: 使用 UI 模式
pnpm test:e2e:ui

# 方法 2: 使用调试模式
pnpm test:e2e:debug

# 方法 3: 查看失败截图和视频
# 位置: test-results/ 目录
```

### Q: 如何跳过某个测试？

```typescript
// Vitest
test.skip('暂时跳过这个测试', () => {
  // ...
});

// Playwright
test.skip('暂时跳过这个测试', async ({ page }) => {
  // ...
});
```

---

## ✅ 下一步建议

1. **增加测试覆盖率**
   - 为 Server Actions 编写集成测试
   - 为 React 组件编写测试
   - 测试边界条件和错误场景

2. **完善 E2E 测试**
   - 创建测试用户数据
   - 添加认证状态管理（`auth.json`）
   - 测试完整的用户流程

3. **性能优化**
   - 使用 `test.concurrent` 并行运行测试
   - 缓存 Playwright 浏览器
   - 优化 CI/CD 运行时间

4. **代码质量**
   - 设置最低测试覆盖率要求
   - 添加 pre-push hook 运行测试
   - 定期审查测试用例

---

**祝测试愉快！** 🎉

如有问题，请参考测试文件中的详细注释，或查阅官方文档。
