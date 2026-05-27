"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, FolderOpen } from "lucide-react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

interface TestCaseRow {
    key: string;
    status: string;
    priority: string;
    condition: string | null;
    testSteps: string | null;
    expectedResult: string | null;
    notes: string | null;
}

interface ModuleRow {
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

interface ModuleSummaryTableProps {
    modules: ModuleRow[];
    projects?: ProjectOption[];
    showProjectGroup?: boolean;
    searchQuery?: string;
    statusFilter?: string;
    priorityFilter?: string;
}

const statusStyle: Record<string, string> = {
    PASS: "border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950 dark:text-green-300",
    FAIL: "border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300",
    NOT_RUN: "border-gray-200 bg-gray-50 text-gray-700 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-300",
    BLOCKED: "border-yellow-200 bg-yellow-50 text-yellow-700 dark:border-yellow-800 dark:bg-yellow-950 dark:text-yellow-300",
};

const priorityStyle: Record<string, string> = {
    CRITICAL: "border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300",
    HIGH: "border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-800 dark:bg-orange-950 dark:text-orange-300",
    MEDIUM: "border-yellow-200 bg-yellow-50 text-yellow-700 dark:border-yellow-800 dark:bg-yellow-950 dark:text-yellow-300",
    LOW: "border-gray-200 bg-gray-50 text-gray-700 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-300",
};

export function ModuleSummaryTable({ modules, projects, showProjectGroup, searchQuery, statusFilter, priorityFilter }: ModuleSummaryTableProps) {
    const [expanded, setExpanded] = useState<Record<string, boolean>>({});
    const [expandedProjects, setExpandedProjects] = useState<Record<string, boolean>>({});

    if (modules.length === 0) {
        return (
            <div className="flex h-32 items-center justify-center rounded-lg border border-dashed">
                <p className="text-sm text-muted-foreground">No modules found</p>
            </div>
        );
    }

    const toggle = (id: string) =>
        setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

    const toggleProject = (id: string) =>
        setExpandedProjects((prev) => ({ ...prev, [id]: !prev[id] }));

    // Group modules by project when showProjectGroup is true
    const q = (searchQuery || "").toLowerCase();
    const grouped = showProjectGroup && projects
        ? projects
            .map((p) => ({
                ...p,
                modules: modules.filter((m) => m.projectId === p.id),
            }))
            .filter((g) => {
                if (!q) return true;
                // Show project if its name/key matches OR it has matching modules
                if (g.name.toLowerCase().includes(q) || g.key.toLowerCase().includes(q)) return true;
                return g.modules.length > 0;
            })
        : null;

    return (
        <div className="overflow-x-auto rounded-lg border">
            <Table>
                <TableHeader>
                    <TableRow className="bg-muted border-b-2">
                        <TableHead className="w-8" />
                        <TableHead className="font-semibold">Project Name</TableHead>
                        <TableHead className="text-center font-semibold">Total</TableHead>
                        <TableHead className="text-center font-semibold">Passed</TableHead>
                        <TableHead className="text-center font-semibold">Failed</TableHead>
                        <TableHead className="text-center font-semibold">Not Run</TableHead>
                        <TableHead className="text-center font-semibold">Blocked</TableHead>
                        <TableHead className="text-center font-semibold">Pass Rate</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {grouped ? (
                        grouped.map((group) => {
                            const isProjectExpanded = !!expandedProjects[group.id]; // default closed
                            const groupTotal = group.modules.reduce((s, m) => s + m.total, 0);
                            const groupPassed = group.modules.reduce((s, m) => s + m.passed, 0);
                            const groupFailed = group.modules.reduce((s, m) => s + m.failed, 0);
                            const groupNotRun = group.modules.reduce((s, m) => s + m.notRun, 0);
                            const groupBlocked = group.modules.reduce((s, m) => s + m.blocked, 0);
                            const groupPassRate = groupTotal > 0 ? Math.round((groupPassed / groupTotal) * 10000) / 100 : 0;

                            return (
                                <ProjectGroup
                                    key={group.id}
                                    projectName={group.name}
                                    projectKey={group.key}
                                    isExpanded={isProjectExpanded}
                                    onToggle={() => toggleProject(group.id)}
                                    total={groupTotal}
                                    passed={groupPassed}
                                    failed={groupFailed}
                                    notRun={groupNotRun}
                                    blocked={groupBlocked}
                                    passRate={groupPassRate}
                                >
                                    {group.modules.length > 0 ? (
                                        group.modules.map((mod) => (
                                            <ModuleRowGroup
                                                key={mod.id}
                                                mod={mod}
                                                isExpanded={!!expanded[mod.id]}
                                                onToggle={() => toggle(mod.id)}
                                                indent
                                                statusFilter={statusFilter}
                                                priorityFilter={priorityFilter}
                                            />
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={8} className="pl-10 py-3">
                                                <span className="text-xs text-muted-foreground italic">No modules yet</span>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </ProjectGroup>
                            );
                        })
                    ) : (
                        modules.map((mod) => (
                            <ModuleRowGroup
                                key={mod.id}
                                mod={mod}
                                isExpanded={!!expanded[mod.id]}
                                onToggle={() => toggle(mod.id)}
                                statusFilter={statusFilter}
                                priorityFilter={priorityFilter}
                            />
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    );
}

function ProjectGroup({
    projectName,
    projectKey,
    isExpanded,
    onToggle,
    total,
    passed,
    failed,
    notRun,
    blocked,
    passRate,
    children,
}: {
    projectName: string;
    projectKey: string;
    isExpanded: boolean;
    onToggle: () => void;
    total: number;
    passed: number;
    failed: number;
    notRun: number;
    blocked: number;
    passRate: number;
    children: React.ReactNode;
}) {
    return (
        <>
            <TableRow
                className="cursor-pointer hover:bg-muted/50 bg-muted/20"
                onClick={onToggle}
            >
                <TableCell className="w-8 px-2">
                    {isExpanded ? (
                        <ChevronDown className="h-4 w-4" />
                    ) : (
                        <ChevronRight className="h-4 w-4" />
                    )}
                </TableCell>
                <TableCell className="font-semibold">
                    <div className="flex items-center gap-2">
                        <FolderOpen className="h-4 w-4 text-muted-foreground" />
                        <span>{projectName}</span>
                        <span className="text-xs text-muted-foreground font-normal">({projectKey})</span>
                    </div>
                </TableCell>
                <TableCell className="text-center font-medium">{total}</TableCell>
                <TableCell className="text-center">
                    <Badge variant="outline" className="border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950 dark:text-green-300">
                        {passed}
                    </Badge>
                </TableCell>
                <TableCell className="text-center">
                    <Badge variant="outline" className="border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300">
                        {failed}
                    </Badge>
                </TableCell>
                <TableCell className="text-center">
                    <Badge variant="outline" className="border-gray-200 bg-gray-50 text-gray-700 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-300">
                        {notRun}
                    </Badge>
                </TableCell>
                <TableCell className="text-center">
                    <Badge variant="outline" className="border-yellow-200 bg-yellow-50 text-yellow-700 dark:border-yellow-800 dark:bg-yellow-950 dark:text-yellow-300">
                        {blocked}
                    </Badge>
                </TableCell>
                <TableCell className="text-center font-medium">{passRate.toFixed(1)}%</TableCell>
            </TableRow>
            {isExpanded && children}
        </>
    );
}

function ModuleRowGroup({
    mod,
    isExpanded,
    onToggle,
    indent,
    statusFilter,
    priorityFilter,
}: {
    mod: ModuleRow;
    isExpanded: boolean;
    onToggle: () => void;
    indent?: boolean;
    statusFilter?: string;
    priorityFilter?: string;
}) {
    const [selectedTC, setSelectedTC] = useState<TestCaseRow | null>(null);

    return (
        <>
            <TableRow
                className="cursor-pointer hover:bg-muted/50"
                onClick={onToggle}
            >
                <TableCell className="w-8 px-2">
                    {isExpanded ? (
                        <ChevronDown className="h-4 w-4" />
                    ) : (
                        <ChevronRight className="h-4 w-4" />
                    )}
                </TableCell>
                <TableCell className={indent ? "pl-8 font-medium" : "font-medium"}>{mod.name}</TableCell>
                <TableCell className="text-center">{mod.total}</TableCell>
                <TableCell className="text-center">
                    <Badge
                        variant="outline"
                        className="border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950 dark:text-green-300"
                    >
                        {mod.passed}
                    </Badge>
                </TableCell>
                <TableCell className="text-center">
                    <Badge
                        variant="outline"
                        className="border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300"
                    >
                        {mod.failed}
                    </Badge>
                </TableCell>
                <TableCell className="text-center">
                    <Badge
                        variant="outline"
                        className="border-gray-200 bg-gray-50 text-gray-700 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-300"
                    >
                        {mod.notRun}
                    </Badge>
                </TableCell>
                <TableCell className="text-center">
                    <Badge
                        variant="outline"
                        className="border-yellow-200 bg-yellow-50 text-yellow-700 dark:border-yellow-800 dark:bg-yellow-950 dark:text-yellow-300"
                    >
                        {mod.blocked}
                    </Badge>
                </TableCell>
                <TableCell className="text-center">{mod.passRate.toFixed(1)}%</TableCell>
            </TableRow>
            {isExpanded && mod.testCases.length === 0 && (
                <TableRow>
                    <TableCell colSpan={8} className="p-0">
                        <div className="border-t bg-muted/30 px-4 py-6 text-center">
                            <p className="text-sm text-muted-foreground">No test cases in this module</p>
                        </div>
                    </TableCell>
                </TableRow>
            )}
            {isExpanded && mod.testCases.length > 0 && (
                <TableRow>
                    <TableCell colSpan={8} className="p-0">
                        <div className="border-t bg-muted/30 px-4 py-2">
                            <div className="overflow-x-auto">
                                <table className="w-full text-xs">
                                    <thead>
                                        <tr className="border-b-2 border-border/60 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent">
                                            <th className="py-2 px-3 text-left font-semibold text-primary/80 uppercase tracking-wider text-[10px]">Test ID</th>
                                            <th className="py-2 px-3 text-left font-semibold text-primary/80 uppercase tracking-wider text-[10px]">Expected Result</th>
                                            <th className="py-2 px-3 text-left font-semibold text-primary/80 uppercase tracking-wider text-[10px]">Priority</th>
                                            <th className="py-2 px-3 text-left font-semibold text-primary/80 uppercase tracking-wider text-[10px]">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {mod.testCases
                                            .filter((tc) => !statusFilter || statusFilter === "all" || tc.status === statusFilter)
                                            .filter((tc) => !priorityFilter || priorityFilter === "all" || tc.priority === priorityFilter)
                                            .map((tc) => (
                                                <tr
                                                    key={tc.key}
                                                    className="border-b last:border-0 cursor-pointer transition-colors hover:bg-primary/5 group"
                                                    onClick={(e) => { e.stopPropagation(); setSelectedTC(tc); }}
                                                >
                                                    <td className="py-2.5 px-3 font-mono text-xs font-medium text-foreground/70 whitespace-nowrap group-hover:text-primary">
                                                        {tc.key}
                                                    </td>
                                                    <td className="py-2.5 px-3 max-w-[280px]">
                                                        <span className="line-clamp-2 whitespace-pre-line text-foreground/80">{tc.expectedResult || "—"}</span>
                                                    </td>
                                                    <td className="py-2.5 px-3 whitespace-nowrap">
                                                        <Badge variant="outline" className={`text-[10px] px-2 py-0.5 font-medium ${priorityStyle[tc.priority] || ""}`}>
                                                            {tc.priority}
                                                        </Badge>
                                                    </td>
                                                    <td className="py-2.5 px-3 whitespace-nowrap">
                                                        <Badge variant="outline" className={`text-[10px] px-2 py-0.5 font-medium ${statusStyle[tc.status] || ""}`}>
                                                            {tc.status}
                                                        </Badge>
                                                    </td>
                                                </tr>
                                            ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </TableCell>
                </TableRow>
            )}

            {/* Test Case Detail Modal */}
            <Dialog open={!!selectedTC} onOpenChange={(open) => { if (!open) setSelectedTC(null); }}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="font-mono text-base">{selectedTC?.key}</DialogTitle>
                    </DialogHeader>
                    {selectedTC && (
                        <div className="space-y-3 text-sm">
                            <div>
                                <span className="font-semibold text-muted-foreground">Status</span>
                                <div className="mt-1">
                                    <Badge variant="outline" className={statusStyle[selectedTC.status] || ""}>
                                        {selectedTC.status}
                                    </Badge>
                                </div>
                            </div>
                            <div>
                                <span className="font-semibold text-muted-foreground">Priority</span>
                                <div className="mt-1">
                                    <Badge variant="outline" className={priorityStyle[selectedTC.priority] || ""}>
                                        {selectedTC.priority}
                                    </Badge>
                                </div>
                            </div>
                            <div>
                                <span className="font-semibold text-muted-foreground">Condition (if)</span>
                                <p className="mt-1 whitespace-pre-line rounded bg-muted/50 p-2">{selectedTC.condition || "—"}</p>
                            </div>
                            <div>
                                <span className="font-semibold text-muted-foreground">Test Steps</span>
                                <p className="mt-1 whitespace-pre-line rounded bg-muted/50 p-2">{selectedTC.testSteps || "—"}</p>
                            </div>
                            <div>
                                <span className="font-semibold text-muted-foreground">Expected Result</span>
                                <p className="mt-1 whitespace-pre-line rounded bg-muted/50 p-2">{selectedTC.expectedResult || "—"}</p>
                            </div>
                            <div>
                                <span className="font-semibold text-muted-foreground">Notes</span>
                                <p className="mt-1 whitespace-pre-line rounded bg-muted/50 p-2">{selectedTC.notes || "—"}</p>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}
