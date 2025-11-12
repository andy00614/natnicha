"use client";

/**
 * Todos Page
 *
 * 完整的 Todo List 应用页面
 * - 创建新 Todo
 * - 列表展示
 * - 筛选（All/Active/Completed）
 * - 切换完成状态
 * - 删除 Todo
 */

import { useEffect, useState, useCallback } from "react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { TodoForm } from "@/modules/todo/components/todo-form";
import { TodoList } from "@/modules/todo/components/todo-list";
import {
    TodoFilter,
    type FilterType,
} from "@/modules/todo/components/todo-filter";
import { getTodos } from "@/modules/todo/actions/todo.action";
import type { Todo } from "@/modules/todo/schemas/todo.schema";
import toast from "react-hot-toast";

export default function TodosPage() {
    const [todos, setTodos] = useState<Todo[]>([]);
    const [filter, setFilter] = useState<FilterType>("all");
    const [isLoading, setIsLoading] = useState(true);

    const loadTodos = useCallback(async () => {
        setIsLoading(true);
        try {
            const result = await getTodos({ filter });

            if (result.success && result.data) {
                setTodos(result.data);
            } else {
                toast.error(result.error ?? "Failed to load todos");
            }
        } catch (error) {
            toast.error(
                error instanceof Error ? error.message : "Failed to load todos",
            );
        } finally {
            setIsLoading(false);
        }
    }, [filter]);

    useEffect(() => {
        loadTodos();
    }, [loadTodos]);

    const activeCount = todos.filter((todo) => !todo.completed).length;

    return (
        <div className="container mx-auto max-w-4xl py-8">
            <Card>
                <CardHeader>
                    <CardTitle>Todo List</CardTitle>
                    <CardDescription>
                        Manage your tasks with priority and due dates
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Create Todo Form */}
                    <TodoForm onSuccess={loadTodos} />

                    <Separator />

                    {/* Filter */}
                    <TodoFilter
                        currentFilter={filter}
                        onFilterChange={setFilter}
                        activeCount={activeCount}
                    />

                    {/* Todo List */}
                    {isLoading ? (
                        <div className="rounded-lg border border-dashed p-8 text-center">
                            <p className="text-muted-foreground">
                                Loading todos...
                            </p>
                        </div>
                    ) : (
                        <TodoList todos={todos} onUpdate={loadTodos} />
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
