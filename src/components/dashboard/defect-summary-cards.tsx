import { Bug, AlertCircle, CheckCircle2, XCircle } from "lucide-react";
import { SummaryCard } from "@/components/dashboard/summary-card";

interface DefectSummaryCardsProps {
    defects: {
        open: number;
        inProgress: number;
        resolved: number;
        closed: number;
        total: number;
    };
}

export function DefectSummaryCards({ defects }: DefectSummaryCardsProps) {
    return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <SummaryCard
                title="Total Defects"
                value={defects.total}
                icon={<Bug className="h-4 w-4" />}
            />
            <SummaryCard
                title="Open"
                value={defects.open}
                variant="destructive"
                icon={<AlertCircle className="h-4 w-4" />}
            />
            <SummaryCard
                title="In Progress"
                value={defects.inProgress}
                icon={<XCircle className="h-4 w-4" />}
            />
            <SummaryCard
                title="Resolved / Closed"
                value={defects.resolved + defects.closed}
                variant="success"
                icon={<CheckCircle2 className="h-4 w-4" />}
            />
        </div>
    );
}
