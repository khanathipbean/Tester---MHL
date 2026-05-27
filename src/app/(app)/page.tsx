import { prisma } from "@/lib/db/prisma";
import { DashboardContent } from "@/components/dashboard/dashboard-content";

async function getDashboardData() {
  const [projects, testCasesByProject, moduleSummaries] = await Promise.all([
    prisma.project.findMany({
      orderBy: { createdAt: "asc" },
      select: { id: true, name: true, key: true },
    }),

    prisma.testCase.groupBy({
      by: ["projectId", "status"],
      _count: { status: true },
    }),

    prisma.testSuite.findMany({
      select: {
        id: true,
        name: true,
        projectId: true,
        updatedAt: true,
        testCases: {
          select: { key: true, status: true, priority: true, condition: true, testSteps: true, expectedResult: true, notes: true },
          orderBy: { key: "asc" },
        },
      },
    }),
  ]);

  // Build per-project status maps
  const projectStatusMap: Record<string, Record<string, number>> = {};
  for (const e of testCasesByProject) {
    if (!projectStatusMap[e.projectId]) projectStatusMap[e.projectId] = {};
    projectStatusMap[e.projectId][e.status] = e._count.status;
  }

  // Global stats
  const allStatuses: Record<string, number> = {};
  for (const pMap of Object.values(projectStatusMap)) {
    for (const [status, count] of Object.entries(pMap)) {
      allStatuses[status] = (allStatuses[status] || 0) + count;
    }
  }

  const totalTestCases = Object.values(allStatuses).reduce((a, b) => a + b, 0);
  const passed = allStatuses["PASS"] || 0;
  const failed = allStatuses["FAIL"] || 0;
  const notRun = allStatuses["NOT_RUN"] || 0;
  const blocked = allStatuses["BLOCKED"] || 0;
  const passRate =
    totalTestCases > 0 ? Math.round((passed / totalTestCases) * 10000) / 100 : 0;
  const failedRate =
    totalTestCases > 0 ? Math.round((failed / totalTestCases) * 10000) / 100 : 0;

  const modules = moduleSummaries.map((mod) => {
    const total = mod.testCases.length;
    let modPassed = 0;
    let modFailed = 0;
    let modNotRun = 0;
    let modBlocked = 0;

    for (const tc of mod.testCases) {
      if (tc.status === "PASS") modPassed++;
      else if (tc.status === "FAIL") modFailed++;
      else if (tc.status === "NOT_RUN") modNotRun++;
      else if (tc.status === "BLOCKED") modBlocked++;
    }

    return {
      id: mod.id,
      projectId: mod.projectId,
      name: mod.name,
      total,
      passed: modPassed,
      failed: modFailed,
      notRun: modNotRun,
      blocked: modBlocked,
      passRate: total > 0 ? Math.round((modPassed / total) * 10000) / 100 : 0,
      updatedAt: mod.updatedAt.toISOString(),
      testCases: mod.testCases,
    };
  });

  return {
    projects,
    totalTestCases,
    totalExecutions: passed + failed,
    passed,
    failed,
    notRun,
    blocked,
    passRate,
    failedRate,
    modules,
  };
}

export default async function DashboardPage() {
  const data = await getDashboardData();

  return (
    <div className="mx-auto w-full max-w-7xl 2xl:max-w-[1800px] px-4 py-6 sm:px-6 lg:px-8 2xl:px-12">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          QA test execution overview
        </p>
      </div>
      <DashboardContent data={data} />
    </div>
  );
}
