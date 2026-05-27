import { type NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/db/prisma";
import { withRole } from "@/lib/api/auth";
import { successResponse } from "@/lib/api/response";
import { parseSearchParams, paginate } from "@/lib/api/pagination";
import { hashPassword } from "@/lib/auth/password";

export async function GET(request: NextRequest) {
    const { error } = await withRole(["ADMIN"]);
    if (error) return error;

    const { page, limit, skip, search } = parseSearchParams(request.url);

    const where = search
        ? {
            OR: [
                { name: { contains: search } },
                { email: { contains: search } },
            ],
        }
        : {};

    const [items, total] = await Promise.all([
        prisma.user.findMany({
            where,
            skip,
            take: limit,
            orderBy: { createdAt: "desc" },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true,
                updatedAt: true,
            },
        }),
        prisma.user.count({ where }),
    ]);

    return successResponse(paginate(items, total, page, limit));
}

export async function POST(request: NextRequest) {
    const { error } = await withRole(["ADMIN"]);
    if (error) return error;

    const body = await request.json();
    const { name, email, password, role } = body;

    if (!name || !email || !password) {
        return NextResponse.json({ message: "Name, email, and password are required" }, { status: 400 });
    }

    if (password.length < 6) {
        return NextResponse.json({ message: "Password must be at least 6 characters" }, { status: 400 });
    }

    const validRoles = ["ADMIN", "QA", "VIEWER"];
    if (role && !validRoles.includes(role)) {
        return NextResponse.json({ message: "Invalid role" }, { status: 400 });
    }

    // Check if email already exists
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
        return NextResponse.json({ message: "Email already exists" }, { status: 409 });
    }

    const hashedPassword = await hashPassword(password);

    const user = await prisma.user.create({
        data: {
            name,
            email,
            password: hashedPassword,
            role: role || "QA",
        },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            createdAt: true,
            updatedAt: true,
        },
    });

    return successResponse(user, "User created", 201);
}
