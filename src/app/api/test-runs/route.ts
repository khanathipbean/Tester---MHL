import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";

export async function GET() {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const project = await prisma.project.findFirst({ orderBy: { createdAt: "asc" } });
    if (!project) return NextResponse.json({ data: [] });

    const testRuns = await prisma.testRun.findMany({
        where: { projectId: project.id },
        orderBy: { createdAt: "desc" },
        include: {
            _count: { select: { executions: true } },
            executions: { select: { status: true } },
        },
    });

    const data = testRuns.map((run) => {
        const total = run.executions.length;
        const passed = run.executions.filter((e) => e.status === "PASSED").length;
        const failed = run.executions.filter((e) => e.status === "FAILED").length;
        const blocked = run.executions.filter((e) => e.status === "BLOCKED").length;
        return {
            id: run.id,
            key: run.key,
            name: run.name,
            environment: run.environment,
            status: run.status,
            startedAt: run.startedAt?.toISOString() || null,
            completedAt: run.completedAt?.toISOString() || null,
            createdAt: run.createdAt.toISOString(),
            total,
            passed,
            failed,
            blocked,
        };
    });

    return NextResponse.json({ data });
}

export async function POST(req: NextRequest) {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const role = user.role as string;
    if (role === "VIEWER") return NextResponse.json({ message: "Forbidden" }, { status: 403 });

    const body = await req.json();
    const { name, environment, testCaseIds, projectId } = body;

    if (!name || !Array.isArray(testCaseIds) || testCaseIds.length === 0) {
        return NextResponse.json({ message: "Name and test cases are required" }, { status: 400 });
    }

    let resolvedProjectId = projectId;
    if (!resolvedProjectId) {
        const project = await prisma.project.findFirst({ orderBy: { createdAt: "asc" } });
        if (!project) return NextResponse.json({ message: "No project found" }, { status: 404 });
        resolvedProjectId = project.id;
    }

    // Generate key
    const count = await prisma.testRun.count({ where: { projectId: resolvedProjectId } });
    const key = `TR-${String(count + 1).padStart(3, "0")}`;

    const testRun = await prisma.testRun.create({
        data: {
            projectId: resolvedProjectId,
            key,
            name,
            environment: environment || null,
            status: "PLANNED",
            executions: {
                create: testCaseIds.map((testCaseId: string) => ({
                    testCaseId,
                    status: "NOT_RUN",
                })),
            },
        },
    });

    return NextResponse.json({ data: testRun }, { status: 201 });
}
