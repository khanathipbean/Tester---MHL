import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { ProjectsClient } from "@/components/projects/projects-client";

export const metadata = {
    title: "Projects",
};

export default async function ProjectsPage() {
    const user = await getCurrentUser();
    if (!user) redirect("/login");

    const role = user.role as "ADMIN" | "QA" | "VIEWER";

    const projects = await prisma.project.findMany({
        orderBy: { createdAt: "desc" },
        include: {
            suites: {
                orderBy: { name: "asc" },
                include: {
                    _count: { select: { testCases: true } },
                },
            },
            _count: { select: { testCases: true } },
        },
    });

    const serialized = projects.map((p) => ({
        id: p.id,
        key: p.key,
        name: p.name,
        description: p.description,
        status: p.status,
        createdAt: p.createdAt.toISOString(),
        updatedAt: p.updatedAt.toISOString(),
        testCaseCount: p._count.testCases,
        modules: p.suites.map((s) => ({
            id: s.id,
            name: s.name,
            description: s.description,
            testCaseCount: s._count.testCases,
            createdAt: s.createdAt.toISOString(),
            updatedAt: s.updatedAt.toISOString(),
        })),
    }));

    return (
        <div className="mx-auto w-full max-w-7xl 2xl:max-w-[1800px] px-4 py-6 sm:px-6 lg:px-8 2xl:px-12">
            <ProjectsClient
                projects={serialized}
                canEdit={role === "ADMIN" || role === "QA"}
                canDelete={role === "ADMIN"}
            />
        </div>
    );
}
