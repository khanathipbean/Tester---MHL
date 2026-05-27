"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useModules } from "@/hooks/use-modules";

const formSchema = z.object({
    name: z.string().min(1, "Name is required").max(200),
    description: z.string().max(1000).optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface ModuleFormModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    projectId: string;
    module?: {
        id: string;
        name: string;
        description: string | null;
    } | null;
}

export function ModuleFormModal({
    open,
    onOpenChange,
    projectId,
    module,
}: ModuleFormModalProps) {
    const { createModule, updateModule, isLoading } = useModules();
    const isEditing = !!module;

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: module?.name || "",
            description: module?.description || "",
        },
    });

    useEffect(() => {
        if (open) {
            reset({
                name: module?.name || "",
                description: module?.description || "",
            });
        }
    }, [open, module, reset]);

    const onSubmit = async (data: FormValues) => {
        try {
            if (isEditing && module) {
                await updateModule(module.id, data);
            } else {
                await createModule({ ...data, projectId });
            }
            reset();
            onOpenChange(false);
        } catch {
            // Error handled by hook toast
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{isEditing ? "Edit Module" : "Create Module"}</DialogTitle>
                    <DialogDescription>
                        {isEditing
                            ? "Update the module details."
                            : "Add a new module to organize test cases."}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Name <span className="text-destructive">*</span></Label>
                        <Input
                            id="name"
                            placeholder="e.g. Authentication"
                            {...register("name")}
                        />
                        {errors.name && (
                            <p className="text-xs text-destructive">{errors.name.message}</p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Input
                            id="description"
                            placeholder="Optional description"
                            {...register("description")}
                        />
                        {errors.description && (
                            <p className="text-xs text-destructive">
                                {errors.description.message}
                            </p>
                        )}
                    </div>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? "Saving..." : isEditing ? "Save Changes" : "Create"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
