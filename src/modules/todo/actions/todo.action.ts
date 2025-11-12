"use server";

/**
 * Todo Server Actions
 *
 * CRUD 操作的 Server Actions
 * 遵循项目规范：
 * - 使用 "use server" 标记
 * - 进行认证检查
 * - 使用 Zod 验证输入
 * - 返回类型化的响应
 */

import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getDb } from "@/db";
import { todos } from "../schemas/todo.schema";
import {
    todoCreateSchema,
    todoUpdateSchema,
    type TodoCreate,
    type TodoUpdate,
} from "../models/todo.model";
import { requireAuth } from "@/modules/auth/utils/auth-utils";
import type { Todo } from "../schemas/todo.schema";
import type { z } from "zod";

/**
 * Server Action 响应类型
 */
export type ActionResponse<T = void> = {
    success: boolean;
    data?: T;
    error?: string;
    statusCode?: number;
};

/**
 * 创建 Todo
 */
export async function createTodo(
    input: z.input<typeof todoCreateSchema>,
): Promise<ActionResponse<Todo>> {
    try {
        // 1. 认证检查
        const user = await requireAuth();

        // 2. 验证输入
        const validated = todoCreateSchema.safeParse(input);
        if (!validated.success) {
            return {
                success: false,
                error: validated.error.issues[0]?.message ?? "Invalid input",
                statusCode: 400,
            };
        }

        // 3. 数据库操作
        const db = await getDb();
        const [newTodo] = await db
            .insert(todos)
            .values({
                ...validated.data,
                userId: user.id,
                completed: validated.data.completed ?? false,
                priority: validated.data.priority ?? "medium",
            })
            .returning();

        // 4. 重新验证缓存
        revalidatePath("/todos");

        // 5. 返回响应
        return {
            success: true,
            data: newTodo,
            statusCode: 201,
        };
    } catch (error) {
        console.error("Error creating todo:", error);

        // 如果是认证错误，直接抛出
        if (error instanceof Error && error.message === "Unauthorized") {
            throw error;
        }

        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : "Failed to create todo",
            statusCode: 500,
        };
    }
}

/**
 * 获取 Todos 列表
 */
export async function getTodos(options?: {
    filter?: "all" | "active" | "completed";
}): Promise<ActionResponse<Todo[]>> {
    try {
        // 1. 认证检查
        const user = await requireAuth();

        // 2. 数据库查询
        const db = await getDb();
        const query = db.select().from(todos).where(eq(todos.userId, user.id));

        const allTodos = await query;

        // 3. 筛选逻辑
        const filter = options?.filter ?? "all";
        let filteredTodos = allTodos;

        if (filter === "active") {
            filteredTodos = allTodos.filter((todo: Todo) => !todo.completed);
        } else if (filter === "completed") {
            filteredTodos = allTodos.filter((todo: Todo) => todo.completed);
        }

        return {
            success: true,
            data: filteredTodos,
            statusCode: 200,
        };
    } catch (error) {
        console.error("Error getting todos:", error);

        // 如果是认证错误，直接抛出
        if (error instanceof Error && error.message === "Unauthorized") {
            throw error;
        }

        return {
            success: false,
            error:
                error instanceof Error ? error.message : "Failed to get todos",
            statusCode: 500,
        };
    }
}

/**
 * 更新 Todo
 */
export async function updateTodo(
    id: string,
    update: z.input<typeof todoUpdateSchema>,
): Promise<ActionResponse<Todo>> {
    try {
        // 1. 认证检查
        const user = await requireAuth();

        // 2. 验证输入
        const validated = todoUpdateSchema.safeParse(update);
        if (!validated.success) {
            return {
                success: false,
                error: validated.error.issues[0]?.message ?? "Invalid input",
                statusCode: 400,
            };
        }

        // 3. 验证 Todo 存在且属于当前用户
        const db = await getDb();
        const existing = await db
            .select()
            .from(todos)
            .where(and(eq(todos.id, id), eq(todos.userId, user.id)));

        if (existing.length === 0) {
            return {
                success: false,
                error: "Todo not found",
                statusCode: 404,
            };
        }

        // 4. 更新数据库
        const [updated] = await db
            .update(todos)
            .set(validated.data)
            .where(eq(todos.id, id))
            .returning();

        // 5. 重新验证缓存
        revalidatePath("/todos");

        return {
            success: true,
            data: updated,
            statusCode: 200,
        };
    } catch (error) {
        console.error("Error updating todo:", error);

        if (error instanceof Error && error.message === "Unauthorized") {
            throw error;
        }

        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : "Failed to update todo",
            statusCode: 500,
        };
    }
}

/**
 * 删除 Todo
 */
export async function deleteTodo(id: string): Promise<ActionResponse> {
    try {
        // 1. 认证检查
        const user = await requireAuth();

        // 2. 验证 Todo 存在且属于当前用户
        const db = await getDb();
        const existing = await db
            .select()
            .from(todos)
            .where(and(eq(todos.id, id), eq(todos.userId, user.id)));

        if (existing.length === 0) {
            return {
                success: false,
                error: "Todo not found",
                statusCode: 404,
            };
        }

        // 3. 删除数据库记录
        await db.delete(todos).where(eq(todos.id, id));

        // 4. 重新验证缓存
        revalidatePath("/todos");

        return {
            success: true,
            statusCode: 200,
        };
    } catch (error) {
        console.error("Error deleting todo:", error);

        if (error instanceof Error && error.message === "Unauthorized") {
            throw error;
        }

        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : "Failed to delete todo",
            statusCode: 500,
        };
    }
}
