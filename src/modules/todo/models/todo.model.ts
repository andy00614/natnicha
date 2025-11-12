/**
 * Todo Model - Zod Validation Schemas
 *
 * 定义 Todo 的验证规则和 TypeScript 类型
 * 遵循项目规范：使用 Zod 进行运行时验证，并通过类型推断生成 TS 类型
 */

import { z } from "zod";

/**
 * Priority 枚举
 */
export const priorityEnum = z.enum(["low", "medium", "high"]);

/**
 * Todo 创建 Schema
 * 用于验证创建新 Todo 时的输入
 */
export const todoCreateSchema = z.object({
    title: z
        .string()
        .min(1, "Title is required")
        .max(200, "Title must be at most 200 characters"),

    description: z
        .string()
        .max(1000, "Description must be at most 1000 characters")
        .nullable()
        .optional(),

    completed: z.boolean().optional(),

    priority: priorityEnum.optional(),

    dueDate: z
        .union([z.string(), z.date()])
        .pipe(z.coerce.date())
        .nullable()
        .optional(),
});

/**
 * Todo 更新 Schema
 * 所有字段都是可选的（支持部分更新）
 */
export const todoUpdateSchema = z.object({
    title: z
        .string()
        .min(1, "Title cannot be empty")
        .max(200, "Title must be at most 200 characters")
        .optional(),

    description: z
        .string()
        .max(1000, "Description must be at most 1000 characters")
        .nullable()
        .optional(),

    completed: z.boolean().optional(),

    priority: priorityEnum.optional(),

    dueDate: z
        .union([z.string(), z.date()])
        .pipe(z.coerce.date())
        .nullable()
        .optional(),
});

/**
 * TypeScript 类型推断
 */
export type TodoCreate = z.infer<typeof todoCreateSchema>;
export type TodoUpdate = z.infer<typeof todoUpdateSchema>;
export type Priority = z.infer<typeof priorityEnum>;
