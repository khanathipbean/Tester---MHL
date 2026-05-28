import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "src/prisma/schema.prisma",
  datasource: {
    url: process.env.DATABASE_URL || "postgresql://placeholder:placeholder@localhost:5432/placeholder",
  },
  migrations: {
    path: "src/prisma/migrations",
    seed: "npx tsx src/prisma/seed.ts",
  },
});
