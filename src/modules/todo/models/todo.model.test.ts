/**
 * Todo Model 测试 - Zod Schema 验证
 *
 * 这个测试文件遵循 TDD 原则：
 * 1. 先写测试（会失败）
 * 2. 实现最小代码使测试通过
 * 3. 重构优化
 */

import { describe, it, expect } from "vitest";
import {
    todoCreateSchema,
    todoUpdateSchema,
    type TodoCreate,
    type TodoUpdate,
} from "./todo.model";

describe("Todo Model - Zod Schema 验证", () => {
    describe("todoCreateSchema - 创建 Todo 验证", () => {
        /**
         * A1.1 - 验证有效的 Todo 创建输入（最小字段）
         */
        it("应该接受有效的最小输入（仅 title）", () => {
            const input = { title: "Buy milk" };

            const result = todoCreateSchema.safeParse(input);

            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data.title).toBe("Buy milk");
                expect(result.data.description).toBeUndefined();
                expect(result.data.completed).toBeUndefined();
                expect(result.data.priority).toBeUndefined();
                expect(result.data.dueDate).toBeUndefined();
            }
        });

        /**
         * A1.2 - 验证有效的 Todo 创建输入（完整字段）
         */
        it("应该接受完整的有效输入", () => {
            const input = {
                title: "Buy milk",
                description: "From supermarket",
                completed: false,
                priority: "high" as const,
                dueDate: new Date("2025-12-31"),
            };

            const result = todoCreateSchema.safeParse(input);

            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data.title).toBe("Buy milk");
                expect(result.data.description).toBe("From supermarket");
                expect(result.data.completed).toBe(false);
                expect(result.data.priority).toBe("high");
                expect(result.data.dueDate).toBeInstanceOf(Date);
            }
        });

        /**
         * A1.3 - 拒绝空标题
         */
        it("应该拒绝空标题", () => {
            const input = { title: "" };

            const result = todoCreateSchema.safeParse(input);

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues[0]?.path).toContain("title");
            }
        });

        /**
         * A1.4 - 拒绝过长标题（超过 200 字符）
         */
        it("应该拒绝超过 200 字符的标题", () => {
            const input = { title: "A".repeat(201) };

            const result = todoCreateSchema.safeParse(input);

            expect(result.success).toBe(false);
            if (!result.success) {
                const error = result.error.issues[0];
                expect(error?.path).toContain("title");
                expect(error?.message).toMatch(/200/);
            }
        });

        /**
         * A1.5 - 拒绝过长描述（超过 1000 字符）
         */
        it("应该拒绝超过 1000 字符的描述", () => {
            const input = {
                title: "Valid title",
                description: "A".repeat(1001),
            };

            const result = todoCreateSchema.safeParse(input);

            expect(result.success).toBe(false);
            if (!result.success) {
                const error = result.error.issues[0];
                expect(error?.path).toContain("description");
                expect(error?.message).toMatch(/1000/);
            }
        });

        /**
         * A1.6 - 允许空描述（null 或 undefined）
         */
        it("应该允许 null 或 undefined 描述", () => {
            const inputNull = { title: "Valid", description: null };
            const inputUndefined = { title: "Valid" };

            const resultNull = todoCreateSchema.safeParse(inputNull);
            const resultUndefined = todoCreateSchema.safeParse(inputUndefined);

            expect(resultNull.success).toBe(true);
            expect(resultUndefined.success).toBe(true);
        });

        /**
         * A1.7 - 验证 completed 字段必须是 boolean
         */
        it("应该拒绝非 boolean 的 completed 字段", () => {
            const input = { title: "Valid", completed: "true" };

            const result = todoCreateSchema.safeParse(input);

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues[0]?.path).toContain("completed");
            }
        });

        /**
         * A1.8 - 验证 priority 必须是 low/medium/high
         */
        it("应该接受有效的 priority 值", () => {
            const validPriorities = ["low", "medium", "high"] as const;

            for (const priority of validPriorities) {
                const input = { title: "Valid", priority };
                const result = todoCreateSchema.safeParse(input);
                expect(result.success).toBe(true);
            }
        });

        it("应该拒绝无效的 priority 值", () => {
            const input = { title: "Valid", priority: "urgent" };

            const result = todoCreateSchema.safeParse(input);

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues[0]?.path).toContain("priority");
            }
        });

        /**
         * A1.9 - 验证 dueDate 必须是有效的日期
         */
        it("应该接受有效的 Date 对象", () => {
            const input = { title: "Valid", dueDate: new Date("2025-12-31") };

            const result = todoCreateSchema.safeParse(input);

            expect(result.success).toBe(true);
        });

        it("应该接受 ISO 日期字符串并转换为 Date", () => {
            const input = {
                title: "Valid",
                dueDate: "2025-12-31T00:00:00.000Z",
            };

            const result = todoCreateSchema.safeParse(input);

            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data.dueDate).toBeInstanceOf(Date);
            }
        });

        it("应该拒绝无效的日期字符串", () => {
            const input = { title: "Valid", dueDate: "invalid-date" };

            const result = todoCreateSchema.safeParse(input);

            expect(result.success).toBe(false);
        });

        /**
         * A1.10 - 允许 null 的 dueDate
         */
        it("应该允许 null 的 dueDate", () => {
            const input = { title: "Valid", dueDate: null };

            const result = todoCreateSchema.safeParse(input);

            expect(result.success).toBe(true);
        });
    });

    describe("todoUpdateSchema - 更新 Todo 验证", () => {
        /**
         * A2.1 - 允许部分更新（所有字段可选）
         */
        it("应该允许仅更新 title", () => {
            const input = { title: "Updated title" };

            const result = todoUpdateSchema.safeParse(input);

            expect(result.success).toBe(true);
        });

        it("应该允许仅更新 completed", () => {
            const input = { completed: true };

            const result = todoUpdateSchema.safeParse(input);

            expect(result.success).toBe(true);
        });

        it("应该允许仅更新 priority", () => {
            const input = { priority: "high" as const };

            const result = todoUpdateSchema.safeParse(input);

            expect(result.success).toBe(true);
        });

        it("应该允许同时更新多个字段", () => {
            const input = {
                title: "Updated",
                completed: true,
                priority: "low" as const,
                dueDate: new Date("2025-12-31"),
            };

            const result = todoUpdateSchema.safeParse(input);

            expect(result.success).toBe(true);
        });

        /**
         * A2.2 - 更新时仍需遵守字段验证规则
         */
        it("应该拒绝空的 title", () => {
            const input = { title: "" };

            const result = todoUpdateSchema.safeParse(input);

            expect(result.success).toBe(false);
        });

        it("应该拒绝过长的 description", () => {
            const input = { description: "A".repeat(1001) };

            const result = todoUpdateSchema.safeParse(input);

            expect(result.success).toBe(false);
        });

        it("应该拒绝无效的 priority", () => {
            const input = { priority: "critical" };

            const result = todoUpdateSchema.safeParse(input);

            expect(result.success).toBe(false);
        });

        /**
         * A2.3 - 允许空对象（无更新）
         */
        it("应该允许空对象", () => {
            const input = {};

            const result = todoUpdateSchema.safeParse(input);

            expect(result.success).toBe(true);
        });
    });

    describe("TypeScript 类型推断", () => {
        /**
         * 验证类型是否正确导出
         */
        it("TodoCreate 类型应该正确推断", () => {
            const validTodo: TodoCreate = {
                title: "Test",
                description: "Test description",
                completed: false,
                priority: "medium",
                dueDate: new Date(),
            };

            // 类型检查在编译时进行，这里只是确保类型存在
            expect(validTodo.title).toBe("Test");
        });

        it("TodoUpdate 类型应该正确推断（所有字段可选）", () => {
            const partialUpdate: TodoUpdate = {
                title: "Updated",
            };

            const fullUpdate: TodoUpdate = {
                title: "Updated",
                description: "New description",
                completed: true,
                priority: "high",
                dueDate: new Date(),
            };

            expect(partialUpdate.title).toBe("Updated");
            expect(fullUpdate.completed).toBe(true);
        });
    });
});
