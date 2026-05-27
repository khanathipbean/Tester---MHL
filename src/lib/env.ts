import { envSchema } from "@/validations/env";

export const env = envSchema.parse({
  databaseUrl: process.env.DATABASE_URL,
  appName: process.env.APP_NAME,
  publicAppName: process.env.NEXT_PUBLIC_APP_NAME,
  nextAuthUrl: process.env.NEXTAUTH_URL,
  nextAuthSecret: process.env.NEXTAUTH_SECRET,
  geminiApiKey: process.env.GEMINI_API_KEY,
});
