/**
 * Auto-tag script: reads test cases' expectedResult and assigns tags based on keyword matching.
 * Run: npx tsx scripts/auto-tag.ts
 */

import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const adapter = new PrismaBetterSqlite3({
    url: process.env.DATABASE_URL ?? "file:./dev.db",
});

const prisma = new PrismaClient({ adapter });

// Tag definitions with keywords to match in expectedResult (case-insensitive)
const TAG_DEFINITIONS: { name: string; keywords: string[]; color: string }[] = [
    { name: "Load Page", keywords: ["load", "page load", "display page", "navigate", "redirect", "แสดงหน้า", "โหลด"], color: "#3b82f6" },
    { name: "Title", keywords: ["title", "heading", "header text", "หัวข้อ", "ชื่อหน้า"], color: "#8b5cf6" },
    { name: "Description", keywords: ["description", "subtitle", "detail text", "รายละเอียด", "คำอธิบาย"], color: "#06b6d4" },
    { name: "Card", keywords: ["card", "widget", "panel", "box", "การ์ด"], color: "#22c55e" },
    { name: "Filter", keywords: ["filter", "search", "dropdown", "select option", "กรอง", "ค้นหา", "ตัวกรอง"], color: "#f97316" },
    { name: "Permission", keywords: ["permission", "access", "role", "authorize", "unauthorized", "forbidden", "สิทธิ์", "อนุญาต"], color: "#ef4444" },
    { name: "Table", keywords: ["table", "column", "row", "list data", "grid", "ตาราง", "แถว", "คอลัมน์"], color: "#eab308" },
    { name: "History", keywords: ["history", "log", "audit", "changelog", "ประวัติ", "บันทึก"], color: "#ec4899" },
    { name: "Clear Filter", keywords: ["clear filter", "reset filter", "clear all", "ล้างตัวกรอง", "reset"], color: "#64748b" },
    { name: "Form", keywords: ["form", "input", "field", "submit", "save", "ฟอร์ม", "บันทึก", "กรอก"], color: "#14b8a6" },
    { name: "Button", keywords: ["button", "click", "btn", "action button", "ปุ่ม", "คลิก"], color: "#a855f7" },
    { name: "Modal", keywords: ["modal", "dialog", "popup", "confirm dialog", "ป๊อปอัพ", "ไดอะล็อก"], color: "#f43f5e" },
    { name: "Notification", keywords: ["notification", "toast", "alert", "message", "success message", "error message", "แจ้งเตือน"], color: "#10b981" },
    { name: "Pagination", keywords: ["pagination", "page number", "next page", "previous page", "หน้าถัดไป"], color: "#6366f1" },
    { name: "Sort", keywords: ["sort", "order by", "ascending", "descending", "เรียง", "จัดเรียง"], color: "#0ea5e9" },
    { name: "Validation", keywords: ["validation", "required", "invalid", "error field", "ตรวจสอบ", "กรุณากรอก"], color: "#dc2626" },
    { name: "Export", keywords: ["export", "download", "csv", "excel", "pdf", "ดาวน์โหลด", "ส่งออก"], color: "#84cc16" },
    { name: "Status", keywords: ["status", "badge", "state", "สถานะ"], color: "#f59e0b" },
];

function matchTags(text: string): string[] {
    const lower = text.toLowerCase();
    const matched: string[] = [];

    for (const tag of TAG_DEFINITIONS) {
        for (const keyword of tag.keywords) {
            if (lower.includes(keyword.toLowerCase())) {
                matched.push(tag.name);
                break;
            }
        }
    }

    return matched;
}

async function main() {
    console.log("🏷️  Auto-tagging test cases...\n");

    // Get all projects
    const projects = await prisma.project.findMany({ select: { id: true, name: true } });
    console.log(`Found ${projects.length} projects\n`);

    for (const project of projects) {
        console.log(`📁 Project: ${project.name}`);

        // Ensure all tags exist for this project
        for (const tagDef of TAG_DEFINITIONS) {
            await prisma.tag.upsert({
                where: { projectId_name: { projectId: project.id, name: tagDef.name } },
                create: { projectId: project.id, name: tagDef.name, color: tagDef.color },
                update: { color: tagDef.color },
            });
        }

        // Get all tags for this project (fresh after upsert)
        const tags = await prisma.tag.findMany({
            where: { projectId: project.id },
            select: { id: true, name: true },
        });
        const tagMap = new Map(tags.map((t) => [t.name, t.id]));

        // Get all test cases for this project
        const testCases = await prisma.testCase.findMany({
            where: { projectId: project.id },
            select: {
                id: true,
                key: true,
                expectedResult: true,
                title: true,
                testSteps: true,
                tags: { select: { tagId: true } },
            },
        });

        let assignedCount = 0;

        for (const tc of testCases) {
            // Combine expectedResult + title + testSteps for matching
            const textToMatch = [
                tc.expectedResult || "",
                tc.title || "",
                tc.testSteps || "",
            ].join(" ");

            if (!textToMatch.trim()) continue;

            const matchedTagNames = matchTags(textToMatch);
            if (matchedTagNames.length === 0) continue;

            const existingTagIds = new Set(tc.tags.map((t) => t.tagId));

            for (const tagName of matchedTagNames) {
                const tagId = tagMap.get(tagName);
                if (!tagId || existingTagIds.has(tagId)) continue;

                await prisma.testCaseTag.create({
                    data: { testCaseId: tc.id, tagId },
                });
                assignedCount++;
            }
        }

        console.log(`   ✅ ${testCases.length} test cases scanned, ${assignedCount} new tag assignments\n`);
    }

    console.log("🎉 Done!");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());
