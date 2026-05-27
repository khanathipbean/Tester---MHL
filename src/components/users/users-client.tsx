"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Search, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { UserTable } from "@/components/users/user-table";
import { Pagination } from "@/components/ui/pagination";
import { useDebouncedValue } from "@/hooks/use-debounce";

interface User {
    id: string;
    name: string | null;
    email: string;
    role: string;
    createdAt: string;
    updatedAt: string;
}

interface UsersClientProps {
    users: User[];
}

const PAGE_SIZE = 10;

export function UsersClient({ users }: UsersClientProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const { value: searchValue, setValue: setSearch } = useDebouncedValue("", 300);
    const [page, setPage] = useState(1);
    const [roleFilter, setRoleFilter] = useState("all");

    // Create user form state
    const [formOpen, setFormOpen] = useState(false);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("QA");

    const filtered = useMemo(() => {
        let result = users;
        if (searchValue) {
            const q = searchValue.toLowerCase();
            result = result.filter(
                (u) =>
                    u.name?.toLowerCase().includes(q) ||
                    u.email.toLowerCase().includes(q),
            );
        }
        if (roleFilter !== "all") {
            result = result.filter((u) => u.role === roleFilter);
        }
        return result;
    }, [users, searchValue, roleFilter]);

    const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
    const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    const resetForm = () => {
        setName("");
        setEmail("");
        setPassword("");
        setRole("QA");
    };

    const handleCreate = async () => {
        if (!name.trim()) { toast.error("Name is required"); return; }
        if (!email.trim()) { toast.error("Email is required"); return; }
        if (!password.trim() || password.length < 6) { toast.error("Password must be at least 6 characters"); return; }

        try {
            const res = await fetch("/api/users", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: name.trim(), email: email.trim(), password, role }),
            });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || "Failed to create user");
            }
            toast.success("User created successfully");
            setFormOpen(false);
            resetForm();
            startTransition(() => router.refresh());
        } catch (e: unknown) {
            toast.error(e instanceof Error ? e.message : "Failed to create user");
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">Users</h1>
                    <p className="text-sm text-muted-foreground">
                        Manage user roles and permissions
                    </p>
                </div>
                <Button size="sm" onClick={() => setFormOpen(true)}>
                    <Plus className="mr-1 h-4 w-4" />
                    Add User
                </Button>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between mb-4">
                <div className="flex items-end gap-2">
                    <div>
                        <div className="relative w-full sm:w-[280px]">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Search users..."
                                className="pl-9"
                                value={searchValue}
                                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                            />
                        </div>
                    </div>
                    <div>
                        <label className="mb-1 block text-xs font-medium text-muted-foreground">Role</label>
                        <Select value={roleFilter} onValueChange={(v) => { setRoleFilter(v); setPage(1); }}>
                            <SelectTrigger className="w-[120px]">
                                <SelectValue placeholder="All" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All</SelectItem>
                                <SelectItem value="ADMIN">Admin</SelectItem>
                                <SelectItem value="QA">QA</SelectItem>
                                <SelectItem value="DEV">Dev</SelectItem>
                                <SelectItem value="VIEWER">Viewer</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    {(searchValue || roleFilter !== "all") && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-9 px-2 text-muted-foreground"
                            onClick={() => { setSearch(""); setRoleFilter("all"); setPage(1); }}
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

            <UserTable users={paginated} />

            <Pagination
                page={page}
                totalPages={totalPages}
                onPageChange={setPage}
                total={filtered.length}
            />

            {/* Create User Dialog */}
            <Dialog open={formOpen} onOpenChange={(open) => { if (!open) resetForm(); setFormOpen(open); }}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Add User</DialogTitle>
                        <DialogDescription>
                            Create a new user account.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div className="space-y-2">
                            <Label htmlFor="user-name">Name <span className="text-destructive">*</span></Label>
                            <Input
                                id="user-name"
                                placeholder="Full name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="user-email">Email <span className="text-destructive">*</span></Label>
                            <Input
                                id="user-email"
                                type="email"
                                placeholder="email@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="user-password">Password <span className="text-destructive">*</span></Label>
                            <Input
                                id="user-password"
                                type="password"
                                placeholder="At least 6 characters"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="user-role">Role</Label>
                            <Select value={role} onValueChange={setRole}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ADMIN">Admin</SelectItem>
                                    <SelectItem value="QA">QA</SelectItem>
                                    <SelectItem value="VIEWER">Viewer</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => { resetForm(); setFormOpen(false); }}>
                            Cancel
                        </Button>
                        <Button onClick={handleCreate} disabled={isPending}>
                            {isPending ? "Creating..." : "Create"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
