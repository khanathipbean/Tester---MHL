import { type NextRequest } from "next/server";

import { prisma } from "@/lib/db/prisma";
import { withRole } from "@/lib/api/auth";
import {
    successResponse,
    notFoundResponse,
    validationErrorResponse,
} from "@/lib/api/response";
import { updateUserRoleSchema } from "@/validations/user";

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
    const parsed = updateUserRoleSchema.safeParse(body);

    if (!parsed.success) {
        return validationErrorResponse(
            "Validation failed",
            parsed.error.flatten().fieldErrors as Record<string, string[]>,
        );
    }

    const user = await prisma.user.update({
        where: { id },
        data: { role: parsed.data.role },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            updatedAt: true,
        },
    });

    return successResponse(user, "User role updated");
}
