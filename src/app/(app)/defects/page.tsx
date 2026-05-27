import { getCurrentUser } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { DefectsClient } from "@/components/defects/defects-client";

export const metadata = {
    title: "Defects",
};

export default async function DefectsPage() {
    const user = await getCurrentUser();
    if (!user) redirect("/login");

    const role = user.role as "ADMIN" | "QA" | "VIEWER";

    const [projects, defects, testCases, tags] = await Promise.all([
        prisma.project.findMany({
            orderBy: { createdAt: "asc" },
            select: { id: true, name: true, key: true },
        }),
        prisma.defect.findMany({
            orderBy: { createdAt: "desc" },
            include: {
                testCase: { select: { key: true, title: true, condition: true, testSteps: true, expectedResult: true, priority: true, status: true, tags: { include: { tag: true } } } },
            },
        }),
        prisma.testCase.findMany({
            select: { id: true, key: true, title: true, projectId: true },
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
                <h1 className="text-2xl font-semibold tracking-tight">Defects</h1>
                <p className="text-sm text-muted-foreground mt-1">No project found.</p>
            </div>
        );
    }

    const serializedDefects = defects.map((d) => ({
        ...d,
        testCase: d.testCase ? {
            key: d.testCase.key,
            title: d.testCase.title,
            condition: d.testCase.condition,
            testSteps: d.testCase.testSteps,
            expectedResult: d.testCase.expectedResult,
            priority: d.testCase.priority,
            status: d.testCase.status,
            tags: d.testCase.tags.map((t) => t.tag),
        } : null,
        createdAt: d.createdAt.toISOString(),
        updatedAt: d.updatedAt.toISOString(),
    }));

    return (
        <div className="mx-auto w-full max-w-7xl 2xl:max-w-[1800px] px-4 py-6 sm:px-6 lg:px-8 2xl:px-12">
            <DefectsClient
                defects={serializedDefects}
                testCases={testCases}
                projects={projects}
                tags={tags}
                canEdit={role === "ADMIN" || role === "QA"}
                canDelete={role === "ADMIN"}
            />
        </div>
    );
}
