import { type NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { successResponse } from "@/lib/api/response";

// GET /api/notifications — Get current user's notifications
export async function GET() {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const notifications = await prisma.notification.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        take: 50,
    });

    const unreadCount = await prisma.notification.count({
        where: { userId: user.id, read: false },
    });

    return successResponse({ notifications, unreadCount });
}

// PATCH /api/notifications — Mark notifications as read
export async function PATCH(request: NextRequest) {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { ids, markAllRead } = body;

    if (markAllRead) {
        await prisma.notification.updateMany({
            where: { userId: user.id, read: false },
            data: { read: true },
        });
    } else if (ids && Array.isArray(ids)) {
        await prisma.notification.updateMany({
            where: { id: { in: ids }, userId: user.id },
            data: { read: true },
        });
    }

    return successResponse({ success: true });
}

// DELETE /api/notifications — Clear all notifications
export async function DELETE() {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    await prisma.notification.deleteMany({
        where: { userId: user.id },
    });

    return successResponse({ success: true });
}
