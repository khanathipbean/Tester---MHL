"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { MoreHorizontal, Pencil, Trash2, X } from "lucide-react";
import { toast } from "sonner";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TestCaseFormModal } from "@/components/test-cases/test-case-form-modal";
import { DeleteTestCaseModal } from "@/components/test-cases/delete-test-case-modal";
import { TagPicker } from "@/components/test-cases/tag-picker";

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
    projectId?: string;
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

interface TestCaseTableProps {
    testCases: TestCase[];
    modules: Module[];
    projects: ProjectOption[];
    tags: Tag[];
    projectId: string;
    canEdit: boolean;
    canDelete: boolean;
}

const priorityVariant: Record<string, string> = {
    CRITICAL: "border-red-300 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300",
    HIGH: "border-orange-300 bg-orange-50 text-orange-700 dark:border-orange-800 dark:bg-orange-950 dark:text-orange-300",
    MEDIUM: "border-yellow-300 bg-yellow-50 text-yellow-700 dark:border-yellow-800 dark:bg-yellow-950 dark:text-yellow-300",
    LOW: "border-gray-300 bg-gray-50 text-gray-700 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-300",
};

const statusVariant: Record<string, string> = {
    DRAFT: "border-gray-300 bg-gray-50 text-gray-700 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-300",
    READY: "border-green-300 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950 dark:text-green-300",
    DEPRECATED: "border-red-300 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300",
    PASS: "border-green-300 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950 dark:text-green-300",
    FAIL: "border-red-300 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300",
    NOT_RUN: "border-gray-300 bg-gray-50 text-gray-700 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-300",
    BLOCKED: "border-yellow-300 bg-yellow-50 text-yellow-700 dark:border-yellow-800 dark:bg-yellow-950 dark:text-yellow-300",
};

export function TestCaseTable({
    testCases,
    modules,
    projects,
    tags,
    projectId,
    canEdit,
    canDelete,
}: TestCaseTableProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [editCase, setEditCase] = useState<TestCase | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<TestCase | null>(null);

    const handleRemoveTag = async (testCase: TestCase, tagIdToRemove: string) => {
        const newIds = (testCase.tags || []).filter((t) => t.id !== tagIdToRemove).map((t) => t.id);
        const res = await fetch(`/api/test-cases/${testCase.id}/tags`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ tagIds: newIds }),
        });
        if (!res.ok) {
            toast.error("Failed to remove tag");
            return;
        }
        startTransition(() => router.refresh());
    };

    if (testCases.length === 0) {
        return (
            <div className="flex h-40 items-center justify-center rounded-lg border border-dashed">
                <p className="text-sm text-muted-foreground">
                    No test cases found. Create one to get started.
                </p>
            </div>
        );
    }

    return (
        <>
            <div className="overflow-x-auto rounded-lg border">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted border-b-2">
                            <TableHead className="w-24 whitespace-nowrap font-semibold">Test ID</TableHead>
                            <TableHead className="w-auto whitespace-nowrap font-semibold">Module</TableHead>
                            <TableHead className="w-auto whitespace-nowrap font-semibold">Tags</TableHead>
                            <TableHead className="whitespace-nowrap font-semibold">Expected Result</TableHead>
                            <TableHead className="whitespace-nowrap text-center font-semibold">Priority</TableHead>
                            <TableHead className="whitespace-nowrap text-center font-semibold">Status</TableHead>
                            <TableHead className="whitespace-nowrap font-semibold">Notes</TableHead>
                            <TableHead className="whitespace-nowrap text-center font-semibold">Defects</TableHead>
                            {(canEdit || canDelete) && <TableHead className="w-12" />}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {testCases.map((tc) => (
                            <TableRow
                                key={tc.id}
                                className="cursor-pointer"
                                onClick={() => router.push(`/test-cases/${tc.id}`)}
                            >
                                <TableCell className="font-mono text-xs text-muted-foreground whitespace-nowrap">
                                    {tc.key}
                                </TableCell>
                                <TableCell className="text-muted-foreground whitespace-nowrap max-w-[120px] truncate">
                                    {tc.suite?.name || "—"}
                                </TableCell>
                                <TableCell onClick={(e) => e.stopPropagation()}>
                                    <div className="flex items-center gap-1.5 flex-wrap max-w-[180px]">
                                        {tc.tags && tc.tags.length > 0 && tc.tags.map((tag) => (
                                            <Badge
                                                key={tag.id}
                                                variant="outline"
                                                className="text-[11px] font-medium gap-0.5 pr-1 py-0.5 rounded-full"
                                                style={tag.color ? { borderColor: tag.color, backgroundColor: `${tag.color}18`, color: tag.color } : undefined}
                                            >
                                                <span
                                                    className="h-2 w-2 rounded-full shrink-0"
                                                    style={{ backgroundColor: tag.color || "#6b7280" }}
                                                />
                                                {tag.name}
                                                {canEdit && (
                                                    <button
                                                        type="button"
                                                        className="ml-0.5 rounded-full p-0.5 hover:bg-black/10 dark:hover:bg-white/20 transition-colors"
                                                        onClick={() => handleRemoveTag(tc, tag.id)}
                                                        aria-label={`Remove tag ${tag.name}`}
                                                    >
                                                        <X className="h-2.5 w-2.5" />
                                                    </button>
                                                )}
                                            </Badge>
                                        ))}
                                        {canEdit && (
                                            <TagPicker
                                                testCaseId={tc.id}
                                                projectId={tc.projectId}
                                                currentTags={tc.tags || []}
                                                allTags={tags}
                                            />
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell className="max-w-[200px] truncate" title={tc.expectedResult || undefined}>
                                    {tc.expectedResult || "—"}
                                </TableCell>
                                <TableCell className="text-center">
                                    <Badge variant="outline" className={priorityVariant[tc.priority] || ""}>
                                        {tc.priority}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-center">
                                    <Badge variant="outline" className={statusVariant[tc.status] || ""}>
                                        {tc.status}
                                    </Badge>
                                </TableCell>
                                <TableCell className="max-w-[150px] truncate text-muted-foreground" title={tc.notes || undefined}>
                                    {tc.notes || "—"}
                                </TableCell>
                                <TableCell className="text-center">
                                    {(tc._count?.defects ?? 0) > 0 ? (
                                        <Badge variant="outline" className="border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300">
                                            {tc._count!.defects}
                                        </Badge>
                                    ) : (
                                        <span className="text-muted-foreground">—</span>
                                    )}
                                </TableCell>
                                {(canEdit || canDelete) && (
                                    <TableCell onClick={(e) => e.stopPropagation()}>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                {canEdit && (
                                                    <DropdownMenuItem onClick={() => setEditCase(tc)}>
                                                        <Pencil className="mr-2 h-4 w-4" />
                                                        Edit
                                                    </DropdownMenuItem>
                                                )}
                                                {canDelete && (
                                                    <DropdownMenuItem
                                                        onClick={() => setDeleteTarget(tc)}
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

            {editCase && (
                <TestCaseFormModal
                    open={!!editCase}
                    onOpenChange={(open) => !open && setEditCase(null)}
                    projectId={projectId}
                    projects={projects}
                    modules={modules}
                    testCase={editCase}
                />
            )}

            <DeleteTestCaseModal
                open={!!deleteTarget}
                onOpenChange={(open) => !open && setDeleteTarget(null)}
                testCase={deleteTarget}
            />
        </>
    );
}
