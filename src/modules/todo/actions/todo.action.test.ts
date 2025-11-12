/**
 * Todo Server Actions 测试
 *
 * 测试 CRUD 操作的 Server Actions
 * 使用 better-sqlite3 内存数据库进行隔离测试
 *
 * @vitest-environment node
 */

import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { createTodo, getTodos, updateTodo, deleteTodo } from "./todo.action";
import type { TodoCreate, TodoUpdate } from "../models/todo.model";

// Mock 认证工具
vi.mock("@/modules/auth/utils/auth-utils", () => ({
    getCurrentUser: vi.fn(),
    requireAuth: vi.fn(),
}));

// Mock Cloudflare 上下文
vi.mock("@opennextjs/cloudflare", () => ({
    getCloudflareContext: vi.fn(),
}));

// Mock 数据库
vi.mock("@/db", () => ({
    getDB: vi.fn(),
}));

import { getCurrentUser, requireAuth } from "@/modules/auth/utils/auth-utils";
import { getDB } from "@/db";
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { todos } from "../schemas/todo.schema";
import { user as userSchema } from "@/modules/auth/schemas/auth.schema";

describe("Todo Server Actions", () => {
    let testDb: ReturnType<typeof drizzle>;
    let client: ReturnType<typeof createClient>;
    const mockUser = {
        id: "test-user-id",
        email: "test@example.com",
        name: "Test User",
    };

    beforeEach(async () => {
        // 创建内存数据库
        client = createClient({
            url: ":memory:",
        });

        // 创建必要的表
        await client.execute(`
      CREATE TABLE user (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        email_verified INTEGER DEFAULT 0 NOT NULL,
        image TEXT,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      );
    `);

        await client.execute(`
      CREATE TABLE todos (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        completed INTEGER DEFAULT 0 NOT NULL,
        priority TEXT DEFAULT 'medium' NOT NULL,
        due_date INTEGER,
        user_id TEXT NOT NULL,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL,
        FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE
      );
    `);

        // 创建 Drizzle 实例
        testDb = drizzle(client);

        // 插入测试用户
        await testDb.insert(userSchema).values({
            id: mockUser.id,
            email: mockUser.email,
            name: mockUser.name,
            emailVerified: false,
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        // Mock getDB 返回测试数据库
        vi.mocked(getDB).mockResolvedValue(testDb);

        // Mock getCurrentUser 返回测试用户
        vi.mocked(getCurrentUser).mockResolvedValue(mockUser);

        // Mock requireAuth 返回测试用户
        vi.mocked(requireAuth).mockResolvedValue(mockUser);
    });

    afterEach(() => {
        // 清理数据库
        client.close();
        vi.clearAllMocks();
    });

    describe("createTodo - 创建 Todo", () => {
        /**
         * B1.1 - 成功创建 Todo（已认证用户）
         */
        it("应该成功创建 Todo（已认证用户）", async () => {
            const input: TodoCreate = { title: "Test Todo" };

            const result = await createTodo(input);

            expect(result.success).toBe(true);
            expect(result.data).toBeDefined();
            if (result.data) {
                expect(result.data.title).toBe("Test Todo");
                expect(result.data.userId).toBe(mockUser.id);
                expect(result.data.completed).toBe(false);
                expect(result.data.priority).toBe("medium");
                expect(result.data.id).toBeDefined();
            }
        });

        /**
         * B1.2 - 拒绝未认证用户创建
         */
        it("应该拒绝未认证用户创建", async () => {
            vi.mocked(requireAuth).mockRejectedValue(new Error("Unauthorized"));

            const input: TodoCreate = { title: "Test" };

            await expect(createTodo(input)).rejects.toThrow("Unauthorized");
        });

        /**
         * B1.3 - 拒绝无效输入
         */
        it("应该拒绝无效输入", async () => {
            const input = { title: "" } as TodoCreate;

            const result = await createTodo(input);

            expect(result.success).toBe(false);
            expect(result.error).toBeDefined();
        });

        /**
         * B1.4 - 正确设置 priority 和 dueDate
         */
        it("应该正确设置 priority 和 dueDate", async () => {
            const dueDate = new Date("2025-12-31");
            const input: TodoCreate = {
                title: "Important Todo",
                priority: "high",
                dueDate,
            };

            const result = await createTodo(input);

            expect(result.success).toBe(true);
            if (result.data) {
                expect(result.data.priority).toBe("high");
                expect(result.data.dueDate).toBeInstanceOf(Date);
            }
        });
    });

    describe("getTodos - 获取 Todo 列表", () => {
        beforeEach(async () => {
            // 插入测试数据
            await testDb.insert(todos).values([
                {
                    id: "1",
                    title: "Todo 1",
                    completed: false,
                    priority: "medium",
                    userId: mockUser.id,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    id: "2",
                    title: "Todo 2",
                    completed: true,
                    priority: "high",
                    userId: mockUser.id,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    id: "3",
                    title: "Todo 3",
                    completed: false,
                    priority: "low",
                    userId: mockUser.id,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    id: "4",
                    title: "Other User Todo",
                    completed: false,
                    priority: "medium",
                    userId: "other-user-id",
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
            ]);
        });

        /**
         * B2.1 - 成功获取当前用户的所有 Todos
         */
        it("应该仅返回当前用户的 Todos", async () => {
            const result = await getTodos();

            expect(result.success).toBe(true);
            expect(result.data).toHaveLength(3);
            expect(
                result.data?.every((todo) => todo.userId === mockUser.id),
            ).toBe(true);
        });

        /**
         * B2.2 - 筛选：仅获取未完成的 Todos
         */
        it("应该正确筛选未完成的 Todos (filter: active)", async () => {
            const result = await getTodos({ filter: "active" });

            expect(result.success).toBe(true);
            expect(result.data).toHaveLength(2);
            expect(result.data?.every((todo) => !todo.completed)).toBe(true);
        });

        /**
         * B2.3 - 筛选：仅获取已完成的 Todos
         */
        it("应该正确筛选已完成的 Todos (filter: completed)", async () => {
            const result = await getTodos({ filter: "completed" });

            expect(result.success).toBe(true);
            expect(result.data).toHaveLength(1);
            expect(result.data?.[0]?.completed).toBe(true);
        });

        /**
         * B2.4 - 筛选：获取全部 Todos
         */
        it("应该返回全部 Todos (filter: all)", async () => {
            const result = await getTodos({ filter: "all" });

            expect(result.success).toBe(true);
            expect(result.data).toHaveLength(3);
        });

        /**
         * B2.5 - 空列表返回空数组
         */
        it("当用户无 Todos 时应该返回空数组", async () => {
            // 清空当前用户的 todos
            await testDb.delete(todos);

            const result = await getTodos();

            expect(result.success).toBe(true);
            expect(result.data).toEqual([]);
        });

        /**
         * B2.6 - 拒绝未认证用户
         */
        it("应该拒绝未认证用户", async () => {
            vi.mocked(requireAuth).mockRejectedValue(new Error("Unauthorized"));

            await expect(getTodos()).rejects.toThrow("Unauthorized");
        });
    });

    describe("updateTodo - 更新 Todo", () => {
        let testTodo: { id: string; title: string };

        beforeEach(async () => {
            const [inserted] = await testDb
                .insert(todos)
                .values({
                    id: "test-todo-id",
                    title: "Original Title",
                    completed: false,
                    priority: "medium",
                    userId: mockUser.id,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                })
                .returning();
            testTodo = inserted!;
        });

        /**
         * B3.1 - 成功更新标题
         */
        it("应该成功更新标题", async () => {
            const update: TodoUpdate = { title: "Updated Title" };

            const result = await updateTodo(testTodo.id, update);

            expect(result.success).toBe(true);
            expect(result.data?.title).toBe("Updated Title");
        });

        /**
         * B3.2 - 成功切换完成状态
         */
        it("应该成功切换完成状态", async () => {
            const update: TodoUpdate = { completed: true };

            const result = await updateTodo(testTodo.id, update);

            expect(result.success).toBe(true);
            expect(result.data?.completed).toBe(true);
        });

        /**
         * B3.3 - 拒绝更新其他用户的 Todo
         */
        it("应该拒绝更新其他用户的 Todo", async () => {
            // 创建其他用户的 todo
            await testDb.insert(todos).values({
                id: "other-todo",
                title: "Other User Todo",
                completed: false,
                priority: "medium",
                userId: "other-user-id",
                createdAt: new Date(),
                updatedAt: new Date(),
            });

            const result = await updateTodo("other-todo", { title: "Hacked" });

            expect(result.success).toBe(false);
            expect(result.error).toContain("not found");
            expect(result.statusCode).toBe(404);
        });

        /**
         * B3.4 - 拒绝更新不存在的 Todo
         */
        it("应该拒绝更新不存在的 Todo", async () => {
            const result = await updateTodo("nonexistent", { title: "Test" });

            expect(result.success).toBe(false);
            expect(result.statusCode).toBe(404);
        });

        /**
         * B3.5 - 拒绝无效输入
         */
        it("应该拒绝无效输入", async () => {
            const result = await updateTodo(testTodo.id, { title: "" });

            expect(result.success).toBe(false);
            expect(result.error).toBeDefined();
        });

        /**
         * B3.6 - 支持部分更新（仅更新 priority）
         */
        it("应该支持部分更新", async () => {
            const result = await updateTodo(testTodo.id, { priority: "high" });

            expect(result.success).toBe(true);
            expect(result.data?.priority).toBe("high");
            expect(result.data?.title).toBe("Original Title"); // 标题未改变
        });
    });

    describe("deleteTodo - 删除 Todo", () => {
        let testTodoId: string;

        beforeEach(async () => {
            const [inserted] = await testDb
                .insert(todos)
                .values({
                    id: "test-todo-id",
                    title: "To be deleted",
                    completed: false,
                    priority: "medium",
                    userId: mockUser.id,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                })
                .returning();
            testTodoId = inserted!.id;
        });

        /**
         * B4.1 - 成功删除自己的 Todo
         */
        it("应该成功删除自己的 Todo", async () => {
            const result = await deleteTodo(testTodoId);

            expect(result.success).toBe(true);

            // 验证已删除
            const remaining = await testDb.select().from(todos);
            expect(remaining).toHaveLength(0);
        });

        /**
         * B4.2 - 拒绝删除其他用户的 Todo
         */
        it("应该拒绝删除其他用户的 Todo", async () => {
            await testDb.insert(todos).values({
                id: "other-todo",
                title: "Other User Todo",
                completed: false,
                priority: "medium",
                userId: "other-user-id",
                createdAt: new Date(),
                updatedAt: new Date(),
            });

            const result = await deleteTodo("other-todo");

            expect(result.success).toBe(false);
            expect(result.statusCode).toBe(404);
        });

        /**
         * B4.3 - 拒绝删除不存在的 Todo
         */
        it("应该拒绝删除不存在的 Todo", async () => {
            const result = await deleteTodo("nonexistent");

            expect(result.success).toBe(false);
            expect(result.statusCode).toBe(404);
        });
    });
});
