"use client";

import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
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

interface DashboardFiltersProps {
    projects: ProjectOption[];
    projectFilter: string;
    onProjectChange: (value: string) => void;
    modules: Module[];
    moduleFilter: string;
    onModuleChange: (value: string) => void;
    statusFilter: string;
    onStatusChange: (value: string) => void;
    priorityFilter: string;
    onPriorityChange: (value: string) => void;
}

export function DashboardFilters({
    projects,
    projectFilter,
    onProjectChange,
    modules,
    moduleFilter,
    onModuleChange,
    statusFilter,
    onStatusChange,
    priorityFilter,
    onPriorityChange,
}: DashboardFiltersProps) {
    return (
        <div className="flex flex-wrap items-end gap-2 sm:gap-3">
            <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Project</label>
                <Select value={projectFilter} onValueChange={onProjectChange}>
                    <SelectTrigger className="w-[140px] sm:w-[180px]">
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
                    <SelectTrigger className="w-[140px] sm:w-[180px]">
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
                    <SelectTrigger className="w-[120px] sm:w-[160px]">
                        <SelectValue placeholder="All" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="PASS">Passed</SelectItem>
                        <SelectItem value="FAIL">Failed</SelectItem>
                        <SelectItem value="NOT_RUN">Not Run</SelectItem>
                        <SelectItem value="BLOCKED">Blocked</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Priority</label>
                <Select value={priorityFilter} onValueChange={onPriorityChange}>
                    <SelectTrigger className="w-[120px] sm:w-[160px]">
                        <SelectValue placeholder="All" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="CRITICAL">Critical</SelectItem>
                        <SelectItem value="HIGH">High</SelectItem>
                        <SelectItem value="MEDIUM">Medium</SelectItem>
                        <SelectItem value="LOW">Low</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {(projectFilter !== "all" || moduleFilter !== "all" || statusFilter !== "all" || priorityFilter !== "all") && (
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-9 px-2 text-muted-foreground"
                    onClick={() => {
                        onProjectChange("all");
                        onModuleChange("all");
                        onStatusChange("all");
                        onPriorityChange("all");
                    }}
                >
                    <X className="mr-1 h-4 w-4" />
                    Clear
                </Button>
            )}
        </div>
    );
}
