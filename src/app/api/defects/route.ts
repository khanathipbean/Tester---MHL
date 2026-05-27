import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";

export async function GET() {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const project = await prisma.project.findFirst({ orderBy: { createdAt: "asc" } });
    if (!project) return NextResponse.json({ data: [] });

    const defects = await prisma.defect.findMany({
        where: { projectId: project.id },
        orderBy: { createdAt: "desc" },
        include: {
            testCase: { select: { key: true, title: true } },
        },
    });

    const data = defects.map((d) => ({
        ...d,
        createdAt: d.createdAt.toISOString(),
        updatedAt: d.updatedAt.toISOString(),
    }));

    return NextResponse.json({ data });
}

export async function POST(req: NextRequest) {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const role = user.role as string;
    if (role === "VIEWER") return NextResponse.json({ message: "Forbidden" }, { status: 403 });

    const body = await req.json();
    const { title, description, severity, priority, testCaseId, executionId, projectId } = body;

    if (!title) {
        return NextResponse.json({ message: "Title is required" }, { status: 400 });
    }

    let resolvedProjectId = projectId;
    if (!resolvedProjectId) {
        const project = await prisma.project.findFirst({ orderBy: { createdAt: "asc" } });
        if (!project) return NextResponse.json({ message: "No project found" }, { status: 404 });
        resolvedProjectId = project.id;
    }

    const count = await prisma.defect.count({ where: { projectId: resolvedProjectId } });
    const key = `DEF-${String(count + 1).padStart(3, "0")}`;

    const defect = await prisma.defect.create({
        data: {
            projectId: resolvedProjectId,
            key,
            title,
            description: description || null,
            severity: severity || "MEDIUM",
            priority: priority || "MEDIUM",
            testCaseId: testCaseId || null,
            executionId: executionId || null,
            status: "OPEN",
        },
    });

    return NextResponse.json({ data: defect }, { status: 201 });
}
