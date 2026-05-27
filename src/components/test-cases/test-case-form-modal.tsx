"use client";

import { useState, useEffect } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useTestCases } from "@/hooks/use-test-cases";

const formSchema = z.object({
    title: z.string().min(1, "Title is required").max(300),
    description: z.string().max(5000).optional(),
    suiteId: z.string().optional(),
    condition: z.string().max(2000).optional(),
    testSteps: z.string().max(5000).optional(),
    expectedResult: z.string().max(5000).optional(),
    priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]),
    type: z.enum(["FUNCTIONAL", "REGRESSION", "SMOKE", "INTEGRATION", "E2E"]),
    status: z.enum(["PASS", "FAIL", "NOT_RUN", "BLOCKED"]),
    notes: z.string().max(2000).optional(),
    clarificationRequired: z.boolean().optional(),
    inProgress: z.boolean().optional(),
    tested: z.boolean().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface Module {
    id: string;
    name: string;
    projectId?: string;
}

interface ProjectOption {
    id: string;
    name: string;
    key: string;
}

interface TestCaseFormModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    projectId: string;
    projects: ProjectOption[];
    modules: Module[];
    testCase?: {
        id: string;
        title: string;
        description: string | null;
        suiteId: string | null;
        condition: string | null;
        testSteps: string | null;
        expectedResult: string | null;
        priority: string;
        type: string;
        status: string;
        notes: string | null;
        clarificationRequired: boolean;
        inProgress: boolean;
        tested: boolean;
    } | null;
}

export function TestCaseFormModal({
    open,
    onOpenChange,
    projectId,
    projects,
    modules,
    testCase,
}: TestCaseFormModalProps) {
    const { createTestCase, updateTestCase, isLoading } = useTestCases();
    const isEditing = !!testCase;
    const [selectedProjectId, setSelectedProjectId] = useState(projectId);

    useEffect(() => {
        if (open) setSelectedProjectId(projectId);
    }, [open, projectId]);

    const filteredModules = modules.filter(
        (m) => !m.projectId || m.projectId === selectedProjectId
    );

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        watch,
        formState: { errors },
    } = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: testCase?.title || "",
            description: testCase?.description || "",
            suiteId: testCase?.suiteId || undefined,
            condition: testCase?.condition || "",
            testSteps: testCase?.testSteps || "",
            expectedResult: testCase?.expectedResult || "",
            priority: (testCase?.priority as FormValues["priority"]) || "MEDIUM",
            type: (testCase?.type as FormValues["type"]) || "FUNCTIONAL",
            status: (testCase?.status as FormValues["status"]) || "NOT_RUN",
            notes: testCase?.notes || "",
            clarificationRequired: testCase?.clarificationRequired || false,
            inProgress: testCase?.inProgress || false,
            tested: testCase?.tested || false,
        },
    });

    const onSubmit = async (data: FormValues) => {
        try {
            if (isEditing && testCase) {
                await updateTestCase(testCase.id, data);
            } else {
                await createTestCase({ ...data, projectId: selectedProjectId });
            }
            reset();
            onOpenChange(false);
        } catch {
            // Error handled by hook toast
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>
                        {isEditing ? "Edit Test Case" : "Create Test Case"}
                    </DialogTitle>
                    <DialogDescription>
                        {isEditing
                            ? "Update the test case details."
                            : "Add a new test case to the project."}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                    <div className="space-y-2">
                        <Label htmlFor="title">Title <span className="text-destructive">*</span></Label>
                        <Input
                            id="title"
                            placeholder="e.g. User can login with valid credentials"
                            {...register("title")}
                        />
                        {errors.title && (
                            <p className="text-xs text-destructive">{errors.title.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Input
                            id="description"
                            placeholder="Optional description"
                            {...register("description")}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="condition">Condition (if)</Label>
                        <Textarea
                            id="condition"
                            placeholder="Precondition / เงื่อนไข"
                            rows={2}
                            {...register("condition")}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="testSteps">Test Steps</Label>
                        <Textarea
                            id="testSteps"
                            placeholder="ขั้นตอนการทดสอบ"
                            rows={3}
                            {...register("testSteps")}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="expectedResult">Expected Result</Label>
                        <Textarea
                            id="expectedResult"
                            placeholder="ผลลัพธ์ที่คาดหวัง"
                            rows={2}
                            {...register("expectedResult")}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="notes">Notes</Label>
                        <Textarea
                            id="notes"
                            placeholder="หมายเหตุ"
                            rows={2}
                            {...register("notes")}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Project</Label>
                            <Select
                                value={selectedProjectId}
                                onValueChange={(v) => {
                                    setSelectedProjectId(v);
                                    setValue("suiteId", undefined);
                                }}
                                disabled={isEditing}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select project" />
                                </SelectTrigger>
                                <SelectContent>
                                    {projects.map((p) => (
                                        <SelectItem key={p.id} value={p.id}>
                                            {p.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Module</Label>
                            <Select
                                value={watch("suiteId") || "none"}
                                onValueChange={(v) =>
                                    setValue("suiteId", v === "none" ? undefined : v)
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select module" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">None</SelectItem>
                                    {filteredModules.map((mod) => (
                                        <SelectItem key={mod.id} value={mod.id}>
                                            {mod.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Priority</Label>
                            <Select
                                value={watch("priority")}
                                onValueChange={(v) =>
                                    setValue("priority", v as FormValues["priority"])
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="LOW">Low</SelectItem>
                                    <SelectItem value="MEDIUM">Medium</SelectItem>
                                    <SelectItem value="HIGH">High</SelectItem>
                                    <SelectItem value="CRITICAL">Critical</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Type</Label>
                            <Select
                                value={watch("type")}
                                onValueChange={(v) =>
                                    setValue("type", v as FormValues["type"])
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="FUNCTIONAL">Functional</SelectItem>
                                    <SelectItem value="REGRESSION">Regression</SelectItem>
                                    <SelectItem value="SMOKE">Smoke</SelectItem>
                                    <SelectItem value="INTEGRATION">Integration</SelectItem>
                                    <SelectItem value="E2E">E2E</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Status</Label>
                            <Select
                                value={watch("status")}
                                onValueChange={(v) =>
                                    setValue("status", v as FormValues["status"])
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="PASS">Pass</SelectItem>
                                    <SelectItem value="FAIL">Fail</SelectItem>
                                    <SelectItem value="NOT_RUN">Not Run</SelectItem>
                                    <SelectItem value="BLOCKED">Blocked</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-6 pt-2">
                        <label className="flex items-center gap-2 text-sm">
                            <Checkbox
                                checked={watch("clarificationRequired")}
                                onCheckedChange={(v) => setValue("clarificationRequired", !!v)}
                            />
                            Clarification Required
                        </label>
                        <label className="flex items-center gap-2 text-sm">
                            <Checkbox
                                checked={watch("inProgress")}
                                onCheckedChange={(v) => setValue("inProgress", !!v)}
                            />
                            In Progress
                        </label>
                        <label className="flex items-center gap-2 text-sm">
                            <Checkbox
                                checked={watch("tested")}
                                onCheckedChange={(v) => setValue("tested", !!v)}
                            />
                            Tested
                        </label>
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
