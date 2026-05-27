import { type NextRequest } from "next/server";

import { prisma } from "@/lib/db/prisma";
import { withAuth } from "@/lib/api/auth";
import { successResponse } from "@/lib/api/response";

export async function GET(request: NextRequest) {
    const { error } = await withAuth();
    if (error) return error;

    const projectId = request.nextUrl.searchParams.get("projectId") || undefined;

    const whereExecution = projectId
        ? { testRun: { projectId } }
        : {};

    const whereTestCase = projectId ? { projectId } : {};

    const [totalTestCases, executions, moduleSummaries] = await Promise.all([
        prisma.testCase.count({ where: whereTestCase }),

        prisma.testExecution.groupBy({
            by: ["status"],
            where: whereExecution,
            _count: { status: true },
        }),

        prisma.testSuite.findMany({
            where: whereTestCase,
            select: {
                id: true,
                name: true,
                updatedAt: true,
                testCases: {
                    select: {
                        executions: {
                            select: { status: true },
                            orderBy: { executedAt: "desc" },
                            take: 1,
                        },
                    },
                },
            },
        }),
    ]);

    // Aggregate execution statuses
    const statusMap: Record<string, number> = {};
    for (const e of executions) {
        statusMap[e.status] = e._count.status;
    }

    const totalExecutions = Object.values(statusMap).reduce((a, b) => a + b, 0);
    const passed = statusMap["PASSED"] || 0;
    const failed = statusMap["FAILED"] || 0;

    const passRate = totalExecutions > 0 ? (passed / totalExecutions) * 100 : 0;
    const failedRate = totalExecutions > 0 ? (failed / totalExecutions) * 100 : 0;

    // Module-level summary
    const modules = moduleSummaries.map((mod) => {
        const total = mod.testCases.length;
        let modPassed = 0;
        let modFailed = 0;

        for (const tc of mod.testCases) {
            const latestExec = tc.executions[0];
            if (latestExec?.status === "PASSED") modPassed++;
            if (latestExec?.status === "FAILED") modFailed++;
        }

        return {
            id: mod.id,
            name: mod.name,
            total,
            passed: modPassed,
            failed: modFailed,
            passRate: total > 0 ? (modPassed / total) * 100 : 0,
            updatedAt: mod.updatedAt,
        };
    });

    return successResponse({
        totalTestCases,
        totalExecutions,
        passed,
        failed,
        passRate: Math.round(passRate * 100) / 100,
        failedRate: Math.round(failedRate * 100) / 100,
        modules,
    });
}
