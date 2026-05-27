import { getCurrentUser } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { SettingsClient } from "@/components/settings/settings-client";

export const metadata = {
    title: "Settings",
};

export default async function SettingsPage() {
    const user = await getCurrentUser();
    if (!user) redirect("/login");

    const dbUser = await prisma.user.findUnique({
        where: { id: user.id },
        select: { id: true, name: true, email: true, role: true },
    });

    if (!dbUser) redirect("/login");

    return (
        <div className="mx-auto w-full max-w-7xl 2xl:max-w-[1800px] px-4 py-6 sm:px-6 lg:px-8 2xl:px-12">
            <SettingsClient
                user={{
                    id: dbUser.id,
                    name: dbUser.name,
                    email: dbUser.email,
                    role: dbUser.role,
                }}
                isAdmin={dbUser.role === "ADMIN"}
            />
        </div>
    );
}
