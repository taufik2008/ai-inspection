"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ScanEye,
  CalendarDays,
  FileSpreadsheet,
  Share2,
  GraduationCap,
  FolderArchive,
  Terminal,
  ShieldCheck,
  Building2,
  UserCheck,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  X,
  LogOut,
  Smartphone,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useRBAC } from "@/context/rbac-context";
import { useSidebar } from "@/context/sidebar-context";

interface SidebarProps {
  onCloseMobile?: () => void;
  isMobileDrawer?: boolean;
}

const agentNavigation = [
  {
    name: "Control Tower",
    href: "/",
    icon: LayoutDashboard,
    badge: "Manager",
  },
  {
    name: "Agent 1: Quality & Photos",
    href: "/agents/quality",
    icon: ScanEye,
    badge: "AI Vision",
  },
  {
    name: "Agent 2: Scheduling & Fleet",
    href: "/agents/scheduling",
    icon: CalendarDays,
    badge: "H-1 Bot",
  },
  {
    name: "Agent 3: RFQ & Pricing Engine",
    href: "/agents/rfq",
    icon: FileSpreadsheet,
    badge: "Pricing",
  },
  {
    name: "Agent 4: Marketing Studio",
    href: "/agents/marketing",
    icon: Share2,
    badge: "LinkedIn",
  },
  {
    name: "Agent 5: Training Academy",
    href: "/agents/training",
    icon: GraduationCap,
    badge: "Anti-Skip",
  },
  {
    name: "Agent 6: Ingestion & Report",
    href: "/agents/reports",
    icon: FolderArchive,
    badge: "ISO/AQL",
  },
  {
    name: "WhatsApp Gateway Hub",
    href: "/agents/whatsapp-gateway",
    icon: Smartphone,
    badge: "Gateway",
  },
  {
    name: "Testing Sandbox Simulator",
    href: "/sandbox",
    icon: Terminal,
    badge: "Live Test",
  },
];

const managementNavigation = [
  {
    name: "Client Accounts",
    href: "/management/clients",
    icon: Building2,
    badge: "CRUD",
  },
  {
    name: "Inspectors & Staff",
    href: "/management/inspectors",
    icon: UserCheck,
    badge: "RBAC",
  },
  {
    name: "Inspection Orders",
    href: "/management/jobs",
    icon: Briefcase,
    badge: "Jobs",
  },
];

export function Sidebar({ onCloseMobile, isMobileDrawer = false }: SidebarProps) {
  const pathname = usePathname();
  const { currentUser, logout } = useRBAC();
  const {
    isCollapsed,
    isAutohide,
    isHovered,
    toggleCollapse,
    toggleAutohide,
    setIsHovered,
  } = useSidebar();

  const isCompact = !isMobileDrawer && isCollapsed && !isHovered;

  return (
    <aside
      onMouseEnter={() => !isMobileDrawer && setIsHovered(true)}
      onMouseLeave={() => !isMobileDrawer && setIsHovered(false)}
      className={cn(
        "bg-gradient-to-b from-blue-950 via-slate-900 to-indigo-950 text-slate-100 flex flex-col h-full border-r border-blue-900/50 transition-all duration-300 ease-in-out select-none shadow-2xl",
        isMobileDrawer
          ? "w-80"
          : isCompact
          ? "w-20"
          : "w-80"
      )}
    >
      {/* Brand Header */}
      <div
        className={cn(
          "p-4 border-b border-blue-900/50 bg-blue-950/60 flex items-center justify-between transition-all shrink-0",
          isCompact ? "justify-center px-2" : "px-5"
        )}
      >
        <Link
          href="/"
          onClick={onCloseMobile}
          className="flex items-center gap-3 overflow-hidden group"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/40 shrink-0 group-hover:scale-105 transition-transform">
            <ShieldCheck className="w-6 h-6" />
          </div>
          {!isCompact && (
            <div className="min-w-0 transition-opacity duration-200">
              <div className="font-bold text-base tracking-tight flex items-center gap-1.5 text-white">
                InspectAI OS
                <span className="text-[10px] bg-blue-500/30 text-blue-200 px-1.5 py-0.5 rounded border border-blue-400/40 font-semibold">
                  v1.0
                </span>
              </div>
              <div className="text-xs text-blue-300/80 truncate">Multi-Agent Quality Ops</div>
            </div>
          )}
        </Link>

        {/* Mobile close button */}
        {isMobileDrawer && onCloseMobile && (
          <button
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 rounded-lg text-blue-200 hover:text-white hover:bg-blue-900/50 transition-colors"
            title="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Desktop Collapse / Pin Button */}
        {!isMobileDrawer && !isCompact && (
          <button
            onClick={toggleCollapse}
            className="hidden lg:flex p-1.5 rounded-lg text-blue-300 hover:text-white hover:bg-blue-900/60 transition-colors"
            title={isCollapsed ? "Expand sidebar" : "Collapse / Autohide sidebar"}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-3 space-y-4 overflow-y-auto overflow-x-hidden">
        {/* Agents Section */}
        <div>
          {!isCompact ? (
            <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-blue-300/90">
              6 AI Agents &amp; Workflows
            </div>
          ) : (
            <div className="w-full h-px bg-blue-900/50 my-2" />
          )}

          <div className="space-y-1">
            {agentNavigation.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={onCloseMobile}
                  title={isCompact ? item.name : undefined}
                  className={cn(
                    "flex items-center rounded-xl text-xs sm:text-sm font-medium transition-all group relative",
                    isCompact
                      ? "justify-center p-3"
                      : "justify-between px-3.5 py-2.5 gap-2",
                    isActive
                      ? "bg-blue-600 text-white shadow-md shadow-blue-500/30 font-semibold"
                      : "text-blue-100/90 hover:bg-blue-900/50 hover:text-white"
                  )}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <Icon
                      className={cn(
                        "w-4 h-4 shrink-0 transition-colors",
                        isActive ? "text-white" : "text-blue-300 group-hover:text-white"
                      )}
                    />
                    {!isCompact && (
                      <span className="leading-snug break-words whitespace-normal text-xs sm:text-[13px]">
                        {item.name}
                      </span>
                    )}
                  </div>

                  {!isCompact && (
                    <span
                      className={cn(
                        "text-[9px] px-2 py-0.5 rounded-md font-bold tracking-wide uppercase shrink-0 transition-colors",
                        isActive
                          ? "bg-white/20 text-white"
                          : "bg-blue-900/70 text-blue-200 border border-blue-800/60 group-hover:bg-blue-800 group-hover:text-white"
                      )}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Management CRUD Section */}
        <div>
          {!isCompact ? (
            <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-blue-300/90">
              Data Management (CRUD)
            </div>
          ) : (
            <div className="w-full h-px bg-blue-900/50 my-2" />
          )}

          <div className="space-y-1">
            {managementNavigation.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={onCloseMobile}
                  title={isCompact ? item.name : undefined}
                  className={cn(
                    "flex items-center rounded-xl text-xs sm:text-sm font-medium transition-all group relative",
                    isCompact
                      ? "justify-center p-3"
                      : "justify-between px-3.5 py-2.5 gap-2",
                    isActive
                      ? "bg-blue-600 text-white shadow-md shadow-blue-500/30 font-semibold"
                      : "text-blue-100/90 hover:bg-blue-900/50 hover:text-white"
                  )}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <Icon
                      className={cn(
                        "w-4 h-4 shrink-0 transition-colors",
                        isActive ? "text-white" : "text-blue-300 group-hover:text-white"
                      )}
                    />
                    {!isCompact && (
                      <span className="leading-snug break-words whitespace-normal text-xs sm:text-[13px]">
                        {item.name}
                      </span>
                    )}
                  </div>

                  {!isCompact && (
                    <span
                      className={cn(
                        "text-[9px] px-2 py-0.5 rounded-md font-bold tracking-wide uppercase shrink-0 transition-colors",
                        isActive
                          ? "bg-white/20 text-white"
                          : "bg-blue-900/70 text-blue-200 border border-blue-800/60 group-hover:bg-blue-800 group-hover:text-white"
                      )}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Footer Controls & User RBAC */}
      <div className="p-3 border-t border-blue-900/50 bg-blue-950/80 space-y-2 shrink-0">
        {/* Autohide Mode Toggle for Desktop */}
        {!isMobileDrawer && !isCompact && (
          <div className="flex items-center justify-between px-2 text-xs text-blue-300">
            <button
              onClick={toggleAutohide}
              className="flex items-center gap-1.5 hover:text-white transition-colors text-[11px]"
              title={isAutohide ? "Disable autohide on mouse leave" : "Enable autohide on mouse leave"}
            >
              {isAutohide ? (
                <>
                  <EyeOff className="w-3.5 h-3.5 text-blue-300" />
                  <span>Autohide: <strong className="text-white">ON</strong></span>
                </>
              ) : (
                <>
                  <Eye className="w-3.5 h-3.5" />
                  <span>Autohide: <strong>OFF</strong></span>
                </>
              )}
            </button>

            <button
              onClick={toggleCollapse}
              className="p-1 rounded hover:bg-blue-900/60 text-blue-300 hover:text-white transition-colors"
              title="Collapse sidebar"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Compact Expand Toggle Button */}
        {!isMobileDrawer && isCompact && (
          <div className="flex justify-center">
            <button
              onClick={toggleCollapse}
              className="p-2 rounded-lg bg-blue-900/60 text-blue-200 hover:text-white hover:bg-blue-800 transition-colors"
              title="Expand Sidebar"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* User Card */}
        <div
          className={cn(
            "flex items-center gap-2.5 rounded-xl bg-blue-900/30 border border-blue-800/40 p-2",
            isCompact ? "justify-center p-1.5 bg-transparent border-transparent" : "px-3"
          )}
        >
          <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-md shadow-blue-500/40">
            {currentUser.name[0]}
          </div>
          {!isCompact && (
            <>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold text-white truncate">{currentUser.name}</div>
                <div className="text-[10px] text-blue-300 font-semibold">{currentUser.role}</div>
              </div>
              <button
                onClick={() => logout()}
                className="p-1.5 rounded-lg text-blue-300 hover:text-rose-400 hover:bg-rose-950/40 transition-colors"
                title="Sign Out / Log Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>
    </aside>
  );
}
