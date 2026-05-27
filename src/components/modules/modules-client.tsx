"use client";

import { useMemo, useState } from "react";
import { Plus, Search, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ModuleTable } from "@/components/modules/module-table";
import { ModuleFormModal } from "@/components/modules/module-form-modal";
import { Pagination } from "@/components/ui/pagination";
import { useDebouncedValue } from "@/hooks/use-debounce";

interface Module {
    id: string;
    projectId: string;
    name: string;
    description: string | null;
    createdAt: string;
    updatedAt: string;
    _count?: { testCases: number; children: number };
}

interface ModulesClientProps {
    modules: Module[];
    projectId: string;
    canEdit: boolean;
    canDelete: boolean;
    total: number;
    page: number;
    totalPages: number;
}

const PAGE_SIZE = 10;

export function ModulesClient({
    modules,
    projectId,
    canEdit,
    canDelete,
}: ModulesClientProps) {
    const [createOpen, setCreateOpen] = useState(false);
    const { value: searchValue, setValue: setSearch } = useDebouncedValue("", 300);
    const [page, setPage] = useState(1);
    const [sortBy, setSortBy] = useState<"name" | "updatedAt">("updatedAt");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

    const filtered = useMemo(() => {
        let result = modules;
        if (searchValue) {
            result = result.filter((m) =>
                m.name.toLowerCase().includes(searchValue.toLowerCase()),
            );
        }
        result = [...result].sort((a, b) => {
            const valA = a[sortBy];
            const valB = b[sortBy];
            const cmp = valA < valB ? -1 : valA > valB ? 1 : 0;
            return sortOrder === "asc" ? cmp : -cmp;
        });
        return result;
    }, [modules, searchValue, sortBy, sortOrder]);

    const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
    const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    const handleSort = (col: "name" | "updatedAt") => {
        if (sortBy === col) {
            setSortOrder(sortOrder === "asc" ? "desc" : "asc");
        } else {
            setSortBy(col);
            setSortOrder("asc");
        }
        setPage(1);
    };

    return (
        <>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">Modules</h1>
                    <p className="text-sm text-muted-foreground">
                        Organize test cases into modules
                    </p>
                </div>
                {canEdit && (
                    <Button size="sm" onClick={() => setCreateOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        New Module
                    </Button>
                )}
            </div>

            <div className="flex items-center justify-between gap-4">
                <div className="relative max-w-sm flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Search modules..."
                        className="pl-9"
                        value={searchValue}
                        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                    />
                </div>
                {searchValue && (
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-9 px-2 text-muted-foreground"
                        onClick={() => { setSearch(""); setPage(1); }}
                    >
                        <X className="mr-1 h-4 w-4" />
                        Clear
                    </Button>
                )}
                <p className="shrink-0 text-sm text-muted-foreground">
                    Result : {filtered.length}
                </p>
            </div>

            <ModuleTable
                modules={paginated}
                canEdit={canEdit}
                canDelete={canDelete}
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSort={handleSort}
            />

            <Pagination
                page={page}
                totalPages={totalPages}
                onPageChange={setPage}
                total={filtered.length}
            />

            <ModuleFormModal
                open={createOpen}
                onOpenChange={setCreateOpen}
                projectId={projectId}
            />
        </>
    );
}
