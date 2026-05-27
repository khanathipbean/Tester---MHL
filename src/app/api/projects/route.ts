import { type NextRequest } from "next/server";

import { prisma } from "@/lib/db/prisma";
import { withAuth, withRole } from "@/lib/api/auth";
import { successResponse, errorResponse } from "@/lib/api/response";

export async function GET() {
    const { error } = await withAuth();
    if (error) return error;

    const projects = await prisma.project.findMany({
        orderBy: { createdAt: "desc" },
        include: {
            _count: { select: { suites: true, testCases: true } },
        },
    });

    return successResponse(projects);
}

export async function POST(request: NextRequest) {
    const { error } = await withRole(["ADMIN", "QA"]);
    if (error) return error;

    const body = await request.json();
    const { name, description } = body;

    if (!name?.trim()) {
        return errorResponse("Project name is required", 400);
    }

    // Generate key from name
    const key = name
        .trim()
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, "_")
        .slice(0, 20);

    const existing = await prisma.project.findFirst({
        where: { key },
    });

    if (existing) {
        return errorResponse("A project with this key already exists", 409);
    }

    const project = await prisma.project.create({
        data: { key, name: name.trim(), description: description?.trim() || null },
    });

    return successResponse(project, "Project created", 201);
}
