"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { KeyRound, Shield, Trash2 } from "lucide-react";

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
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { RoleUpdateModal } from "@/components/users/role-update-modal";
import { ChangePasswordModal } from "@/components/users/change-password-modal";

interface User {
    id: string;
    name: string | null;
    email: string;
    role: string;
    createdAt: string;
    updatedAt: string;
}

interface UserTableProps {
    users: User[];
}

const roleBadgeStyle: Record<string, string> = {
    ADMIN:
        "border-indigo-300 bg-indigo-50 text-indigo-700 dark:border-indigo-800 dark:bg-indigo-950 dark:text-indigo-300",
    QA: "border-blue-300 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-300",
    VIEWER:
        "border-gray-300 bg-gray-50 text-gray-700 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-300",
};

export function UserTable({ users }: UserTableProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [editUser, setEditUser] = useState<User | null>(null);
    const [passwordUser, setPasswordUser] = useState<User | null>(null);
    const [deleteUser, setDeleteUser] = useState<User | null>(null);

    const handleDelete = async (id: string) => {
        try {
            const res = await fetch(`/api/users/${id}`, { method: "DELETE" });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || "Failed to delete user");
            }
            toast.success("User deleted");
            setDeleteUser(null);
            startTransition(() => router.refresh());
        } catch (e: unknown) {
            toast.error(e instanceof Error ? e.message : "Failed to delete user");
        }
    };

    if (users.length === 0) {
        return (
            <div className="flex h-40 items-center justify-center rounded-lg border border-dashed">
                <p className="text-sm text-muted-foreground">No users found.</p>
            </div>
        );
    }

    return (
        <>
            <div className="overflow-x-auto rounded-lg border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead className="text-right">Joined</TableHead>
                            <TableHead className="w-12" />
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.map((user) => (
                            <TableRow key={user.id}>
                                <TableCell className="font-medium">
                                    {user.name || "—"}
                                </TableCell>
                                <TableCell className="text-muted-foreground">
                                    {user.email}
                                </TableCell>
                                <TableCell>
                                    <Badge
                                        variant="outline"
                                        className={roleBadgeStyle[user.role] || ""}
                                    >
                                        {user.role}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right text-muted-foreground">
                                    {new Date(user.createdAt).toLocaleDateString()}
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-1">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8"
                                            title="Change password"
                                            onClick={() => setPasswordUser(user)}
                                        >
                                            <KeyRound className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8"
                                            title="Change role"
                                            onClick={() => setEditUser(user)}
                                        >
                                            <Shield className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-destructive"
                                            title="Delete user"
                                            onClick={() => setDeleteUser(user)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {editUser && (
                <RoleUpdateModal
                    open={!!editUser}
                    onOpenChange={(open) => !open && setEditUser(null)}
                    user={editUser}
                />
            )}

            {passwordUser && (
                <ChangePasswordModal
                    open={!!passwordUser}
                    onOpenChange={(open) => !open && setPasswordUser(null)}
                    user={passwordUser}
                />
            )}

            {/* Delete Confirm Dialog */}
            <Dialog open={!!deleteUser} onOpenChange={(open) => !open && setDeleteUser(null)}>
                <DialogContent className="sm:max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Delete User</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete <strong>{deleteUser?.name || deleteUser?.email}</strong>? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button variant="outline" onClick={() => setDeleteUser(null)}>
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={() => deleteUser && handleDelete(deleteUser.id)}
                            disabled={isPending}
                        >
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
