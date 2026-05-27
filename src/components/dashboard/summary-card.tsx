import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface SummaryCardProps {
    title: string;
    value: string | number;
    description?: string;
    icon?: React.ReactNode;
    variant?: "default" | "success" | "destructive" | "warning" | "muted";
}

const variantStyles = {
    default: "text-foreground",
    success: "text-green-600 dark:text-green-400",
    destructive: "text-red-600 dark:text-red-400",
    warning: "text-yellow-600 dark:text-yellow-400",
    muted: "text-gray-600 dark:text-gray-400",
};

export function SummaryCard({
    title,
    value,
    description,
    icon,
    variant = "default",
}: SummaryCardProps) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                    {title}
                </CardTitle>
                {icon && (
                    <div className="text-muted-foreground">{icon}</div>
                )}
            </CardHeader>
            <CardContent>
                <div className={`text-2xl font-bold ${variantStyles[variant]}`}>
                    {value}{description && <span className="ml-2 text-lg font-semibold text-muted-foreground">({description})</span>}
                </div>
            </CardContent>
        </Card>
    );
}
