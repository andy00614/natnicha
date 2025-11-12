"use client";

/**
 * TodoForm 组件
 *
 * 用于创建新 Todo 的表单
 * 使用 React Hook Form + Zod 验证
 */

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition } from "react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { todoCreateSchema } from "../models/todo.model";
import { createTodo } from "../actions/todo.action";
import type { z } from "zod";

interface TodoFormProps {
    onSuccess?: () => void;
}

// Use z.input to get the form input type (before transformation)
type TodoFormInput = z.input<typeof todoCreateSchema>;

export function TodoForm({ onSuccess }: TodoFormProps) {
    const [isPending, startTransition] = useTransition();

    const form = useForm<TodoFormInput>({
        resolver: zodResolver(todoCreateSchema),
        defaultValues: {
            title: "",
            description: "",
            priority: "medium",
            dueDate: undefined,
        },
    });

    const handleSubmit = (data: TodoFormInput) => {
        startTransition(async () => {
            try {
                const result = await createTodo(data);

                if (result.success) {
                    toast.success("Todo created successfully!");
                    form.reset();
                    onSuccess?.();
                } else {
                    toast.error(result.error ?? "Failed to create todo");
                }
            } catch (error) {
                toast.error(
                    error instanceof Error
                        ? error.message
                        : "An error occurred",
                );
            }
        });
    };

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(handleSubmit)}
                className="space-y-4"
            >
                {/* Title */}
                <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Title</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="What needs to be done?"
                                    {...field}
                                    disabled={isPending}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Description */}
                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="Add more details..."
                                    {...field}
                                    value={field.value ?? ""}
                                    disabled={isPending}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {/* Priority */}
                    <FormField
                        control={form.control}
                        name="priority"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Priority</FormLabel>
                                <Select
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                    disabled={isPending}
                                >
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select priority" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="low">Low</SelectItem>
                                        <SelectItem value="medium">
                                            Medium
                                        </SelectItem>
                                        <SelectItem value="high">
                                            High
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Due Date */}
                    <FormField
                        control={form.control}
                        name="dueDate"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Due Date</FormLabel>
                                <FormControl>
                                    <Input
                                        type="date"
                                        {...field}
                                        value={
                                            field.value instanceof Date
                                                ? field.value
                                                      .toISOString()
                                                      .split("T")[0]
                                                : field.value || ""
                                        }
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            field.onChange(
                                                value ? new Date(value) : null,
                                            );
                                        }}
                                        disabled={isPending}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                {/* Submit Button */}
                <Button type="submit" disabled={isPending} className="w-full">
                    {isPending ? "Adding..." : "Add Todo"}
                </Button>
            </form>
        </Form>
    );
}
