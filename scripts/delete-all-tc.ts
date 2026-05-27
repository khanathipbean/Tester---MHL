import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
    const d = await prisma.testCase.deleteMany({});
    console.log(`Deleted ${d.count} test cases`);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
