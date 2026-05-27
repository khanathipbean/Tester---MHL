import { z } from "zod";

export const createTagSchema = z.object({
    projectId: z.string().min(1, "Project ID is required"),
    name: z.string().min(1, "Name is required").max(50),
    color: z.string().max(20).optional(),
});

export const updateTagSchema = z.object({
    name: z.string().min(1, "Name is required").max(50).optional(),
    color: z.string().max(20).nullable().optional(),
});

export type CreateTagInput = z.infer<typeof createTagSchema>;
export type UpdateTagInput = z.infer<typeof updateTagSchema>;
