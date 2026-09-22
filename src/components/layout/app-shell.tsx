"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";
import { OfflineIndicator } from "@/components/pwa/offline-indicator";
import { RBACProvider, useRBAC } from "@/context/rbac-context";
import { SidebarProvider } from "@/context/sidebar-context";

function ShellContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isAuthenticated, isLoaded } = useRBAC();

  // If on login page, render full screen without app shell navigation
  if (pathname === "/login") {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* Desktop Collapsible / Autohide Sidebar */}
      <div className="hidden lg:flex shrink-0 h-full">
        <Sidebar isMobileDrawer={false} />
      </div>

      {/* Mobile Drawer (visible when toggled on mobile/tablet) */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          {/* Drawer */}
          <div className="relative z-10 w-80 max-w-[85vw] h-full shadow-2xl">
            <Sidebar
              isMobileDrawer={true}
              onCloseMobile={() => setIsMobileMenuOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Topbar onToggleMobileMenu={() => setIsMobileMenuOpen(true)} />
        <OfflineIndicator />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <RBACProvider>
      <SidebarProvider>
        <ShellContent>{children}</ShellContent>
      </SidebarProvider>
    </RBACProvider>
  );
}
