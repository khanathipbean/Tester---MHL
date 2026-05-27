import { z } from "zod";

export const createTestCaseSchema = z.object({
    projectId: z.string().min(1, "Project ID is required"),
    suiteId: z.string().optional(),
    title: z.string().min(1, "Title is required").max(300),
    description: z.string().max(5000).optional(),
    preconditions: z.string().max(2000).optional(),
    condition: z.string().max(2000).optional(),
    testSteps: z.string().max(5000).optional(),
    expectedResult: z.string().max(5000).optional(),
    priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).default("MEDIUM"),
    type: z.enum(["FUNCTIONAL", "REGRESSION", "SMOKE", "INTEGRATION", "E2E"]).default("FUNCTIONAL"),
    status: z.enum(["DRAFT", "READY", "DEPRECATED", "PASS", "FAIL", "NOT_RUN", "BLOCKED"]).default("DRAFT"),
    automationStatus: z.enum(["MANUAL", "AUTOMATED", "NEEDS_UPDATE"]).default("MANUAL"),
    notes: z.string().max(2000).optional(),
    clarificationRequired: z.boolean().default(false),
    inProgress: z.boolean().default(false),
    tested: z.boolean().default(false),
});

export const updateTestCaseSchema = z.object({
    suiteId: z.string().nullable().optional(),
    title: z.string().min(1).max(300).optional(),
    description: z.string().max(5000).nullable().optional(),
    preconditions: z.string().max(2000).nullable().optional(),
    condition: z.string().max(2000).nullable().optional(),
    testSteps: z.string().max(5000).nullable().optional(),
    expectedResult: z.string().max(5000).nullable().optional(),
    priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).optional(),
    type: z.enum(["FUNCTIONAL", "REGRESSION", "SMOKE", "INTEGRATION", "E2E"]).optional(),
    status: z.enum(["DRAFT", "READY", "DEPRECATED", "PASS", "FAIL", "NOT_RUN", "BLOCKED"]).optional(),
    automationStatus: z.enum(["MANUAL", "AUTOMATED", "NEEDS_UPDATE"]).optional(),
    notes: z.string().max(2000).nullable().optional(),
    clarificationRequired: z.boolean().optional(),
    inProgress: z.boolean().optional(),
    tested: z.boolean().optional(),
});

export type CreateTestCaseInput = z.infer<typeof createTestCaseSchema>;
export type UpdateTestCaseInput = z.infer<typeof updateTestCaseSchema>;
