import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
    // Find modules matching the names
    const modules = await prisma.testSuite.findMany({
        where: {
            OR: [
                { name: { contains: "Price Revision Request", mode: "insensitive" } },
            ],
        },
        select: { id: true, name: true },
    });

    console.log("Found modules:", modules.map(m => m.name));

    if (modules.length === 0) {
        console.log("No matching modules found.");
        return;
    }

    const suiteIds = modules.map(m => m.id);

    // Delete test cases in those modules
    const result = await prisma.testCase.deleteMany({
        where: { suiteId: { in: suiteIds } },
    });

    console.log(`Deleted ${result.count} test cases.`);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
