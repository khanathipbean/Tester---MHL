import "server-only";

import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth/session";
import type { Role } from "@/lib/auth/permissions";

export async function requireAuth() {
    const user = await getCurrentUser();

    if (!user) {
        redirect("/login");
    }

    return user;
}

export async function requireRole(allowedRoles: Role[]) {
    const user = await requireAuth();

    if (!allowedRoles.includes(user.role as Role)) {
        throw new Error("Forbidden");
    }

    return user;
}
