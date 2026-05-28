"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Sector } from "recharts";
import { useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export interface PriorityBreakdown {
    CRITICAL: number;
    HIGH: number;
    MEDIUM: number;
    LOW: number;
}

export type StatusPriorityMap = Record<string, PriorityBreakdown>;

interface StatusPieChartProps {
    passed: number;
    failed: number;
    notRun: number;
    blocked: number;
    activeStatus?: string;
    onStatusClick?: (status: string) => void;
    priorityBreakdown?: StatusPriorityMap;
}

const COLORS: Record<string, string> = {
    Passed: "#16a34a",
    Failed: "#dc2626",
    "Not Run": "#6b7280",
    Blocked: "#eab308",
};

const PRIORITY_COLORS: Record<string, string> = {
    CRITICAL: "#dc2626",
    HIGH: "#f97316",
    MEDIUM: "#eab308",
    LOW: "#6b7280",
};

function CustomTooltip({ active, payload, total, priorityBreakdown }: { active?: boolean; payload?: { name: string; value: number }[]; total: number; priorityBreakdown?: StatusPriorityMap }) {
    if (!active || !payload?.length) return null;
    const { name, value } = payload[0];
    const percent = total > 0 ? (value / total) * 100 : 0;
    const color = COLORS[name] || "#6b7280";
    const statusKey = STATUS_MAP[name];
    const breakdown = priorityBreakdown?.[statusKey];

    return (
        <div className="rounded-lg border bg-popover px-3 py-2.5 shadow-lg min-w-[160px]">
            <div className="flex items-center gap-2 mb-1">
                <span className="h-3 w-3 rounded-full" style={{ backgroundColor: color }} />
                <span className="text-xs font-semibold text-popover-foreground">{name}</span>
            </div>
            <div className="flex items-baseline gap-1.5 mb-2">
                <span className="text-lg font-bold" style={{ color }}>{value}</span>
                <span className="text-xs text-muted-foreground">cases ({percent.toFixed(1)}%)</span>
            </div>
            {breakdown && (
                <div className="border-t pt-1.5 space-y-0.5">
                    <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide mb-1">Priority</p>
                    {(["CRITICAL", "HIGH", "MEDIUM", "LOW"] as const).map((p) => {
                        const count = breakdown[p];
                        if (count === 0) return null;
                        return (
                            <div key={p} className="flex items-center justify-between gap-3 text-xs">
                                <div className="flex items-center gap-1.5">
                                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: PRIORITY_COLORS[p] }} />
                                    <span className="text-popover-foreground capitalize">{p.toLowerCase()}</span>
                                </div>
                                <span className="font-semibold text-popover-foreground">{count}</span>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function renderActiveShape(props: any) {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
    return (
        <g>
            <Sector
                cx={cx}
                cy={cy}
                innerRadius={innerRadius - 2}
                outerRadius={outerRadius + 6}
                startAngle={startAngle}
                endAngle={endAngle}
                fill={fill}
                opacity={0.9}
            />
            <Sector
                cx={cx}
                cy={cy}
                innerRadius={innerRadius - 2}
                outerRadius={outerRadius + 6}
                startAngle={startAngle}
                endAngle={endAngle}
                fill={fill}
                opacity={0.15}
            />
        </g>
    );
}

const STATUS_MAP: Record<string, string> = {
    "Passed": "PASS",
    "Failed": "FAIL",
    "Not Run": "NOT_RUN",
    "Blocked": "BLOCKED",
};

const STATUS_LABEL: Record<string, string> = {
    "PASS": "Passed",
    "FAIL": "Failed",
    "NOT_RUN": "Not Run",
    "BLOCKED": "Blocked",
};

export function StatusPieChart({ passed, failed, notRun, blocked, activeStatus, onStatusClick, priorityBreakdown }: StatusPieChartProps) {
    const [activeIndex, setActiveIndex] = useState<number | undefined>(undefined);
    const [expandedStatus, setExpandedStatus] = useState<string | null>(null);
    const [prevActiveStatus, setPrevActiveStatus] = useState(activeStatus);

    // Sync breakdown panel with external filter changes (during render, not in effect)
    if (activeStatus !== prevActiveStatus) {
        setPrevActiveStatus(activeStatus);
        if (activeStatus === "all") {
            setExpandedStatus(null);
        } else if (expandedStatus && activeStatus !== expandedStatus) {
            setExpandedStatus(activeStatus ?? null);
        }
    }

    const data = [
        { name: "Passed", value: passed },
        { name: "Failed", value: failed },
        { name: "Not Run", value: notRun },
        { name: "Blocked", value: blocked },
    ].filter((d) => d.value > 0);

    const total = passed + failed + notRun + blocked;

    if (total === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm font-medium">Test Case Status</CardTitle>
                </CardHeader>
                <CardContent className="flex h-[250px] items-center justify-center">
                    <p className="text-sm text-muted-foreground">No test case data</p>
                </CardContent>
            </Card>
        );
    }

    const handlePieClick = (_: unknown, index: number) => {
        const entry = data[index];
        const status = STATUS_MAP[entry.name] || "all";
        // Toggle expanded panel
        setExpandedStatus((prev) => (prev === status ? null : status));
        // Also trigger status filter
        if (onStatusClick) {
            onStatusClick(activeStatus === status ? "all" : status);
        }
    };

    // Show breakdown panel for either local click or external filter
    const displayStatus = expandedStatus || (activeStatus && activeStatus !== "all" ? activeStatus : null);
    const displayBreakdown = displayStatus && priorityBreakdown?.[displayStatus];
    const expandedLabel = displayStatus ? STATUS_LABEL[displayStatus] : "";
    const expandedColor = displayStatus ? COLORS[expandedLabel] : "";
    const expandedTotal = displayStatus ? (
        displayStatus === "PASS" ? passed :
            displayStatus === "FAIL" ? failed :
                displayStatus === "NOT_RUN" ? notRun :
                    blocked
    ) : 0;

    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Test Case Status</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="relative">
                    <ResponsiveContainer width="100%" height={280}>
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                innerRadius={65}
                                outerRadius={95}
                                paddingAngle={3}
                                dataKey="value"
                                strokeWidth={2}
                                stroke="hsl(var(--card))"
                                {...({ activeIndex, activeShape: renderActiveShape } as Record<string, unknown>)}
                                onMouseEnter={(_, index) => setActiveIndex(index)}
                                onMouseLeave={() => setActiveIndex(undefined)}
                                onClick={handlePieClick}
                                className="cursor-pointer"
                            >
                                {data.map((entry) => (
                                    <Cell key={entry.name} fill={COLORS[entry.name]} />
                                ))}
                            </Pie>
                            <Tooltip
                                content={<CustomTooltip total={total} priorityBreakdown={priorityBreakdown} />}
                                wrapperStyle={{ zIndex: 10 }}
                                position={{ x: 10, y: 10 }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                    {/* Center label */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="text-center">
                            <p className="text-2xl font-bold text-foreground">{total}</p>
                            <p className="text-xs text-muted-foreground">Total</p>
                        </div>
                    </div>
                </div>
                {/* Custom legend */}
                <div className="flex flex-wrap justify-center gap-x-4 gap-y-1.5 mt-2">
                    {data.map((entry) => {
                        const status = STATUS_MAP[entry.name];
                        const isActive = activeStatus === status;
                        return (
                            <button
                                key={entry.name}
                                type="button"
                                onClick={() => {
                                    setExpandedStatus((prev) => (prev === status ? null : status));
                                    onStatusClick?.(isActive ? "all" : status);
                                }}
                                className={`flex items-center gap-1.5 text-xs rounded-full px-2 py-0.5 transition-colors ${isActive ? "bg-muted ring-1 ring-border" : "hover:bg-muted/50"
                                    }`}
                            >
                                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: COLORS[entry.name] }} />
                                <span className="text-muted-foreground">{entry.name}</span>
                            </button>
                        );
                    })}
                </div>

                {/* Expanded priority breakdown panel */}
                {displayBreakdown && (
                    <div className="mt-4 rounded-lg border bg-muted/30 p-3 animate-in fade-in slide-in-from-top-2 duration-200">
                        <div className="flex items-center gap-2 mb-3">
                            <span className="h-3 w-3 rounded-full" style={{ backgroundColor: expandedColor }} />
                            <span className="text-sm font-semibold">{expandedLabel}</span>
                            <span className="text-sm text-muted-foreground">— {expandedTotal} cases ({total > 0 ? ((expandedTotal / total) * 100).toFixed(1) : 0}%)</span>
                            <button
                                type="button"
                                onClick={() => { setExpandedStatus(null); onStatusClick?.("all"); }}
                                className="ml-auto text-xs text-muted-foreground hover:text-foreground"
                            >
                                ✕
                            </button>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {(["CRITICAL", "HIGH", "MEDIUM", "LOW"] as const).map((p) => {
                                const count = displayBreakdown[p];
                                const pPercent = expandedTotal > 0 ? ((count / expandedTotal) * 100).toFixed(1) : "0";
                                return (
                                    <div key={p} className="rounded-md border bg-background p-2.5 text-center">
                                        <div className="flex items-center justify-center gap-1.5 mb-1">
                                            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: PRIORITY_COLORS[p] }} />
                                            <span className="text-[11px] font-medium capitalize text-muted-foreground">{p.toLowerCase()}</span>
                                        </div>
                                        <p className="text-lg font-bold">{count}</p>
                                        <p className="text-[10px] text-muted-foreground">{pPercent}%</p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
