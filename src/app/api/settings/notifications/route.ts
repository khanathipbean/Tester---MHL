import { type NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { successResponse } from "@/lib/api/response";

// GET /api/settings/notifications — Get notification preferences
export async function GET() {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    let prefs = await prisma.notificationPreference.findUnique({
        where: { userId: user.id },
    });

    if (!prefs) {
        prefs = await prisma.notificationPreference.create({
            data: { userId: user.id },
        });
    }

    return successResponse(prefs);
}

// PATCH /api/settings/notifications — Update notification preferences
export async function PATCH(request: NextRequest) {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { emailEnabled, testRunComplete, defectAssigned, statusChange, importComplete } = body;

    const data: Record<string, boolean> = {};
    if (typeof emailEnabled === "boolean") data.emailEnabled = emailEnabled;
    if (typeof testRunComplete === "boolean") data.testRunComplete = testRunComplete;
    if (typeof defectAssigned === "boolean") data.defectAssigned = defectAssigned;
    if (typeof statusChange === "boolean") data.statusChange = statusChange;
    if (typeof importComplete === "boolean") data.importComplete = importComplete;

    const prefs = await prisma.notificationPreference.upsert({
        where: { userId: user.id },
        update: data,
        create: { userId: user.id, ...data },
    });

    return successResponse(prefs);
}
