import "server-only";

import { getSession } from "@/lib/auth/session";
import { type Role } from "@/lib/auth/permissions";
import { unauthorizedResponse, forbiddenResponse } from "@/lib/api/response";

export async function withAuth() {
    const session = await getSession();

    if (!session?.user) {
        return { user: null, error: unauthorizedResponse() };
    }

    return { user: session.user, error: null };
}

export async function withRole(allowedRoles: Role[]) {
    const { user, error } = await withAuth();

    if (error) return { user: null, error };

    if (!allowedRoles.includes(user!.role as Role)) {
        return { user: null, error: forbiddenResponse() };
    }

    return { user: user!, error: null };
}
