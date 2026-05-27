import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton";

export default function DashboardLoading() {
    return (
        <div className="mx-auto w-full max-w-7xl 2xl:max-w-[1800px] px-4 py-6 sm:px-6 lg:px-8 2xl:px-12">
            <div className="mb-6">
                <div className="h-7 w-32 animate-pulse rounded bg-muted" />
                <div className="mt-1 h-4 w-48 animate-pulse rounded bg-muted" />
            </div>
            <DashboardSkeleton />
        </div>
    );
}
