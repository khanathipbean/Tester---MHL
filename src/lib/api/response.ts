import "server-only";

import { NextResponse } from "next/server";
import type { ApiResponse } from "@/types/api";

export function successResponse<T>(data: T, message?: string, status = 200) {
    const body: ApiResponse<T> = { ok: true, data, message };
    return NextResponse.json(body, { status });
}

export function errorResponse(error: string, status = 400) {
    const body: ApiResponse<never> = { ok: false, error };
    return NextResponse.json(body, { status });
}

export function validationErrorResponse(
    error: string,
    issues: Record<string, string[]>,
) {
    const body: ApiResponse<never> = { ok: false, error, issues };
    return NextResponse.json(body, { status: 422 });
}

export function unauthorizedResponse(message = "Unauthorized") {
    return errorResponse(message, 401);
}

export function forbiddenResponse(message = "Forbidden") {
    return errorResponse(message, 403);
}

export function notFoundResponse(message = "Not found") {
    return errorResponse(message, 404);
}
