import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import * as XLSX from "xlsx";

export async function POST(req: NextRequest) {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const role = user.role as string;
    if (role === "VIEWER") return NextResponse.json({ message: "Forbidden" }, { status: 403 });

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const projectId = formData.get("projectId") as string | null;

    if (!file || !projectId) {
        return NextResponse.json({ message: "File and projectId are required" }, { status: 400 });
    }

    // Verify project exists
    const project = await prisma.project.findUnique({
        where: { id: projectId },
        select: { id: true, key: true },
    });
    if (!project) {
        return NextResponse.json({ message: "Project not found" }, { status: 404 });
    }

    // Get all modules for this project
    const suites = await prisma.testSuite.findMany({
        where: { projectId },
        select: { id: true, name: true },
    });
    const suiteMap = new Map(suites.map((s) => [s.name.toLowerCase(), s.id]));

    // Parse Excel
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: "array" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json<string[]>(sheet, { header: 1, defval: "", raw: false });

    // Expected columns: A=Key, B=Module, C=Condition/Title, D=TestSteps, E=ExpectedResult, F=Priority, G=Status, H=Notes
    // Skip header row. Accept any row that has meaningful content (Key OR Module OR Title)
    const dataRows = rows.slice(1).filter((row) => {
        const key = String(row[0] || "").trim();
        const module = String(row[1] || "").trim();
        const title = String(row[2] || "").trim();
        return key || module || title;
    });

    if (dataRows.length === 0) {
        return NextResponse.json({ message: "No data rows found in file" }, { status: 400 });
    }

    // Get last key number for this project (find max numeric suffix)
    const allCases = await prisma.testCase.findMany({
        where: { projectId },
        select: { id: true, key: true },
    });
    let maxNum = 0;
    for (const c of allCases) {
        const num = Number(c.key.split("-").pop()) || 0;
        if (num > maxNum) maxNum = num;
    }
    let nextNum = maxNum + 1;

    // Pre-fetch all existing cases for upsert check
    const existingKeyMap = new Map(allCases.map((c) => [c.key, c.id]));

    const priorityMap: Record<string, string> = {
        critical: "CRITICAL",
        high: "HIGH",
        medium: "MEDIUM",
        low: "LOW",
    };

    const statusMap: Record<string, string> = {
        pass: "PASS",
        fail: "FAIL",
        draft: "DRAFT",
        ready: "READY",
        "not run": "NOT_RUN",
        blocked: "BLOCKED",
    };

    let created = 0;
    let updated = 0;
    let skipped = 0;
    let modulesCreated = 0;
    const newModuleNames: string[] = [];
    const errors: string[] = [];

    for (let i = 0; i < dataRows.length; i++) {
        const row = dataRows[i];
        const rowNum = i + 2; // 1-indexed + header

        try {
            const keyRaw = String(row[0] || "").trim();
            const moduleName = String(row[1] || "").trim();
            const condition = String(row[2] || "").trim();
            const testSteps = String(row[3] || "").trim();
            const expectedResult = String(row[4] || "").trim();
            const priorityRaw = String(row[5] || "").trim().toLowerCase();
            const statusRaw = String(row[6] || "").trim().toLowerCase();
            const notes = String(row[7] || "").trim();

            // Skip rows where Column C onward are all empty — these are just section headers
            if (!condition && !testSteps && !expectedResult && !priorityRaw && !statusRaw && !notes) {
                skipped++;
                continue;
            }

            const title = condition || keyRaw || moduleName;

            if (!title) {
                skipped++;
                continue;
            }

            // Match module or create new one
            let suiteId: string | null = null;
            if (moduleName) {
                const matched = suiteMap.get(moduleName.toLowerCase());
                if (matched) {
                    suiteId = matched;
                } else {
                    const newSuite = await prisma.testSuite.create({
                        data: {
                            projectId,
                            name: moduleName,
                        },
                    });
                    suiteId = newSuite.id;
                    suiteMap.set(moduleName.toLowerCase(), newSuite.id);
                    modulesCreated++;
                    newModuleNames.push(moduleName);
                }
            }

            const priority = priorityMap[priorityRaw] || "MEDIUM";
            const status = statusMap[statusRaw] || "DRAFT";

            // Check if key already exists in project — update if so
            if (keyRaw && existingKeyMap.has(keyRaw)) {
                const existingId = existingKeyMap.get(keyRaw)!;
                await prisma.testCase.update({
                    where: { id: existingId },
                    data: {
                        title,
                        condition: condition || null,
                        testSteps: testSteps || null,
                        expectedResult: expectedResult || null,
                        priority,
                        status,
                        notes: notes && notes !== "-" ? notes : null,
                        suiteId,
                    },
                });
                updated++;
                continue;
            }

            // Use original key if provided, otherwise generate
            const key = keyRaw || `${project.key}-${nextNum++}`;

            const newCase = await prisma.testCase.create({
                data: {
                    projectId,
                    key,
                    title,
                    condition: condition || null,
                    testSteps: testSteps || null,
                    expectedResult: expectedResult || null,
                    priority,
                    status,
                    notes: notes && notes !== "-" ? notes : null,
                    suiteId,
                    type: "FUNCTIONAL",
                    automationStatus: "MANUAL",
                    createdByName: user.name,
                },
            });
            // Track newly created key to handle duplicates within same file
            existingKeyMap.set(key, newCase.id);
            created++;
        } catch (rowErr: unknown) {
            const msg = rowErr instanceof Error ? rowErr.message : "Unknown error";
            errors.push(`Row ${rowNum}: ${msg}`);
            skipped++;
        }
    }

    // Create notification for import complete
    const usersToNotify = await prisma.notificationPreference.findMany({
        where: { importComplete: true },
        select: { userId: true },
    });
    if (usersToNotify.length > 0) {
        await prisma.notification.createMany({
            data: usersToNotify.map((u) => ({
                userId: u.userId,
                type: "IMPORT_COMPLETE",
                title: "Import Complete",
                message: `Imported ${created} test cases${updated > 0 ? `, updated ${updated}` : ""}.`,
                link: `/test-cases`,
            })),
        });
    }

    return NextResponse.json({
        data: { created, updated, skipped, modulesCreated, newModuleNames, total: dataRows.length, errors: errors.slice(0, 20) },
        message: `Imported ${created} test cases. Updated ${updated}.${skipped > 0 ? ` Skipped ${skipped}.` : ""}${modulesCreated > 0 ? ` Created ${modulesCreated} new module(s).` : ""}`,
    });
}
