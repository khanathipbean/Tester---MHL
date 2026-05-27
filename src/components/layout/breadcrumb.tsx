"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";
import { Fragment } from "react";

const ROUTE_LABELS: Record<string, string> = {
    "": "Overview",
    "projects": "Projects",
    "test-cases": "Test Cases",
    "test-runs": "Test Runs",
    "defects": "Defects",
    "users": "Users",
    "settings": "Settings",
    "modules": "Modules",
};

export function Breadcrumb() {
    const pathname = usePathname();

    if (pathname === "/") return null;

    const segments = pathname.split("/").filter(Boolean);

    const crumbs = segments.map((seg, idx) => {
        const href = "/" + segments.slice(0, idx + 1).join("/");
        const label = ROUTE_LABELS[seg] || decodeURIComponent(seg);
        const isLast = idx === segments.length - 1;
        return { href, label, isLast, isId: !ROUTE_LABELS[seg] && seg.length > 8 };
    });

    return (
        <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-sm">
            <Link
                href="/"
                className="flex items-center text-muted-foreground hover:text-foreground transition-colors"
            >
                <Home className="h-3.5 w-3.5" />
            </Link>
            {crumbs.map((crumb) => (
                <Fragment key={crumb.href}>
                    <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/60" />
                    {crumb.isLast ? (
                        <span className="font-medium text-foreground truncate max-w-[150px]">
                            {crumb.isId ? `#${crumb.label.slice(0, 8)}` : crumb.label}
                        </span>
                    ) : (
                        <Link
                            href={crumb.href}
                            className="text-muted-foreground hover:text-foreground transition-colors truncate max-w-[120px]"
                        >
                            {crumb.label}
                        </Link>
                    )}
                </Fragment>
            ))}
        </nav>
    );
}
