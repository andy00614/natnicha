"use client";

/**
 * TodoList 组件
 * 显示 Todo 列表
 */

import type { Todo } from "../schemas/todo.schema";
import { TodoItem } from "./todo-item";

interface TodoListProps {
    todos: Todo[];
    onUpdate?: () => void;
}

export function TodoList({ todos, onUpdate }: TodoListProps) {
    if (todos.length === 0) {
        return (
            <div className="rounded-lg border border-dashed p-8 text-center">
                <p className="text-muted-foreground">
                    No todos yet. Create your first one!
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-2">
            {todos.map((todo) => (
                <TodoItem key={todo.id} todo={todo} onUpdate={onUpdate} />
            ))}
        </div>
    );
}
