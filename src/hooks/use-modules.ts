"use client";

import { useCallback, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface Module {
    id: string;
    projectId: string;
    name: string;
    description: string | null;
    parentId: string | null;
    createdAt: string;
    updatedAt: string;
    _count?: { testCases: number; children: number };
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

interface UseModulesOptions {
    page?: number;
    limit?: number;
    search?: string;
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

export function useModules() {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [isLoading, setIsLoading] = useState(false);

    const fetchModules = useCallback(
        async (options: UseModulesOptions = {}): Promise<PaginatedResult<Module>> => {
            const params = new URLSearchParams();
            if (options.page) params.set("page", String(options.page));
            if (options.limit) params.set("limit", String(options.limit));
            if (options.search) params.set("search", options.search);
            if (options.sortBy) params.set("sortBy", options.sortBy);
            if (options.sortOrder) params.set("sortOrder", options.sortOrder);

            return fetchJson(`/api/modules?${params.toString()}`);
        },
        [],
    );

    const createModule = useCallback(
        async (data: { projectId: string; name: string; description?: string }) => {
            setIsLoading(true);
            try {
                const result = await fetchJson<Module>("/api/modules", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(data),
                });
                toast.success("Module created successfully");
                startTransition(() => router.refresh());
                return result;
            } catch (err) {
                const message = err instanceof Error ? err.message : "Failed to create module";
                toast.error(message);
                throw err;
            } finally {
                setIsLoading(false);
            }
        },
        [router],
    );

    const updateModule = useCallback(
        async (id: string, data: { name?: string; description?: string | null }) => {
            setIsLoading(true);
            try {
                const result = await fetchJson<Module>(`/api/modules/${id}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(data),
                });
                toast.success("Module updated successfully");
                startTransition(() => router.refresh());
                return result;
            } catch (err) {
                const message = err instanceof Error ? err.message : "Failed to update module";
                toast.error(message);
                throw err;
            } finally {
                setIsLoading(false);
            }
        },
        [router],
    );

    const deleteModule = useCallback(
        async (id: string) => {
            setIsLoading(true);
            try {
                await fetchJson(`/api/modules/${id}`, { method: "DELETE" });
                toast.success("Module deleted successfully");
                startTransition(() => router.refresh());
            } catch (err) {
                const message = err instanceof Error ? err.message : "Failed to delete module";
                toast.error(message);
                throw err;
            } finally {
                setIsLoading(false);
            }
        },
        [router],
    );

    return {
        fetchModules,
        createModule,
        updateModule,
        deleteModule,
        isLoading: isLoading || isPending,
    };
}
