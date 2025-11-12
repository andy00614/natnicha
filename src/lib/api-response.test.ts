/**
 * 测试 2: API Response 辅助函数测试
 *
 * 这个测试展示了如何测试异步函数和 HTTP Response 对象
 * 在 Next.js/Cloudflare Workers 中，API 路由返回 Response 对象
 *
 * 学习要点：
 * 1. 测试异步函数（async/await）
 * 2. 解析和验证 JSON Response
 * 3. 检查 HTTP 状态码和 headers
 * 4. 类型安全的泛型测试
 */

import { describe, it, expect } from "vitest";
import {
    successResponse,
    errorResponse,
    unauthorizedResponse,
    notFoundResponse,
    serverErrorResponse,
    type ApiResponse,
} from "./api-response";

describe("API Response 辅助函数", () => {
    /**
     * 测试场景 1: 成功响应（Success Response）
     * 验证成功的 API 响应格式
     */
    describe("successResponse()", () => {
        it("应该返回正确格式的成功响应", async () => {
            // Arrange: 准备测试数据
            const testData = { id: "123", name: "Test User" };
            const testMessage = "操作成功";

            // Act: 调用函数生成 Response
            const response = successResponse(testData, testMessage);

            // Assert: 验证 Response 属性
            expect(response).toBeInstanceOf(Response);
            expect(response.status).toBe(200); // 默认状态码
            expect(response.headers.get("Content-Type")).toBe(
                "application/json",
            );

            // 解析 JSON body
            const body = (await response.json()) as ApiResponse<
                typeof testData
            >;

            // 验证 JSON 结构
            expect(body.success).toBe(true);
            expect(body.data).toEqual(testData);
            expect(body.error).toBe(null);
            expect(body.message).toBe(testMessage);
        });

        it("应该支持自定义状态码", async () => {
            // Arrange
            const data = { created: true };
            const customStatus = 201; // Created

            // Act
            const response = successResponse(data, undefined, customStatus);

            // Assert
            expect(response.status).toBe(201);

            const body = (await response.json()) as ApiResponse;
            expect(body.success).toBe(true);
            expect(body.data).toEqual(data);
        });

        it("应该处理空数据的成功响应", async () => {
            // Act: 传入 null 或空对象
            const response = successResponse(null);

            // Assert
            const body = (await response.json()) as ApiResponse;
            expect(body.success).toBe(true);
            expect(body.data).toBe(null);
            expect(body.error).toBe(null);
        });
    });

    /**
     * 测试场景 2: 错误响应（Error Response）
     * 验证错误的 API 响应格式
     */
    describe("errorResponse()", () => {
        it("应该返回正确格式的错误响应", async () => {
            // Arrange
            const errorMessage = "验证失败：邮箱格式不正确";
            const statusCode = 400; // Bad Request

            // Act
            const response = errorResponse(errorMessage, statusCode);

            // Assert
            expect(response.status).toBe(400);

            const body = (await response.json()) as ApiResponse;
            expect(body.success).toBe(false);
            expect(body.error).toBe(errorMessage);
            expect(body.data).toBe(null);
        });

        it("应该支持默认状态码 400", async () => {
            // Act: 不传状态码，应该使用默认值 400
            const response = errorResponse("Something went wrong");

            // Assert
            expect(response.status).toBe(400);
        });

        it("应该支持附加数据字段", async () => {
            // Arrange: 有时候错误响应也需要返回额外数据
            const errorData = { field: "email", reason: "already exists" };

            // Act
            const response = errorResponse(
                "Email already registered",
                409, // Conflict
                errorData,
            );

            // Assert
            const body = (await response.json()) as ApiResponse;
            expect(body.success).toBe(false);
            expect(body.error).toBe("Email already registered");
            expect(body.data).toEqual(errorData);
        });
    });

    /**
     * 测试场景 3: 专用错误响应函数
     * 测试快捷的错误响应生成器
     */
    describe("专用错误响应函数", () => {
        it("unauthorizedResponse() 应该返回 401 状态码", async () => {
            // Act
            const response = unauthorizedResponse();

            // Assert
            expect(response.status).toBe(401);

            const body = (await response.json()) as ApiResponse;
            expect(body.success).toBe(false);
            expect(body.error).toBe("Authentication required");
        });

        it("unauthorizedResponse() 应该支持自定义消息", async () => {
            // Arrange
            const customMessage = "请先登录";

            // Act
            const response = unauthorizedResponse(customMessage);

            // Assert
            const body = (await response.json()) as ApiResponse;
            expect(body.error).toBe(customMessage);
        });

        it("notFoundResponse() 应该返回 404 状态码", async () => {
            // Act
            const response = notFoundResponse("用户未找到");

            // Assert
            expect(response.status).toBe(404);

            const body = (await response.json()) as ApiResponse;
            expect(body.success).toBe(false);
            expect(body.error).toBe("用户未找到");
        });

        it("serverErrorResponse() 应该返回 500 状态码", async () => {
            // Act
            const response = serverErrorResponse("数据库连接失败");

            // Assert
            expect(response.status).toBe(500);

            const body = (await response.json()) as ApiResponse;
            expect(body.success).toBe(false);
            expect(body.error).toBe("数据库连接失败");
        });
    });

    /**
     * 测试场景 4: 类型安全测试（TypeScript 泛型）
     * 验证泛型类型推断是否正确
     */
    describe("类型安全（TypeScript）", () => {
        it("应该正确推断泛型类型", async () => {
            // Arrange: 定义复杂的类型
            interface User {
                id: string;
                email: string;
                name: string;
                createdAt: Date;
            }

            const user: User = {
                id: "user123",
                email: "test@example.com",
                name: "Test User",
                createdAt: new Date("2024-01-01"),
            };

            // Act
            const response = successResponse<User>(user);

            // Assert: TypeScript 应该能正确推断类型
            const body = (await response.json()) as ApiResponse<User>;

            // 这里 TypeScript 编译器会检查类型
            expect(body.data?.id).toBe("user123");
            expect(body.data?.email).toBe("test@example.com");
            expect(body.data?.name).toBe("Test User");
        });

        it("应该支持数组类型的响应", async () => {
            // Arrange
            const users = [
                { id: "1", name: "User 1" },
                { id: "2", name: "User 2" },
            ];

            // Act
            const response = successResponse(users);

            // Assert
            const body = (await response.json()) as ApiResponse<typeof users>;
            expect(body.data).toHaveLength(2);
            expect(body.data?.[0].name).toBe("User 1");
        });
    });

    /**
     * 测试场景 5: 实际使用案例
     * 模拟 API 路由中的使用场景
     */
    describe("实际使用案例", () => {
        it("模拟成功的用户登录 API 响应", async () => {
            // Arrange: 模拟登录成功后的数据
            const loginData = {
                user: { id: "u1", email: "user@example.com" },
                token: "jwt-token-here",
            };

            // Act: 创建成功响应
            const response = successResponse(loginData, "登录成功");

            // Assert
            expect(response.status).toBe(200);

            const body = (await response.json()) as ApiResponse<
                typeof loginData
            >;
            expect(body.success).toBe(true);
            expect(body.message).toBe("登录成功");
            expect(body.data?.token).toBe("jwt-token-here");
        });

        it("模拟表单验证失败的 API 响应", async () => {
            // Arrange: 模拟表单验证错误
            const validationErrors = {
                email: "邮箱格式不正确",
                password: "密码至少需要 8 位",
            };

            // Act
            const response = errorResponse(
                "表单验证失败",
                422, // Unprocessable Entity
                validationErrors,
            );

            // Assert
            expect(response.status).toBe(422);

            const body = (await response.json()) as ApiResponse;
            expect(body.success).toBe(false);
            expect(body.error).toBe("表单验证失败");
            expect(body.data).toEqual(validationErrors);
        });
    });
});
