/**
 * Todo Drizzle Schema
 *
 * 定义 todos 表的数据库结构
 * 遵循项目规范：
 * - 使用 SQLite 数据类型
 * - 外键关联 user 表并设置 cascade 删除
 * - 自动管理 createdAt 和 updatedAt 时间戳
 */

import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";
import { user } from "@/modules/auth/schemas/auth.schema";

export const todos = sqliteTable("todos", {
    id: text("id")
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID()),

    title: text("title").notNull(),

    description: text("description"),

    completed: integer("completed", { mode: "boolean" })
        .notNull()
        .default(false),

    priority: text("priority", { enum: ["low", "medium", "high"] })
        .notNull()
        .default("medium"),

    dueDate: integer("due_date", { mode: "timestamp" }),

    userId: text("user_id")
        .notNull()
        .references(() => user.id, { onDelete: "cascade" }),

    createdAt: integer("created_at", { mode: "timestamp" })
        .notNull()
        .default(sql`(unixepoch())`),

    updatedAt: integer("updated_at", { mode: "timestamp" })
        .notNull()
        .default(sql`(unixepoch())`)
        .$onUpdate(() => new Date()),
});

/**
 * 类型推断
 * 遵循 CLAUDE.md 规范：从 schema 推断类型，避免重复定义
 */
export type Todo = typeof todos.$inferSelect;
export type NewTodo = typeof todos.$inferInsert;
