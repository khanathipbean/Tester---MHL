import { type NextRequest } from "next/server";

import { prisma } from "@/lib/db/prisma";
import { withAuth, withRole } from "@/lib/api/auth";
import {
    successResponse,
    notFoundResponse,
    validationErrorResponse,
} from "@/lib/api/response";
import { updateTagSchema } from "@/validations/tag";

interface RouteParams {
    params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
    const { error } = await withAuth();
    if (error) return error;

    const { id } = await params;

    const tag = await prisma.tag.findUnique({
        where: { id },
        include: { _count: { select: { testCases: true } } },
    });

    if (!tag) return notFoundResponse("Tag not found");

    return successResponse(tag);
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
    const { error } = await withRole(["ADMIN", "QA"]);
    if (error) return error;

    const { id } = await params;

    const existing = await prisma.tag.findUnique({ where: { id } });
    if (!existing) return notFoundResponse("Tag not found");

    const body = await request.json();
    const parsed = updateTagSchema.safeParse(body);

    if (!parsed.success) {
        return validationErrorResponse(
            "Validation failed",
            parsed.error.flatten().fieldErrors as Record<string, string[]>,
        );
    }

    const tag = await prisma.tag.update({
        where: { id },
        data: parsed.data,
    });

    return successResponse(tag, "Tag updated");
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
    const { error } = await withRole(["ADMIN"]);
    if (error) return error;

    const { id } = await params;

    const existing = await prisma.tag.findUnique({ where: { id } });
    if (!existing) return notFoundResponse("Tag not found");

    await prisma.tag.delete({ where: { id } });

    return successResponse(null, "Tag deleted");
}
