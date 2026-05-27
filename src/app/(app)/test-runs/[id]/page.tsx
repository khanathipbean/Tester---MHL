import { getCurrentUser } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { TestRunExecute } from "@/components/test-runs/test-run-execute";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function TestRunDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const user = await getCurrentUser();
    if (!user) redirect("/login");

    const { id } = await params;
    const role = user.role as "ADMIN" | "QA" | "VIEWER";

    const testRun = await prisma.testRun.findUnique({
        where: { id },
        include: {
            executions: {
                include: {
                    testCase: {
                        select: { key: true, title: true, priority: true, condition: true, testSteps: true, expectedResult: true, tags: { include: { tag: true } } },
                    },
                },
                orderBy: { testCase: { key: "asc" } },
            },
        },
    });

    if (!testRun) redirect("/test-runs");

    const serialized = {
        id: testRun.id,
        key: testRun.key,
        name: testRun.name,
        environment: testRun.environment,
        status: testRun.status,
        executions: testRun.executions.map((e) => ({
            id: e.id,
            testCaseId: e.testCaseId,
            status: e.status,
            actualResult: e.actualResult,
            notes: e.notes,
            executedAt: e.executedAt?.toISOString() || null,
            testCase: {
                ...e.testCase,
                tags: e.testCase.tags.map((t) => t.tag),
            },
        })),
    };

    return (
        <div className="mx-auto w-full max-w-7xl 2xl:max-w-[1800px] px-4 py-6 sm:px-6 lg:px-8 2xl:px-12">
            <div className="mb-6">
                <Link href="/test-runs" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-2">
                    <ArrowLeft className="h-4 w-4" /> Back to Test Runs
                </Link>
                <h1 className="text-2xl font-semibold tracking-tight">
                    {testRun.name} <span className="text-muted-foreground font-normal text-base">({testRun.key})</span>
                </h1>
                {testRun.environment && (
                    <p className="text-sm text-muted-foreground">Environment: {testRun.environment}</p>
                )}
            </div>
            <TestRunExecute
                testRun={serialized}
                canEdit={role === "ADMIN" || role === "QA"}
            />
        </div>
    );
}
