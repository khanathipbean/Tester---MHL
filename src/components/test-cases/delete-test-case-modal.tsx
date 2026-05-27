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
import { useTestCases } from "@/hooks/use-test-cases";

interface DeleteTestCaseModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    testCase: { id: string; key: string; title: string } | null;
}

export function DeleteTestCaseModal({
    open,
    onOpenChange,
    testCase,
}: DeleteTestCaseModalProps) {
    const { deleteTestCase, isLoading } = useTestCases();

    const handleDelete = async () => {
        if (!testCase) return;
        try {
            await deleteTestCase(testCase.id);
            onOpenChange(false);
        } catch {
            // Error handled by hook toast
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Delete Test Case</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to delete &ldquo;{testCase?.key} —{" "}
                        {testCase?.title}&rdquo;? This action cannot be undone.
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
