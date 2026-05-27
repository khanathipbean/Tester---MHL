import { z } from "zod";

export const envSchema = z.object({
  databaseUrl: z.string().min(1),
  appName: z.string().min(1).default("Test Case Dashboard"),
  publicAppName: z.string().min(1).default("Test Case Dashboard"),
  nextAuthUrl: z.string().url().default("http://localhost:3000"),
  nextAuthSecret: z.string().min(1),
  geminiApiKey: z.string().optional(),
});
