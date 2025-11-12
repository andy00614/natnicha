"use client";

/**
 * TodoItem 组件
 * 单个 Todo 项的显示和交互
 */

import { useState, useTransition } from "react";
import toast from "react-hot-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Todo } from "../schemas/todo.schema";
import { updateTodo, deleteTodo } from "../actions/todo.action";
import { format } from "date-fns";

interface TodoItemProps {
    todo: Todo;
    onUpdate?: () => void;
}

const priorityColors = {
    low: "secondary",
    medium: "default",
    high: "destructive",
} as const;

export function TodoItem({ todo, onUpdate }: TodoItemProps) {
    const [isPending, startTransition] = useTransition();

    const handleToggle = () => {
        startTransition(async () => {
            const result = await updateTodo(todo.id, {
                completed: !todo.completed,
            });

            if (result.success) {
                toast.success(
                    todo.completed
                        ? "Todo marked as active"
                        : "Todo completed!",
                );
                onUpdate?.();
            } else {
                toast.error(result.error ?? "Failed to update todo");
            }
        });
    };

    const handleDelete = () => {
        if (!confirm("Are you sure you want to delete this todo?")) return;

        startTransition(async () => {
            const result = await deleteTodo(todo.id);

            if (result.success) {
                toast.success("Todo deleted");
                onUpdate?.();
            } else {
                toast.error(result.error ?? "Failed to delete todo");
            }
        });
    };

    return (
        <div className="flex items-start gap-3 rounded-lg border bg-card p-4 transition-colors hover:bg-accent/50">
            <Checkbox
                checked={todo.completed}
                onCheckedChange={handleToggle}
                disabled={isPending}
                className="mt-1"
            />

            <div className="flex-1 space-y-2">
                <div className="flex items-start justify-between gap-2">
                    <h3
                        className={`text-sm font-medium ${
                            todo.completed
                                ? "line-through text-muted-foreground"
                                : ""
                        }`}
                    >
                        {todo.title}
                    </h3>

                    <div className="flex items-center gap-2">
                        <Badge variant={priorityColors[todo.priority]}>
                            {todo.priority}
                        </Badge>

                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleDelete}
                            disabled={isPending}
                            className="h-8 px-2 text-destructive hover:text-destructive"
                        >
                            Delete
                        </Button>
                    </div>
                </div>

                {todo.description && (
                    <p className="text-sm text-muted-foreground">
                        {todo.description}
                    </p>
                )}

                {todo.dueDate && (
                    <p className="text-xs text-muted-foreground">
                        Due: {format(new Date(todo.dueDate), "PPP")}
                    </p>
                )}
            </div>
        </div>
    );
}
