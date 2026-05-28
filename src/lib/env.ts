import { envSchema } from "@/validations/env";

let _env: ReturnType<typeof envSchema.parse> | null = null;

export function getEnv() {
  if (!_env) {
    _env = envSchema.parse({
      databaseUrl: process.env.DATABASE_URL,
      appName: process.env.APP_NAME,
      publicAppName: process.env.NEXT_PUBLIC_APP_NAME,
      nextAuthUrl: process.env.NEXTAUTH_URL,
      nextAuthSecret: process.env.NEXTAUTH_SECRET,
      geminiApiKey: process.env.GEMINI_API_KEY,
    });
  }
  return _env;
}

// For backward compatibility - lazy proxy that validates on first access
export const env = new Proxy({} as ReturnType<typeof envSchema.parse>, {
  get(_, prop: string) {
    return getEnv()[prop as keyof ReturnType<typeof envSchema.parse>];
  },
});
