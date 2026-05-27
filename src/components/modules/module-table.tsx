"use client";

import { useState } from "react";
import { MoreHorizontal, Pencil, Trash2, ArrowUpDown } from "lucide-react";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ModuleFormModal } from "@/components/modules/module-form-modal";
import { DeleteModuleModal } from "@/components/modules/delete-module-modal";

interface Module {
    id: string;
    projectId: string;
    name: string;
    description: string | null;
    createdAt: string;
    updatedAt: string;
    _count?: { testCases: number; children: number };
}

interface ModuleTableProps {
    modules: Module[];
    canEdit: boolean;
    canDelete: boolean;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
    onSort?: (col: "name" | "updatedAt") => void;
}

export function ModuleTable({ modules, canEdit, canDelete, sortBy, sortOrder, onSort }: ModuleTableProps) {
    const [editModule, setEditModule] = useState<Module | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<Module | null>(null);

    if (modules.length === 0) {
        return (
            <div className="flex h-40 items-center justify-center rounded-lg border border-dashed">
                <p className="text-sm text-muted-foreground">
                    No modules found. Create one to get started.
                </p>
            </div>
        );
    }

    return (
        <>
            <div className="rounded-lg border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>
                                <button onClick={() => onSort?.("name")} className="inline-flex items-center gap-1 cursor-pointer">
                                    Name <ArrowUpDown className="h-3 w-3" />
                                </button>
                            </TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead className="text-right">Test Cases</TableHead>
                            <TableHead className="text-right">
                                <button onClick={() => onSort?.("updatedAt")} className="inline-flex items-center gap-1 cursor-pointer">
                                    Updated <ArrowUpDown className="h-3 w-3" />
                                </button>
                            </TableHead>
                            {(canEdit || canDelete) && (
                                <TableHead className="w-12" />
                            )}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {modules.map((mod) => (
                            <TableRow key={mod.id}>
                                <TableCell className="font-medium">{mod.name}</TableCell>
                                <TableCell className="max-w-xs truncate text-muted-foreground" title={mod.description || undefined}>
                                    {mod.description || "—"}
                                </TableCell>
                                <TableCell className="text-right">
                                    {mod._count?.testCases ?? 0}
                                </TableCell>
                                <TableCell className="text-right text-muted-foreground">
                                    {new Date(mod.updatedAt).toLocaleDateString()}
                                </TableCell>
                                {(canEdit || canDelete) && (
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                {canEdit && (
                                                    <DropdownMenuItem onClick={() => setEditModule(mod)}>
                                                        <Pencil className="mr-2 h-4 w-4" />
                                                        Edit
                                                    </DropdownMenuItem>
                                                )}
                                                {canDelete && (
                                                    <DropdownMenuItem
                                                        onClick={() => setDeleteTarget(mod)}
                                                        className="text-destructive focus:text-destructive"
                                                    >
                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                        Delete
                                                    </DropdownMenuItem>
                                                )}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                )}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {editModule && (
                <ModuleFormModal
                    open={!!editModule}
                    onOpenChange={(open) => !open && setEditModule(null)}
                    projectId={editModule.projectId}
                    module={editModule}
                />
            )}

            <DeleteModuleModal
                open={!!deleteTarget}
                onOpenChange={(open) => !open && setDeleteTarget(null)}
                module={deleteTarget}
            />
        </>
    );
}
