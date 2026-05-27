"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Search, X, ChevronsUpDown, Check, ExternalLink, FileText } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
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
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DefectSummaryCards } from "@/components/dashboard/defect-summary-cards";

interface Defect {
    id: string;
    projectId: string;
    key: string;
    title: string;
    description: string | null;
    severity: string;
    priority: string;
    status: string;
    externalUrl: string | null;
    testCaseId: string | null;
    createdAt: string;
    updatedAt: string;
    testCase: { key: string; title: string; condition: string | null; testSteps: string | null; expectedResult: string | null; priority: string; status: string; tags?: { id: string; name: string; color: string | null }[] } | null;
}

interface TestCaseOption {
    id: string;
    key: string;
    title: string;
    projectId: string;
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

interface DefectsClientProps {
    defects: Defect[];
    testCases: TestCaseOption[];
    projects: ProjectOption[];
    tags: Tag[];
    canEdit: boolean;
    canDelete: boolean;
}

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

export function DefectsClient({ defects, testCases, projects, tags, canEdit, canDelete }: DefectsClientProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [formOpen, setFormOpen] = useState(false);
    const [editTarget, setEditTarget] = useState<Defect | null>(null);
    const [viewTestCase, setViewTestCase] = useState<Defect["testCase"] | null>(null);

    // Filter state
    const [searchFilter, setSearchFilter] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [severityFilter, setSeverityFilter] = useState("all");
    const [projectFilter, setProjectFilter] = useState("all");
    const [tagFilter, setTagFilter] = useState("all");
    const [tagPopoverOpen, setTagPopoverOpen] = useState(false);

    const projectTags = useMemo(() => {
        const source = projectFilter === "all" ? tags : tags.filter((t) => t.projectId === projectFilter);
        const seen = new Map<string, { name: string; color: string | null }>();
        for (const t of source) {
            if (!seen.has(t.name)) seen.set(t.name, { name: t.name, color: t.color });
        }
        return Array.from(seen.values());
    }, [tags, projectFilter]);

    const filtered = useMemo(() => {
        return defects.filter((d) => {
            if (projectFilter !== "all" && d.projectId !== projectFilter) return false;
            if (searchFilter && !d.title.toLowerCase().includes(searchFilter.toLowerCase()) && !d.key.toLowerCase().includes(searchFilter.toLowerCase())) {
                return false;
            }
            if (statusFilter !== "all" && d.status !== statusFilter) return false;
            if (severityFilter !== "all" && d.severity !== severityFilter) return false;
            if (tagFilter !== "all") {
                if (!d.testCase?.tags?.some((t) => t.name === tagFilter)) return false;
            }
            return true;
        });
    }, [defects, searchFilter, statusFilter, severityFilter, projectFilter, tagFilter]);

    const defectStats = useMemo(() => ({
        open: filtered.filter((d) => d.status === "OPEN").length,
        inProgress: filtered.filter((d) => d.status === "IN_PROGRESS").length,
        resolved: filtered.filter((d) => d.status === "RESOLVED").length,
        closed: filtered.filter((d) => d.status === "CLOSED").length,
        total: filtered.length,
    }), [filtered]);

    // Form state
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [severity, setSeverity] = useState("MEDIUM");
    const [priority, setPriority] = useState("MEDIUM");
    const [status, setStatus] = useState("OPEN");
    const [testCaseId, setTestCaseId] = useState("none");
    const [externalUrl, setExternalUrl] = useState("");
    const [formProjectId, setFormProjectId] = useState(projects[0]?.id || "");
    const [deleteId, setDeleteId] = useState<string | null>(null);

    const formTestCases = useMemo(() => {
        return testCases.filter((tc) => tc.projectId === formProjectId);
    }, [testCases, formProjectId]);

    const openCreate = () => {
        setEditTarget(null);
        setTitle("");
        setDescription("");
        setSeverity("MEDIUM");
        setPriority("MEDIUM");
        setStatus("OPEN");
        setTestCaseId("none");
        setExternalUrl("");
        setFormProjectId(projectFilter !== "all" ? projectFilter : projects[0]?.id || "");
        setFormOpen(true);
    };

    const openEdit = (d: Defect) => {
        setEditTarget(d);
        setTitle(d.title);
        setDescription(d.description || "");
        setSeverity(d.severity);
        setPriority(d.priority);
        setStatus(d.status);
        setTestCaseId(d.testCaseId || "none");
        setExternalUrl(d.externalUrl || "");
        setFormProjectId(d.projectId);
        setFormOpen(true);
    };

    const handleSubmit = async () => {
        if (!title.trim()) { toast.error("Title is required"); return; }

        const payload = {
            title,
            description: description || null,
            severity,
            priority,
            status,
            testCaseId: testCaseId === "none" ? null : testCaseId,
            externalUrl: externalUrl || null,
            projectId: formProjectId,
        };

        try {
            const url = editTarget ? `/api/defects/${editTarget.id}` : "/api/defects";
            const method = editTarget ? "PATCH" : "POST";
            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            if (!res.ok) throw new Error((await res.json()).message);
            toast.success(editTarget ? "Updated" : "Created");
            setFormOpen(false);
            startTransition(() => router.refresh());
        } catch (e: unknown) {
            toast.error(e instanceof Error ? e.message : "Failed");
        }
    };

    const handleDelete = async (id: string) => {
        try {
            const res = await fetch(`/api/defects/${id}`, { method: "DELETE" });
            if (!res.ok) throw new Error((await res.json()).message);
            toast.success("Deleted");
            setDeleteId(null);
            startTransition(() => router.refresh());
        } catch (e: unknown) {
            toast.error(e instanceof Error ? e.message : "Failed to delete");
        }
    };

    const handleStatusChange = async (id: string, newStatus: string) => {
        try {
            const res = await fetch(`/api/defects/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus }),
            });
            if (!res.ok) throw new Error((await res.json()).message);
            toast.success(`Status → ${newStatus.replace("_", " ")}`);
            startTransition(() => router.refresh());
        } catch (e: unknown) {
            toast.error(e instanceof Error ? e.message : "Failed");
        }
    };

    return (
        <>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">Defects</h1>
                    <p className="text-sm text-muted-foreground">
                        Track and manage defects
                    </p>
                </div>
                {canEdit && (
                    <Button size="sm" onClick={openCreate}>
                        <Plus className="h-4 w-4 sm:mr-2" />
                        <span className="hidden sm:inline">Report Defect</span>
                    </Button>
                )}
            </div>

            <div className="mb-6">
                <DefectSummaryCards defects={defectStats} />
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between mb-4">
                <div className="flex flex-wrap items-end gap-2 sm:gap-3">
                    <div className="relative w-full sm:min-w-[200px] sm:w-auto sm:max-w-sm">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Search defects..."
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
                                <SelectItem value="OPEN">Open</SelectItem>
                                <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                                <SelectItem value="RESOLVED">Resolved</SelectItem>
                                <SelectItem value="CLOSED">Closed</SelectItem>
                                <SelectItem value="REOPENED">Reopened</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <label className="mb-1 block text-xs font-medium text-muted-foreground">Severity</label>
                        <Select value={severityFilter} onValueChange={setSeverityFilter}>
                            <SelectTrigger className="w-[110px] sm:w-[140px]">
                                <SelectValue placeholder="All" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All</SelectItem>
                                <SelectItem value="LOW">Low</SelectItem>
                                <SelectItem value="MEDIUM">Medium</SelectItem>
                                <SelectItem value="HIGH">High</SelectItem>
                                <SelectItem value="CRITICAL">Critical</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    {projectTags.length > 0 && (
                        <div>
                            <label className="mb-1 block text-xs font-medium text-muted-foreground">Tag</label>
                            <Popover open={tagPopoverOpen} onOpenChange={setTagPopoverOpen}>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        role="combobox"
                                        className="w-[130px] sm:w-[160px] justify-between font-normal"
                                    >
                                        {tagFilter === "all" ? (
                                            "All"
                                        ) : (
                                            <span className="flex items-center gap-1.5 truncate">
                                                <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: projectTags.find((t) => t.name === tagFilter)?.color || "#6b7280" }} />
                                                {tagFilter}
                                            </span>
                                        )}
                                        <ChevronsUpDown className="ml-1 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[200px] p-0" align="start">
                                    <Command>
                                        <CommandInput placeholder="Search tag..." />
                                        <CommandList>
                                            <CommandEmpty>No tag found.</CommandEmpty>
                                            <CommandGroup>
                                                <CommandItem
                                                    value="all"
                                                    onSelect={() => { setTagFilter("all"); setTagPopoverOpen(false); }}
                                                >
                                                    <Check className={`mr-2 h-4 w-4 ${tagFilter === "all" ? "opacity-100" : "opacity-0"}`} />
                                                    All
                                                </CommandItem>
                                                {projectTags.map((tag) => (
                                                    <CommandItem
                                                        key={tag.name}
                                                        value={tag.name}
                                                        onSelect={() => { setTagFilter(tag.name); setTagPopoverOpen(false); }}
                                                    >
                                                        <Check className={`mr-2 h-4 w-4 ${tagFilter === tag.name ? "opacity-100" : "opacity-0"}`} />
                                                        <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: tag.color || "#6b7280" }} />
                                                        <span className="ml-1.5 truncate">{tag.name}</span>
                                                    </CommandItem>
                                                ))}
                                            </CommandGroup>
                                        </CommandList>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                        </div>
                    )}
                    {(searchFilter || statusFilter !== "all" || severityFilter !== "all" || projectFilter !== "all" || tagFilter !== "all") && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-9 px-2 text-muted-foreground"
                            onClick={() => { setSearchFilter(""); setStatusFilter("all"); setSeverityFilter("all"); setProjectFilter("all"); setTagFilter("all"); }}
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
                    <p className="text-sm text-muted-foreground">No defects found</p>
                </div>
            ) : (
                <div className="rounded-lg border overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-24">Key</TableHead>
                                <TableHead>Title</TableHead>
                                <TableHead>Linked TC</TableHead>
                                <TableHead>Tags</TableHead>
                                <TableHead>Severity</TableHead>
                                <TableHead>Priority</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="w-12 text-center">Link</TableHead>
                                <TableHead>Created</TableHead>
                                {(canEdit || canDelete) && <TableHead className="w-20" />}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filtered.map((d) => (
                                <TableRow key={d.id}>
                                    <TableCell className="font-mono text-xs">{d.key}</TableCell>
                                    <TableCell className="font-medium max-w-[200px] truncate" title={d.title}>{d.title}</TableCell>
                                    <TableCell className="text-center">
                                        {d.testCase ? (
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-7 w-7"
                                                title={`${d.testCase.key} - ${d.testCase.title}`}
                                                onClick={() => setViewTestCase(d.testCase)}
                                            >
                                                <FileText className="h-4 w-4" />
                                            </Button>
                                        ) : (
                                            <span className="text-muted-foreground">—</span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-wrap gap-1">
                                            {d.testCase?.tags && d.testCase.tags.length > 0
                                                ? d.testCase.tags.map((tag) => (
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
                                    <TableCell>
                                        <Badge variant="outline" className={`text-xs ${severityStyle[d.severity] || ""}`}>
                                            {d.severity}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className={`text-xs ${severityStyle[d.priority] || ""}`}>
                                            {d.priority}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        {canEdit ? (
                                            <Select value={d.status} onValueChange={(v) => handleStatusChange(d.id, v)}>
                                                <SelectTrigger className="h-7 w-28 text-xs">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="OPEN">Open</SelectItem>
                                                    <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                                                    <SelectItem value="RESOLVED">Resolved</SelectItem>
                                                    <SelectItem value="CLOSED">Closed</SelectItem>
                                                    <SelectItem value="REOPENED">Reopened</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        ) : (
                                            <Badge variant="outline" className={`text-xs ${defectStatusStyle[d.status] || ""}`}>
                                                {d.status.replace("_", " ")}
                                            </Badge>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        {d.externalUrl ? (
                                            <a
                                                href={d.externalUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center justify-center text-muted-foreground hover:text-foreground"
                                                title={d.externalUrl}
                                            >
                                                <ExternalLink className="h-4 w-4" />
                                            </a>
                                        ) : (
                                            <span className="text-muted-foreground">—</span>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-xs text-muted-foreground">
                                        {new Date(d.createdAt).toLocaleDateString()}
                                    </TableCell>
                                    {(canEdit || canDelete) && (
                                        <TableCell>
                                            <div className="flex gap-1">
                                                {canEdit && (
                                                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(d)}>
                                                        <Pencil className="h-3.5 w-3.5" />
                                                    </Button>
                                                )}
                                                {canDelete && (
                                                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => setDeleteId(d.id)}>
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </Button>
                                                )}
                                            </div>
                                        </TableCell>
                                    )}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}

            {/* Delete Confirm Dialog */}
            <Dialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
                <DialogContent className="sm:max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Delete Defect</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this defect? This action cannot be undone.
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

            {/* Test Case Detail Modal */}
            <Dialog open={!!viewTestCase} onOpenChange={(open) => !open && setViewTestCase(null)}>
                <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
                    <DialogHeader className="pb-3 border-b">
                        <DialogTitle className="flex items-center gap-2 text-base">
                            <span className="flex items-center justify-center h-7 w-7 rounded-md bg-primary/10 text-primary">
                                <FileText className="h-4 w-4" />
                            </span>
                            {viewTestCase?.key}
                        </DialogTitle>
                    </DialogHeader>
                    {viewTestCase && (
                        <div className="space-y-4 pt-2 text-sm">
                            {/* Status & Priority */}
                            <div className="flex items-center gap-2">
                                <Badge variant="outline" className="gap-1">
                                    <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                                    {viewTestCase.status}
                                </Badge>
                                <Badge variant="outline" className="gap-1">
                                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                                    {viewTestCase.priority}
                                </Badge>
                            </div>

                            {/* Condition */}
                            {viewTestCase.condition && (
                                <div className="rounded-lg border p-3 space-y-1.5">
                                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Condition (if)</p>
                                    <p className="whitespace-pre-wrap leading-relaxed">{viewTestCase.condition}</p>
                                </div>
                            )}

                            {/* Test Steps */}
                            {viewTestCase.testSteps && (
                                <div className="rounded-lg border p-3 space-y-1.5">
                                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Test Steps</p>
                                    <p className="whitespace-pre-wrap leading-relaxed">{viewTestCase.testSteps}</p>
                                </div>
                            )}

                            {/* Expected Result */}
                            {viewTestCase.expectedResult && (
                                <div className="rounded-lg border border-green-200 bg-green-50/50 dark:border-green-900 dark:bg-green-950/30 p-3 space-y-1.5">
                                    <p className="text-xs font-semibold uppercase tracking-wider text-green-700 dark:text-green-400">Expected Result</p>
                                    <p className="whitespace-pre-wrap leading-relaxed">{viewTestCase.expectedResult}</p>
                                </div>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Create/Edit Dialog */}
            <Dialog open={formOpen} onOpenChange={setFormOpen}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>{editTarget ? "Edit Defect" : "Report Defect"}</DialogTitle>
                        <DialogDescription>
                            {editTarget ? "Update defect details." : "Log a new defect found during testing."}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
                        <div className="space-y-2">
                            <Label>Project</Label>
                            <Select value={formProjectId} onValueChange={(v) => { setFormProjectId(v); setTestCaseId("none"); }} disabled={!!editTarget}>
                                <SelectTrigger><SelectValue placeholder="Select project" /></SelectTrigger>
                                <SelectContent>
                                    {projects.map((p) => (
                                        <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Title <span className="text-destructive">*</span></Label>
                            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Brief defect description" />
                        </div>
                        <div className="space-y-2">
                            <Label>Description</Label>
                            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Steps to reproduce, details..." rows={3} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Severity</Label>
                                <Select value={severity} onValueChange={setSeverity}>
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
                                <Select value={priority} onValueChange={setPriority}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="LOW">Low</SelectItem>
                                        <SelectItem value="MEDIUM">Medium</SelectItem>
                                        <SelectItem value="HIGH">High</SelectItem>
                                        <SelectItem value="CRITICAL">Critical</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            {editTarget && (
                                <div className="space-y-2">
                                    <Label>Status</Label>
                                    <Select value={status} onValueChange={setStatus}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="OPEN">Open</SelectItem>
                                            <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                                            <SelectItem value="RESOLVED">Resolved</SelectItem>
                                            <SelectItem value="CLOSED">Closed</SelectItem>
                                            <SelectItem value="REOPENED">Reopened</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}
                            <div className="space-y-2">
                                <Label>Linked Test Case</Label>
                                <TestCaseCombobox
                                    value={testCaseId}
                                    onChange={setTestCaseId}
                                    testCases={formTestCases}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>External URL (optional)</Label>
                            <Input value={externalUrl} onChange={(e) => setExternalUrl(e.target.value)} placeholder="Link to Jira, GitHub issue, etc." />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setFormOpen(false)}>Cancel</Button>
                        <Button onClick={handleSubmit} disabled={isPending}>
                            {isPending ? "Saving..." : editTarget ? "Save" : "Create"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

function TestCaseCombobox({
    value,
    onChange,
    testCases,
}: {
    value: string;
    onChange: (value: string) => void;
    testCases: { id: string; key: string; title: string }[];
}) {
    const [open, setOpen] = useState(false);
    const selected = testCases.find((tc) => tc.id === value);

    return (
        <Popover open={open} onOpenChange={setOpen} modal={true}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between font-normal"
                >
                    <span className="truncate">
                        {selected ? `${selected.key} - ${selected.title}` : "None"}
                    </span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent
                className="z-[60] w-[--radix-popover-trigger-width] p-0"
                align="start"
                side="bottom"
                onOpenAutoFocus={(e) => e.preventDefault()}
            >
                <Command>
                    <CommandInput placeholder="Search test case..." />
                    <CommandList className="max-h-52 overflow-y-auto">
                        <CommandEmpty>No test case found.</CommandEmpty>
                        <CommandGroup>
                            <CommandItem
                                value="none"
                                onSelect={() => { onChange("none"); setOpen(false); }}
                            >
                                <Check className={`mr-2 h-4 w-4 ${value === "none" ? "opacity-100" : "opacity-0"}`} />
                                None
                            </CommandItem>
                            {testCases.map((tc) => (
                                <CommandItem
                                    key={tc.id}
                                    value={`${tc.key} ${tc.title}`}
                                    onSelect={() => { onChange(tc.id); setOpen(false); }}
                                >
                                    <Check className={`mr-2 h-4 w-4 ${value === tc.id ? "opacity-100" : "opacity-0"}`} />
                                    <span className="font-mono text-xs text-muted-foreground mr-1">{tc.key}</span>
                                    <span className="truncate">{tc.title}</span>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
