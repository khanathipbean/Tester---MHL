import "server-only";

import { getServerSession } from "next-auth";

import { authConfig } from "@/lib/auth/config";

export async function getSession() {
    return getServerSession(authConfig);
}

export async function getCurrentUser() {
    const session = await getSession();

    if (!session?.user) {
        return null;
    }

    return session.user;
}
