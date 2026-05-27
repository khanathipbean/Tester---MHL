import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const role = user.role as string;
    if (role === "VIEWER") return NextResponse.json({ message: "Forbidden" }, { status: 403 });

    const { id } = await params;
    const body = await req.json();

    const defect = await prisma.defect.update({
        where: { id },
        data: {
            ...(body.title && { title: body.title }),
            ...(body.description !== undefined && { description: body.description }),
            ...(body.severity && { severity: body.severity }),
            ...(body.priority && { priority: body.priority }),
            ...(body.status && { status: body.status }),
            ...(body.testCaseId !== undefined && { testCaseId: body.testCaseId }),
            ...(body.externalUrl !== undefined && { externalUrl: body.externalUrl }),
        },
    });

    return NextResponse.json({ data: defect });
}

export async function DELETE(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const role = user.role as string;
    if (role !== "ADMIN") return NextResponse.json({ message: "Forbidden" }, { status: 403 });

    const { id } = await params;
    await prisma.defect.delete({ where: { id } });

    return NextResponse.json({ message: "Deleted" });
}
