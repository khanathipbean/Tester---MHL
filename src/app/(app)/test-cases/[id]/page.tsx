import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { TestCaseDetail } from "@/components/test-cases/test-case-detail";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const tc = await prisma.testCase.findUnique({ where: { id }, select: { key: true, title: true } });
    return { title: tc ? `${tc.key} - ${tc.title}` : "Test Case" };
}

export default async function TestCaseDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const user = await getCurrentUser();
    if (!user) redirect("/login");

    const { id } = await params;

    const testCase = await prisma.testCase.findUnique({
        where: { id },
        include: {
            suite: { select: { id: true, name: true } },
            defects: {
                select: { id: true, key: true, title: true, severity: true, status: true },
                orderBy: { createdAt: "desc" },
            },
            executions: {
                select: {
                    id: true,
                    status: true,
                    executedAt: true,
                    actualResult: true,
                    testRun: { select: { key: true, name: true } },
                },
                orderBy: { executedAt: "desc" },
                take: 10,
            },
        },
    });

    if (!testCase) notFound();

    const serialized = {
        ...testCase,
        createdAt: testCase.createdAt.toISOString(),
        updatedAt: testCase.updatedAt.toISOString(),
        executions: testCase.executions.map((e) => ({
            ...e,
            executedAt: e.executedAt?.toISOString() || null,
        })),
    };

    return (
        <div className="mx-auto w-full max-w-5xl 2xl:max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8 2xl:px-12">
            <TestCaseDetail testCase={serialized} />
        </div>
    );
}
