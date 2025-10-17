# ClearGitHub 产品文档

## 📋 产品概述

**ClearGitHub** 是一个智能 GitHub 仓库清理工具,帮助开发者批量管理和删除无用的仓库。

**核心价值主张**: AI 分析 + 批量操作 = 高效仓库管理

---

## 🎯 核心功能 (MVP)

### 1. GitHub 账号连接
- 用户通过 GitHub OAuth 登录
- 授权读取仓库列表和删除权限

### 2. 仓库列表展示
- 显示用户所有仓库
- 展示关键信息:
  - 仓库名称
  - 最后更新时间
  - Stars / Forks 数量
  - 是否有 README
  - Commit 数量

### 3. AI 智能分析
- 分析每个仓库的价值
- 给出建议操作: **删除** / **保留** / **归档**
- 提供删除理由:
  - "6个月无更新 + 无文档"
  - "疑似测试项目 (仅3次提交)"
  - "Fork 的项目且无修改"

### 4. 手动筛选
- 用户可勾选要删除的仓库
- 查看 AI 建议但自主决策
- 批量选择功能

### 5. 批量删除
- 二次确认弹窗 (防误删)
- 批量调用 GitHub API 删除
- 显示删除进度和结果

---

## 🔄 用户流程 (User Flow)

```
1. 登录页面
   ↓
   [GitHub OAuth 授权]
   ↓
2. 仓库列表页
   ├─ 显示所有仓库 (卡片形式)
   ├─ AI 分析标签 (❌删除 / ⚠️谨慎 / ✅保留)
   ├─ 点击查看详细理由
   └─ 勾选要删除的仓库
   ↓
3. 批量删除确认
   ├─ 显示即将删除的仓库数量
   ├─ 警告: "删除后90天内可恢复"
   └─ 输入 "DELETE" 二次确认
   ↓
4. 执行删除
   ├─ 进度条显示删除状态
   ├─ 显示成功/失败的仓库
   └─ 完成后返回列表页
```

---

## 📱 页面结构

### 1. 登录页 (`/`)
- GitHub 登录按钮
- 产品介绍文案

### 2. 仓库列表页 (`/dashboard`)
- 顶部: 用户信息 + 退出登录
- 搜索/筛选栏 (按状态筛选)
- 仓库卡片网格:
  ```
  ┌──────────────────────────────────┐
  │ [❌] repo-name                   │
  │ ⭐ 0  🍴 0  📝 无README          │
  │ 最后更新: 2023-05-12             │
  │                                  │
  │ AI 建议: 删除                    │
  │ 理由: 8个月无更新,疑似测试项目   │
  └──────────────────────────────────┘
  ```
- 底部操作栏:
  - 已选中 X 个仓库
  - [批量删除] 按钮

### 3. 确认删除弹窗
- 列出即将删除的仓库
- 输入框: 输入 "DELETE" 确认
- [取消] [确认删除] 按钮

---

## 🗄️ 数据库设计 (MVP)

### users 表
- 已存在 (Better Auth 自动创建)

### repos 表 (缓存 GitHub 数据)
```sql
CREATE TABLE repos (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,               -- 仓库名称
  full_name TEXT NOT NULL,          -- owner/repo
  updated_at INTEGER NOT NULL,      -- 最后更新时间
  stars INTEGER DEFAULT 0,
  forks INTEGER DEFAULT 0,
  commit_count INTEGER DEFAULT 0,
  has_readme BOOLEAN DEFAULT 0,
  is_fork BOOLEAN DEFAULT 0,
  ai_suggestion TEXT,               -- 'delete' | 'keep' | 'archive'
  ai_reason TEXT,                   -- AI 建议理由
  analyzed_at INTEGER,              -- AI 分析时间
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### deletion_logs 表 (删除记录)
```sql
CREATE TABLE deletion_logs (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  repo_name TEXT NOT NULL,
  deleted_at INTEGER NOT NULL,
  backup_data TEXT,                 -- JSON 备份仓库元数据
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

---

## 🔐 GitHub API 权限

需要的 OAuth Scopes:
- `repo` - 读取和删除仓库
- `read:user` - 读取用户信息

---

## 🚀 MVP 开发任务

### Phase 1: GitHub 认证 (1天)
- [ ] 配置 GitHub OAuth App
- [ ] 实现登录/登出流程
- [ ] 存储 GitHub access token

### Phase 2: 仓库数据获取 (1天)
- [ ] 调用 GitHub API 获取仓库列表
- [ ] 存储到 D1 数据库
- [ ] 展示仓库列表 UI

### Phase 3: AI 分析功能 (2天)
- [ ] 集成 Vercel AI SDK
- [ ] 编写分析 prompt
- [ ] 批量分析仓库
- [ ] 显示 AI 建议标签

### Phase 4: 批量删除功能 (1天)
- [ ] 实现多选功能
- [ ] 二次确认弹窗
- [ ] 调用 GitHub DELETE API
- [ ] 显示删除进度

### Phase 5: 优化和测试 (1天)
- [ ] 错误处理 (API 限流等)
- [ ] 备份删除记录到数据库
- [ ] 端到端测试

**总计**: 6天完成 MVP

---

## 📚 技术栈

- **前端**: Next.js 15 + React 19 + Tailwind CSS
- **后端**: Cloudflare Workers + D1 数据库
- **认证**: Better Auth (GitHub OAuth)
- **AI**: Vercel AI SDK + OpenAI/Anthropic
- **API**: GitHub REST API v3

---

_最后更新: 2025-10-17_
