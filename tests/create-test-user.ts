/**
 * 通过 API 创建测试用户
 * 用于 CI 环境在测试前创建测试账户
 */

const TEST_USER = {
    email: process.env.E2E_TEST_EMAIL || "e2e-test@example.com",
    password: process.env.E2E_TEST_PASSWORD || "TestPassword123!",
    name: "E2E Test User",
};

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

async function createTestUser() {
    console.log("🔧 Creating test user via signup API...");
    console.log("📧 Email:", TEST_USER.email);

    try {
        // 调用注册 API（Better Auth 的 signup endpoint）
        const response = await fetch(`${BASE_URL}/api/auth/sign-up`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                email: TEST_USER.email,
                password: TEST_USER.password,
                name: TEST_USER.name,
            }),
        });

        if (response.ok) {
            const data = await response.json();
            console.log("✅ Test user created successfully!");
            console.log("Response:", data);
        } else {
            const error = await response.text();

            // 如果用户已存在，不算错误
            if (error.includes("already exists") || response.status === 409) {
                console.log("ℹ️  Test user already exists, skipping creation");
            } else {
                console.error("❌ Failed to create user:", error);
                throw new Error(`Signup failed: ${error}`);
            }
        }
    } catch (error) {
        console.error("❌ Error creating test user:", error);
        throw error;
    }
}

// 运行
createTestUser()
    .then(() => {
        console.log("✅ Test user setup complete");
        process.exit(0);
    })
    .catch((error) => {
        console.error("❌ Setup failed:", error);
        process.exit(1);
    });
