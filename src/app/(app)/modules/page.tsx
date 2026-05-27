import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { ModulesClient } from "@/components/modules/modules-client";

export const metadata = {
    title: "Modules",
};

export default async function ModulesPage() {
    const user = await getCurrentUser();
    if (!user) redirect("/login");

    const role = user.role as "ADMIN" | "QA" | "VIEWER";

    // Get the first project (or create a default one)
    let project = await prisma.project.findFirst({
        orderBy: { createdAt: "asc" },
    });

    if (!project) {
        project = await prisma.project.create({
            data: {
                key: "DEFAULT",
                name: "Default Project",
                description: "Default project for test case management",
            },
        });
    }

    const modules = await prisma.testSuite.findMany({
        where: { projectId: project.id },
        orderBy: { createdAt: "desc" },
        include: {
            _count: { select: { testCases: true, children: true } },
        },
    });

    const serialized = modules.map((m) => ({
        ...m,
        createdAt: m.createdAt.toISOString(),
        updatedAt: m.updatedAt.toISOString(),
    }));

    return (
        <div className="mx-auto w-full max-w-7xl 2xl:max-w-[1800px] px-4 py-6 sm:px-6 lg:px-8 2xl:px-12">
            <div className="space-y-4">
                <ModulesClient
                    modules={serialized}
                    projectId={project.id}
                    canEdit={role === "ADMIN" || role === "QA"}
                    canDelete={role === "ADMIN"}
                    total={modules.length}
                    page={1}
                    totalPages={1}
                />
            </div>
        </div>
    );
}
