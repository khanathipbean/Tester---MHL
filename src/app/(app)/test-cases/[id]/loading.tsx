export default function TestCaseDetailLoading() {
    return (
        <div className="mx-auto w-full max-w-5xl 2xl:max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8 2xl:px-12">
            <div className="space-y-6">
                {/* Back button */}
                <div className="h-9 w-24 animate-pulse rounded bg-muted" />

                {/* Header */}
                <div className="space-y-2">
                    <div className="h-7 w-48 animate-pulse rounded bg-muted" />
                    <div className="h-5 w-96 animate-pulse rounded bg-muted" />
                </div>

                {/* Badges row */}
                <div className="flex gap-2">
                    <div className="h-6 w-20 animate-pulse rounded-full bg-muted" />
                    <div className="h-6 w-20 animate-pulse rounded-full bg-muted" />
                    <div className="h-6 w-24 animate-pulse rounded-full bg-muted" />
                </div>

                {/* Content blocks */}
                <div className="space-y-4">
                    <div className="rounded-lg border p-4 space-y-3">
                        <div className="h-5 w-32 animate-pulse rounded bg-muted" />
                        <div className="h-4 w-full animate-pulse rounded bg-muted" />
                        <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
                    </div>
                    <div className="rounded-lg border p-4 space-y-3">
                        <div className="h-5 w-32 animate-pulse rounded bg-muted" />
                        <div className="h-4 w-full animate-pulse rounded bg-muted" />
                        <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
                    </div>
                </div>

                {/* Execution history table skeleton */}
                <div className="rounded-lg border p-4 space-y-3">
                    <div className="h-5 w-40 animate-pulse rounded bg-muted" />
                    <div className="space-y-2">
                        <div className="h-8 w-full animate-pulse rounded bg-muted" />
                        <div className="h-8 w-full animate-pulse rounded bg-muted" />
                        <div className="h-8 w-full animate-pulse rounded bg-muted" />
                    </div>
                </div>
            </div>
        </div>
    );
}
