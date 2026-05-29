"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
    Plus,
    ChevronDown,
    ChevronRight,
    Pencil,
    Trash2,
    FolderPlus,
    Layers3,
    Loader2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";

interface ModuleData {
    id: string;
    name: string;
    description: string | null;
    testCaseCount: number;
    createdAt: string;
    updatedAt: string;
}

interface ProjectData {
    id: string;
    key: string;
    name: string;
    description: string | null;
    status: string;
    createdAt: string;
    updatedAt: string;
    testCaseCount: number;
    modules: ModuleData[];
}

interface ProjectsClientProps {
    projects: ProjectData[];
    canEdit: boolean;
    canDelete: boolean;
}

export function ProjectsClient({ projects, canEdit, canDelete }: ProjectsClientProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [submitting, setSubmitting] = useState(false);
    const busy = isPending || submitting;
    const [expanded, setExpanded] = useState<Record<string, boolean>>({});

    // Project form
    const [projectFormOpen, setProjectFormOpen] = useState(false);
    const [editProject, setEditProject] = useState<ProjectData | null>(null);
    const [projectName, setProjectName] = useState("");
    const [projectDescription, setProjectDescription] = useState("");

    // Module form
    const [moduleFormOpen, setModuleFormOpen] = useState(false);
    const [moduleProjectId, setModuleProjectId] = useState("");
    const [editModule, setEditModule] = useState<ModuleData | null>(null);
    const [moduleName, setModuleName] = useState("");
    const [moduleDescription, setModuleDescription] = useState("");

    // Delete
    const [deleteTarget, setDeleteTarget] = useState<{ type: "project" | "module"; id: string; name: string } | null>(null);

    const toggleExpand = (id: string) =>
        setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

    // Project CRUD
    const openCreateProject = () => {
        setEditProject(null);
        setProjectName("");
        setProjectDescription("");
        setProjectFormOpen(true);
    };

    const openEditProject = (p: ProjectData) => {
        setEditProject(p);
        setProjectName(p.name);
        setProjectDescription(p.description || "");
        setProjectFormOpen(true);
    };

    const handleProjectSubmit = async () => {
        if (!projectName.trim()) {
            toast.error("Project name is required");
            return;
        }
        setSubmitting(true);
        try {
            if (editProject) {
                const res = await fetch(`/api/projects/${editProject.id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ name: projectName, description: projectDescription }),
                });
                if (!res.ok) throw new Error((await res.json()).message);
                toast.success("Project updated");
            } else {
                const res = await fetch("/api/projects", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ name: projectName, description: projectDescription }),
                });
                if (!res.ok) throw new Error((await res.json()).message);
                toast.success("Project created");
            }
            setProjectFormOpen(false);
            startTransition(() => router.refresh());
        } catch (err: unknown) {
            toast.error(err instanceof Error ? err.message : "Failed");
        } finally {
            setSubmitting(false);
        }
    };

    // Module CRUD
    const openCreateModule = (projectId: string) => {
        setEditModule(null);
        setModuleProjectId(projectId);
        setModuleName("");
        setModuleDescription("");
        setModuleFormOpen(true);
    };

    const openEditModule = (projectId: string, mod: ModuleData) => {
        setEditModule(mod);
        setModuleProjectId(projectId);
        setModuleName(mod.name);
        setModuleDescription(mod.description || "");
        setModuleFormOpen(true);
    };

    const handleModuleSubmit = async () => {
        if (!moduleName.trim()) {
            toast.error("Module name is required");
            return;
        }
        setSubmitting(true);
        try {
            if (editModule) {
                const res = await fetch(`/api/modules/${editModule.id}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ name: moduleName, description: moduleDescription }),
                });
                if (!res.ok) throw new Error((await res.json()).message);
                toast.success("Module updated");
            } else {
                const res = await fetch("/api/modules", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ projectId: moduleProjectId, name: moduleName, description: moduleDescription }),
                });
                if (!res.ok) throw new Error((await res.json()).message);
                toast.success("Module created");
            }
            setModuleFormOpen(false);
            startTransition(() => router.refresh());
        } catch (err: unknown) {
            toast.error(err instanceof Error ? err.message : "Failed");
        } finally {
            setSubmitting(false);
        }
    };

    // Delete
    const handleDelete = async () => {
        if (!deleteTarget) return;
        setSubmitting(true);
        try {
            const url = deleteTarget.type === "project"
                ? `/api/projects/${deleteTarget.id}`
                : `/api/modules/${deleteTarget.id}`;
            const res = await fetch(url, { method: "DELETE" });
            if (!res.ok) throw new Error((await res.json()).message);
            toast.success(`${deleteTarget.type === "project" ? "Project" : "Module"} deleted`);
            setDeleteTarget(null);
            startTransition(() => router.refresh());
        } catch (err: unknown) {
            toast.error(err instanceof Error ? err.message : "Failed to delete");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">Projects</h1>
                    <p className="text-sm text-muted-foreground">
                        Manage projects and their modules
                    </p>
                </div>
                {canEdit && (
                    <Button size="sm" onClick={openCreateProject}>
                        <Plus className="h-4 w-4 sm:mr-2" />
                        <span className="hidden sm:inline">New Project</span>
                    </Button>
                )}
            </div>

            {projects.length === 0 ? (
                <div className="flex h-40 items-center justify-center rounded-lg border border-dashed">
                    <p className="text-sm text-muted-foreground">
                        No projects found. Create one to get started.
                    </p>
                </div>
            ) : (
                <div className="space-y-3">
                    {projects.map((project) => (
                        <div key={project.id} className="rounded-lg border">
                            {/* Project Header */}
                            <div
                                className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-muted/50"
                                onClick={() => toggleExpand(project.id)}
                            >
                                <div className="flex items-center gap-3">
                                    {expanded[project.id] ? (
                                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                    ) : (
                                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                    )}
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium">{project.name}</span>
                                            <Badge variant="outline" className="text-xs">
                                                {project.key}
                                            </Badge>
                                        </div>
                                        {project.description && (
                                            <p className="text-xs text-muted-foreground mt-0.5">
                                                {project.description}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
                                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                        <span>{project.modules.length} modules</span>
                                        <span>{project.testCaseCount} test cases</span>
                                    </div>
                                    {canEdit && (
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => openCreateModule(project.id)}>
                                                    <FolderPlus className="mr-2 h-4 w-4" />
                                                    Add Module
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => openEditProject(project)}>
                                                    <Pencil className="mr-2 h-4 w-4" />
                                                    Edit Project
                                                </DropdownMenuItem>
                                                {canDelete && (
                                                    <DropdownMenuItem
                                                        className="text-destructive"
                                                        onClick={() => setDeleteTarget({ type: "project", id: project.id, name: project.name })}
                                                    >
                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                        Delete Project
                                                    </DropdownMenuItem>
                                                )}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    )}
                                </div>
                            </div>

                            {/* Modules List */}
                            {expanded[project.id] && (
                                <div className="border-t">
                                    {project.modules.length === 0 ? (
                                        <div className="px-4 py-6 text-center">
                                            <p className="text-sm text-muted-foreground">
                                                No modules in this project
                                            </p>
                                            {canEdit && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="mt-2"
                                                    onClick={() => openCreateModule(project.id)}
                                                >
                                                    <FolderPlus className="mr-2 h-4 w-4" />
                                                    Add Module
                                                </Button>
                                            )}
                                        </div>
                                    ) : (
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead className="pl-10">Module Name</TableHead>
                                                    <TableHead>Description</TableHead>
                                                    <TableHead className="text-center">Test Cases</TableHead>
                                                    <TableHead className="text-right">Updated</TableHead>
                                                    {canEdit && <TableHead className="w-10" />}
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {project.modules.map((mod) => (
                                                    <TableRow key={mod.id}>
                                                        <TableCell className="pl-10">
                                                            <div className="flex items-center gap-2">
                                                                <Layers3 className="h-4 w-4 text-muted-foreground" />
                                                                <span className="font-medium">{mod.name}</span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="text-muted-foreground max-w-[200px] truncate">
                                                            {mod.description || "—"}
                                                        </TableCell>
                                                        <TableCell className="text-center">
                                                            <Badge variant="secondary">{mod.testCaseCount}</Badge>
                                                        </TableCell>
                                                        <TableCell className="text-right text-xs text-muted-foreground">
                                                            {new Date(mod.updatedAt).toLocaleDateString()}
                                                        </TableCell>
                                                        {canEdit && (
                                                            <TableCell>
                                                                <DropdownMenu>
                                                                    <DropdownMenuTrigger asChild>
                                                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                                            <MoreHorizontal className="h-4 w-4" />
                                                                        </Button>
                                                                    </DropdownMenuTrigger>
                                                                    <DropdownMenuContent align="end">
                                                                        <DropdownMenuItem onClick={() => openEditModule(project.id, mod)}>
                                                                            <Pencil className="mr-2 h-4 w-4" />
                                                                            Edit Module
                                                                        </DropdownMenuItem>
                                                                        {canDelete && (
                                                                            <DropdownMenuItem
                                                                                className="text-destructive"
                                                                                onClick={() => setDeleteTarget({ type: "module", id: mod.id, name: mod.name })}
                                                                            >
                                                                                <Trash2 className="mr-2 h-4 w-4" />
                                                                                Delete Module
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
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Project Form Dialog */}
            <Dialog open={projectFormOpen} onOpenChange={setProjectFormOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>{editProject ? "Edit Project" : "Create Project"}</DialogTitle>
                        <DialogDescription>
                            {editProject ? "Update project details." : "Create a new project to organize modules and test cases."}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="project-name">Name <span className="text-destructive">*</span></Label>
                            <Input
                                id="project-name"
                                placeholder="e.g. E-Commerce Platform"
                                value={projectName}
                                onChange={(e) => setProjectName(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="project-desc">Description</Label>
                            <Textarea
                                id="project-desc"
                                placeholder="Brief description of the project..."
                                value={projectDescription}
                                onChange={(e) => setProjectDescription(e.target.value)}
                                rows={3}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setProjectFormOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleProjectSubmit} disabled={busy}>
                            {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {busy ? "Saving..." : editProject ? "Update" : "Create"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Module Form Dialog */}
            <Dialog open={moduleFormOpen} onOpenChange={setModuleFormOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>{editModule ? "Edit Module" : "Add Module"}</DialogTitle>
                        <DialogDescription>
                            {editModule ? "Update module details." : "Add a new module to this project."}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="module-name">Name <span className="text-destructive">*</span></Label>
                            <Input
                                id="module-name"
                                placeholder="e.g. Authentication"
                                value={moduleName}
                                onChange={(e) => setModuleName(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="module-desc">Description</Label>
                            <Textarea
                                id="module-desc"
                                placeholder="Brief description of the module..."
                                value={moduleDescription}
                                onChange={(e) => setModuleDescription(e.target.value)}
                                rows={3}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setModuleFormOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleModuleSubmit} disabled={busy}>
                            {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {busy ? "Saving..." : editModule ? "Update" : "Add"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Delete {deleteTarget?.type === "project" ? "Project" : "Module"}</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete &quot;{deleteTarget?.name}&quot;?
                            {deleteTarget?.type === "project" && " This will delete all modules and test cases within this project."}
                            {" "}This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteTarget(null)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleDelete} disabled={busy}>
                            {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {busy ? "Deleting..." : "Delete"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
