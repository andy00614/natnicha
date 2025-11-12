/**
 * TodoForm 组件测试
 *
 * 测试表单 UI 交互和验证
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TodoForm } from "./todo-form";

describe("TodoForm 组件", () => {
    const mockOnSuccess = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    /**
     * C2.1 - 渲染表单字段（标题 + 描述 + priority + dueDate）
     */
    it("应该渲染所有表单字段", () => {
        render(<TodoForm onSuccess={mockOnSuccess} />);

        expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/priority/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/due date/i)).toBeInTheDocument();
        expect(
            screen.getByRole("button", { name: /add todo/i }),
        ).toBeInTheDocument();
    });

    /**
     * C2.2 - 成功提交表单（最小字段）
     */
    it("应该成功提交表单（仅标题）", async () => {
        const user = userEvent.setup();
        render(<TodoForm onSuccess={mockOnSuccess} />);

        // 输入标题
        const titleInput = screen.getByLabelText(/title/i);
        await user.type(titleInput, "Buy milk");

        // 提交表单
        const submitButton = screen.getByRole("button", { name: /add todo/i });
        await user.click(submitButton);

        // 等待表单提交
        await waitFor(() => {
            expect(mockOnSuccess).toHaveBeenCalled();
        });
    });

    /**
     * C2.3 - 成功提交表单（完整字段）
     */
    it("应该成功提交表单（所有字段）", async () => {
        const user = userEvent.setup();
        render(<TodoForm onSuccess={mockOnSuccess} />);

        // 输入所有字段
        await user.type(screen.getByLabelText(/title/i), "Buy milk");
        await user.type(
            screen.getByLabelText(/description/i),
            "From supermarket",
        );

        // 选择 priority（假设使用 Select 组件）
        const prioritySelect = screen.getByLabelText(/priority/i);
        await user.click(prioritySelect);
        const highOption = await screen.findByRole("option", { name: /high/i });
        await user.click(highOption);

        // 输入日期
        await user.type(screen.getByLabelText(/due date/i), "2025-12-31");

        // 提交
        await user.click(screen.getByRole("button", { name: /add todo/i }));

        await waitFor(() => {
            expect(mockOnSuccess).toHaveBeenCalled();
        });
    });

    /**
     * C2.4 - 显示验证错误（空标题）
     */
    it("应该显示空标题的验证错误", async () => {
        const user = userEvent.setup();
        render(<TodoForm onSuccess={mockOnSuccess} />);

        // 直接提交（不输入任何内容）
        const submitButton = screen.getByRole("button", { name: /add todo/i });
        await user.click(submitButton);

        // 等待验证错误显示
        await waitFor(() => {
            expect(screen.getByText(/title.*required/i)).toBeInTheDocument();
        });

        // onSuccess 不应该被调用
        expect(mockOnSuccess).not.toHaveBeenCalled();
    });

    /**
     * C2.5 - 显示验证错误（标题过长）
     */
    it("应该显示标题过长的验证错误", async () => {
        const user = userEvent.setup();
        render(<TodoForm onSuccess={mockOnSuccess} />);

        // 输入超过 200 字符的标题
        const longTitle = "A".repeat(201);
        await user.type(screen.getByLabelText(/title/i), longTitle);

        // 提交
        await user.click(screen.getByRole("button", { name: /add todo/i }));

        // 等待验证错误
        await waitFor(() => {
            expect(screen.getByText(/200.*character/i)).toBeInTheDocument();
        });

        expect(mockOnSuccess).not.toHaveBeenCalled();
    });

    /**
     * C2.6 - 禁用提交按钮（pending 状态）
     */
    it("应该在提交时禁用按钮", async () => {
        const user = userEvent.setup();

        // Mock 一个慢速的 onSuccess 来测试 pending 状态
        const slowOnSuccess = vi.fn(
            () => new Promise((resolve) => setTimeout(resolve, 100)),
        );

        render(<TodoForm onSuccess={slowOnSuccess} />);

        await user.type(screen.getByLabelText(/title/i), "Test");
        const submitButton = screen.getByRole("button", { name: /add todo/i });

        await user.click(submitButton);

        // 按钮应该被禁用
        expect(submitButton).toBeDisabled();

        // 等待完成
        await waitFor(() => {
            expect(submitButton).not.toBeDisabled();
        });
    });

    /**
     * C2.7 - 提交成功后清空表单
     */
    it("应该在成功提交后清空表单", async () => {
        const user = userEvent.setup();
        render(<TodoForm onSuccess={mockOnSuccess} />);

        const titleInput = screen.getByLabelText(/title/i) as HTMLInputElement;
        await user.type(titleInput, "Test Todo");
        await user.click(screen.getByRole("button", { name: /add todo/i }));

        await waitFor(() => {
            expect(mockOnSuccess).toHaveBeenCalled();
        });

        // 表单应该被清空
        expect(titleInput.value).toBe("");
    });

    /**
     * C2.8 - priority 默认值为 medium
     */
    it("应该有 priority 默认值 medium", () => {
        render(<TodoForm onSuccess={mockOnSuccess} />);

        const prioritySelect = screen.getByLabelText(/priority/i);
        expect(prioritySelect).toHaveValue("medium");
    });
});
