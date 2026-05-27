"use client";

import { useState, useTransition, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, X, Tag as TagIcon, Search } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";

interface Tag {
    id: string;
    name: string;
    color: string | null;
    projectId: string;
}

interface TagPickerProps {
    testCaseId: string;
    projectId: string;
    currentTags: { id: string; name: string; color: string | null }[];
    allTags: Tag[];
}

const TAG_COLORS = [
    "#ef4444", // red
    "#f97316", // orange
    "#eab308", // yellow
    "#22c55e", // green
    "#06b6d4", // cyan
    "#3b82f6", // blue
    "#8b5cf6", // violet
    "#ec4899", // pink
];

export function TagPicker({ testCaseId, projectId, currentTags, allTags }: TagPickerProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [open, setOpen] = useState(false);
    const [newTagName, setNewTagName] = useState("");
    const [selectedColor, setSelectedColor] = useState(TAG_COLORS[5]);
    const [tagSearch, setTagSearch] = useState("");

    const projectTags = allTags.filter((t) => t.projectId === projectId);
    const filteredProjectTags = useMemo(() => {
        if (!tagSearch) return projectTags;
        return projectTags.filter((t) => t.name.toLowerCase().includes(tagSearch.toLowerCase()));
    }, [projectTags, tagSearch]);
    const selectedIds = currentTags.map((t) => t.id);

    const handleToggleTag = async (tagId: string) => {
        const newIds = selectedIds.includes(tagId)
            ? selectedIds.filter((id) => id !== tagId)
            : [...selectedIds, tagId];

        const res = await fetch(`/api/test-cases/${testCaseId}/tags`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ tagIds: newIds }),
        });

        if (!res.ok) {
            toast.error("Failed to update tags");
            return;
        }

        startTransition(() => router.refresh());
    };

    const handleDeleteTag = async (tagId: string) => {
        const res = await fetch(`/api/tags/${tagId}`, { method: "DELETE" });
        if (!res.ok) {
            toast.error("Failed to delete tag");
            return;
        }
        toast.success("Tag deleted");
        startTransition(() => router.refresh());
    };

    const handleCreateTag = async () => {
        if (!newTagName.trim()) return;

        const res = await fetch("/api/tags", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ projectId, name: newTagName.trim(), color: selectedColor }),
        });

        if (!res.ok) {
            const json = await res.json();
            toast.error(json.error || "Failed to create tag");
            return;
        }

        const json = await res.json();
        const newTag = json.data;

        // Also assign it to the test case
        const newIds = [...selectedIds, newTag.id];
        await fetch(`/api/test-cases/${testCaseId}/tags`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ tagIds: newIds }),
        });

        setNewTagName("");
        startTransition(() => router.refresh());
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={(e) => e.stopPropagation()}
                >
                    <TagIcon className="h-3.5 w-3.5" />
                </Button>
            </PopoverTrigger>
            <PopoverContent
                className="w-64 p-3"
                align="start"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="space-y-3">
                    <p className="text-sm font-medium">Manage Tags</p>

                    {/* Search filter */}
                    {projectTags.length > 5 && (
                        <div className="relative">
                            <Search className="absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Search tags..."
                                className="h-7 pl-7 pr-7 text-sm"
                                value={tagSearch}
                                onChange={(e) => setTagSearch(e.target.value)}
                            />
                            {tagSearch && (
                                <button
                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                    onClick={() => setTagSearch("")}
                                >
                                    <X className="h-3.5 w-3.5" />
                                </button>
                            )}
                        </div>
                    )}

                    {filteredProjectTags.length > 0 && (
                        <div className="space-y-1.5 max-h-40 overflow-y-auto">
                            {filteredProjectTags.map((tag) => (
                                <div
                                    key={tag.id}
                                    className="flex items-center gap-2 rounded px-1 py-0.5 text-sm hover:bg-muted group"
                                >
                                    <label className="flex items-center gap-2 cursor-pointer flex-1 min-w-0">
                                        <Checkbox
                                            checked={selectedIds.includes(tag.id)}
                                            onCheckedChange={() => handleToggleTag(tag.id)}
                                        />
                                        <span
                                            className="h-3 w-3 rounded-full shrink-0"
                                            style={{ backgroundColor: tag.color || "#6b7280" }}
                                        />
                                        <span className="truncate">{tag.name}</span>
                                    </label>
                                    <button
                                        type="button"
                                        className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-destructive/10 hover:text-destructive transition-opacity shrink-0"
                                        onClick={() => handleDeleteTag(tag.id)}
                                        aria-label={`Delete tag ${tag.name}`}
                                    >
                                        <Trash2 className="h-3 w-3" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="border-t pt-2 space-y-2">
                        <p className="text-xs text-muted-foreground">Create new tag</p>
                        <Input
                            placeholder="Tag name..."
                            value={newTagName}
                            onChange={(e) => setNewTagName(e.target.value)}
                            className="h-7 text-sm"
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    e.preventDefault();
                                    handleCreateTag();
                                }
                            }}
                        />
                        <div className="flex items-center gap-1">
                            {TAG_COLORS.map((color) => (
                                <button
                                    key={color}
                                    type="button"
                                    className={`h-5 w-5 rounded-full border-2 transition-transform ${selectedColor === color ? "scale-125 border-foreground" : "border-transparent"
                                        }`}
                                    style={{ backgroundColor: color }}
                                    onClick={() => setSelectedColor(color)}
                                />
                            ))}
                        </div>
                        <Button
                            size="sm"
                            variant="outline"
                            className="w-full h-7 text-xs"
                            onClick={handleCreateTag}
                            disabled={!newTagName.trim()}
                        >
                            <Plus className="h-3 w-3 mr-1" />
                            Create & Add
                        </Button>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
}
