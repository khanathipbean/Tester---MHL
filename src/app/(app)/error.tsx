"use client";

import { Button } from "@/components/ui/button";

export default function DashboardError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <div className="mx-auto flex w-full max-w-7xl 2xl:max-w-[1800px] flex-col items-center justify-center px-4 py-20 2xl:px-12">
            <h2 className="text-lg font-semibold">Something went wrong</h2>
            <p className="mt-2 text-sm text-muted-foreground">
                {error.message || "Failed to load dashboard data."}
            </p>
            <Button variant="outline" className="mt-4" onClick={reset}>
                Try again
            </Button>
        </div>
    );
}
