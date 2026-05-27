"use client";

import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/layout/sidebar-context";

export function SidebarToggle() {
    const { collapsed, toggle } = useSidebar();

    return (
        <Button
            variant="ghost"
            size="icon"
            className="hidden md:inline-flex"
            onClick={toggle}
        >
            {collapsed ? (
                <PanelLeftOpen className="h-5 w-5" />
            ) : (
                <PanelLeftClose className="h-5 w-5" />
            )}
            <span className="sr-only">Toggle sidebar</span>
        </Button>
    );
}
