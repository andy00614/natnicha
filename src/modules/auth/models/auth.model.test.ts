/**
 * 测试 3: Zod Schema 验证测试
 *
 * 这个测试展示了如何测试表单验证逻辑（使用 Zod）
 * Zod 是一个 TypeScript-first 的 schema 验证库
 *
 * 学习要点：
 * 1. 测试数据验证规则
 * 2. 验证成功和失败的场景
 * 3. 检查错误消息
 * 4. 使用 expect().toThrow 测试抛出的错误
 * 5. 解析 Zod 错误对象（使用 error.issues）
 */

import { describe, it, expect } from "vitest";
import { signInSchema, signUpSchema } from "./auth.model";
import { ZodError } from "zod";

describe("Auth Model - Zod Schema 验证", () => {
    /**
     * 测试场景 1: signInSchema（登录表单验证）
     */
    describe("signInSchema（登录验证）", () => {
        it("应该通过有效的登录数据", () => {
            // Arrange: 准备有效的登录数据
            const validData = {
                email: "user@example.com",
                password: "password123", // 8 个字符以上
            };

            // Act: 验证数据（.parse() 会抛出错误，.safeParse() 返回结果对象）
            const result = signInSchema.safeParse(validData);

            // Assert: 验证应该成功
            expect(result.success).toBe(true);

            if (result.success) {
                // TypeScript 类型守卫
                expect(result.data.email).toBe("user@example.com");
                expect(result.data.password).toBe("password123");
            }
        });

        it("应该拒绝无效的邮箱格式", () => {
            // Arrange: 无效的邮箱
            const invalidData = {
                email: "not-an-email", // 缺少 @
                password: "password123",
            };

            // Act
            const result = signInSchema.safeParse(invalidData);

            // Assert: 验证应该失败
            expect(result.success).toBe(false);

            if (!result.success) {
                // 检查错误信息 - Zod 的错误在 error.issues 数组中
                const emailIssue = result.error.issues.find(
                    (issue) => issue.path[0] === "email",
                );
                expect(emailIssue).toBeDefined();
                expect(emailIssue?.message).toContain("email"); // Zod 默认的邮箱错误信息
            }
        });

        it("应该拒绝空邮箱", () => {
            // Arrange
            const invalidData = {
                email: "", // 空字符串
                password: "password123",
            };

            // Act
            const result = signInSchema.safeParse(invalidData);

            // Assert
            expect(result.success).toBe(false);

            if (!result.success) {
                const emailIssue = result.error.issues.find(
                    (issue) => issue.path[0] === "email",
                );
                // 空字符串仍被视为无效的邮箱格式
                expect(emailIssue?.message).toBeTruthy();
                expect(emailIssue).toBeDefined();
            }
        });

        it("应该拒绝过短的密码（少于 8 个字符）", () => {
            // Arrange
            const invalidData = {
                email: "user@example.com",
                password: "pass", // 只有 4 个字符
            };

            // Act
            const result = signInSchema.safeParse(invalidData);

            // Assert
            expect(result.success).toBe(false);

            if (!result.success) {
                const passwordIssue = result.error.issues.find(
                    (issue) => issue.path[0] === "password",
                );
                expect(passwordIssue).toBeDefined();
                expect(passwordIssue?.message).toBe(
                    "Password should contain minimum 8 character(s)",
                );
            }
        });

        it("应该拒绝缺少字段的数据", () => {
            // Arrange: 缺少 password 字段
            const invalidData = {
                email: "user@example.com",
                // password 缺失
            };

            // Act
            const result = signInSchema.safeParse(invalidData);

            // Assert
            expect(result.success).toBe(false);

            if (!result.success) {
                // Zod 会报告必填字段错误
                const passwordIssue = result.error.issues.find(
                    (issue) => issue.path[0] === "password",
                );
                expect(passwordIssue).toBeDefined();
                // Zod v4 的错误消息是 "Invalid input: expected string, received undefined"
                expect(passwordIssue?.message).toBeTruthy();
            }
        });
    });

    /**
     * 测试场景 2: signUpSchema（注册表单验证）
     * signUpSchema 继承 signInSchema，并添加了 username 字段
     */
    describe("signUpSchema（注册验证）", () => {
        it("应该通过有效的注册数据", () => {
            // Arrange
            const validData = {
                email: "newuser@example.com",
                password: "securePassword123",
                username: "john_doe", // 至少 3 个字符
            };

            // Act
            const result = signUpSchema.safeParse(validData);

            // Assert
            expect(result.success).toBe(true);

            if (result.success) {
                expect(result.data.username).toBe("john_doe");
                expect(result.data.email).toBe("newuser@example.com");
            }
        });

        it("应该拒绝过短的用户名（少于 3 个字符）", () => {
            // Arrange
            const invalidData = {
                email: "user@example.com",
                password: "password123",
                username: "ab", // 只有 2 个字符
            };

            // Act
            const result = signUpSchema.safeParse(invalidData);

            // Assert
            expect(result.success).toBe(false);

            if (!result.success) {
                const usernameIssue = result.error.issues.find(
                    (issue) => issue.path[0] === "username",
                );
                expect(usernameIssue).toBeDefined();
                expect(usernameIssue?.message).toBe(
                    "Username should contain minimum 3 character(s)",
                );
            }
        });

        it("应该拒绝缺少 username 的数据", () => {
            // Arrange: 虽然有 email 和 password，但缺少 username
            const invalidData = {
                email: "user@example.com",
                password: "password123",
                // username 缺失
            };

            // Act
            const result = signUpSchema.safeParse(invalidData);

            // Assert
            expect(result.success).toBe(false);

            if (!result.success) {
                const usernameIssue = result.error.issues.find(
                    (issue) => issue.path[0] === "username",
                );
                expect(usernameIssue).toBeDefined();
                // Zod v4 的错误消息
                expect(usernameIssue?.message).toBeTruthy();
            }
        });

        it("应该继承 signInSchema 的所有验证规则", () => {
            // Arrange: 测试邮箱验证仍然有效
            const invalidData = {
                email: "invalid-email", // 无效邮箱
                password: "password123",
                username: "validuser",
            };

            // Act
            const result = signUpSchema.safeParse(invalidData);

            // Assert: 应该因为邮箱无效而失败
            expect(result.success).toBe(false);

            if (!result.success) {
                const emailIssue = result.error.issues.find(
                    (issue) => issue.path[0] === "email",
                );
                expect(emailIssue).toBeDefined();
            }
        });
    });

    /**
     * 测试场景 3: 使用 .parse() 而不是 .safeParse()
     * .parse() 会在验证失败时抛出 ZodError
     */
    describe("使用 .parse() 测试（抛出错误）", () => {
        it("有效数据应该不抛出错误", () => {
            // Arrange
            const validData = {
                email: "user@example.com",
                password: "password123",
            };

            // Act & Assert: 应该不抛出错误
            expect(() => signInSchema.parse(validData)).not.toThrow();
        });

        it("无效数据应该抛出 ZodError", () => {
            // Arrange
            const invalidData = {
                email: "invalid",
                password: "123", // 太短
            };

            // Act & Assert: 应该抛出 ZodError
            expect(() => signInSchema.parse(invalidData)).toThrow(ZodError);
        });

        it("可以捕获并检查 ZodError 的详细信息", () => {
            // Arrange
            const invalidData = {
                email: "",
                password: "short",
            };

            // Act & Assert
            try {
                signInSchema.parse(invalidData);
                // 如果没有抛出错误，测试应该失败
                expect.fail("应该抛出 ZodError");
            } catch (error) {
                // 验证是 ZodError 实例
                expect(error).toBeInstanceOf(ZodError);

                if (error instanceof ZodError) {
                    // 检查错误数量（使用 issues 而不是 errors）
                    expect(error.issues.length).toBeGreaterThan(0);

                    // 检查是否包含邮箱错误
                    const hasEmailIssue = error.issues.some(
                        (issue) => issue.path[0] === "email",
                    );
                    expect(hasEmailIssue).toBe(true);

                    // 检查是否包含密码错误
                    const hasPasswordIssue = error.issues.some(
                        (issue) => issue.path[0] === "password",
                    );
                    expect(hasPasswordIssue).toBe(true);
                }
            }
        });
    });

    /**
     * 测试场景 4: 边界条件测试（Edge Cases）
     */
    describe("边界条件测试", () => {
        it("密码刚好 8 个字符应该通过", () => {
            // Arrange
            const data = {
                email: "user@example.com",
                password: "12345678", // 刚好 8 个字符
            };

            // Act
            const result = signInSchema.safeParse(data);

            // Assert
            expect(result.success).toBe(true);
        });

        it("用户名刚好 3 个字符应该通过", () => {
            // Arrange
            const data = {
                email: "user@example.com",
                password: "password123",
                username: "abc", // 刚好 3 个字符
            };

            // Act
            const result = signUpSchema.safeParse(data);

            // Assert
            expect(result.success).toBe(true);
        });

        it("应该允许非常长的密码", () => {
            // Arrange: 测试没有最大长度限制
            const data = {
                email: "user@example.com",
                password: "a".repeat(1000), // 1000 个字符
            };

            // Act
            const result = signInSchema.safeParse(data);

            // Assert: 只要 >= 8 就应该通过
            expect(result.success).toBe(true);
        });

        it("应该允许包含特殊字符的邮箱", () => {
            // Arrange: 合法但复杂的邮箱
            const data = {
                email: "user+test123@sub.example.co.uk",
                password: "password123",
            };

            // Act
            const result = signInSchema.safeParse(data);

            // Assert
            expect(result.success).toBe(true);
        });
    });

    /**
     * 测试场景 5: 类型推断测试
     * 验证 TypeScript 类型系统是否正确工作
     */
    describe("TypeScript 类型推断", () => {
        it("SignInSchema 类型应该包含 email 和 password", () => {
            // Arrange: 使用类型注解
            const validData = {
                email: "user@example.com",
                password: "password123",
            };

            // Act
            const result = signInSchema.safeParse(validData);

            // Assert: TypeScript 编译时会检查类型
            if (result.success) {
                // 这些字段应该存在且类型正确
                const email: string = result.data.email;
                const password: string = result.data.password;

                expect(email).toBe("user@example.com");
                expect(password).toBe("password123");
            }
        });

        it("SignUpSchema 类型应该包含 email, password 和 username", () => {
            // Arrange
            const validData = {
                email: "user@example.com",
                password: "password123",
                username: "testuser",
            };

            // Act
            const result = signUpSchema.safeParse(validData);

            // Assert
            if (result.success) {
                const username: string = result.data.username;
                expect(username).toBe("testuser");
            }
        });
    });
});
