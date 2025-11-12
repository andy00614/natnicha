#!/bin/bash

# CI 环境测试用户设置脚本
# 用于在 GitHub Actions 中创建 E2E 测试用户

set -e

echo "🔧 Setting up E2E test user for CI..."

# 测试用户凭据
export E2E_TEST_EMAIL="e2e-test@example.com"
export E2E_TEST_PASSWORD="TestPassword123!"
export E2E_TEST_NAME="E2E Test User"

# 写入环境变量文件供 Playwright 使用
cat > .env.test << EOF
E2E_TEST_EMAIL=${E2E_TEST_EMAIL}
E2E_TEST_PASSWORD=${E2E_TEST_PASSWORD}
EOF

echo "✅ Test user credentials configured"
echo "📧 Email: ${E2E_TEST_EMAIL}"
echo "🔑 Password: ${E2E_TEST_PASSWORD}"

# 将环境变量导出到 GitHub Actions 环境
if [ -n "$GITHUB_ENV" ]; then
  echo "E2E_TEST_EMAIL=${E2E_TEST_EMAIL}" >> $GITHUB_ENV
  echo "E2E_TEST_PASSWORD=${E2E_TEST_PASSWORD}" >> $GITHUB_ENV
  echo "💾 Exported to GitHub Actions environment"
fi

echo "✅ E2E test user setup complete"
