/**
 * 测试 1: cn() 工具函数测试
 *
 * 这个测试展示了如何测试纯函数（pure function）
 * cn() 是一个非常常用的工具函数，用于合并 Tailwind CSS classes
 *
 * 学习要点：
 * 1. describe() - 组织测试套件（test suite）
 * 2. it() - 定义单个测试用例
 * 3. expect() - 断言（assertion）
 * 4. toBe() - 检查值是否相等
 */

import { describe, it, expect } from "vitest";
import { cn } from "./utils";

describe("cn() 工具函数", () => {
    /**
     * 测试场景 1: 基本的 class 合并
     * 验证多个字符串可以正确合并
     */
    it("应该正确合并多个 class 字符串", () => {
        // Arrange (准备): 定义输入
        const input1 = "text-red-500";
        const input2 = "bg-blue-500";

        // Act (执行): 调用被测试的函数
        const result = cn(input1, input2);

        // Assert (断言): 验证结果
        expect(result).toBe("text-red-500 bg-blue-500");
    });

    /**
     * 测试场景 2: 条件 class（使用对象语法）
     * 这是 clsx 提供的功能，可以根据条件动态添加 class
     */
    it("应该正确处理条件 class（对象语法）", () => {
        // Arrange
        const isActive = true;
        const isDisabled = false;

        // Act: 使用对象语法，只有 value 为 true 的 key 会被包含
        const result = cn({
            "text-blue-500": isActive, // true，会被包含
            "text-gray-500": isDisabled, // false，会被忽略
        });

        // Assert
        expect(result).toBe("text-blue-500");
    });

    /**
     * 测试场景 3: Tailwind class 冲突解决
     * 这是 twMerge 的核心功能：当有相同类型的 Tailwind class 时，
     * 后面的会覆盖前面的
     */
    it("应该正确解决 Tailwind class 冲突（后面的覆盖前面的）", () => {
        // Arrange: text-red-500 和 text-blue-500 是冲突的（都是文字颜色）
        const baseClasses = "text-red-500 bg-white";
        const overrideClasses = "text-blue-500"; // 这个会覆盖 text-red-500

        // Act
        const result = cn(baseClasses, overrideClasses);

        // Assert: 红色被蓝色覆盖，但背景色保留
        expect(result).toBe("bg-white text-blue-500");
    });

    /**
     * 测试场景 4: 处理 undefined 和 null
     * 在实际项目中，经常会遇到可选的 className prop
     */
    it("应该忽略 undefined 和 null 值", () => {
        // Arrange
        const definedClass = "text-red-500";
        const undefinedClass = undefined;
        const nullClass = null;

        // Act
        const result = cn(definedClass, undefinedClass, nullClass);

        // Assert: 只保留有效的 class
        expect(result).toBe("text-red-500");
    });

    /**
     * 测试场景 5: 空输入
     * 边界条件（edge case）测试
     */
    it("当没有输入时应该返回空字符串", () => {
        // Act
        const result = cn();

        // Assert
        expect(result).toBe("");
    });

    /**
     * 测试场景 6: 数组输入
     * clsx 支持数组语法
     */
    it("应该正确处理数组输入", () => {
        // Arrange
        const classArray = ["text-red-500", "bg-blue-500"];

        // Act
        const result = cn(classArray);

        // Assert
        expect(result).toBe("text-red-500 bg-blue-500");
    });

    /**
     * 测试场景 7: 实际使用案例（React 组件场景）
     * 模拟在实际组件中的使用方式
     */
    it("实际案例：根据 variant 动态应用样式", () => {
        // Arrange: 模拟组件的 props（使用 as const 来保持字面量类型同时允许比较）
        type Variant = "primary" | "secondary";
        type Size = "small" | "large";

        const variant: Variant = "primary";
        const size: Size = "large";
        const isDisabled = false;

        // Act: 模拟组件内部的 className 逻辑
        const result = cn(
            "rounded-md font-medium transition-colors", // 基础样式
            {
                // 根据 variant 应用不同颜色
                "bg-blue-500 text-white hover:bg-blue-600":
                    variant === ("primary" as Variant),
                "bg-gray-200 text-gray-800 hover:bg-gray-300":
                    variant === ("secondary" as Variant),
            },
            {
                // 根据 size 应用不同大小
                "px-4 py-2 text-sm": size === ("small" as Size),
                "px-6 py-3 text-base": size === ("large" as Size),
            },
            {
                // 根据状态应用样式
                "opacity-50 cursor-not-allowed": isDisabled,
            },
        );

        // Assert: 验证生成的完整 className
        expect(result).toContain("bg-blue-500"); // variant primary
        expect(result).toContain("px-6 py-3"); // size large
        expect(result).not.toContain("opacity-50"); // isDisabled = false
    });
});
