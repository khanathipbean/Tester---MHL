import { z } from "zod";

export const createModuleSchema = z.object({
    projectId: z.string().min(1, "Project ID is required"),
    name: z.string().min(1, "Name is required").max(200),
    description: z.string().max(1000).optional(),
    parentId: z.string().optional(),
});

export const updateModuleSchema = z.object({
    name: z.string().min(1, "Name is required").max(200).optional(),
    description: z.string().max(1000).nullable().optional(),
    parentId: z.string().nullable().optional(),
});

export type CreateModuleInput = z.infer<typeof createModuleSchema>;
export type UpdateModuleInput = z.infer<typeof updateModuleSchema>;
