"use client";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useUsers } from "@/hooks/use-users";
import { useState } from "react";

interface RoleUpdateModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    user: { id: string; name: string | null; email: string; role: string } | null;
}

export function RoleUpdateModal({
    open,
    onOpenChange,
    user,
}: RoleUpdateModalProps) {
    const { updateRole, isLoading } = useUsers();
    const [selectedRole, setSelectedRole] = useState(user?.role || "QA");

    const handleSubmit = async () => {
        if (!user) return;
        try {
            await updateRole(user.id, selectedRole);
            onOpenChange(false);
        } catch {
            // Error handled by hook toast
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Update Role</DialogTitle>
                    <DialogDescription>
                        Change role for {user?.name || user?.email}
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-2">
                    <div className="space-y-2">
                        <Label>Role</Label>
                        <Select
                            value={selectedRole}
                            onValueChange={setSelectedRole}
                        >
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
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={isLoading}>
                        {isLoading ? "Updating..." : "Update Role"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
