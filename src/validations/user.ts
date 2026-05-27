import { z } from "zod";

export const updateUserRoleSchema = z.object({
    role: z.enum(["ADMIN", "QA", "VIEWER"]),
});

export type UpdateUserRoleInput = z.infer<typeof updateUserRoleSchema>;
