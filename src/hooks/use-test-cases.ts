"use client";

import { useCallback, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface TestCase {
    id: string;
    projectId: string;
    suiteId: string | null;
    key: string;
    title: string;
    description: string | null;
    priority: string;
    type: string;
    status: string;
    automationStatus: string;
    createdAt: string;
    updatedAt: string;
    suite?: { id: string; name: string } | null;
    _count?: { steps: number; executions: number; defects: number };
}

interface PaginatedResult<T> {
    data: T[];
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

interface FetchOptions {
    page?: number;
    limit?: number;
    search?: string;
    suiteId?: string;
    status?: string;
    priority?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
}

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
    const res = await fetch(url, init);
    const json = await res.json();
    if (!res.ok) {
        throw new Error(json.message || "Something went wrong");
    }
    return json.data ?? json;
}

export function useTestCases() {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [isLoading, setIsLoading] = useState(false);

    const fetchTestCases = useCallback(
        async (options: FetchOptions = {}): Promise<PaginatedResult<TestCase>> => {
            const params = new URLSearchParams();
            if (options.page) params.set("page", String(options.page));
            if (options.limit) params.set("limit", String(options.limit));
            if (options.search) params.set("search", options.search);
            if (options.suiteId) params.set("suiteId", options.suiteId);
            if (options.status) params.set("status", options.status);
            if (options.priority) params.set("priority", options.priority);
            if (options.sortBy) params.set("sortBy", options.sortBy);
            if (options.sortOrder) params.set("sortOrder", options.sortOrder);

            return fetchJson(`/api/test-cases?${params.toString()}`);
        },
        [],
    );

    const createTestCase = useCallback(
        async (data: {
            projectId: string;
            suiteId?: string;
            title: string;
            description?: string;
            priority?: string;
            type?: string;
            status?: string;
        }) => {
            setIsLoading(true);
            try {
                const result = await fetchJson<TestCase>("/api/test-cases", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(data),
                });
                toast.success("Test case created successfully");
                startTransition(() => router.refresh());
                return result;
            } catch (err) {
                const message =
                    err instanceof Error ? err.message : "Failed to create test case";
                toast.error(message);
                throw err;
            } finally {
                setIsLoading(false);
            }
        },
        [router],
    );

    const updateTestCase = useCallback(
        async (
            id: string,
            data: {
                suiteId?: string | null;
                title?: string;
                description?: string | null;
                priority?: string;
                type?: string;
                status?: string;
            },
        ) => {
            setIsLoading(true);
            try {
                const result = await fetchJson<TestCase>(`/api/test-cases/${id}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(data),
                });
                toast.success("Test case updated successfully");
                startTransition(() => router.refresh());
                return result;
            } catch (err) {
                const message =
                    err instanceof Error ? err.message : "Failed to update test case";
                toast.error(message);
                throw err;
            } finally {
                setIsLoading(false);
            }
        },
        [router],
    );

    const deleteTestCase = useCallback(
        async (id: string) => {
            setIsLoading(true);
            try {
                await fetchJson(`/api/test-cases/${id}`, { method: "DELETE" });
                toast.success("Test case deleted successfully");
                startTransition(() => router.refresh());
            } catch (err) {
                const message =
                    err instanceof Error ? err.message : "Failed to delete test case";
                toast.error(message);
                throw err;
            } finally {
                setIsLoading(false);
            }
        },
        [router],
    );

    return {
        fetchTestCases,
        createTestCase,
        updateTestCase,
        deleteTestCase,
        isLoading: isLoading || isPending,
    };
}
