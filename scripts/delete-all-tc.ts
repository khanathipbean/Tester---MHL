import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const adapter = new PrismaBetterSqlite3({ url: "file:./dev.db" });
const prisma = new PrismaClient({ adapter });

async function main() {
    const d = await prisma.testCase.deleteMany({});
    console.log(`Deleted ${d.count} test cases`);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
