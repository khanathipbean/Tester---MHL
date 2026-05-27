"use client";

import { Search, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface Module {
    id: string;
    name: string;
}

interface ProjectOption {
    id: string;
    name: string;
    key: string;
}

interface TestCaseFiltersProps {
    projects: ProjectOption[];
    projectFilter: string;
    onProjectChange: (value: string) => void;
    modules: Module[];
    search: string;
    onSearchChange: (value: string) => void;
    statusFilter: string;
    onStatusChange: (value: string) => void;
    moduleFilter: string;
    onModuleChange: (value: string) => void;
    priorityFilter: string;
    onPriorityChange: (value: string) => void;
    onClearFilters?: () => void;
}

export function TestCaseFilters({
    projects,
    projectFilter,
    onProjectChange,
    modules,
    search,
    onSearchChange,
    statusFilter,
    onStatusChange,
    moduleFilter,
    onModuleChange,
    priorityFilter,
    onPriorityChange,
    onClearFilters,
}: TestCaseFiltersProps) {
    return (
        <div className="flex flex-wrap items-end gap-2 sm:gap-3">
            <div className="relative w-full sm:min-w-[200px] sm:w-auto sm:flex-1 sm:max-w-sm">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Search test cases..."
                        className="pl-9"
                        value={search}
                        onChange={(e) => onSearchChange(e.target.value)}
                    />
                </div>
            </div>

            <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Project</label>
                <Select value={projectFilter} onValueChange={onProjectChange}>
                    <SelectTrigger className="w-[130px] sm:w-[160px]">
                        <SelectValue placeholder="All" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        {projects.map((p) => (
                            <SelectItem key={p.id} value={p.id}>
                                {p.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Module</label>
                <Select value={moduleFilter} onValueChange={onModuleChange}>
                    <SelectTrigger className="w-[130px] sm:w-[160px]">
                        <SelectValue placeholder="All" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        {modules.map((mod) => (
                            <SelectItem key={mod.id} value={mod.id}>
                                {mod.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Status</label>
                <Select value={statusFilter} onValueChange={onStatusChange}>
                    <SelectTrigger className="w-[110px] sm:w-[140px]">
                        <SelectValue placeholder="All" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="PASS">Pass</SelectItem>
                        <SelectItem value="FAIL">Fail</SelectItem>
                        <SelectItem value="NOT_RUN">Not Run</SelectItem>
                        <SelectItem value="BLOCKED">Blocked</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Priority</label>
                <Select value={priorityFilter} onValueChange={onPriorityChange}>
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

            {(search || statusFilter !== "all" || moduleFilter !== "all" || priorityFilter !== "all") && (
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-9 px-2 text-muted-foreground"
                    onClick={() => onClearFilters?.()}
                >
                    <X className="mr-1 h-4 w-4" />
                    Clear
                </Button>
            )}
        </div>
    );
}
