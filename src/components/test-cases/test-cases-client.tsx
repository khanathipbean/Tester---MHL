"use client";

import { useMemo, useRef, useState, useTransition, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Plus, Sparkles, Upload, ArrowLeft, FolderOpen, Layers3, FileText } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { TestCaseTable } from "@/components/test-cases/test-case-table";
import { TestCaseFormModal } from "@/components/test-cases/test-case-form-modal";
import { TestCaseFilters } from "@/components/test-cases/test-case-filters";
import { Pagination } from "@/components/ui/pagination";
import { useDebouncedValue } from "@/hooks/use-debounce";

interface TestCase {
    id: string;
    projectId: string;
    suiteId: string | null;
    key: string;
    title: string;
    description: string | null;
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
    createdAt: string;
    updatedAt: string;
    suite?: { id: string; name: string } | null;
    tags?: { id: string; name: string; color: string | null }[];
    _count?: { steps: number; executions: number; defects: number };
}

interface Module {
    id: string;
    name: string;
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

interface TestCasesClientProps {
    testCases: TestCase[];
    modules: Module[];
    projects: ProjectOption[];
    tags: Tag[];
    canEdit: boolean;
    canDelete: boolean;
}

const DEFAULT_PAGE_SIZE = 10;

export function TestCasesClient({
    testCases,
    modules,
    projects,
    tags,
    canEdit,
    canDelete,
}: TestCasesClientProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();
    const [createOpen, setCreateOpen] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [autoTagging, setAutoTagging] = useState(false);

    // Derive filters directly from URL search params
    const projectFilter = searchParams.get("project") || "all";
    const statusFilter = searchParams.get("status") || "all";
    const moduleFilter = searchParams.get("module") || "all";
    const priorityFilter = searchParams.get("priority") || "all";
    const page = Number(searchParams.get("page")) || 1;
    const pageSize = Number(searchParams.get("size")) || DEFAULT_PAGE_SIZE;
    const { value: searchValue, setValue: setSearch } = useDebouncedValue(searchParams.get("q") || "", 300);

    // Update URL search params (source of truth for filters)
    const updateFilters = useCallback((params: Record<string, string>) => {
        const sp = new URLSearchParams(searchParams.toString());
        for (const [key, value] of Object.entries(params)) {
            if (value && value !== "all" && value !== "1" && value !== String(DEFAULT_PAGE_SIZE)) {
                sp.set(key, value);
            } else {
                sp.delete(key);
            }
        }
        const qs = sp.toString();
        router.replace(`/test-cases${qs ? `?${qs}` : ""}`, { scroll: false });
    }, [searchParams, router]);
    const filteredModules = useMemo(() => {
        if (projectFilter === "all") return modules;
        return modules.filter((m) => m.projectId === projectFilter);
    }, [modules, projectFilter]);

    const filtered = useMemo(() => {
        let result = testCases.filter((tc) => {
            if (projectFilter !== "all" && tc.projectId !== projectFilter) return false;
            if (
                searchValue &&
                !tc.title.toLowerCase().includes(searchValue.toLowerCase()) &&
                !tc.key.toLowerCase().includes(searchValue.toLowerCase())
            ) {
                return false;
            }
            if (statusFilter !== "all" && tc.status !== statusFilter) return false;
            if (moduleFilter !== "all" && tc.suiteId !== moduleFilter) return false;
            if (priorityFilter !== "all" && tc.priority !== priorityFilter) return false;
            return true;
        });
        result = [...result].sort((a, b) => {
            const numA = parseInt(a.key.match(/(\d+)$/)?.[1] || "0", 10);
            const numB = parseInt(b.key.match(/(\d+)$/)?.[1] || "0", 10);
            return numA - numB;
        });
        return result;
    }, [testCases, searchValue, projectFilter, statusFilter, moduleFilter, priorityFilter]);

    const totalPages = Math.ceil(filtered.length / pageSize);
    const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

    const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (projectFilter === "all") {
            toast.error("กรุณาเลือก Project ก่อนทำการ Import");
            if (fileInputRef.current) fileInputRef.current.value = "";
            return;
        }

        const targetProjectId = projectFilter;
        const formData = new FormData();
        formData.append("file", file);
        formData.append("projectId", targetProjectId);

        try {
            const res = await fetch("/api/test-cases/import", {
                method: "POST",
                body: formData,
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.message);

            const { created, updated, skipped, modulesCreated, newModuleNames, errors } = json.data;
            toast.success(`Import สำเร็จ: สร้างใหม่ ${created} รายการ${updated > 0 ? `, อัปเดต ${updated} รายการ` : ""}${skipped > 0 ? `, ข้าม ${skipped} รายการ` : ""}`);
            if (modulesCreated > 0) {
                toast.info(`สร้าง Module ใหม่ ${modulesCreated} รายการ: ${newModuleNames.join(", ")}`);
            }
            if (errors && errors.length > 0) {
                toast.warning(errors.slice(0, 3).join("\n"));
            }
            startTransition(() => router.refresh());
        } catch (err: unknown) {
            toast.error(err instanceof Error ? err.message : "Import failed");
        } finally {
            // Reset file input
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    // Compute per-project stats for cards
    const projectStats = useMemo(() => {
        return projects.map((p) => {
            const pModules = modules.filter((m) => m.projectId === p.id);
            const pTestCases = testCases.filter((tc) => tc.projectId === p.id);
            return { ...p, moduleCount: pModules.length, testCaseCount: pTestCases.length };
        });
    }, [projects, modules, testCases]);

    const selectedProject = projects.find((p) => p.id === projectFilter);

    return (
        <>
            {/* Header */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
                <div className="flex items-center gap-3">
                    {projectFilter !== "all" && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => updateFilters({ project: "all", module: "all", page: "1", q: "" })}
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    )}
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">
                            {projectFilter !== "all" && selectedProject
                                ? selectedProject.name
                                : "Test Cases"}
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            {projectFilter !== "all" && selectedProject
                                ? `Project: ${selectedProject.key}`
                                : "Select a project to view test cases"}
                        </p>
                    </div>
                </div>
                {canEdit && projectFilter !== "all" && (
                    <div className="flex gap-2">
                        {/* <Button
                            size="sm"
                            variant="outline"
                            onClick={async () => {
                                if (projectFilter === "all") {
                                    toast.error("กรุณาเลือก Project ก่อนทำ Auto-tag");
                                    return;
                                }
                                setAutoTagging(true);
                                try {
                                    const testCaseIds = filtered.map((tc) => tc.id);
                                    const res = await fetch("/api/test-cases/auto-tag", {
                                        method: "POST",
                                        headers: { "Content-Type": "application/json" },
                                        body: JSON.stringify({ projectId: projectFilter, testCaseIds }),
                                    });
                                    const json = await res.json();
                                    if (!res.ok) throw new Error(json.error || "Auto-tag failed");
                                    if (json.data.tagged === 0) {
                                        toast.info(json.data.message || "ไม่มี Test Case ที่ต้อง tag");
                                    } else {
                                        toast.success(`Auto-tag สำเร็จ: ${json.data.tagged}/${json.data.total} cases`);
                                    }
                                    startTransition(() => router.refresh());
                                } catch (err: unknown) {
                                    toast.error(err instanceof Error ? err.message : "Auto-tag failed");
                                } finally {
                                    setAutoTagging(false);
                                }
                            }}
                            disabled={isPending || autoTagging}
                        >
                            <Sparkles className="h-4 w-4 sm:mr-2" />
                            <span className="hidden sm:inline">{autoTagging ? "Tagging..." : "Auto-tag"}</span>
                        </Button> */}
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isPending}
                        >
                            <Upload className="h-4 w-4 sm:mr-2" />
                            <span className="hidden sm:inline">Import Excel | CSV</span>
                        </Button>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".xlsx,.xls,.csv"
                            className="hidden"
                            onChange={handleImport}
                        />
                        <Button size="sm" onClick={() => setCreateOpen(true)}>
                            <Plus className="h-4 w-4 sm:mr-2" />
                            <span className="hidden sm:inline">New Test Case</span>
                        </Button>
                    </div>
                )}
            </div>

            {/* Project Cards - shown when no project selected */}
            {projectFilter === "all" ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {projectStats.map((p) => (
                        <Card
                            key={p.id}
                            className="cursor-pointer transition-all hover:shadow-md hover:border-primary/40 hover:-translate-y-0.5"
                            onClick={() => updateFilters({ project: p.id, page: "1" })}
                        >
                            <CardContent className="p-5">
                                <div className="flex items-start gap-3">
                                    <div className="rounded-lg bg-primary/10 p-2.5">
                                        <FolderOpen className="h-5 w-5 text-primary" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold truncate">{p.name}</h3>
                                        <p className="text-xs text-muted-foreground">{p.key}</p>
                                    </div>
                                </div>
                                <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
                                    <div className="flex items-center gap-1.5">
                                        <Layers3 className="h-3.5 w-3.5" />
                                        <span>{p.moduleCount} modules</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <FileText className="h-3.5 w-3.5" />
                                        <span>{p.testCaseCount} cases</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                    {projectStats.length === 0 && (
                        <div className="col-span-full flex h-40 items-center justify-center rounded-lg border border-dashed">
                            <p className="text-sm text-muted-foreground">No projects found</p>
                        </div>
                    )}
                </div>
            ) : (
                <>
                    {/* Filters & Table - shown when project is selected */}
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between mb-4">
                        <TestCaseFilters
                            projects={projects}
                            projectFilter={projectFilter}
                            onProjectChange={(v) => { updateFilters({ project: v, module: "all", page: "1" }); }}
                            modules={filteredModules}
                            search={searchValue}
                            onSearchChange={(v) => { setSearch(v); updateFilters({ q: v, page: "1" }); }}
                            statusFilter={statusFilter}
                            onStatusChange={(v) => { updateFilters({ status: v, page: "1" }); }}
                            moduleFilter={moduleFilter}
                            onModuleChange={(v) => { updateFilters({ module: v, page: "1" }); }}
                            priorityFilter={priorityFilter}
                            onPriorityChange={(v) => { updateFilters({ priority: v, page: "1" }); }}
                            onClearFilters={() => { setSearch(""); updateFilters({ q: "", status: "all", module: "all", priority: "all", page: "1" }); }}
                        />
                        <p className="shrink-0 text-sm text-muted-foreground">
                            Result : {filtered.length}
                        </p>
                    </div>

                    <TestCaseTable
                        testCases={paginated}
                        modules={modules}
                        projects={projects}
                        tags={tags}
                        projectId={projectFilter}
                        canEdit={canEdit}
                        canDelete={canDelete}
                    />

                    <Pagination
                        page={page}
                        totalPages={totalPages}
                        onPageChange={(p) => { updateFilters({ page: String(p) }); }}
                        total={filtered.length}
                        pageSize={pageSize}
                        onPageSizeChange={(size) => { updateFilters({ size: String(size), page: "1" }); }}
                    />
                </>
            )}

            <TestCaseFormModal
                open={createOpen}
                onOpenChange={setCreateOpen}
                projectId={projectFilter !== "all" ? projectFilter : projects[0]?.id || ""}
                projects={projects}
                modules={modules}
            />
        </>
    );
}
