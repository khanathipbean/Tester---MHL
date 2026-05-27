import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { UsersClient } from "@/components/users/users-client";

export const metadata = {
    title: "Users",
};

export default async function UsersPage() {
    const user = await getCurrentUser();
    if (!user) redirect("/login");

    if (user.role !== "ADMIN") {
        redirect("/");
    }

    const users = await prisma.user.findMany({
        orderBy: { createdAt: "desc" },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            createdAt: true,
            updatedAt: true,
        },
    });

    const serialized = users.map((u) => ({
        ...u,
        createdAt: u.createdAt.toISOString(),
        updatedAt: u.updatedAt.toISOString(),
    }));

    return (
        <div className="mx-auto w-full max-w-7xl 2xl:max-w-[1800px] px-4 py-6 sm:px-6 lg:px-8 2xl:px-12">
            <UsersClient users={serialized} />
        </div>
    );
}
