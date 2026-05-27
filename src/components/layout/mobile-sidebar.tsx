"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import {
    BarChart3,
    Bug,
    ClipboardCheck,
    FlaskConical,
    FolderKanban,
    Settings,
    Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";

const navigation = [
    { label: "Overview", href: "/", icon: BarChart3 },
    { label: "Projects", href: "/projects", icon: FolderKanban },
    { label: "Test Cases", href: "/test-cases", icon: ClipboardCheck },
    { label: "Test Runs", href: "/test-runs", icon: FlaskConical },
    { label: "Defects", href: "/defects", icon: Bug },
    { label: "Users", href: "/users", icon: Users },
    { label: "Settings", href: "/settings", icon: Settings },
];

export function MobileSidebar() {
    const [open, setOpen] = useState(false);
    const pathname = usePathname();

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Open menu</span>
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
                <SheetHeader className="h-14 border-b px-5 flex justify-center">
                    <SheetTitle className="text-sm font-semibold tracking-normal">
                        TCD
                    </SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col gap-1 px-3 py-4">
                    {navigation.map((item) => {
                        const Icon = item.icon;
                        const isActive =
                            item.href === "/"
                                ? pathname === "/"
                                : pathname.startsWith(item.href);
                        const className = isActive
                            ? "bg-accent text-accent-foreground"
                            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground";

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setOpen(false)}
                                className={`flex h-10 items-center gap-3 rounded-md px-3 text-sm font-medium transition-colors ${className}`}
                            >
                                <Icon aria-hidden="true" className="h-4 w-4" />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>
            </SheetContent>
        </Sheet>
    );
}
