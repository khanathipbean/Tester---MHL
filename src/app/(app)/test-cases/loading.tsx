export default function TestCasesLoading() {
    return (
        <div className="mx-auto w-full max-w-7xl 2xl:max-w-[1800px] px-4 py-6 sm:px-6 lg:px-8 2xl:px-12">
            <div className="space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <div className="h-7 w-32 animate-pulse rounded bg-muted" />
                        <div className="mt-1 h-4 w-48 animate-pulse rounded bg-muted" />
                    </div>
                    <div className="h-9 w-36 animate-pulse rounded bg-muted" />
                </div>

                {/* Filters */}
                <div className="flex gap-2">
                    <div className="h-9 w-48 animate-pulse rounded bg-muted" />
                    <div className="h-9 w-32 animate-pulse rounded bg-muted" />
                    <div className="h-9 w-32 animate-pulse rounded bg-muted" />
                </div>

                {/* Table */}
                <div className="rounded-lg border">
                    <div className="h-10 w-full animate-pulse rounded-t-lg bg-muted" />
                    <div className="divide-y">
                        {Array.from({ length: 10 }).map((_, i) => (
                            <div key={i} className="flex items-center gap-4 p-3">
                                <div className="h-4 w-20 animate-pulse rounded bg-muted" />
                                <div className="h-4 w-24 animate-pulse rounded bg-muted" />
                                <div className="h-4 w-32 animate-pulse rounded bg-muted" />
                                <div className="h-4 w-40 animate-pulse rounded bg-muted flex-1" />
                                <div className="h-5 w-16 animate-pulse rounded-full bg-muted" />
                                <div className="h-5 w-16 animate-pulse rounded-full bg-muted" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
