import { type NextRequest, NextResponse } from "next/server";
import { getAuthInstance as getAuth } from "@/modules/auth/utils/auth-utils";

export async function middleware(request: NextRequest) {
    try {
        console.log("=== Middleware triggered ===");
        console.log("Request URL:", request.url);
        console.log("Request path:", request.nextUrl.pathname);

        // Log all cookies
        const cookies = request.cookies.getAll();
        console.log("Cookies:", cookies);

        const auth = await getAuth();
        const session = await auth.api.getSession({
            headers: request.headers,
        });

        console.log("Session result:", JSON.stringify(session, null, 2));

        if (!session) {
            console.log("❌ No session found, redirecting to /login");
            return NextResponse.redirect(new URL("/login", request.url));
        }

        console.log("✅ Session valid, allowing access");
        return NextResponse.next();
    } catch (error) {
        console.error("❌ Middleware error:", error);
        return NextResponse.redirect(new URL("/login", request.url));
    }
}

export const config = {
    matcher: [
        "/dashboard/:path*", // Protects /dashboard and all sub-routes
    ],
};
