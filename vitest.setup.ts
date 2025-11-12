/**
 * Vitest Setup File
 * 在所有测试运行前执行，用于配置全局测试环境
 */

import { expect, afterEach } from "vitest";
import { cleanup } from "@testing-library/react";
import * as matchers from "@testing-library/jest-dom/matchers";

// 扩展 Vitest 的 expect 断言，添加 @testing-library/jest-dom 的 matchers
// 例如：toBeInTheDocument(), toHaveClass(), toHaveTextContent() 等
expect.extend(matchers);

// 每个测试后自动清理 React 组件
// 防止测试之间的状态污染
afterEach(() => {
    cleanup();
});
