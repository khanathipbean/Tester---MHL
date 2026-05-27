"use client";

import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

import { Button } from "@/components/ui/button";

export function LogoutButton() {
    return (
        <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Sign out"
            title="Sign out"
            onClick={() => signOut({ callbackUrl: "/login" })}
        >
            <LogOut aria-hidden="true" className="h-4 w-4" />
        </Button>
    );
}
