import { type NextRequest } from "next/server";

import { prisma } from "@/lib/db/prisma";
import { withAuth, withRole } from "@/lib/api/auth";
import { successResponse, validationErrorResponse } from "@/lib/api/response";
import { createTagSchema } from "@/validations/tag";

export async function GET(request: NextRequest) {
    const { error } = await withAuth();
    if (error) return error;

    const projectId = request.nextUrl.searchParams.get("projectId") || undefined;

    const where = {
        ...(projectId && { projectId }),
    };

    const tags = await prisma.tag.findMany({
        where,
        orderBy: { name: "asc" },
        include: { _count: { select: { testCases: true } } },
    });

    return successResponse(tags);
}

export async function POST(request: NextRequest) {
    const { error } = await withRole(["ADMIN", "QA"]);
    if (error) return error;

    const body = await request.json();
    const parsed = createTagSchema.safeParse(body);

    if (!parsed.success) {
        return validationErrorResponse(
            "Validation failed",
            parsed.error.flatten().fieldErrors as Record<string, string[]>,
        );
    }

    const tag = await prisma.tag.create({
        data: parsed.data,
    });

    return successResponse(tag, "Tag created", 201);
}
