import { getCurrentUser } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { TestRunsClient } from "@/components/test-runs/test-runs-client";

export const metadata = {
    title: "Test Runs",
};

export default async function TestRunsPage() {
    const user = await getCurrentUser();
    if (!user) redirect("/login");

    const role = user.role as "ADMIN" | "QA" | "VIEWER";

    const [projects, testRuns, testCases, tags] = await Promise.all([
        prisma.project.findMany({
            orderBy: { createdAt: "asc" },
            select: { id: true, name: true, key: true },
        }),
        prisma.testRun.findMany({
            orderBy: { createdAt: "desc" },
            include: {
                executions: { select: { status: true } },
            },
        }),
        prisma.testCase.findMany({
            select: { id: true, key: true, title: true, status: true, projectId: true, tags: { include: { tag: true } } },
            orderBy: { key: "asc" },
        }),
        prisma.tag.findMany({
            orderBy: { name: "asc" },
            select: { id: true, name: true, color: true, projectId: true },
        }),
    ]);

    if (projects.length === 0) {
        return (
            <div className="mx-auto w-full max-w-7xl 2xl:max-w-[1800px] px-4 py-6 sm:px-6 lg:px-8 2xl:px-12">
                <h1 className="text-2xl font-semibold tracking-tight">Test Runs</h1>
                <p className="text-sm text-muted-foreground mt-1">No project found.</p>
            </div>
        );
    }

    const serializedRuns = testRuns.map((run) => {
        const total = run.executions.length;
        const passed = run.executions.filter((e) => e.status === "PASSED").length;
        const failed = run.executions.filter((e) => e.status === "FAILED").length;
        const blocked = run.executions.filter((e) => e.status === "BLOCKED").length;
        return {
            id: run.id,
            projectId: run.projectId,
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

    const testCasesWithTags = testCases.map((tc) => ({
        ...tc,
        tags: tc.tags.map((t) => t.tag),
    }));

    return (
        <div className="mx-auto w-full max-w-7xl 2xl:max-w-[1800px] px-4 py-6 sm:px-6 lg:px-8 2xl:px-12">
            <TestRunsClient
                testRuns={serializedRuns}
                testCases={testCasesWithTags}
                projects={projects}
                tags={tags}
                canEdit={role === "ADMIN" || role === "QA"}
                canDelete={role === "ADMIN"}
            />
        </div>
    );
}
