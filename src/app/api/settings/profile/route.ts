import { type NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { successResponse } from "@/lib/api/response";

// PATCH /api/settings/profile — Update own profile (name, email)
export async function PATCH(request: NextRequest) {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { name, email } = body;

    const data: Record<string, string> = {};

    if (name && typeof name === "string" && name.trim()) {
        data.name = name.trim();
    }

    if (email && typeof email === "string" && email.trim()) {
        // Check if email is already taken by another user
        const existing = await prisma.user.findFirst({
            where: { email: email.trim(), NOT: { id: user.id } },
        });
        if (existing) {
            return NextResponse.json({ message: "Email already in use" }, { status: 409 });
        }
        data.email = email.trim();
    }

    if (Object.keys(data).length === 0) {
        return NextResponse.json({ message: "No data to update" }, { status: 400 });
    }

    await prisma.user.update({
        where: { id: user.id },
        data,
    });

    return successResponse(null, "Profile updated");
}
