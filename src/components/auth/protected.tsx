import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth/session";
import type { Role } from "@/lib/auth/permissions";

interface ProtectedProps {
    children: React.ReactNode;
    allowedRoles?: Role[];
}

export async function Protected({ children, allowedRoles }: ProtectedProps) {
    const user = await getCurrentUser();

    if (!user) {
        redirect("/login");
    }

    if (allowedRoles && !allowedRoles.includes(user.role as Role)) {
        redirect("/");
    }

    return <>{children}</>;
}
