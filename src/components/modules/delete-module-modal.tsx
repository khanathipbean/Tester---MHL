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
import { useModules } from "@/hooks/use-modules";

interface DeleteModuleModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    module: { id: string; name: string } | null;
}

export function DeleteModuleModal({
    open,
    onOpenChange,
    module,
}: DeleteModuleModalProps) {
    const { deleteModule, isLoading } = useModules();

    const handleDelete = async () => {
        if (!module) return;
        try {
            await deleteModule(module.id);
            onOpenChange(false);
        } catch {
            // Error handled by hook toast
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Delete Module</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to delete &ldquo;{module?.name}&rdquo;? This
                        action cannot be undone and will remove all associated test cases.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={isLoading}
                    >
                        {isLoading ? "Deleting..." : "Delete"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
