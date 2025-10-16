# WildVoice Project - AI Assistant Instructions

> **Purpose**: This document serves as the comprehensive guide for AI assistants working on the WildVoice project. It establishes coding standards, architectural patterns, and workflow guardrails to maintain code quality and consistency.

---

## Table of Contents

0. [Golden Rules](#0-golden-rules)
1. [Project Overview](#1-project-overview)
2. [Technology Stack](#2-technology-stack)
3. [Project Structure](#3-project-structure)
4. [Coding Standards](#4-coding-standards)
5. [Type System Guidelines](#5-type-system-guidelines)
6. [UI & Styling Conventions](#6-ui--styling-conventions)
7. [Module Development Pattern](#7-module-development-pattern)
8. [Database & ORM Guidelines](#8-database--orm-guidelines)
9. [Authentication & Authorization](#9-authentication--authorization)
10. [API & Server Actions](#10-api--server-actions)
11. [File Operations & Storage](#11-file-operations--storage)
12. [Build & Deployment](#12-build--deployment)
13. [Testing Guidelines](#13-testing-guidelines)
14. [Common Pitfalls](#14-common-pitfalls)
15. [Development Workflow](#15-development-workflow)

---

## 0. Golden Rules

**These rules are NON-NEGOTIABLE. Always follow them.**

| ✅ You MAY | ❌ You MUST NOT |
|-----------|----------------|
| Ask the user for clarification when uncertain | Assume or guess technical requirements |
| Edit existing files to add functionality | Create new files unless absolutely necessary |
| Use semantic Tailwind tokens (`bg-muted`, `text-foreground`) | Hardcode color values in components |
| Reference Drizzle schema types via type inference | Create duplicate type definitions manually |
| Use Server Actions for data mutations | Default to API routes for simple operations |
| Follow existing patterns in `src/modules/auth/` | Invent new organizational structures |
| Read third-party library docs before using APIs | Use outdated or assumed API methods |
| Provide guidance and solutions when asked | Write code unless explicitly requested |
| Keep code concise and minimal | Over-engineer or add "nice-to-have" features |
| Use existing shadcn/ui components | Install additional UI libraries |

**Core Principles:**
- **Do what has been asked; nothing more, nothing less**
- **NEVER create documentation files (*.md) unless explicitly requested**
- **ALWAYS prefer editing existing files over creating new ones**
- **When in doubt, ASK the user rather than making assumptions**

---

## 1. Project Overview

**WildVoice** is a voice processing platform built for Cloudflare's edge infrastructure, providing Text-to-Speech (TTS), Speech-to-Text (STT), and Voice Cloning capabilities powered by FAL AI.

### Key Documentation
- **[product.md](product.md)**: Complete product specification, features, architecture, and roadmap
- **[PLAYBOOK.md](PLAYBOOK.md)**: Step-by-step deployment guide for Cloudflare
- **[README.md](README.md)**: Basic project overview

**⚠️ IMPORTANT**: Before starting any work, read [product.md](product.md) to understand the complete product vision and technical architecture.

### Current Development Phase

| Phase | Status | Features |
|-------|--------|----------|
| Phase 1 & 3 | ✅ Complete | Voice Library + TTS, R2 Storage, FAL AI Integration |
| Phase 2 | 🔄 In Progress | Voice Cloning, Dashboard UI Refinement |
| Phase 4 | 📋 Planned | Speech-to-Text (STT) |
| Phase 5 | 📋 Planned | Performance Optimization |

---

## 2. Technology Stack

### Frontend

```typescript
// Core Framework
Next.js: 15.4.6              // App Router with Server Components
React: 19.1.0                // Latest React with Server Actions

// UI & Styling
Radix UI: via shadcn/ui      // Accessible component primitives
Tailwind CSS: 4.x            // Utility-first CSS with theme system
Lucide React: 0.544.0        // Icon library

// Forms & Validation
React Hook Form: 7.62.0      // Form state management
Zod: 4.1.8                   // Runtime type validation
@hookform/resolvers: 5.2.1   // RHF + Zod integration

// Utilities
clsx: 2.1.1                  // Conditional classNames
tailwind-merge: 3.3.1        // Merge Tailwind classes
date-fns: 4.1.0              // Date manipulation
react-hot-toast: 2.6.0       // Toast notifications
```

### Backend & Runtime

```typescript
// Infrastructure
Cloudflare Workers           // Edge computing runtime
@opennextjs/cloudflare: 1.3.0 // Next.js adapter for Workers

// Database
Cloudflare D1                // Distributed SQLite database
Drizzle ORM: 0.44.5          // Type-safe ORM with SQLite
Drizzle Kit: 0.31.4          // Schema migrations tool

// Authentication
Better Auth: 1.3.9           // Auth library with social providers

// Storage
Cloudflare R2                // S3-compatible object storage
```

### AI & APIs

```typescript
// AI SDKs
@ai-sdk/fal: 1.0.15          // FAL AI integration (TTS, STT, Cloning)
@ai-sdk/openai: 2.0.42       // OpenAI integration
ai: 5.0.60                   // Vercel AI SDK core
```

### Development Tools

```bash
# Code Quality
@biomejs/biome: 2.2.4        # Fast formatter/linter (replaces ESLint + Prettier)

# CLI Tools
wrangler: 4.35.0             # Cloudflare Workers CLI
httpyac: 6.16.7              # HTTP testing

# Local Development
better-sqlite3: 12.2.0       # Local SQLite for D1 emulation
```

---

## 3. Project Structure

### Directory Overview

| Directory | Purpose | Status |
|-----------|---------|--------|
| `src/app/` | Next.js 15 App Router pages and layouts | ✅ Active |
| `src/modules/` | **Feature modules** (modular architecture) | ✅ Active |
| `src/components/ui/` | shadcn/ui components (12 components) | ✅ Active |
| `src/db/` | Drizzle ORM instance and schema exports | ✅ Active |
| `src/drizzle/` | Database migration SQL files | ✅ Active |
| `src/lib/` | Shared utilities (`cn()`, API helpers, R2) | ✅ Active |
| `src/constants/` | Global constants and validation rules | ✅ Active |
| `src/services/` | Business logic services | 🔄 In Progress |
| `public/` | Static assets | ✅ Active |
| `.open-next/` | OpenNext build output (auto-generated) | 🔧 Build |

### File Naming Conventions

```typescript
// Files use kebab-case
auth-utils.ts
signup-form.tsx
voice-library.action.ts

// Components use PascalCase
SignupForm.tsx
VoiceCard.tsx
AudioPlayer.tsx

// Route segments use Next.js conventions
page.tsx        // Route page
layout.tsx      // Route layout
route.ts        // API route
loading.tsx     // Loading UI
error.tsx       // Error boundary

// Special suffixes
*.action.ts     // Server actions ("use server")
*.model.ts      // Type definitions and Zod schemas
*.schema.ts     // Drizzle ORM table schemas
*.route.ts      // Route constants
*-utils.ts      // Utility functions
```

### Path Aliases

```typescript
// TypeScript paths configuration
import { Button } from "@/components/ui/button"
import { getCurrentUser } from "@/modules/auth/utils/auth-utils"
import { db } from "@/db"

// Maps to:
@/* -> ./src/*
```

---

## 4. Coding Standards

### TypeScript Configuration

**✅ [保留] Strict mode is ENABLED** — all code must be type-safe.

```typescript
// tsconfig.json key settings
{
  "compilerOptions": {
    "strict": true,                    // Enable all strict checks
    "moduleResolution": "bundler",     // Modern module resolution
    "esModuleInterop": true,
    "skipLibCheck": true,
    "noUncheckedIndexedAccess": true  // Safer array/object access
  }
}
```

### Naming Conventions

**✅ [保留并扩展]**

| Element | Convention | Example |
|---------|-----------|---------|
| Variables/Functions | camelCase | `getUserById`, `isAuthenticated` |
| Components | PascalCase | `LoginForm`, `VoiceCard` |
| Types/Interfaces | PascalCase | `User`, `ApiResponse<T>` |
| Constants | UPPER_SNAKE_CASE or camelCase | `MAX_FILE_SIZE`, `defaultVoice` |
| Files | kebab-case | `auth-utils.ts`, `voice-card.tsx` |
| Directories | kebab-case | `voice-library/`, `audio-player/` |

### Code Formatting

**⚠️ [新增] Use Biome for all formatting:**

```bash
# Format code before committing
pnpm lint

# Biome will auto-format:
# - Indentation: 2 spaces (not tabs)
# - Line width: 80 characters (soft limit)
# - Semicolons: Required
# - Quotes: Double quotes for strings
# - Trailing commas: ES5 style
```

### Error Handling Patterns

**⚠️ [新增]**

```typescript
// ✅ GOOD: Type-safe error handling
try {
  const result = await riskyOperation()
  return successResponse(result)
} catch (error) {
  console.error("Operation failed:", error)
  return errorResponse(
    error instanceof Error ? error.message : "Unknown error",
    500
  )
}

// ❌ BAD: Untyped error throwing
throw "Something went wrong"  // Don't throw strings

// ❌ BAD: Ignoring errors silently
try {
  await operation()
} catch {}  // Never catch without handling
```

### Async/Await Best Practices

**⚠️ [新增]**

```typescript
// ✅ GOOD: Parallel operations
const [user, posts] = await Promise.all([
  getUser(userId),
  getPosts(userId)
])

// ❌ BAD: Sequential when parallel possible
const user = await getUser(userId)   // Waits unnecessarily
const posts = await getPosts(userId)

// ✅ GOOD: Error handling in parallel
const results = await Promise.allSettled([
  operation1(),
  operation2()
])
```

---

## 5. Type System Guidelines

### Core Principle: Infer, Don't Duplicate

**✅ [保留并强化] ALWAYS use type inference from existing schemas.**

### Drizzle ORM Type Inference

**⚠️ [新增示例]**

```typescript
// ✅ GOOD: Infer from Drizzle schema
import { user } from "@/modules/auth/schemas/auth.schema"

type User = typeof user.$inferSelect        // For SELECT queries
type NewUser = typeof user.$inferInsert     // For INSERT operations
type UserUpdate = Partial<NewUser>          // For UPDATE operations

// ❌ BAD: Manual type duplication
interface User {  // DON'T DO THIS!
  id: string
  email: string
  name: string
  // ... duplicates schema definition
}
```

### Zod Schema Type Inference

**⚠️ [新增示例]**

```typescript
// Define Zod schema once
import { z } from "zod"

export const voiceCreateSchema = z.object({
  name: z.string().min(1).max(100),
  provider: z.enum(["fal", "openai"]),
  voiceId: z.string()
})

// ✅ Infer TypeScript type
export type VoiceCreate = z.infer<typeof voiceCreateSchema>

// Use in form validation
const form = useForm<VoiceCreate>({
  resolver: zodResolver(voiceCreateSchema)
})
```

### Third-Party Library Types

**⚠️ [新增]**

```typescript
// ✅ GOOD: Import from library
import type { Session, User } from "better-auth/types"
import type { NextRequest, NextResponse } from "next/server"

// ❌ BAD: Create your own version
interface MySession {  // Don't do this!
  user: { id: string, email: string }
  // ...
}
```

### Generic API Response Types

**⚠️ [新增示例]**

```typescript
// Defined in src/lib/api-response.ts
export type ApiResponse<T> = {
  success: boolean
  data?: T
  error?: string
  statusCode: number
}

// ✅ Usage example
export async function getVoices(): Promise<ApiResponse<Voice[]>> {
  try {
    const voices = await db.select().from(voicesTable)
    return successResponse(voices)
  } catch (error) {
    return errorResponse("Failed to fetch voices", 500)
  }
}
```

---

## 6. UI & Styling Conventions

### Design System: shadcn/ui + Tailwind CSS

**✅ [保留并扩展核心原则]**

#### Available Components (12 Total)

**⚠️ [新增组件清单]**

```typescript
// Installed shadcn/ui components
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Dialog, DialogTrigger, DialogContent } from "@/components/ui/dialog"
import { Form, FormField, FormItem, FormLabel } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectTrigger, SelectContent } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { AlertDialog } from "@/components/ui/alert-dialog"
import { Separator } from "@/components/ui/separator"
```

**❌ DO NOT install additional UI libraries without consulting the user.**

### Semantic Color Tokens

**✅ [保留] NEVER hardcode color values. Use semantic tokens:**

```tsx
// ✅ GOOD: Semantic tokens
<div className="bg-muted text-muted-foreground border-border">
  <Button variant="destructive">Delete</Button>
  <Badge variant="secondary">New</Badge>
</div>

// ❌ BAD: Hardcoded colors
<div className="bg-gray-100 text-gray-600 border-gray-300">
  <button className="bg-red-500">Delete</button>
</div>

// ❌ BAD: Hex/RGB colors
<div style={{ backgroundColor: "#f3f4f6", color: "#6b7280" }}>
```

### Available Semantic Tokens

**⚠️ [新增完整列表]**

```css
/* Theme colors (defined in globals.css) */
--background        /* Page background */
--foreground        /* Primary text */
--card              /* Card background */
--card-foreground   /* Card text */
--popover           /* Popover background */
--primary           /* Primary brand color */
--secondary         /* Secondary brand color */
--muted             /* Muted backgrounds */
--muted-foreground  /* Muted text */
--accent            /* Accent highlights */
--destructive       /* Error/danger states */
--border            /* Border colors */
--input             /* Input borders */
--ring              /* Focus rings */

/* Chart colors */
--chart-1, --chart-2, --chart-3, --chart-4, --chart-5
```

### Component Styling Utilities

**⚠️ [新增]**

```typescript
// src/lib/utils.ts - cn() utility
import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

// ✅ Use cn() to merge Tailwind classes safely
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Usage example
import { cn } from "@/lib/utils"

<div className={cn(
  "base-class",
  isActive && "active-class",
  className  // Allow prop override
)} />
```

### Dark Mode Support

**⚠️ [新增]**

```tsx
// Dark mode is automatic via CSS variables
// Uses .dark class selector

// Example: Color adapts automatically
<div className="bg-background text-foreground">
  This adapts to light/dark mode automatically
</div>

// Access dark mode class (if needed)
<html className="dark">  // Toggles entire theme
```

### Responsive Design Patterns

**⚠️ [新增]**

```tsx
// ✅ GOOD: Mobile-first responsive design
<div className="
  flex flex-col           /* Mobile: stack vertically */
  md:flex-row             /* Tablet+: horizontal */
  gap-4                   /* Consistent spacing */
  p-4 md:p-6 lg:p-8       /* Scale padding */
">
```

---

## 7. Module Development Pattern

**✅ [保留核心模式，扩展细节]**

### Standard Module Structure

```
src/modules/[feature-name]/
├── actions/
│   └── [feature].action.ts       # Server actions ("use server")
├── components/
│   ├── [component-1].tsx
│   └── [component-2].tsx
├── models/
│   └── [feature].model.ts        # Zod schemas and types
├── schemas/
│   └── [feature].schema.ts       # Drizzle ORM table definitions
├── utils/
│   └── [feature]-utils.ts        # Helper functions
├── [feature].route.ts            # Route path constants
├── [feature].layout.tsx          # Feature layout (optional)
└── [feature].page.tsx            # Feature page component
```

### Example: Auth Module (Reference Implementation)

**⚠️ [新增完整示例]**

```typescript
// src/modules/auth/
// ✅ This is the GOLD STANDARD - follow this pattern

// 1. schemas/auth.schema.ts - Database tables
export const user = sqliteTable("user", {
  id: text("id").primaryKey(),
  email: text("email").unique().notNull(),
  name: text("name").notNull(),
  // ...
})

// 2. models/auth.model.ts - Validation schemas
export const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
})

export type SignInInput = z.infer<typeof signInSchema>

// 3. actions/auth.action.ts - Server actions
"use server"
export async function signIn(input: SignInInput) {
  // Implementation
}

// 4. components/login-form.tsx - UI component
export function LoginForm() {
  const form = useForm<SignInInput>({
    resolver: zodResolver(signInSchema)
  })
  // ...
}

// 5. utils/auth-utils.ts - Shared utilities
export async function getCurrentUser() {
  const session = await auth.api.getSession({ headers: headers() })
  return session?.user ?? null
}

// 6. auth.route.ts - Route constants
export const authRoutes = {
  login: "/login",
  signup: "/signup",
  dashboard: "/dashboard"
}
```

### When to Create a New Module

**⚠️ [新增决策指南]**

| Create Module | Add to Existing Module |
|---------------|------------------------|
| New major feature (Voice Library, TTS, STT) | Small enhancement to existing feature |
| Has own database tables | Uses existing tables |
| 3+ components | 1-2 components |
| Independent business logic | Extends existing logic |

---

## 8. Database & ORM Guidelines

### Drizzle ORM Patterns

**⚠️ [新增完整 ORM 指南]**

#### Schema Definition

```typescript
// src/modules/[feature]/schemas/[feature].schema.ts
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core"
import { sql } from "drizzle-orm"

export const voices = sqliteTable("voices", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  provider: text("provider").notNull(),
  voiceId: text("voice_id").notNull(),
  userId: text("user_id").notNull().references(() => user.id, {
    onDelete: "cascade"  // ⚠️ Always specify delete behavior
  }),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`)
    .$onUpdate(() => new Date())
})
```

#### Database Instance Access

```typescript
// ✅ GOOD: Use dynamic context binding
import { getDB } from "@/db"

export async function getVoices() {
  const db = await getDB()  // Gets Cloudflare D1 binding
  return db.select().from(voices)
}

// ❌ BAD: Import static db instance (doesn't work in Workers)
import { db } from "@/db"  // This may fail in production
```

#### Query Patterns

```typescript
// SELECT with WHERE
const userVoices = await db
  .select()
  .from(voices)
  .where(eq(voices.userId, userId))

// INSERT with returning
const [newVoice] = await db
  .insert(voices)
  .values({ name, provider, voiceId, userId })
  .returning()

// UPDATE
await db
  .update(voices)
  .set({ name: "Updated Name" })
  .where(eq(voices.id, voiceId))

// DELETE
await db
  .delete(voices)
  .where(eq(voices.id, voiceId))

// JOIN example
const voicesWithUsers = await db
  .select({
    voice: voices,
    user: user
  })
  .from(voices)
  .leftJoin(user, eq(voices.userId, user.id))
```

#### Migrations

**⚠️ [新增迁移流程]**

```bash
# 1. Modify schema files in src/modules/*/schemas/

# 2. Generate migration
pnpm db:generate
# Creates: src/drizzle/0001_migration_name.sql

# 3. Apply to local database
pnpm db:migrate:local

# 4. Test locally
pnpm dev:cf

# 5. Deploy to production
pnpm db:migrate:prod
```

---

## 9. Authentication & Authorization

**✅ [保留] Better Auth is configured and production-ready.**

### Getting Current User

**⚠️ [新增代码示例]**

```typescript
// In Server Components
import { getCurrentUser } from "@/modules/auth/utils/auth-utils"

export default async function DashboardPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  return <div>Welcome {user.name}</div>
}

// In Server Actions
"use server"
export async function createVoice(input: VoiceInput) {
  const user = await requireAuth()  // Throws if not authenticated

  // ... create voice for user
}
```

### Protected Routes

```typescript
// middleware.ts pattern (待确认 - 需检查是否已实现)
export async function middleware(request: NextRequest) {
  const user = await getCurrentUser()

  if (!user && request.nextUrl.pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/login", request.url))
  }
}
```

### Auth Utilities Reference

```typescript
// From @/modules/auth/utils/auth-utils.ts

getCurrentUser()      // Returns User | null
requireAuth()         // Returns User or throws 401
isAuthenticated()     // Returns boolean
getAuthInstance()     // Returns Better Auth instance
```

---

## 10. API & Server Actions

**✅ [保留] Server Actions are PREFERRED over API routes.**

### Server Action Pattern

**⚠️ [新增完整示例]**

```typescript
// src/app/actions/voice.action.ts or src/modules/voice/actions/voice.action.ts
"use server"

import { revalidatePath } from "next/cache"
import { getDB } from "@/db"
import { voices } from "@/modules/voice/schemas/voice.schema"
import { requireAuth } from "@/modules/auth/utils/auth-utils"

export async function createVoice(input: VoiceCreateInput) {
  // 1. Authenticate
  const user = await requireAuth()

  // 2. Validate input (Zod validation)
  const validated = voiceCreateSchema.parse(input)

  // 3. Database operation
  const db = await getDB()
  const [newVoice] = await db
    .insert(voices)
    .values({ ...validated, userId: user.id })
    .returning()

  // 4. Revalidate cache
  revalidatePath("/dashboard/voices")

  // 5. Return typed response
  return { success: true, data: newVoice }
}
```

### Client-Side Usage

```tsx
"use client"

import { createVoice } from "@/app/actions/voice.action"
import { useTransition } from "react"
import toast from "react-hot-toast"

export function CreateVoiceForm() {
  const [isPending, startTransition] = useTransition()

  const handleSubmit = (data: VoiceCreateInput) => {
    startTransition(async () => {
      const result = await createVoice(data)

      if (result.success) {
        toast.success("Voice created!")
      } else {
        toast.error(result.error)
      }
    })
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* form fields */}
      <Button disabled={isPending}>
        {isPending ? "Creating..." : "Create Voice"}
      </Button>
    </form>
  )
}
```

### API Response Helpers

**⚠️ [新增]**

```typescript
// src/lib/api-response.ts

export function successResponse<T>(data: T, statusCode = 200) {
  return { success: true, data, statusCode }
}

export function errorResponse(error: string, statusCode = 500) {
  return { success: false, error, statusCode }
}

// Usage
return successResponse({ id: "123", name: "Voice 1" })
return errorResponse("Invalid voice ID", 404)
```

### When to Use API Routes vs Server Actions

**⚠️ [新增决策表]**

| Use Server Action | Use API Route |
|-------------------|---------------|
| Form submissions | Webhooks from external services |
| CRUD operations from UI | Public APIs (e.g., `/api/voices/[id]`) |
| User-triggered mutations | Third-party integrations |
| Revalidating cache after mutation | File downloads with special headers |

---

## 11. File Operations & Storage

### Cloudflare R2 Upload Pattern

**⚠️ [新增完整 R2 指南]**

```typescript
// src/lib/r2.ts

export async function uploadToR2(params: {
  file: File
  key: string
  bucket: R2Bucket  // From env.FILES binding
}): Promise<UploadResult> {
  try {
    const arrayBuffer = await params.file.arrayBuffer()

    await params.bucket.put(params.key, arrayBuffer, {
      httpMetadata: {
        contentType: params.file.type,
      }
    })

    return {
      success: true,
      key: params.key,
      url: `https://your-bucket.r2.dev/${params.key}`  // 待确认：需配置 public domain
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Upload failed"
    }
  }
}
```

### Usage in Server Action

```typescript
"use server"

export async function uploadVoiceFile(formData: FormData) {
  const file = formData.get("file") as File
  const user = await requireAuth()

  const env = getCloudflareContext().env
  const key = `voices/${user.id}/${crypto.randomUUID()}.${file.name.split(".").pop()}`

  const result = await uploadToR2({
    file,
    key,
    bucket: env.FILES
  })

  if (!result.success) {
    return errorResponse(result.error)
  }

  // Save file metadata to database
  // ...

  return successResponse({ url: result.url })
}
```

### File Size Limits

**⚠️ [新增]** (待确认实际限制)

```typescript
// Cloudflare Workers limits
const MAX_FILE_SIZE = 100 * 1024 * 1024  // 100MB (default Worker limit)

// Validation
if (file.size > MAX_FILE_SIZE) {
  return errorResponse("File too large", 413)
}
```

---

## 12. Build & Deployment

### Development Commands

**✅ [保留并完善]**

```bash
# Local Development
pnpm dev                      # Next.js dev server (localhost:3000)
pnpm dev:cf                   # Local Cloudflare Workers mode
pnpm dev:remote               # Remote development (uses prod bindings)

# Database Operations
pnpm db:generate              # Generate migration from schema changes
pnpm db:migrate:local         # Apply migrations to local D1
pnpm db:migrate:prod          # Apply migrations to production D1
pnpm db:studio                # Open Drizzle Studio (DB GUI)
pnpm db:inspect:local         # List tables in local D1

# Build & Deploy
pnpm build                    # Build Next.js app
pnpm build:cf                 # Build for Cloudflare Workers
pnpm deploy                   # Deploy to production
pnpm deploy:preview           # Deploy to preview environment

# Code Quality
pnpm lint                     # Format code with Biome
```

### Environment Variables

**⚠️ [新增]** (基于 PLAYBOOK.md)

```bash
# .dev.vars (local development)
DATABASE_ID=your-d1-database-id
BETTER_AUTH_SECRET=your-secret-key
GOOGLE_CLIENT_ID=xxx
GOOGLE_CLIENT_SECRET=xxx

# Production secrets (set via Wrangler)
pnpm cf:secret BETTER_AUTH_SECRET
pnpm cf:secret GOOGLE_CLIENT_ID
pnpm cf:secret GOOGLE_CLIENT_SECRET
```

### Deployment Checklist

**⚠️ [新增]**

- [ ] Run `pnpm lint` to format code
- [ ] Test locally with `pnpm dev:cf`
- [ ] Generate and apply migrations if schema changed
- [ ] Update environment variables/secrets if needed
- [ ] Deploy with `pnpm deploy`
- [ ] Verify deployment at production URL
- [ ] Check logs: `wrangler tail`

---

## 13. Testing Guidelines

**⚠️ [新增 - 当前项目无测试框架]** (待确认/可调整)

### Current Status
⚠️ **No testing framework is currently configured in this project.**

### Recommended Setup (待实现)

```bash
# Suggested testing stack for Next.js + Cloudflare
pnpm add -D vitest @vitejs/plugin-react
pnpm add -D @testing-library/react @testing-library/jest-dom
pnpm add -D @cloudflare/vitest-pool-workers  # For testing Workers
```

### Manual Testing Checklist

Until automated tests are added, verify:

- [ ] Authentication flow (login, signup, logout)
- [ ] Protected routes redirect to login
- [ ] Form validation errors display correctly
- [ ] Server actions return proper success/error responses
- [ ] Database operations persist data
- [ ] File uploads to R2 succeed
- [ ] Dark mode toggle works (待确认是否已实现)

---

## 14. Common Pitfalls

**⚠️ [新增陷阱清单]**

### Database & ORM

| ❌ Pitfall | ✅ Solution |
|-----------|------------|
| Using static `db` import in Workers | Use `getDB()` to get context-bound instance |
| Forgetting `onDelete: "cascade"` in foreign keys | Specify cascade behavior in schema |
| Not handling `.$onUpdate()` for timestamps | Use `.$onUpdate(() => new Date())` |

### Type System

| ❌ Pitfall | ✅ Solution |
|-----------|------------|
| Creating duplicate type definitions | Use `typeof schema.$inferSelect` |
| Not inferring Zod types | Use `z.infer<typeof schema>` |
| Importing wrong type from library | Import from `/types` export if available |

### Server Components & Actions

| ❌ Pitfall | ✅ Solution |
|-----------|------------|
| Using `useState` in Server Component | Move to Client Component with "use client" |
| Calling Server Action without `startTransition` | Wrap in `useTransition` for pending state |
| Not revalidating cache after mutation | Call `revalidatePath()` or `revalidateTag()` |

### Styling

| ❌ Pitfall | ✅ Solution |
|-----------|------------|
| Hardcoding colors like `bg-red-500` | Use `bg-destructive` semantic token |
| Not using `cn()` utility | Always use `cn()` to merge classes |
| Over-nesting Tailwind classes | Keep classNames flat and readable |

### Authentication

| ❌ Pitfall | ✅ Solution |
|-----------|------------|
| Not checking auth in Server Action | Always call `requireAuth()` first |
| Exposing sensitive data to client | Filter user object before sending |

---

## 15. Development Workflow

**⚠️ [新增 AI 工作流程]**

### Step-by-Step AI Assistant Workflow

When the user requests a feature or bug fix:

#### 1. Understand & Clarify
- [ ] Read the user's request carefully
- [ ] Check if it matches existing patterns in `src/modules/auth/`
- [ ] Ask clarifying questions if uncertain about requirements
- [ ] Identify which module(s) will be affected

#### 2. Plan (if complex task)
- [ ] Break down into subtasks
- [ ] Identify files to modify (prefer editing over creating)
- [ ] Check for existing similar implementations
- [ ] Estimate if third-party library docs need to be consulted

#### 3. Implement
- [ ] Follow the module structure pattern (Section 7)
- [ ] Use type inference, not manual types (Section 5)
- [ ] Follow styling conventions (Section 6)
- [ ] Implement Server Actions over API routes (Section 10)
- [ ] Add proper error handling

#### 4. Verify
- [ ] Check code follows naming conventions (Section 4)
- [ ] Verify no hardcoded colors used
- [ ] Ensure types are inferred from schemas
- [ ] Test imports and path aliases work
- [ ] Suggest manual testing steps to user

#### 5. Document (if needed)
- [ ] Add inline comments for complex logic only
- [ ] Do NOT create markdown docs unless explicitly requested
- [ ] Update this CLAUDE.md if new patterns are established

### When to Use Anchor Comments

**⚠️ [新增]** (借鉴 julep AGENTS.md)

```typescript
// AIDEV-NOTE: This cache is crucial for performance
// Do not remove without profiling impact
const cachedAuthInstance = new WeakMap()

// AIDEV-TODO: Implement rate limiting here
// See: https://developers.cloudflare.com/workers/runtime-apis/rate-limiting/
export async function handleRequest() {
  // ...
}

// AIDEV-WARN: Changing this query breaks voice library pagination
// Related: src/modules/voice/components/voice-list.tsx
const voices = await db.select().from(voicesTable).limit(20)
```

---

## 附录 A: Glossary (术语表)

**⚠️ [新增]**

| Term | Definition |
|------|------------|
| **Edge Runtime** | Cloudflare Workers 执行环境,不支持 Node.js 全部 API |
| **Server Component** | Next.js 在服务端渲染的组件,默认类型 |
| **Server Action** | 以 "use server" 标记的函数,可直接在客户端调用 |
| **D1** | Cloudflare 的分布式 SQLite 数据库 |
| **R2** | Cloudflare 的 S3 兼容对象存储 |
| **Drizzle ORM** | 类型安全的 TypeScript ORM |
| **Better Auth** | Next.js 认证库,支持社交登录 |
| **shadcn/ui** | 基于 Radix UI 的可复制组件集合(非 npm 包) |
| **FAL AI** | 提供 TTS、STT、语音克隆的 AI 服务 |

---

## 附录 B: Quick Reference Links

**✅ [保留并扩展]**

### Internal Documentation
- [product.md](product.md) - Full product specification
- [PLAYBOOK.md](PLAYBOOK.md) - Deployment guide

### Key Files
- [src/modules/auth/](src/modules/auth/) - Reference implementation
- [src/db/schema.ts](src/db/schema.ts) - All database schemas
- [src/lib/utils.ts](src/lib/utils.ts) - `cn()` utility
- [src/components/ui/](src/components/ui/) - shadcn/ui components

### External Resources
- [Next.js 15 Docs](https://nextjs.org/docs)
- [Drizzle ORM Docs](https://orm.drizzle.team)
- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [Better Auth Docs](https://better-auth.com)
- [shadcn/ui Components](https://ui.shadcn.com)

---

## 版本历史

**⚠️ [新增]**

| Version | Date | Changes |
|---------|------|---------|
| 2.0.0 | 2025-10-16 | Major restructure with 15 sections, added testing, deployment, glossary |
| 1.0.0 | 2025-XX-XX | Initial version with basic guidelines |

---

**Last Updated**: 2025-10-16
**Maintained By**: WildVoice Team
