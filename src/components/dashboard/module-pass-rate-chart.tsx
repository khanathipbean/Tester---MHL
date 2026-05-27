"use client";

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
} from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ModulePassRateChartProps {
    modules: {
        name: string;
        passRate: number;
        projectName?: string;
    }[];
}

function getPassRateColor(rate: number): string {
    if (rate >= 90) return "#16a34a";
    if (rate >= 70) return "#65a30d";
    if (rate >= 50) return "#eab308";
    if (rate >= 30) return "#f97316";
    return "#dc2626";
}

function getPassRateLabel(rate: number): string {
    if (rate >= 90) return "Excellent";
    if (rate >= 70) return "Good";
    if (rate >= 50) return "Fair";
    if (rate >= 30) return "Poor";
    return "Critical";
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number; payload?: { projectName?: string; name?: string } }[]; label?: string }) {
    if (!active || !payload?.length) return null;
    const value = payload[0].value;
    const projectName = payload[0].payload?.projectName;
    const fullName = payload[0].payload?.name || label;
    const color = getPassRateColor(value);
    const status = getPassRateLabel(value);

    return (
        <div className="rounded-lg border bg-popover px-3 py-2.5 shadow-lg">
            {projectName && (
                <p className="text-[10px] text-muted-foreground mb-0.5">{projectName}</p>
            )}
            <p className="text-xs font-semibold text-popover-foreground mb-1.5">{fullName}</p>
            <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full" style={{ backgroundColor: color }} />
                <span className="text-sm font-bold" style={{ color }}>{value}%</span>
                <span className="text-xs text-muted-foreground">— {status}</span>
            </div>
            <div className="mt-1.5 h-1.5 w-full rounded-full bg-muted overflow-hidden">
                <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${value}%`, backgroundColor: color }}
                />
            </div>
        </div>
    );
}

function getAbbreviation(name: string): string {
    // Extract uppercase letters from camelCase/PascalCase or first letters of words
    const upperLetters = name.match(/[A-Z]/g);
    if (upperLetters && upperLetters.length >= 2) {
        return upperLetters.join("");
    }
    // Fallback: first letter of each word
    const words = name.split(/[\s_-]+/);
    if (words.length >= 2) {
        return words.map((w) => w[0]?.toUpperCase() || "").join("");
    }
    // Single word: take first 3 chars
    return name.slice(0, 3).toUpperCase();
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomXAxisTick({ x, y, payload, data }: any) {
    const entry = data?.find((d: { name: string }) => d.name === payload?.value);
    const abbr = entry?.abbr || payload?.value;
    const fullName = payload?.value || "";

    return (
        <g transform={`translate(${x},${y})`}>
            <title>{fullName}</title>
            <text
                x={0}
                y={0}
                dy={12}
                textAnchor="middle"
                fontSize={11}
                className="fill-muted-foreground"
            >
                {abbr}
            </text>
        </g>
    );
}

export function ModulePassRateChart({ modules }: ModulePassRateChartProps) {
    const data = modules.map((m) => ({
        ...m,
        passRate: +m.passRate.toFixed(1),
        abbr: getAbbreviation(m.name),
    }));

    if (modules.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm font-medium">
                        Pass Rate by Module
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex h-[250px] items-center justify-center">
                    <p className="text-sm text-muted-foreground">No module data</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium">
                        Pass Rate by Module
                    </CardTitle>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: "#16a34a" }} />≥90%</span>
                        <span className="flex items-center gap-1"><span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: "#65a30d" }} />≥70%</span>
                        <span className="flex items-center gap-1"><span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: "#eab308" }} />≥50%</span>
                        <span className="flex items-center gap-1"><span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: "#f97316" }} />≥30%</span>
                        <span className="flex items-center gap-1"><span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: "#dc2626" }} />&lt;30%</span>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={data} margin={{ top: 20, right: 20, bottom: 5, left: 0 }} barCategoryGap="20%">
                        <defs>
                            {data.map((entry, index) => {
                                const color = getPassRateColor(entry.passRate);
                                return (
                                    <linearGradient key={index} id={`barGrad-${index}`} x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor={color} stopOpacity={1} />
                                        <stop offset="100%" stopColor={color} stopOpacity={0.6} />
                                    </linearGradient>
                                );
                            })}
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border/40" />
                        <XAxis
                            dataKey="name"
                            fontSize={11}
                            tickLine={false}
                            axisLine={false}
                            interval={0}
                            tick={<CustomXAxisTick data={data} />}
                        />
                        <YAxis
                            fontSize={11}
                            tickLine={false}
                            axisLine={false}
                            domain={[0, 100]}
                            tickFormatter={(v) => `${v}%`}
                            className="fill-muted-foreground"
                        />
                        <Tooltip
                            content={<CustomTooltip />}
                            cursor={{ fill: "hsl(var(--muted))", opacity: 0.3, radius: 4 }}
                        />
                        <Bar
                            dataKey="passRate"
                            name="Pass Rate"
                            radius={[8, 8, 0, 0]}
                            maxBarSize={52}
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            label={((props: any) => {
                                const x = Number(props.x) || 0;
                                const y = Number(props.y) || 0;
                                const width = Number(props.width) || 0;
                                const value = Number(props.value) || 0;
                                return (
                                    <text
                                        x={x + width / 2}
                                        y={y - 6}
                                        textAnchor="middle"
                                        fontSize={10}
                                        fontWeight={700}
                                        fill={getPassRateColor(value)}
                                    >
                                        {value}%
                                    </text>
                                );
                            })}
                        >
                            {data.map((_, index) => (
                                <Cell key={index} fill={`url(#barGrad-${index})`} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}
