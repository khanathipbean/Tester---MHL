import { type NextRequest } from "next/server";

import { prisma } from "@/lib/db/prisma";
import { withAuth, withRole } from "@/lib/api/auth";
import {
    successResponse,
    notFoundResponse,
    validationErrorResponse,
} from "@/lib/api/response";
import { updateTestCaseSchema } from "@/validations/test-case";

interface RouteParams {
    params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
    const { error } = await withAuth();
    if (error) return error;

    const { id } = await params;

    const testCase = await prisma.testCase.findUnique({
        where: { id },
        include: {
            suite: { select: { id: true, name: true } },
            steps: { orderBy: { position: "asc" } },
            _count: { select: { executions: true, defects: true } },
        },
    });

    if (!testCase) return notFoundResponse("Test case not found");

    return successResponse(testCase);
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
    const { user, error } = await withRole(["ADMIN", "QA"]);
    if (error) return error;

    const { id } = await params;

    const existing = await prisma.testCase.findUnique({ where: { id } });
    if (!existing) return notFoundResponse("Test case not found");

    const body = await request.json();
    const parsed = updateTestCaseSchema.safeParse(body);

    if (!parsed.success) {
        return validationErrorResponse(
            "Validation failed",
            parsed.error.flatten().fieldErrors as Record<string, string[]>,
        );
    }

    const testCase = await prisma.testCase.update({
        where: { id },
        data: {
            ...parsed.data,
            updatedByName: user!.name,
        },
    });

    return successResponse(testCase, "Test case updated");
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
    const { error } = await withRole(["ADMIN"]);
    if (error) return error;

    const { id } = await params;

    const existing = await prisma.testCase.findUnique({ where: { id } });
    if (!existing) return notFoundResponse("Test case not found");

    await prisma.testCase.delete({ where: { id } });

    return successResponse(null, "Test case deleted");
}
