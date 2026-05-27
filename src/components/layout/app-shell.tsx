"use client";

import { MobileSidebar } from "@/components/layout/mobile-sidebar";
import { Sidebar } from "@/components/layout/sidebar";
import { SidebarProvider, useSidebar } from "@/components/layout/sidebar-context";
import { SidebarToggle } from "@/components/layout/sidebar-toggle";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Breadcrumb } from "@/components/layout/breadcrumb";

export function AppShell({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SidebarProvider>
      <div className="min-h-screen bg-background">
        <Sidebar />
        <AppContent>{children}</AppContent>
      </div>
    </SidebarProvider>
  );
}

function AppContent({ children }: { children: React.ReactNode }) {
  const { collapsed } = useSidebar();

  return (
    <div
      className={`flex min-h-screen flex-col transition-[padding] duration-200 ${collapsed ? "md:pl-16" : "md:pl-64"
        }`}
    >
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-background/95 px-4 backdrop-blur sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <MobileSidebar />
          <SidebarToggle />
          <Breadcrumb />
        </div>
        <div className="flex items-center gap-1">
          <ThemeToggle />
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}
