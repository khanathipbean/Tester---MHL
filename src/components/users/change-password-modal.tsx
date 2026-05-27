"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

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

interface ChangePasswordModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    user: { id: string; name: string | null; email: string };
}

export function ChangePasswordModal({ open, onOpenChange, user }: ChangePasswordModalProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const reset = () => {
        setPassword("");
        setConfirmPassword("");
    };

    const handleSubmit = async () => {
        if (!password || password.length < 6) {
            toast.error("Password must be at least 6 characters");
            return;
        }
        if (password !== confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        try {
            const res = await fetch(`/api/users/${user.id}/password`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ password }),
            });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || "Failed to change password");
            }
            toast.success("Password changed successfully");
            reset();
            onOpenChange(false);
            startTransition(() => router.refresh());
        } catch (e: unknown) {
            toast.error(e instanceof Error ? e.message : "Failed to change password");
        }
    };

    return (
        <Dialog open={open} onOpenChange={(v) => { if (!v) reset(); onOpenChange(v); }}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Change Password</DialogTitle>
                    <DialogDescription>
                        Set a new password for {user.name || user.email}
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-2">
                    <div className="space-y-2">
                        <Label htmlFor="new-password">New Password <span className="text-destructive">*</span></Label>
                        <Input
                            id="new-password"
                            type="password"
                            placeholder="At least 6 characters"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="confirm-password">Confirm Password <span className="text-destructive">*</span></Label>
                        <Input
                            id="confirm-password"
                            type="password"
                            placeholder="Re-enter password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => { reset(); onOpenChange(false); }}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={isPending}>
                        {isPending ? "Saving..." : "Save"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
