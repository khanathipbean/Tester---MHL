"use client";

import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
    page: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    total?: number;
    pageSize?: number;
    onPageSizeChange?: (size: number) => void;
}

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

export function Pagination({
    page,
    totalPages,
    onPageChange,
    total,
    pageSize,
    onPageSizeChange,
}: PaginationProps) {
    if (totalPages <= 1 && !onPageSizeChange) return null;

    return (
        <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
                {total !== undefined && (
                    <p className="text-sm text-muted-foreground">{total} items</p>
                )}
                {onPageSizeChange && pageSize && (
                    <div className="flex items-center gap-1">
                        <span className="text-sm text-muted-foreground">Rows:</span>
                        <Select value={String(pageSize)} onValueChange={(v) => onPageSizeChange(Number(v))}>
                            <SelectTrigger className="h-8 w-[70px] text-xs">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {PAGE_SIZE_OPTIONS.map((size) => (
                                    <SelectItem key={size} value={String(size)}>
                                        {size}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                )}
            </div>
            {totalPages > 1 && (
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onPageChange(page - 1)}
                        disabled={page <= 1}
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm text-muted-foreground">
                        {page} / {totalPages}
                    </span>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onPageChange(page + 1)}
                        disabled={page >= totalPages}
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            )}
        </div>
    );
}
