import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcrypt";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });


const SALT_ROUNDS = 12;

async function main() {
    const users = [
        { name: "Admin User", email: "admin@test.com", password: "password123", role: "ADMIN" },
        { name: "QA User", email: "qa@test.com", password: "password123", role: "QA" },
        { name: "Viewer User", email: "viewer@test.com", password: "password123", role: "VIEWER" },
    ];

    for (const user of users) {
        const hashedPassword = await bcrypt.hash(user.password, SALT_ROUNDS);

        await prisma.user.upsert({
            where: { email: user.email },
            update: { name: user.name, password: hashedPassword, role: user.role },
            create: {
                name: user.name,
                email: user.email,
                password: hashedPassword,
                role: user.role,
            },
        });
    }

    console.log("Seeded 3 users: admin@test.com, qa@test.com, viewer@test.com");
    console.log("Password for all: password123");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(() => {
        void prisma.$disconnect();
    });
