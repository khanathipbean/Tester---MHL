"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

interface Execution {
    id: string;
    status: string;
    executedAt: string | null;
    actualResult: string | null;
    testRun: { key: string; name: string };
}

interface DefectLink {
    id: string;
    key: string;
    title: string;
    severity: string;
    status: string;
}

interface TestCaseData {
    id: string;
    projectId: string;
    key: string;
    title: string;
    description: string | null;
    preconditions: string | null;
    condition: string | null;
    testSteps: string | null;
    expectedResult: string | null;
    priority: string;
    type: string;
    status: string;
    automationStatus: string;
    notes: string | null;
    clarificationRequired: boolean;
    inProgress: boolean;
    tested: boolean;
    createdByName: string | null;
    updatedByName: string | null;
    createdAt: string;
    updatedAt: string;
    suite: { id: string; name: string } | null;
    defects: DefectLink[];
    executions: Execution[];
}

const priorityStyle: Record<string, string> = {
    LOW: "border-gray-200 bg-gray-50 text-gray-700 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-300",
    MEDIUM: "border-yellow-200 bg-yellow-50 text-yellow-700 dark:border-yellow-800 dark:bg-yellow-950 dark:text-yellow-300",
    HIGH: "border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-800 dark:bg-orange-950 dark:text-orange-300",
    CRITICAL: "border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300",
};

const statusStyle: Record<string, string> = {
    DRAFT: "border-gray-200 bg-gray-50 text-gray-700 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-300",
    READY: "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-300",
    PASS: "border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950 dark:text-green-300",
    FAIL: "border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300",
    NOT_RUN: "border-gray-200 bg-gray-50 text-gray-700 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-300",
    BLOCKED: "border-yellow-200 bg-yellow-50 text-yellow-700 dark:border-yellow-800 dark:bg-yellow-950 dark:text-yellow-300",
    DEPRECATED: "border-gray-200 bg-gray-50 text-gray-700 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-300",
};

const execStatusStyle: Record<string, string> = {
    PASSED: "border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950 dark:text-green-300",
    FAILED: "border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300",
    BLOCKED: "border-yellow-200 bg-yellow-50 text-yellow-700 dark:border-yellow-800 dark:bg-yellow-950 dark:text-yellow-300",
    NOT_RUN: "border-gray-200 bg-gray-50 text-gray-700 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-300",
};

const severityStyle: Record<string, string> = {
    CRITICAL: "border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300",
    HIGH: "border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-800 dark:bg-orange-950 dark:text-orange-300",
    MEDIUM: "border-yellow-200 bg-yellow-50 text-yellow-700 dark:border-yellow-800 dark:bg-yellow-950 dark:text-yellow-300",
    LOW: "border-gray-200 bg-gray-50 text-gray-700 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-300",
};

const defectStatusStyle: Record<string, string> = {
    OPEN: "border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300",
    IN_PROGRESS: "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-300",
    RESOLVED: "border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950 dark:text-green-300",
    CLOSED: "border-gray-200 bg-gray-50 text-gray-700 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-300",
    REOPENED: "border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-800 dark:bg-orange-950 dark:text-orange-300",
};

export function TestCaseDetail({ testCase }: { testCase: TestCaseData }) {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <Link href={`/test-cases?project=${testCase.projectId}`} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4">
                    <ArrowLeft className="h-4 w-4" />
                    Back to Test Cases
                </Link>
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <p className="text-xs font-mono text-muted-foreground">{testCase.key}</p>
                        <h1 className="text-2xl font-semibold tracking-tight mt-1">{testCase.expectedResult || testCase.title}</h1>
                        {testCase.description && (
                            <p className="text-sm text-muted-foreground mt-1">{testCase.description}</p>
                        )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                        <Badge variant="outline" className={priorityStyle[testCase.priority] || ""}>
                            {testCase.priority}
                        </Badge>
                        <Badge variant="outline" className={statusStyle[testCase.status] || ""}>
                            {testCase.status}
                        </Badge>
                    </div>
                </div>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 2xl:grid-cols-8 rounded-lg border p-4">
                <InfoItem label="Module" value={testCase.suite?.name || "—"} />
                <InfoItem label="Type" value={testCase.type} />
                <InfoItem label="Automation" value={testCase.automationStatus} />
                <InfoItem label="Created By" value={testCase.createdByName || "—"} />
                <InfoItem label="Clarification" value={testCase.clarificationRequired ? "Yes ⚠️" : "No"} />
                <InfoItem label="In Progress" value={testCase.inProgress ? "Yes 🔄" : "No"} />
                <InfoItem label="Tested" value={testCase.tested ? "Yes ✅" : "No"} />
                <InfoItem label="Updated" value={new Date(testCase.updatedAt).toLocaleDateString()} />
            </div>

            {/* Test Details */}
            <div className="space-y-4">
                <h2 className="text-sm font-medium text-muted-foreground">Test Details</h2>
                <div className="rounded-lg border divide-y 2xl:divide-y-0 2xl:grid 2xl:grid-cols-2 2xl:divide-x">
                    <div className="divide-y">
                        <DetailSection label="Preconditions" content={testCase.preconditions} />
                        <DetailSection label="Condition (if)" content={testCase.condition} />
                        <DetailSection label="Test Steps" content={testCase.testSteps} />
                    </div>
                    <div className="divide-y">
                        <DetailSection label="Expected Result" content={testCase.expectedResult} />
                        <DetailSection label="Notes" content={testCase.notes} />
                    </div>
                </div>
            </div>

            {/* Execution History & Linked Defects - side by side on 2xl */}
            <div className="grid gap-6 2xl:grid-cols-2">
                {/* Execution History */}
                {testCase.executions.length > 0 && (
                    <div className="space-y-3">
                        <h2 className="text-sm font-medium text-muted-foreground">
                            Execution History (last 10)
                        </h2>
                        <div className="rounded-lg border overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Test Run</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Actual Result</TableHead>
                                        <TableHead>Executed At</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {testCase.executions.map((exec) => (
                                        <TableRow key={exec.id}>
                                            <TableCell className="text-sm">
                                                <span className="font-mono text-xs text-muted-foreground mr-1">{exec.testRun.key}</span>
                                                {exec.testRun.name}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className={`text-xs ${execStatusStyle[exec.status] || ""}`}>
                                                    {exec.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="max-w-[200px] truncate text-sm" title={exec.actualResult || undefined}>
                                                {exec.actualResult || "—"}
                                            </TableCell>
                                            <TableCell className="text-xs text-muted-foreground">
                                                {exec.executedAt ? new Date(exec.executedAt).toLocaleString() : "—"}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                )}

                {/* Linked Defects */}
                {testCase.defects.length > 0 && (
                    <div className="space-y-3">
                        <h2 className="text-sm font-medium text-muted-foreground">
                            Linked Defects ({testCase.defects.length})
                        </h2>
                        <div className="rounded-lg border overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Key</TableHead>
                                        <TableHead>Title</TableHead>
                                        <TableHead>Severity</TableHead>
                                        <TableHead>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {testCase.defects.map((defect) => (
                                        <TableRow key={defect.id}>
                                            <TableCell className="font-mono text-xs">{defect.key}</TableCell>
                                            <TableCell className="text-sm font-medium">{defect.title}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className={`text-xs ${severityStyle[defect.severity] || ""}`}>
                                                    {defect.severity}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className={`text-xs ${defectStatusStyle[defect.status] || ""}`}>
                                                    {defect.status.replace("_", " ")}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function InfoItem({ label, value }: { label: string; value: string }) {
    return (
        <div>
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="text-sm font-medium mt-0.5">{value}</p>
        </div>
    );
}

function DetailSection({ label, content }: { label: string; content: string | null }) {
    return (
        <div className="px-4 py-3">
            <p className="text-xs font-medium text-muted-foreground mb-1">{label}</p>
            <p className="text-sm whitespace-pre-wrap">{content || "—"}</p>
        </div>
    );
}
