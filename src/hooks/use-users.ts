"use client";

import { useCallback, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface User {
    id: string;
    name: string | null;
    email: string;
    role: string;
    createdAt: string;
    updatedAt: string;
}

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
    const res = await fetch(url, init);
    const json = await res.json();
    if (!res.ok) {
        throw new Error(json.message || "Something went wrong");
    }
    return json.data ?? json;
}

export function useUsers() {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [isLoading, setIsLoading] = useState(false);

    const updateRole = useCallback(
        async (userId: string, role: string) => {
            setIsLoading(true);
            try {
                const result = await fetchJson<User>(`/api/users/${userId}/role`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ role }),
                });
                toast.success("User role updated successfully");
                startTransition(() => router.refresh());
                return result;
            } catch (err) {
                const message =
                    err instanceof Error ? err.message : "Failed to update role";
                toast.error(message);
                throw err;
            } finally {
                setIsLoading(false);
            }
        },
        [router],
    );

    return {
        updateRole,
        isLoading: isLoading || isPending,
    };
}
