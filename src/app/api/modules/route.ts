import { type NextRequest } from "next/server";

import { prisma } from "@/lib/db/prisma";
import { withAuth, withRole } from "@/lib/api/auth";
import {
    successResponse,
    errorResponse,
    validationErrorResponse,
} from "@/lib/api/response";
import { parseSearchParams, paginate } from "@/lib/api/pagination";
import { createModuleSchema } from "@/validations/module";

export async function GET(request: NextRequest) {
    const { error } = await withAuth();
    if (error) return error;

    const { page, limit, skip, search, sortBy, sortOrder } = parseSearchParams(
        request.url,
    );

    const projectId = request.nextUrl.searchParams.get("projectId") || undefined;

    const where = {
        ...(projectId && { projectId }),
        ...(search && {
            name: { contains: search },
        }),
    };

    const [items, total] = await Promise.all([
        prisma.testSuite.findMany({
            where,
            skip,
            take: limit,
            orderBy: { [sortBy || "createdAt"]: sortOrder },
            include: {
                _count: { select: { testCases: true, children: true } },
            },
        }),
        prisma.testSuite.count({ where }),
    ]);

    return successResponse(paginate(items, total, page, limit));
}

export async function POST(request: NextRequest) {
    const { error } = await withRole(["ADMIN", "QA"]);
    if (error) return error;

    const body = await request.json();
    const parsed = createModuleSchema.safeParse(body);

    if (!parsed.success) {
        return validationErrorResponse(
            "Validation failed",
            parsed.error.flatten().fieldErrors as Record<string, string[]>,
        );
    }

    const { projectId, name, description, parentId } = parsed.data;

    const existing = await prisma.testSuite.findFirst({
        where: { projectId, name },
    });

    if (existing) {
        return errorResponse("A module with this name already exists in the project", 409);
    }

    const module = await prisma.testSuite.create({
        data: { projectId, name, description, parentId },
    });

    return successResponse(module, "Module created", 201);
}
