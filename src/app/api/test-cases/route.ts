import { type NextRequest } from "next/server";

import { prisma } from "@/lib/db/prisma";
import { withAuth, withRole } from "@/lib/api/auth";
import {
    successResponse,
    validationErrorResponse,
} from "@/lib/api/response";
import { parseSearchParams, paginate } from "@/lib/api/pagination";
import { createTestCaseSchema } from "@/validations/test-case";

export async function GET(request: NextRequest) {
    const { error } = await withAuth();
    if (error) return error;

    const { page, limit, skip, search, sortBy, sortOrder } = parseSearchParams(
        request.url,
    );

    const sp = request.nextUrl.searchParams;
    const projectId = sp.get("projectId") || undefined;
    const suiteId = sp.get("suiteId") || undefined;
    const status = sp.get("status") || undefined;
    const priority = sp.get("priority") || undefined;

    const where = {
        ...(projectId && { projectId }),
        ...(suiteId && { suiteId }),
        ...(status && { status }),
        ...(priority && { priority }),
        ...(search && {
            OR: [
                { title: { contains: search } },
                { key: { contains: search } },
            ],
        }),
    };

    const [items, total] = await Promise.all([
        prisma.testCase.findMany({
            where,
            skip,
            take: limit,
            orderBy: { [sortBy || "createdAt"]: sortOrder },
            include: {
                suite: { select: { id: true, name: true } },
                tags: { include: { tag: true } },
                _count: { select: { steps: true, executions: true, defects: true } },
            },
        }),
        prisma.testCase.count({ where }),
    ]);

    return successResponse(paginate(items, total, page, limit));
}

export async function POST(request: NextRequest) {
    const { user, error } = await withRole(["ADMIN", "QA"]);
    if (error) return error;

    const body = await request.json();
    const parsed = createTestCaseSchema.safeParse(body);

    if (!parsed.success) {
        return validationErrorResponse(
            "Validation failed",
            parsed.error.flatten().fieldErrors as Record<string, string[]>,
        );
    }

    const { projectId, ...rest } = parsed.data;

    // Generate next key for this project
    const lastCase = await prisma.testCase.findFirst({
        where: { projectId },
        orderBy: { createdAt: "desc" },
        select: { key: true },
    });

    const nextNum = lastCase
        ? Number(lastCase.key.split("-").pop()) + 1
        : 1;

    const project = await prisma.project.findUnique({
        where: { id: projectId },
        select: { key: true },
    });

    const key = `${project?.key || "TC"}-${nextNum}`;

    const testCase = await prisma.testCase.create({
        data: {
            ...rest,
            projectId,
            key,
            createdByName: user!.name,
        },
    });

    return successResponse(testCase, "Test case created", 201);
}
