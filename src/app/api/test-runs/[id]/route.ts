import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";

export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { id } = await params;

    const testRun = await prisma.testRun.findUnique({
        where: { id },
        include: {
            executions: {
                include: {
                    testCase: { select: { key: true, title: true, priority: true, condition: true, testSteps: true, expectedResult: true } },
                },
                orderBy: { testCase: { key: "asc" } },
            },
        },
    });

    if (!testRun) return NextResponse.json({ message: "Not found" }, { status: 404 });

    return NextResponse.json({
        data: {
            ...testRun,
            startedAt: testRun.startedAt?.toISOString() || null,
            completedAt: testRun.completedAt?.toISOString() || null,
            createdAt: testRun.createdAt.toISOString(),
            updatedAt: testRun.updatedAt.toISOString(),
        },
    });
}

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const role = user.role as string;
    if (role === "VIEWER") return NextResponse.json({ message: "Forbidden" }, { status: 403 });

    const { id } = await params;
    const body = await req.json();

    // Update execution status
    if (body.executionId && body.status) {
        const execution = await prisma.testExecution.update({
            where: { id: body.executionId },
            data: {
                status: body.status,
                actualResult: body.actualResult || null,
                notes: body.notes || null,
                executedAt: new Date(),
            },
            select: { id: true, status: true, testCaseId: true },
        });

        // Sync test case status based on execution result
        const statusMapping: Record<string, string> = {
            PASSED: "PASS",
            FAILED: "FAIL",
            BLOCKED: "BLOCKED",
        };
        const mappedStatus = statusMapping[body.status];
        if (mappedStatus && execution.testCaseId) {
            await prisma.testCase.update({
                where: { id: execution.testCaseId },
                data: { status: mappedStatus },
            });
        }

        // Check if all executions are done
        const allExecs = await prisma.testExecution.findMany({
            where: { testRunId: id },
            select: { status: true },
        });
        const allDone = allExecs.every((e) => e.status !== "NOT_RUN");
        if (allDone) {
            await prisma.testRun.update({
                where: { id },
                data: { status: "COMPLETED", completedAt: new Date() },
            });
        } else {
            // Auto-transition from PLANNED to IN_PROGRESS on first execution
            const run = await prisma.testRun.findUnique({ where: { id }, select: { status: true } });
            if (run?.status === "PLANNED") {
                await prisma.testRun.update({
                    where: { id },
                    data: { status: "IN_PROGRESS", startedAt: new Date() },
                });
            }
        }

        return NextResponse.json({ data: execution });
    }

    // Update test run name
    if (body.name) {
        const testRun = await prisma.testRun.update({
            where: { id },
            data: { name: body.name },
        });
        return NextResponse.json({ data: testRun });
    }

    // Update test run status
    if (body.status) {
        const testRun = await prisma.testRun.update({
            where: { id },
            data: { status: body.status, completedAt: body.status === "COMPLETED" ? new Date() : undefined },
        });
        return NextResponse.json({ data: testRun });
    }

    return NextResponse.json({ message: "Invalid request" }, { status: 400 });
}

export async function DELETE(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const role = user.role as string;
    if (role !== "ADMIN") return NextResponse.json({ message: "Forbidden" }, { status: 403 });

    const { id } = await params;
    await prisma.testRun.delete({ where: { id } });

    return NextResponse.json({ message: "Deleted" });
}
