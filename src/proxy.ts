import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const publicPaths = ["/login", "/api/auth"];

function isPublicPath(pathname: string): boolean {
    return publicPaths.some((path) => pathname.startsWith(path));
}

export function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Allow static assets and public paths
    if (
        pathname.startsWith("/_next") ||
        pathname.startsWith("/favicon") ||
        pathname.includes(".") ||
        isPublicPath(pathname)
    ) {
        return NextResponse.next();
    }

    // Check for session token (optimistic check)
    const token =
        request.cookies.get("next-auth.session-token")?.value ??
        request.cookies.get("__Secure-next-auth.session-token")?.value;

    if (!token) {
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("callbackUrl", pathname);
        return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
