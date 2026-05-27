import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function DashboardSkeleton() {
    return (
        <div className="space-y-6">
            {/* Summary cards skeleton */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                {Array.from({ length: 5 }).map((_, i) => (
                    <Card key={i}>
                        <CardHeader className="pb-2">
                            <Skeleton className="h-4 w-24" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-8 w-16" />
                            <Skeleton className="mt-2 h-3 w-32" />
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Charts skeleton */}
            <div className="grid gap-4 lg:grid-cols-2">
                <Card>
                    <CardHeader>
                        <Skeleton className="h-4 w-32" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-[250px] w-full" />
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <Skeleton className="h-4 w-40" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-[250px] w-full" />
                    </CardContent>
                </Card>
            </div>

            {/* Table skeleton */}
            <div className="space-y-2">
                <Skeleton className="h-4 w-40" />
                <div className="rounded-lg border">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="flex gap-4 border-b p-4 last:border-0">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-4 w-12" />
                            <Skeleton className="h-4 w-12" />
                            <Skeleton className="h-4 w-12" />
                            <Skeleton className="h-4 w-16" />
                            <Skeleton className="h-4 w-20" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
