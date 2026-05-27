import { type NextRequest } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

import { prisma } from "@/lib/db/prisma";
import { env } from "@/lib/env";
import { withRole } from "@/lib/api/auth";
import { successResponse, errorResponse } from "@/lib/api/response";

// Auto-tag test cases using Gemini AI
export async function POST(request: NextRequest) {
    const { error } = await withRole(["ADMIN", "QA"]);
    if (error) return error;

    if (!env.geminiApiKey) {
        return errorResponse("GEMINI_API_KEY is not configured", 500);
    }

    const body = await request.json();
    const { projectId, testCaseIds } = body as { projectId: string; testCaseIds?: string[] };

    if (!projectId) {
        return errorResponse("projectId is required");
    }

    // Get project tags
    const tags = await prisma.tag.findMany({
        where: { projectId },
    });

    if (tags.length === 0) {
        return errorResponse("No tags found for this project. Create tags first.");
    }

    // Get test cases to tag
    const whereClause: { projectId: string; id?: { in: string[] } } = { projectId };
    if (testCaseIds && testCaseIds.length > 0) {
        whereClause.id = { in: testCaseIds };
    }

    console.log("[auto-tag] whereClause:", JSON.stringify(whereClause));
    console.log("[auto-tag] testCaseIds count:", testCaseIds?.length ?? "not provided");

    const testCases = await prisma.testCase.findMany({
        where: whereClause,
        select: {
            id: true,
            title: true,
            expectedResult: true,
            tags: { select: { tagId: true } },
        },
    });

    console.log("[auto-tag] Found test cases:", testCases.length);
    if (testCases.length > 0) {
        console.log("[auto-tag] First case tags:", JSON.stringify(testCases[0].tags));
    }

    if (testCases.length === 0) {
        return errorResponse("No test cases found");
    }

    // Filter out test cases that already have tags
    const untaggedCases = testCases.filter((tc) => tc.tags.length === 0);
    console.log("[auto-tag] Untagged cases:", untaggedCases.length);

    if (untaggedCases.length === 0) {
        return successResponse({ tagged: 0, message: "All test cases already have tags" });
    }

    const genAI = new GoogleGenerativeAI(env.geminiApiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const tagList = tags.map((t) => `"${t.name}" (id: ${t.id})`).join(", ");

    // Process in batches of 10 to respect rate limits
    const BATCH_SIZE = 10;
    let taggedCount = 0;
    const results: { testCaseId: string; tagId: string; tagName: string }[] = [];
    let lastError: string | null = null;

    for (let i = 0; i < untaggedCases.length; i += BATCH_SIZE) {
        const batch = untaggedCases.slice(i, i + BATCH_SIZE);

        const casesText = batch.map((tc, idx) => (
            `[${idx}] Title: "${tc.title}" | Expected Result: "${tc.expectedResult || "N/A"}"`
        )).join("\n");

        const prompt = `You are a QA test case classifier. Given the following tags: ${tagList}

Assign exactly ONE most relevant tag to each test case based on its title and expected result.

Test cases:
${casesText}

Respond with ONLY a JSON array like: [{"index": 0, "tagId": "..."}]
No explanation, no markdown, just the JSON array.`;

        try {
            const result = await model.generateContent(prompt);
            const text = result.response.text().trim();

            // Parse JSON from response (handle potential markdown wrapping)
            const jsonStr = text.replace(/^```json?\s*/, "").replace(/\s*```$/, "");
            const assignments = JSON.parse(jsonStr) as { index: number; tagId: string }[];

            for (const assignment of assignments) {
                const tc = batch[assignment.index];
                const tag = tags.find((t) => t.id === assignment.tagId);
                if (!tc || !tag) continue;

                // Assign tag
                await prisma.testCaseTag.upsert({
                    where: { testCaseId_tagId: { testCaseId: tc.id, tagId: tag.id } },
                    create: { testCaseId: tc.id, tagId: tag.id },
                    update: {},
                });

                taggedCount++;
                results.push({ testCaseId: tc.id, tagId: tag.id, tagName: tag.name });
            }
        } catch (e: unknown) {
            const errMsg = e instanceof Error ? e.message : String(e);
            console.error("Auto-tag batch error:", errMsg);
            lastError = errMsg;
            // If quota exceeded, stop immediately
            if (errMsg.includes("429") || errMsg.includes("quota")) {
                break;
            }
        }

        // Rate limit: wait 4 seconds between batches (15 req/min = 1 req per 4s)
        if (i + BATCH_SIZE < untaggedCases.length) {
            await new Promise((resolve) => setTimeout(resolve, 4000));
        }
    }

    // If no cases were tagged and there was an error, return the error
    if (taggedCount === 0 && lastError) {
        if (lastError.includes("429") || lastError.includes("quota")) {
            return errorResponse("Gemini API quota exceeded — กรุณาสร้าง API key ใหม่หรือรอ quota reset", 429);
        }
        return errorResponse(`AI error: ${lastError.slice(0, 200)}`, 500);
    }

    return successResponse({
        tagged: taggedCount,
        total: untaggedCases.length,
        results,
    });
}
