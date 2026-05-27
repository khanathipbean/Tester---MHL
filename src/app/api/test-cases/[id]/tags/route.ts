import { type NextRequest } from "next/server";

import { prisma } from "@/lib/db/prisma";
import { withRole } from "@/lib/api/auth";
import { successResponse, notFoundResponse, errorResponse } from "@/lib/api/response";

interface RouteParams {
    params: Promise<{ id: string }>;
}

// Set tags for a test case (replace all)
export async function PUT(request: NextRequest, { params }: RouteParams) {
    const { error } = await withRole(["ADMIN", "QA"]);
    if (error) return error;

    const { id } = await params;

    const testCase = await prisma.testCase.findUnique({ where: { id } });
    if (!testCase) return notFoundResponse("Test case not found");

    const body = await request.json();
    const { tagIds } = body as { tagIds: string[] };

    if (!Array.isArray(tagIds)) {
        return errorResponse("tagIds must be an array");
    }

    // Delete existing tags and create new ones
    await prisma.testCaseTag.deleteMany({ where: { testCaseId: id } });

    if (tagIds.length > 0) {
        await prisma.testCaseTag.createMany({
            data: tagIds.map((tagId) => ({ testCaseId: id, tagId })),
        });
    }

    const updated = await prisma.testCase.findUnique({
        where: { id },
        include: {
            tags: { include: { tag: true } },
        },
    });

    return successResponse(updated?.tags.map((t) => t.tag), "Tags updated");
}
