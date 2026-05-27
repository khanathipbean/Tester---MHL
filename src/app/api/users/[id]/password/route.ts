import { type NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/db/prisma";
import { withRole } from "@/lib/api/auth";
import { hashPassword } from "@/lib/auth/password";
import { successResponse, notFoundResponse } from "@/lib/api/response";

interface RouteParams {
    params: Promise<{ id: string }>;
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
    const { error } = await withRole(["ADMIN"]);
    if (error) return error;

    const { id } = await params;

    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) return notFoundResponse("User not found");

    const body = await request.json();
    const { password } = body;

    if (!password || typeof password !== "string" || password.length < 6) {
        return NextResponse.json(
            { message: "Password must be at least 6 characters" },
            { status: 400 },
        );
    }

    const hashedPassword = await hashPassword(password);

    await prisma.user.update({
        where: { id },
        data: { password: hashedPassword },
    });

    return successResponse(null, "Password updated");
}
