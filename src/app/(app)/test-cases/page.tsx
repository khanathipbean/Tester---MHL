import { Suspense } from "react";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { TestCasesClient } from "@/components/test-cases/test-cases-client";

export const metadata = {
    title: "Test Cases",
};

export default async function TestCasesPage() {
    const user = await getCurrentUser();
    if (!user) redirect("/login");

    const role = user.role as "ADMIN" | "QA" | "VIEWER";

    const [projects, testCases, modules, tags] = await Promise.all([
        prisma.project.findMany({
            orderBy: { createdAt: "asc" },
            select: { id: true, name: true, key: true },
        }),
        prisma.testCase.findMany({
            orderBy: { key: "asc" },
            include: {
                suite: { select: { id: true, name: true } },
                tags: { include: { tag: true } },
                _count: { select: { steps: true, executions: true, defects: true } },
            },
        }),
        prisma.testSuite.findMany({
            select: { id: true, name: true, projectId: true },
            orderBy: { name: "asc" },
        }),
        prisma.tag.findMany({
            orderBy: { name: "asc" },
            select: { id: true, name: true, color: true, projectId: true },
        }),
    ]);

    const serializedCases = testCases.map((tc) => ({
        ...tc,
        tags: tc.tags.map((t) => t.tag),
        createdAt: tc.createdAt.toISOString(),
        updatedAt: tc.updatedAt.toISOString(),
    }));

    return (
        <div className="mx-auto w-full max-w-7xl 2xl:max-w-[1800px] px-4 py-6 sm:px-6 lg:px-8 2xl:px-12">
            <div className="space-y-4">
                <Suspense>
                    <TestCasesClient
                        testCases={serializedCases}
                        modules={modules}
                        projects={projects}
                        tags={tags}
                        canEdit={role === "ADMIN" || role === "QA"}
                        canDelete={role === "ADMIN"}
                    />
                </Suspense>
            </div>
        </div>
    );
}
