# Test Case Dashboard

Production-grade foundation for a QA test case dashboard built with Next.js App Router, TypeScript, Tailwind CSS, shadcn/ui-style components, Prisma ORM, and SQLite.

Business workflows, dashboard widgets, and authentication screens are intentionally not implemented yet.

## Project Structure

```txt
src/
  app/
    (app)/
      layout.tsx
      page.tsx
    globals.css
    layout.tsx
  components/
    layout/
    providers/
    theme/
    ui/
  hooks/
  lib/
    db/
  services/
  types/
  validations/
  prisma/
    migrations/
    schema.prisma
```

## Package Installation

```bash
npm install @hookform/resolvers @prisma/client @prisma/adapter-better-sqlite3 @radix-ui/react-slot @tanstack/react-table bcrypt better-sqlite3 class-variance-authority clsx lucide-react next-auth next-themes react-hook-form recharts tailwind-merge zod
npm install -D @tailwindcss/postcss @types/bcrypt @types/node @types/react @types/react-dom eslint eslint-config-next prisma tailwindcss typescript
```

## Tailwind CSS

Tailwind v4 is configured with `@tailwindcss/postcss` in [postcss.config.mjs](./postcss.config.mjs), app-wide styles in [src/app/globals.css](./src/app/globals.css), and a small content config in [tailwind.config.ts](./tailwind.config.ts).

## shadcn/ui

shadcn/ui aliases are configured in [components.json](./components.json). The shared `cn` helper lives in [src/lib/utils.ts](./src/lib/utils.ts), and the first reusable primitive is [src/components/ui/button.tsx](./src/components/ui/button.tsx).

Useful commands:

```bash
npx shadcn@latest init
npx shadcn@latest add button
```

## Prisma and SQLite

Prisma 7 stores the datasource URL in [prisma.config.ts](./prisma.config.ts), while the schema itself lives in [src/prisma/schema.prisma](./src/prisma/schema.prisma). The Prisma Client singleton is in [src/lib/db/prisma.ts](./src/lib/db/prisma.ts) and uses `@prisma/adapter-better-sqlite3` for local SQLite.

```bash
npm run db:generate
npm run db:migrate
npm run db:studio
```

The initial SQL migration is generated at [src/prisma/migrations/20260521000000_init/migration.sql](./src/prisma/migrations/20260521000000_init/migration.sql).

## Environment Variables

Copy [.env.example](./.env.example) into `.env` or `.env.local` for local development.

```bash
DATABASE_URL="file:./dev.db"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="replace-with-a-random-32-byte-secret"
APP_NAME="Test Case Dashboard"
NEXT_PUBLIC_APP_NAME="Test Case Dashboard"
```

## Theme Support

Dark/light mode is wired through `next-themes` in [src/components/providers/theme-provider.tsx](./src/components/providers/theme-provider.tsx). The toggle is [src/components/theme/theme-toggle.tsx](./src/components/theme/theme-toggle.tsx).

## Development

```bash
npm run dev
npm run lint
npm run typecheck
npm run build
```
