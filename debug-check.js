const { PrismaClient } = require('@prisma/client');
const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3');

const adapter = new PrismaBetterSqlite3({ url: 'file:./dev.db' });
const p = new PrismaClient({ adapter });

async function main() {
    const tc = await p.testCase.count();
    const tcTag = await p.testCaseTag.count();
    const t = await p.tag.count();
    console.log('TestCases:', tc, '| Tags:', t, '| TestCaseTag:', tcTag);

    const sample = await p.testCase.findFirst({
        select: { id: true, projectId: true, title: true, expectedResult: true }
    });
    console.log('Sample:', JSON.stringify(sample));

    const projects = await p.project.findMany({ select: { id: true, name: true } });
    console.log('Projects:', JSON.stringify(projects));
}

main().then(() => p.$disconnect());
