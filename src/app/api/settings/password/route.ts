import { type NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { successResponse } from "@/lib/api/response";

// PATCH /api/settings/password — Change own password
export async function PATCH(request: NextRequest) {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { currentPassword, newPassword } = body;

    if (!currentPassword || typeof currentPassword !== "string") {
        return NextResponse.json({ message: "Current password is required" }, { status: 400 });
    }

    if (!newPassword || typeof newPassword !== "string" || newPassword.length < 6) {
        return NextResponse.json({ message: "New password must be at least 6 characters" }, { status: 400 });
    }

    // Verify current password
    const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
    if (!dbUser) return NextResponse.json({ message: "User not found" }, { status: 404 });

    const valid = await verifyPassword(currentPassword, dbUser.password);
    if (!valid) {
        return NextResponse.json({ message: "Current password is incorrect" }, { status: 400 });
    }

    const hashedPassword = await hashPassword(newPassword);
    await prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword },
    });

    return successResponse(null, "Password changed successfully");
}
