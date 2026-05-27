"use client";

import { useState, useMemo, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CheckCircle2, XCircle, MinusCircle, AlertTriangle, Bug, Search, X, Pencil } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface Execution {
    id: string;
    testCaseId: string;
    status: string;
    actualResult: string | null;
    notes: string | null;
    executedAt: string | null;
    testCase: {
        key: string;
        title: string;
        priority: string;
        condition: string | null;
        testSteps: string | null;
        expectedResult: string | null;
        tags?: { id: string; name: string; color: string | null }[];
    };
}

interface TestRunDetail {
    id: string;
    key: string;
    name: string;
    environment: string | null;
    status: string;
    executions: Execution[];
}

interface TestRunExecuteProps {
    testRun: TestRunDetail;
    canEdit: boolean;
}

const execStatusStyle: Record<string, string> = {
    NOT_RUN: "border-gray-200 bg-gray-50 text-gray-700 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-300",
    PASSED: "border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950 dark:text-green-300",
    FAILED: "border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300",
    BLOCKED: "border-yellow-200 bg-yellow-50 text-yellow-700 dark:border-yellow-800 dark:bg-yellow-950 dark:text-yellow-300",
    PLANNED: "border-gray-200 bg-gray-50 text-gray-700 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-300",
    IN_PROGRESS: "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-300",
    COMPLETED: "border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950 dark:text-green-300",
};

export function TestRunExecute({ testRun, canEdit }: TestRunExecuteProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [expandMode, setExpandMode] = useState<"fail" | "blocked">("fail");
    const [actualResult, setActualResult] = useState("");
    const [notes, setNotes] = useState("");
    const [search, setSearch] = useState("");
    const [passAllConfirm, setPassAllConfirm] = useState(false);

    // Edit name state
    const [editNameOpen, setEditNameOpen] = useState(false);
    const [editNameValue, setEditNameValue] = useState(testRun.name);

    // Defect dialog state
    const [defectOpen, setDefectOpen] = useState(false);
    const [defectExec, setDefectExec] = useState<Execution | null>(null);
    const [defectTitle, setDefectTitle] = useState("");
    const [defectDesc, setDefectDesc] = useState("");
    const [defectSeverity, setDefectSeverity] = useState("MEDIUM");
    const [defectPriority, setDefectPriority] = useState("MEDIUM");

    const total = testRun.executions.length;
    const passed = testRun.executions.filter((e) => e.status === "PASSED").length;
    const failed = testRun.executions.filter((e) => e.status === "FAILED").length;
    const blocked = testRun.executions.filter((e) => e.status === "BLOCKED").length;
    const notRun = testRun.executions.filter((e) => e.status === "NOT_RUN").length;

    const filteredExecutions = useMemo(() => {
        if (!search.trim()) return testRun.executions;
        const q = search.toLowerCase();
        return testRun.executions.filter((exec) => {
            const tc = exec.testCase;
            if (tc.key.toLowerCase().includes(q)) return true;
            if (tc.condition?.toLowerCase().includes(q)) return true;
            if (tc.testSteps?.toLowerCase().includes(q)) return true;
            if (tc.expectedResult?.toLowerCase().includes(q)) return true;
            if (tc.title?.toLowerCase().includes(q)) return true;
            if (exec.status.toLowerCase().includes(q)) return true;
            if (tc.tags?.some((t) => t.name.toLowerCase().includes(q))) return true;
            return false;
        });
    }, [search, testRun.executions]);

    const updateStatus = async (executionId: string, status: string) => {
        try {
            const res = await fetch(`/api/test-runs/${testRun.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ executionId, status, actualResult, notes }),
            });
            if (!res.ok) throw new Error((await res.json()).message);

            // Update test case notes when blocked
            if (status === "BLOCKED" && notes.trim()) {
                const exec = testRun.executions.find((e) => e.id === executionId);
                if (exec) {
                    await fetch(`/api/test-cases/${exec.testCaseId}`, {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ notes: notes.trim() }),
                    });
                }
            }

            toast.success(`Marked as ${status}`);
            setExpandedId(null);
            setActualResult("");
            setNotes("");
            startTransition(() => router.refresh());
        } catch (e: unknown) {
            toast.error(e instanceof Error ? e.message : "Failed to update");
        }
    };

    const passAllNotRun = async () => {
        const notRunExecs = testRun.executions.filter((e) => e.status === "NOT_RUN");
        if (notRunExecs.length === 0) { toast.info("No test cases to pass"); return; }
        try {
            for (const exec of notRunExecs) {
                const res = await fetch(`/api/test-runs/${testRun.id}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ executionId: exec.id, status: "PASSED", actualResult: "", notes: "" }),
                });
                if (!res.ok) throw new Error((await res.json()).message);
            }
            toast.success(`Passed ${notRunExecs.length} test cases`);
            startTransition(() => router.refresh());
        } catch (e: unknown) {
            toast.error(e instanceof Error ? e.message : "Failed to pass all");
        }
    };

    const openDefectDialog = (exec: Execution) => {
        setDefectExec(exec);
        setDefectTitle(`[${exec.testCase.key}] `);
        setDefectDesc(actualResult || exec.actualResult || "");
        setDefectSeverity("MEDIUM");
        setDefectPriority("MEDIUM");
        setDefectOpen(true);
    };

    const handleEditName = async () => {
        if (!editNameValue.trim()) { toast.error("Name is required"); return; }
        try {
            const res = await fetch(`/api/test-runs/${testRun.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: editNameValue.trim() }),
            });
            if (!res.ok) throw new Error((await res.json()).message);
            toast.success("Name updated");
            setEditNameOpen(false);
            startTransition(() => router.refresh());
        } catch (e: unknown) {
            toast.error(e instanceof Error ? e.message : "Failed to update name");
        }
    };

    const handleCreateDefect = async () => {
        if (!defectTitle.trim() || !defectExec) { toast.error("Title is required"); return; }
        try {
            const res = await fetch("/api/defects", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: defectTitle,
                    description: defectDesc || null,
                    severity: defectSeverity,
                    priority: defectPriority,
                    testCaseId: defectExec.testCaseId,
                    executionId: defectExec.id,
                }),
            });
            if (!res.ok) throw new Error((await res.json()).message);

            // Mark execution as FAILED
            await fetch(`/api/test-runs/${testRun.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ executionId: defectExec.id, status: "FAILED", actualResult: defectDesc || actualResult || "", notes: "" }),
            });

            // Update test case status to FAIL
            await fetch(`/api/test-cases/${defectExec.testCaseId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: "FAIL" }),
            });

            toast.success("Defect created & test case marked as Fail");
            setDefectOpen(false);
            setExpandedId(null);
            setActualResult("");
            startTransition(() => router.refresh());
        } catch (e: unknown) {
            toast.error(e instanceof Error ? e.message : "Failed to create defect");
        }
    };

    return (
        <div className="space-y-4">
            {/* Summary bar */}
            <div className="flex flex-wrap items-center gap-4 rounded-lg border p-4">
                <div className="text-sm">
                    <span className="text-muted-foreground">Status: </span>
                    <Badge variant="outline" className={execStatusStyle[testRun.status] || ""}>
                        {testRun.status.replace("_", " ")}
                    </Badge>
                </div>
                <div className="text-sm">Total: <strong>{total}</strong></div>
                <div className="text-sm text-green-600">Passed: <strong>{passed}</strong></div>
                <div className="text-sm text-red-600">Failed: <strong>{failed}</strong></div>
                <div className="text-sm text-yellow-600">Blocked: <strong>{blocked}</strong></div>
                <div className="text-sm text-muted-foreground">Not Run: <strong>{notRun}</strong></div>
                {total > 0 && (
                    <div className="ml-auto text-sm font-medium">
                        Progress: {Math.round(((passed + failed + blocked) / total) * 100)}%
                    </div>
                )}
            </div>

            {/* Search */}
            <div className="flex items-center gap-2">
                <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search test ID, tag, condition..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="h-9 w-full sm:w-[280px] pl-8"
                    />
                </div>
                {search && (
                    <Button variant="ghost" size="sm" onClick={() => setSearch("")} className="h-9 px-2">
                        <X className="h-4 w-4" />
                    </Button>
                )}
                {search && (
                    <span className="text-xs text-muted-foreground">
                        {filteredExecutions.length} / {testRun.executions.length}
                    </span>
                )}
                {canEdit && testRun.status !== "COMPLETED" && notRun > 0 && (
                    <Button
                        variant="outline"
                        size="sm"
                        className="ml-auto h-9 text-green-600 border-green-200 hover:bg-green-50 hover:text-green-700"
                        onClick={() => setPassAllConfirm(true)}
                        disabled={isPending}
                    >
                        <CheckCircle2 className="h-4 w-4 mr-1" />
                        Pass All ({notRun})
                    </Button>
                )}
            </div>

            {/* Executions table */}
            <div className="overflow-x-auto rounded-lg border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-24">Test ID</TableHead>
                            <TableHead>Tags</TableHead>
                            <TableHead>Condition</TableHead>
                            <TableHead>Test Steps</TableHead>
                            <TableHead>Expected Result</TableHead>
                            <TableHead>Status</TableHead>
                            {canEdit && <TableHead className="w-48">Actions</TableHead>}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredExecutions.map((exec) => (
                            <>
                                <TableRow key={exec.id} className={expandedId === exec.id ? "bg-muted/30" : ""}>
                                    <TableCell className="font-mono text-xs">{exec.testCase.key}</TableCell>
                                    <TableCell>
                                        <div className="flex flex-wrap gap-1">
                                            {exec.testCase.tags && exec.testCase.tags.length > 0
                                                ? exec.testCase.tags.map((tag) => (
                                                    <Badge
                                                        key={tag.id}
                                                        variant="outline"
                                                        className="text-xs"
                                                        style={tag.color ? { borderColor: tag.color, backgroundColor: `${tag.color}15`, color: tag.color } : undefined}
                                                    >
                                                        {tag.name}
                                                    </Badge>
                                                ))
                                                : <span className="text-muted-foreground">—</span>
                                            }
                                        </div>
                                    </TableCell>
                                    <TableCell className="max-w-[150px]">
                                        <span className="line-clamp-2 text-xs">{exec.testCase.condition || "—"}</span>
                                    </TableCell>
                                    <TableCell className="max-w-[180px]">
                                        <span className="line-clamp-2 text-xs whitespace-pre-line">{exec.testCase.testSteps || "—"}</span>
                                    </TableCell>
                                    <TableCell className="max-w-[180px]">
                                        <span className="line-clamp-2 text-xs whitespace-pre-line">{exec.testCase.expectedResult || "—"}</span>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className={`text-xs ${execStatusStyle[exec.status] || ""}`}>
                                            {exec.status.replace("_", " ")}
                                        </Badge>
                                    </TableCell>
                                    {canEdit && (
                                        <TableCell>
                                            {testRun.status !== "COMPLETED" ? (
                                                <div className="flex gap-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-7 w-7 text-green-600"
                                                        title="Pass"
                                                        onClick={() => updateStatus(exec.id, "PASSED")}
                                                    >
                                                        <CheckCircle2 className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-7 w-7 text-red-600"
                                                        title="Fail"
                                                        onClick={() => {
                                                            setExpandedId(expandedId === exec.id && expandMode === "fail" ? null : exec.id);
                                                            setExpandMode("fail");
                                                            setActualResult(exec.actualResult || "");
                                                            setNotes(exec.notes || "");
                                                        }}
                                                    >
                                                        <XCircle className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-7 w-7 text-yellow-600"
                                                        title="Blocked"
                                                        onClick={() => {
                                                            setExpandedId(expandedId === exec.id && expandMode === "blocked" ? null : exec.id);
                                                            setExpandMode("blocked");
                                                            setNotes(exec.notes || "");
                                                        }}
                                                    >
                                                        <AlertTriangle className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-7 w-7 text-gray-400"
                                                        title="Reset"
                                                        onClick={() => updateStatus(exec.id, "NOT_RUN")}
                                                    >
                                                        <MinusCircle className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            ) : (
                                                <span className="text-xs text-muted-foreground">Completed</span>
                                            )}
                                        </TableCell>
                                    )}
                                </TableRow>
                                {expandedId === exec.id && (
                                    <TableRow key={`${exec.id}-detail`}>
                                        <TableCell colSpan={canEdit ? 7 : 6} className="bg-muted/20">
                                            <div className="space-y-2 p-2">
                                                {expandMode === "fail" ? (
                                                    <>
                                                        <div className="space-y-1">
                                                            <label className="text-xs font-medium">Actual Result / Notes</label>
                                                            <Textarea
                                                                value={actualResult}
                                                                onChange={(e) => setActualResult(e.target.value)}
                                                                placeholder="อธิบายผลลัพธ์จริงที่เกิดขึ้น..."
                                                                rows={2}
                                                            />
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <Button size="sm" variant="destructive" onClick={() => updateStatus(exec.id, "FAILED")}>
                                                                Mark as Failed
                                                            </Button>
                                                            <Button size="sm" variant="outline" onClick={() => openDefectDialog(exec)}>
                                                                <Bug className="mr-1 h-3.5 w-3.5" />
                                                                Report Defect
                                                            </Button>
                                                            <Button size="sm" variant="outline" onClick={() => setExpandedId(null)}>
                                                                Cancel
                                                            </Button>
                                                        </div>
                                                    </>
                                                ) : (
                                                    <>
                                                        <div className="space-y-1">
                                                            <label className="text-xs font-medium">Blocked Reason / Notes</label>
                                                            <Textarea
                                                                value={notes}
                                                                onChange={(e) => setNotes(e.target.value)}
                                                                placeholder="ระบุเหตุผลที่ถูก Block..."
                                                                rows={2}
                                                            />
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <Button size="sm" className="bg-yellow-600 hover:bg-yellow-700 text-white" onClick={() => updateStatus(exec.id, "BLOCKED")}>
                                                                Mark as Blocked
                                                            </Button>
                                                            <Button size="sm" variant="outline" onClick={() => setExpandedId(null)}>
                                                                Cancel
                                                            </Button>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* Pass All Confirm Dialog */}
            <Dialog open={passAllConfirm} onOpenChange={setPassAllConfirm}>
                <DialogContent className="sm:max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Pass All Test Cases</DialogTitle>
                        <DialogDescription>
                            This will mark {notRun} test case{notRun > 1 ? "s" : ""} as PASSED. Are you sure?
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button variant="outline" onClick={() => setPassAllConfirm(false)}>
                            Cancel
                        </Button>
                        <Button
                            className="bg-green-600 hover:bg-green-700 text-white"
                            onClick={() => { setPassAllConfirm(false); passAllNotRun(); }}
                            disabled={isPending}
                        >
                            <CheckCircle2 className="h-4 w-4 mr-1" />
                            Confirm Pass All
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Create Defect Dialog */}
            <Dialog open={defectOpen} onOpenChange={setDefectOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Report Defect</DialogTitle>
                        <DialogDescription>
                            Create a defect linked to {defectExec?.testCase.key}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>Title <span className="text-destructive">*</span></Label>
                            <Input value={defectTitle} onChange={(e) => setDefectTitle(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label>Description</Label>
                            <Textarea value={defectDesc} onChange={(e) => setDefectDesc(e.target.value)} rows={3} placeholder="Steps to reproduce..." />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Severity</Label>
                                <Select value={defectSeverity} onValueChange={setDefectSeverity}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="LOW">Low</SelectItem>
                                        <SelectItem value="MEDIUM">Medium</SelectItem>
                                        <SelectItem value="HIGH">High</SelectItem>
                                        <SelectItem value="CRITICAL">Critical</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Priority</Label>
                                <Select value={defectPriority} onValueChange={setDefectPriority}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="LOW">Low</SelectItem>
                                        <SelectItem value="MEDIUM">Medium</SelectItem>
                                        <SelectItem value="HIGH">High</SelectItem>
                                        <SelectItem value="CRITICAL">Critical</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDefectOpen(false)}>Cancel</Button>
                        <Button onClick={handleCreateDefect} disabled={isPending}>Create</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Name Dialog */}
            <Dialog open={editNameOpen} onOpenChange={setEditNameOpen}>
                <DialogContent className="sm:max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Edit Test Run Name</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-2">
                        <Label>Name <span className="text-destructive">*</span></Label>
                        <Input
                            value={editNameValue}
                            onChange={(e) => setEditNameValue(e.target.value)}
                            onKeyDown={(e) => { if (e.key === "Enter") handleEditName(); }}
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditNameOpen(false)}>Cancel</Button>
                        <Button onClick={handleEditName} disabled={isPending}>Save</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
