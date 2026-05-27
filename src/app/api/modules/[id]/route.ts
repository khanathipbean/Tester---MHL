import { type NextRequest } from "next/server";

import { prisma } from "@/lib/db/prisma";
import { withRole } from "@/lib/api/auth";
import {
    successResponse,
    notFoundResponse,
    validationErrorResponse,
} from "@/lib/api/response";
import { updateModuleSchema } from "@/validations/module";

interface RouteParams {
    params: Promise<{ id: string }>;
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
    const { error } = await withRole(["ADMIN", "QA"]);
    if (error) return error;

    const { id } = await params;

    const existing = await prisma.testSuite.findUnique({ where: { id } });
    if (!existing) return notFoundResponse("Module not found");

    const body = await request.json();
    const parsed = updateModuleSchema.safeParse(body);

    if (!parsed.success) {
        return validationErrorResponse(
            "Validation failed",
            parsed.error.flatten().fieldErrors as Record<string, string[]>,
        );
    }

    const module = await prisma.testSuite.update({
        where: { id },
        data: parsed.data,
    });

    return successResponse(module, "Module updated");
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
    const { error } = await withRole(["ADMIN"]);
    if (error) return error;

    const { id } = await params;

    const existing = await prisma.testSuite.findUnique({ where: { id } });
    if (!existing) return notFoundResponse("Module not found");

    await prisma.testSuite.delete({ where: { id } });

    return successResponse(null, "Module deleted");
}
