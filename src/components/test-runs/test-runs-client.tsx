"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Play, Trash2, CheckCircle, Search, X, ListChecks, Clock, Ban, PlayCircle, Pencil } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
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
import { SummaryCard } from "@/components/dashboard/summary-card";

interface TestRun {
    id: string;
    projectId: string;
    key: string;
    name: string;
    environment: string | null;
    status: string;
    startedAt: string | null;
    completedAt: string | null;
    createdAt: string;
    total: number;
    passed: number;
    failed: number;
    blocked: number;
}

interface TestCase {
    id: string;
    key: string;
    title: string;
    status: string;
    projectId: string;
    suiteId: string | null;
    tags?: { id: string; name: string; color: string | null }[];
}

interface ProjectOption {
    id: string;
    name: string;
    key: string;
}

interface Tag {
    id: string;
    name: string;
    color: string | null;
    projectId: string;
}

interface Module {
    id: string;
    name: string;
    projectId: string;
}

interface TestRunsClientProps {
    testRuns: TestRun[];
    testCases: TestCase[];
    projects: ProjectOption[];
    tags: Tag[];
    modules: Module[];
    canEdit: boolean;
    canDelete: boolean;
}

const statusStyle: Record<string, string> = {
    PLANNED: "border-gray-200 bg-gray-50 text-gray-700 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-300",
    IN_PROGRESS: "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-300",
    COMPLETED: "border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950 dark:text-green-300",
    ABORTED: "border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300",
};

export function TestRunsClient({ testRuns, testCases, projects, tags, modules, canEdit, canDelete }: TestRunsClientProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [createOpen, setCreateOpen] = useState(false);
    const [name, setName] = useState("");
    const [environment, setEnvironment] = useState("");
    const [selectedCases, setSelectedCases] = useState<string[]>([]);
    const [searchFilter, setSearchFilter] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [projectFilter, setProjectFilter] = useState("all");
    const [createProjectId, setCreateProjectId] = useState(projects[0]?.id || "");
    const [createSearch, setCreateSearch] = useState("");
    const [createTagFilter, setCreateTagFilter] = useState("all");
    const [createModuleFilter, setCreateModuleFilter] = useState("all");
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [editNameId, setEditNameId] = useState<string | null>(null);
    const [editNameValue, setEditNameValue] = useState("");

    const filtered = useMemo(() => {
        return testRuns.filter((run) => {
            if (projectFilter !== "all" && run.projectId !== projectFilter) return false;
            if (searchFilter && !run.name.toLowerCase().includes(searchFilter.toLowerCase()) && !run.key.toLowerCase().includes(searchFilter.toLowerCase())) {
                return false;
            }
            if (statusFilter !== "all" && run.status !== statusFilter) return false;
            return true;
        });
    }, [testRuns, searchFilter, statusFilter, projectFilter]);

    const filteredTestCases = useMemo(() => {
        let cases = testCases.filter((tc) => tc.projectId === createProjectId);
        if (createModuleFilter !== "all") {
            cases = cases.filter((tc) => tc.suiteId === createModuleFilter);
        }
        if (createSearch) {
            const q = createSearch.toLowerCase();
            cases = cases.filter((tc) => tc.key.toLowerCase().includes(q) || tc.title.toLowerCase().includes(q));
        }
        if (createTagFilter !== "all") {
            cases = cases.filter((tc) => tc.tags?.some((t) => t.id === createTagFilter));
        }
        return cases;
    }, [testCases, createProjectId, createSearch, createTagFilter, createModuleFilter]);

    const projectTags = useMemo(() => {
        return tags.filter((t) => t.projectId === createProjectId);
    }, [tags, createProjectId]);

    const projectModules = useMemo(() => {
        return modules.filter((m) => m.projectId === createProjectId);
    }, [modules, createProjectId]);

    const handleCreate = async () => {
        if (!name.trim() || selectedCases.length === 0) {
            toast.error("Name and at least one test case are required");
            return;
        }
        try {
            const res = await fetch("/api/test-runs", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, environment, testCaseIds: selectedCases, projectId: createProjectId }),
            });
            if (!res.ok) throw new Error((await res.json()).message);
            toast.success("Test run created");
            setCreateOpen(false);
            setName("");
            setEnvironment("");
            setSelectedCases([]);
            startTransition(() => router.refresh());
        } catch (e: unknown) {
            toast.error(e instanceof Error ? e.message : "Failed to create");
        }
    };

    const handleDelete = async (id: string) => {
        try {
            const res = await fetch(`/api/test-runs/${id}`, { method: "DELETE" });
            if (!res.ok) throw new Error((await res.json()).message);
            toast.success("Deleted");
            setDeleteId(null);
            startTransition(() => router.refresh());
        } catch (e: unknown) {
            toast.error(e instanceof Error ? e.message : "Failed to delete");
        }
    };

    const handleEditName = async () => {
        if (!editNameValue.trim() || !editNameId) { toast.error("Name is required"); return; }
        try {
            const res = await fetch(`/api/test-runs/${editNameId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: editNameValue.trim() }),
            });
            if (!res.ok) throw new Error((await res.json()).message);
            toast.success("Name updated");
            setEditNameId(null);
            startTransition(() => router.refresh());
        } catch (e: unknown) {
            toast.error(e instanceof Error ? e.message : "Failed to update name");
        }
    };

    const toggleCase = (id: string) => {
        setSelectedCases((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
        );
    };

    const selectAll = () => {
        if (selectedCases.length === filteredTestCases.length) {
            setSelectedCases([]);
        } else {
            setSelectedCases(filteredTestCases.map((tc) => tc.id));
        }
    };

    return (
        <>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">Test Runs</h1>
                    <p className="text-sm text-muted-foreground">
                        Execute and track test runs
                    </p>
                </div>
                {canEdit && (
                    <Button size="sm" onClick={() => setCreateOpen(true)}>
                        <Plus className="h-4 w-4 sm:mr-2" />
                        <span className="hidden sm:inline">New Test Run</span>
                    </Button>
                )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
                <SummaryCard
                    title="Total Runs"
                    value={filtered.length}
                    icon={<ListChecks className="h-4 w-4" />}
                />
                <SummaryCard
                    title="Planned"
                    value={filtered.filter((r) => r.status === "PLANNED").length}
                    icon={<Clock className="h-4 w-4" />}
                />
                <SummaryCard
                    title="In Progress"
                    value={filtered.filter((r) => r.status === "IN_PROGRESS").length}
                    icon={<PlayCircle className="h-4 w-4" />}
                />
                <SummaryCard
                    title="Completed"
                    value={filtered.filter((r) => r.status === "COMPLETED").length}
                    variant="success"
                    icon={<CheckCircle className="h-4 w-4" />}
                />
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between mb-4">
                <div className="flex flex-wrap items-end gap-2 sm:gap-3">
                    <div className="relative w-full sm:min-w-[200px] sm:w-auto sm:max-w-sm">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Search test runs..."
                            className="pl-9"
                            value={searchFilter}
                            onChange={(e) => setSearchFilter(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="mb-1 block text-xs font-medium text-muted-foreground">Project</label>
                        <Select value={projectFilter} onValueChange={setProjectFilter}>
                            <SelectTrigger className="w-[130px] sm:w-[160px]">
                                <SelectValue placeholder="All" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All</SelectItem>
                                {projects.map((p) => (
                                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <label className="mb-1 block text-xs font-medium text-muted-foreground">Status</label>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-[110px] sm:w-[140px]">
                                <SelectValue placeholder="All" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All</SelectItem>
                                <SelectItem value="PLANNED">Planned</SelectItem>
                                <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                                <SelectItem value="COMPLETED">Completed</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    {(searchFilter || statusFilter !== "all" || projectFilter !== "all") && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-9 px-2 text-muted-foreground"
                            onClick={() => { setSearchFilter(""); setStatusFilter("all"); setProjectFilter("all"); }}
                        >
                            <X className="mr-1 h-4 w-4" />
                            Clear
                        </Button>
                    )}
                </div>
                <p className="shrink-0 text-sm text-muted-foreground">
                    Result : {filtered.length}
                </p>
            </div>

            {filtered.length === 0 ? (
                <div className="flex h-40 items-center justify-center rounded-lg border border-dashed">
                    <p className="text-sm text-muted-foreground">No test runs found</p>
                </div>
            ) : (
                <div className="overflow-x-auto rounded-lg border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Key</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Environment</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Total</TableHead>
                                <TableHead className="text-right">Passed</TableHead>
                                <TableHead className="text-right">Failed</TableHead>
                                <TableHead className="text-right">Blocked</TableHead>
                                <TableHead className="text-right">Progress</TableHead>
                                <TableHead className="w-24" />
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filtered.map((run) => {
                                const progress = run.total > 0
                                    ? Math.round(((run.passed + run.failed + run.blocked) / run.total) * 100)
                                    : 0;
                                return (
                                    <TableRow key={run.id}>
                                        <TableCell className="font-mono text-xs">{run.key}</TableCell>
                                        <TableCell className="font-medium">{run.name}</TableCell>
                                        <TableCell className="text-muted-foreground">{run.environment || "—"}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className={statusStyle[run.status] || ""}>
                                                {run.status.replace("_", " ")}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">{run.total}</TableCell>
                                        <TableCell className="text-right text-green-600">{run.passed}</TableCell>
                                        <TableCell className="text-right text-red-600">{run.failed}</TableCell>
                                        <TableCell className="text-right text-yellow-600">{run.blocked}</TableCell>
                                        <TableCell className="text-right">{progress}%</TableCell>
                                        <TableCell>
                                            <div className="flex gap-1">
                                                {canEdit && (
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8"
                                                        onClick={() => { setEditNameId(run.id); setEditNameValue(run.name); }}
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                )}
                                                {canEdit && run.status !== "COMPLETED" && (
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8"
                                                        onClick={() => router.push(`/test-runs/${run.id}`)}
                                                    >
                                                        <Play className="h-4 w-4" />
                                                    </Button>
                                                )}
                                                {run.status === "COMPLETED" && (
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8"
                                                        onClick={() => router.push(`/test-runs/${run.id}`)}
                                                    >
                                                        <CheckCircle className="h-4 w-4" />
                                                    </Button>
                                                )}
                                                {canDelete && (
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-destructive"
                                                        onClick={() => setDeleteId(run.id)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </div>
            )}

            {/* Delete Confirm Dialog */}
            <Dialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
                <DialogContent className="sm:max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Delete Test Run</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this test run? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button variant="outline" onClick={() => setDeleteId(null)}>
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={() => deleteId && handleDelete(deleteId)}
                            disabled={isPending}
                        >
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Name Dialog */}
            <Dialog open={!!editNameId} onOpenChange={(open) => !open && setEditNameId(null)}>
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
                        <Button variant="outline" onClick={() => setEditNameId(null)}>Cancel</Button>
                        <Button onClick={handleEditName} disabled={isPending}>Save</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Create Dialog */}
            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-hidden flex flex-col">
                    <DialogHeader>
                        <DialogTitle>Create Test Run</DialogTitle>
                        <DialogDescription>Select test cases to include in this run.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 flex-1 overflow-y-auto">
                        <div className="space-y-2">
                            <Label>Project</Label>
                            <Select value={createProjectId} onValueChange={(v) => { setCreateProjectId(v); setSelectedCases([]); setCreateSearch(""); setCreateTagFilter("all"); setCreateModuleFilter("all"); }}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select project" />
                                </SelectTrigger>
                                <SelectContent>
                                    {projects.map((p) => (
                                        <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Name <span className="text-destructive">*</span></Label>
                            <Input
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="e.g. Sprint 5 Regression"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Environment (optional)</Label>
                            <Select value={environment} onValueChange={setEnvironment}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select environment" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Production">Production</SelectItem>
                                    <SelectItem value="Unit Test">Unit Test</SelectItem>
                                    <SelectItem value="Developer">Developer</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label>Test Cases <span className="text-destructive">*</span> ({selectedCases.length}/{filteredTestCases.length})</Label>
                                <Button variant="ghost" size="sm" onClick={selectAll}>
                                    {selectedCases.length === filteredTestCases.length ? "Deselect All" : "Select All"}
                                </Button>
                            </div>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    placeholder="Search test cases..."
                                    className="pl-9"
                                    value={createSearch}
                                    onChange={(e) => setCreateSearch(e.target.value)}
                                />
                            </div>
                            <div className="flex gap-2">
                                {projectModules.length > 0 && (
                                    <Select value={createModuleFilter} onValueChange={setCreateModuleFilter}>
                                        <SelectTrigger className="h-8 text-xs">
                                            <SelectValue placeholder="Filter by module" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Modules</SelectItem>
                                            {projectModules.map((m) => (
                                                <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                                {projectTags.length > 0 && (
                                    <Select value={createTagFilter} onValueChange={setCreateTagFilter}>
                                        <SelectTrigger className="h-8 text-xs">
                                            <SelectValue placeholder="Filter by tag" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Tags</SelectItem>
                                            {projectTags.map((tag) => (
                                                <SelectItem key={tag.id} value={tag.id}>
                                                    <span className="flex items-center gap-1.5">
                                                        <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: tag.color || "#6b7280" }} />
                                                        {tag.name}
                                                    </span>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            </div>
                            <div className="max-h-48 overflow-y-auto rounded-md border p-2 space-y-1">
                                {filteredTestCases.map((tc) => (
                                    <label key={tc.id} className="flex items-center gap-2 py-1 px-1 rounded hover:bg-muted text-sm cursor-pointer">
                                        <Checkbox
                                            checked={selectedCases.includes(tc.id)}
                                            onCheckedChange={() => toggleCase(tc.id)}
                                        />
                                        <span className="font-mono text-xs text-muted-foreground">{tc.key}</span>
                                        <span className="truncate flex-1">{tc.title}</span>
                                        {tc.tags && tc.tags.length > 0 && (
                                            <span className="flex gap-0.5 shrink-0">
                                                {tc.tags.map((tag) => (
                                                    <span
                                                        key={tag.id}
                                                        className="h-2.5 w-2.5 rounded-full"
                                                        style={{ backgroundColor: tag.color || "#6b7280" }}
                                                        title={tag.name}
                                                    />
                                                ))}
                                            </span>
                                        )}
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
                        <Button onClick={handleCreate} disabled={isPending}>
                            {isPending ? "Creating..." : "Create"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
