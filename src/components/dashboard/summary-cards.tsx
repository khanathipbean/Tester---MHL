import {
    ClipboardCheck,
    CheckCircle2,
    XCircle,
    CircleDashed,
    Ban,
} from "lucide-react";

import { SummaryCard } from "@/components/dashboard/summary-card";

interface SummaryCardsProps {
    totalTestCases: number;
    passed: number;
    failed: number;
    notRun: number;
    blocked: number;
}

export function SummaryCards({
    totalTestCases,
    passed,
    failed,
    notRun,
    blocked,
}: SummaryCardsProps) {
    const pct = (v: number) => totalTestCases > 0 ? ((v / totalTestCases) * 100).toFixed(1) + "%" : "0%";

    return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <SummaryCard
                title="Total Test Cases"
                value={totalTestCases}
                icon={<ClipboardCheck className="h-4 w-4" />}
            />
            <SummaryCard
                title="Passed"
                value={passed}
                description={pct(passed)}
                variant="success"
                icon={<CheckCircle2 className="h-4 w-4" />}
            />
            <SummaryCard
                title="Failed"
                value={failed}
                description={pct(failed)}
                variant="destructive"
                icon={<XCircle className="h-4 w-4" />}
            />
            <SummaryCard
                title="Not Run"
                value={notRun}
                description={pct(notRun)}
                variant="muted"
                icon={<CircleDashed className="h-4 w-4" />}
            />
            <SummaryCard
                title="Blocked"
                value={blocked}
                description={pct(blocked)}
                variant="warning"
                icon={<Ban className="h-4 w-4" />}
            />
        </div>
    );
}
