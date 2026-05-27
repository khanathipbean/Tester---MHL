import { type NextRequest } from "next/server";

import { prisma } from "@/lib/db/prisma";
import { withAuth, withRole } from "@/lib/api/auth";
import { successResponse, errorResponse } from "@/lib/api/response";

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    const { error } = await withRole(["ADMIN", "QA"]);
    if (error) return error;

    const { id } = await params;
    const body = await request.json();
    const { name, description } = body;

    if (!name?.trim()) {
        return errorResponse("Project name is required", 400);
    }

    const project = await prisma.project.findUnique({ where: { id } });
    if (!project) {
        return errorResponse("Project not found", 404);
    }

    const updated = await prisma.project.update({
        where: { id },
        data: { name: name.trim(), description: description?.trim() || null },
    });

    return successResponse(updated, "Project updated");
}

export async function DELETE(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    const { error } = await withRole(["ADMIN"]);
    if (error) return error;

    const { id } = await params;

    const project = await prisma.project.findUnique({ where: { id } });
    if (!project) {
        return errorResponse("Project not found", 404);
    }

    await prisma.project.delete({ where: { id } });

    return successResponse(null, "Project deleted");
}
