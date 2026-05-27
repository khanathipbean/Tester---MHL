import { type NextRequest } from "next/server";

import { prisma } from "@/lib/db/prisma";
import { withRole } from "@/lib/api/auth";
import { getCurrentUser } from "@/lib/auth/session";
import { successResponse, notFoundResponse } from "@/lib/api/response";
import { NextResponse } from "next/server";

interface RouteParams {
    params: Promise<{ id: string }>;
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
    const { error } = await withRole(["ADMIN"]);
    if (error) return error;

    const { id } = await params;

    // Prevent self-deletion
    const currentUser = await getCurrentUser();
    if (currentUser?.id === id) {
        return NextResponse.json(
            { message: "Cannot delete your own account" },
            { status: 400 },
        );
    }

    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) return notFoundResponse("User not found");

    await prisma.user.delete({ where: { id } });

    return successResponse(null, "User deleted");
}
