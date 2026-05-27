"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  BarChart3,
  Bug,
  ClipboardCheck,
  FlaskConical,
  FolderKanban,
  LogOut,
  Settings,
  ShieldCheck,
  Users,
} from "lucide-react";
import { useSidebar } from "@/components/layout/sidebar-context";

const navigation = [
  { label: "Overview", href: "/", icon: BarChart3 },
  { label: "Projects", href: "/projects", icon: FolderKanban },
  { label: "Test Cases", href: "/test-cases", icon: ClipboardCheck },
  { label: "Test Runs", href: "/test-runs", icon: FlaskConical },
  { label: "Defects", href: "/defects", icon: Bug },
  { label: "Users", href: "/users", icon: Users },
  { label: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { collapsed } = useSidebar();
  const { data: session } = useSession();
  const userName = session?.user?.name || session?.user?.email || "User";

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 hidden border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-[width] duration-200 md:flex md:flex-col ${collapsed ? "w-16" : "w-64"
        }`}
    >
      <div className="flex h-14 items-center border-b border-sidebar-border px-5">
        <Link href="/" className="flex items-center gap-2 text-sm font-semibold tracking-normal">
          <ShieldCheck className="h-5 w-5 shrink-0" />
          {!collapsed && "TESTER"}
        </Link>
      </div>
      <nav className="flex flex-1 flex-col gap-1 px-2 py-4">
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          const baseClass = isActive
            ? "bg-sidebar-accent text-sidebar-accent-foreground"
            : "text-sidebar-foreground/75 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground";

          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={`flex h-10 items-center gap-3 rounded-md text-sm font-medium transition-colors ${baseClass} ${collapsed ? "justify-center px-0" : "px-3"
                }`}
            >
              <Icon aria-hidden="true" className="h-4 w-4 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-sidebar-border px-2 py-3">
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          title={collapsed ? "Sign out" : undefined}
          className={`flex w-full items-center gap-3 rounded-md text-sm font-medium text-sidebar-foreground/75 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground ${collapsed ? "justify-center px-0 h-10" : "px-3 py-2"
            } cursor-pointer`}
        >
          <LogOut aria-hidden="true" className="h-4 w-4 shrink-0" />
          {!collapsed && (
            <span className="flex flex-col items-start overflow-hidden">
              <span className="truncate text-xs text-sidebar-foreground/50">{userName}</span>
              <span>Logout</span>
            </span>
          )}
        </button>
      </div>
    </aside>
  );
}
