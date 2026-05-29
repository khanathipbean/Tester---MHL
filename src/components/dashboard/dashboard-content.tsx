"use client";

import { useMemo, useState } from "react";

import { SummaryCards } from "@/components/dashboard/summary-cards";
import { StatusPieChart } from "@/components/dashboard/status-pie-chart";
import type { StatusPriorityMap } from "@/components/dashboard/status-pie-chart";
import { ModulePassRateChart } from "@/components/dashboard/module-pass-rate-chart";
import { ModuleSummaryTable } from "@/components/dashboard/module-summary-table";
import { DashboardFilters } from "@/components/dashboard/dashboard-filters";

interface TestCaseRow {
    key: string;
    status: string;
    priority: string;
    condition: string | null;
    testSteps: string | null;
    expectedResult: string | null;
    notes: string | null;
}

interface ModuleData {
    id: string;
    projectId: string;
    name: string;
    total: number;
    passed: number;
    failed: number;
    notRun: number;
    blocked: number;
    passRate: number;
    updatedAt: string;
    testCases: TestCaseRow[];
}

interface ProjectOption {
    id: string;
    name: string;
    key: string;
}

interface DashboardData {
    projects: ProjectOption[];
    totalTestCases: number;
    totalExecutions: number;
    passed: number;
    failed: number;
    notRun: number;
    blocked: number;
    passRate: number;
    failedRate: number;
    modules: ModuleData[];
}

interface DashboardContentProps {
    data: DashboardData;
}

export function DashboardContent({ data }: DashboardContentProps) {
    const [projectFilter, setProjectFilter] = useState("all");
    const [moduleFilter, setModuleFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");
    const [priorityFilter, setPriorityFilter] = useState("all");

    const filtered = useMemo(() => {
        let modules = data.modules;

        if (projectFilter !== "all") {
            modules = modules.filter((m) => m.projectId === projectFilter);
        }

        if (moduleFilter !== "all") {
            modules = modules.filter((m) => m.id === moduleFilter);
        }

        // Filter test cases by priority and recalculate module stats
        const matchPriority = (tc: { priority: string }) => priorityFilter === "all" || tc.priority === priorityFilter;

        const recalcModules = priorityFilter !== "all"
            ? modules.map((mod) => {
                const filtered = mod.testCases.filter(matchPriority);
                const modPassed = filtered.filter((tc) => tc.status === "PASS").length;
                const modFailed = filtered.filter((tc) => tc.status === "FAIL").length;
                const modNotRun = filtered.filter((tc) => tc.status === "NOT_RUN").length;
                const modBlocked = filtered.filter((tc) => tc.status === "BLOCKED").length;
                const total = filtered.length;
                return {
                    ...mod,
                    total,
                    passed: modPassed,
                    failed: modFailed,
                    notRun: modNotRun,
                    blocked: modBlocked,
                    passRate: total > 0 ? Math.round((modPassed / total) * 10000) / 100 : 0,
                    testCases: filtered,
                };
            })
            : modules;

        const totalTestCases = recalcModules.reduce((sum, m) => sum + m.total, 0);
        const passed = recalcModules.reduce((sum, m) => sum + m.passed, 0);
        const failed = recalcModules.reduce((sum, m) => sum + m.failed, 0);
        const notRun = recalcModules.reduce((sum, m) => sum + m.notRun, 0);
        const blocked = recalcModules.reduce((sum, m) => sum + m.blocked, 0);
        const totalExecutions = passed + failed;
        const passRate =
            totalTestCases > 0
                ? Math.round((passed / totalTestCases) * 10000) / 100
                : 0;
        const failedRate =
            totalTestCases > 0
                ? Math.round((failed / totalTestCases) * 10000) / 100
                : 0;

        // If status filter is applied, show only matching counts
        let displayPassed = passed;
        let displayFailed = failed;
        let displayNotRun = notRun;
        let displayBlocked = blocked;
        if (statusFilter === "PASS") {
            displayFailed = 0; displayNotRun = 0; displayBlocked = 0;
        } else if (statusFilter === "FAIL") {
            displayPassed = 0; displayNotRun = 0; displayBlocked = 0;
        } else if (statusFilter === "NOT_RUN") {
            displayPassed = 0; displayFailed = 0; displayBlocked = 0;
        } else if (statusFilter === "BLOCKED") {
            displayPassed = 0; displayFailed = 0; displayNotRun = 0;
        }

        // Compute priority breakdown per status
        const priorityBreakdown: StatusPriorityMap = {
            PASS: { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0 },
            FAIL: { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0 },
            NOT_RUN: { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0 },
            BLOCKED: { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0 },
        };
        for (const mod of recalcModules) {
            for (const tc of mod.testCases) {
                const s = tc.status;
                const p = tc.priority as "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
                if (priorityBreakdown[s] && priorityBreakdown[s][p] !== undefined) {
                    priorityBreakdown[s][p]++;
                }
            }
        }

        return {
            totalTestCases: displayPassed + displayFailed + displayNotRun + displayBlocked,
            passed: displayPassed,
            failed: displayFailed,
            notRun: displayNotRun,
            blocked: displayBlocked,
            passRate: statusFilter === "all" ? passRate : statusFilter === "PASS" ? 100 : 0,
            failedRate: statusFilter === "all" ? failedRate : statusFilter === "FAIL" ? 100 : 0,
            modules: recalcModules,
            priorityBreakdown,
        };
    }, [data, projectFilter, moduleFilter, statusFilter, priorityFilter]);

    return (
        <div className="space-y-6">
            <DashboardFilters
                projects={data.projects}
                projectFilter={projectFilter}
                onProjectChange={(v) => { setProjectFilter(v); setModuleFilter("all"); }}
                modules={projectFilter === "all" ? data.modules : data.modules.filter((m) => m.projectId === projectFilter)}
                moduleFilter={moduleFilter}
                onModuleChange={setModuleFilter}
                statusFilter={statusFilter}
                onStatusChange={setStatusFilter}
                priorityFilter={priorityFilter}
                onPriorityChange={setPriorityFilter}
            />

            <SummaryCards
                totalTestCases={filtered.totalTestCases}
                passed={filtered.passed}
                failed={filtered.failed}
                notRun={filtered.notRun}
                blocked={filtered.blocked}
            />

            <div className="grid gap-4 lg:grid-cols-2">
                <StatusPieChart
                    passed={filtered.passed}
                    failed={filtered.failed}
                    notRun={filtered.notRun}
                    blocked={filtered.blocked}
                    activeStatus={statusFilter}
                    onStatusClick={setStatusFilter}
                    priorityBreakdown={filtered.priorityBreakdown}
                />
                <ModulePassRateChart modules={filtered.modules.map((m) => ({ ...m, projectName: data.projects.find((p) => p.id === m.projectId)?.name }))} />
            </div>

            <div className="space-y-3">
                <h2 className="text-sm font-medium text-muted-foreground">
                    Project & Module Overview
                </h2>
                <ModuleSummaryTable
                    modules={filtered.modules}
                    projects={data.projects}
                    showProjectGroup={projectFilter === "all"}
                    statusFilter={statusFilter}
                    priorityFilter={priorityFilter}
                />
            </div>
        </div>
    );
}
