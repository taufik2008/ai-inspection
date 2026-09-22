"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  UserCheck,
  CheckCircle2,
  ChevronDown,
  Sparkles,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  LogOut,
  ShieldAlert,
  User,
} from "lucide-react";
import { useRBAC, type UserRole } from "@/context/rbac-context";
import { useSidebar } from "@/context/sidebar-context";

interface TopbarProps {
  onToggleMobileMenu?: () => void;
}

export function Topbar({ onToggleMobileMenu }: TopbarProps) {
  const { currentUser, setRole, logout } = useRBAC();
  const { isCollapsed, toggleCollapse } = useSidebar();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="h-16 border-b border-slate-200 bg-white dark:bg-slate-900 dark:border-slate-800 px-4 sm:px-6 flex items-center justify-between z-10 shrink-0">
      {/* Left: Mobile Menu / Desktop Sidebar Toggle + Title */}
      <div className="flex items-center gap-3">
        {/* Mobile Hamburger Toggle */}
        <button
          onClick={onToggleMobileMenu}
          className="lg:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
          title="Open Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Desktop Sidebar Collapse / Expand Toggle */}
        <button
          onClick={toggleCollapse}
          className="hidden lg:flex p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
          title={isCollapsed ? "Expand Sidebar" : "Collapse / Autohide Sidebar"}
        >
          {isCollapsed ? (
            <PanelLeftOpen className="w-5 h-5 text-blue-600" />
          ) : (
            <PanelLeftClose className="w-5 h-5 text-slate-500" />
          )}
        </button>

        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 truncate">
              InspectAI Operating System
            </h1>
            <span className="hidden md:inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800 font-semibold">
              <CheckCircle2 className="w-3 h-3" />
              6 AI Agents Active
            </span>
          </div>
        </div>
      </div>

      {/* Right User & RBAC Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Quick Simulator Link */}
        <Link
          href="/sandbox"
          className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-blue-600 bg-blue-50 dark:bg-blue-950/60 dark:text-blue-300 px-3 py-1.5 rounded-lg border border-blue-200 dark:border-blue-800 hover:bg-blue-100 transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>AI Simulator</span>
        </Link>

        {/* User Profile & RBAC Menu Dropdown */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700/80 transition-all text-xs"
          >
            <div className="w-7 h-7 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs shadow-sm">
              {currentUser.name[0]}
            </div>
            <div className="hidden sm:block text-left">
              <div className="font-bold text-slate-800 dark:text-slate-200 truncate max-w-[120px]">
                {currentUser.name}
              </div>
              <div className="text-[10px] text-blue-600 font-semibold">{currentUser.role}</div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              {/* Profile Card Header */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl mb-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-sm shadow-md">
                    {currentUser.name[0]}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {currentUser.name}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                      {currentUser.email}
                    </div>
                    <span className="inline-block mt-1 text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300 border border-blue-200 dark:border-blue-700">
                      {currentUser.role}
                    </span>
                  </div>
                </div>
              </div>

              {/* RBAC Role Switcher Section */}
              <div className="text-[10px] uppercase font-bold text-slate-400 px-2 py-1">
                Switch Role (RBAC)
              </div>
              <div className="space-y-1 mb-2">
                {(
                  [
                    { role: "MANAGER", name: "Budi Pratama (QA Manager)", desc: "Approve RFQs & Reports" },
                    { role: "INSPECTOR", name: "Arief Hidayat (Inspector)", desc: "Field Audits & Training" },
                    { role: "ADMIN", name: "System Administrator", desc: "Full CRUD & System Control" },
                  ] as const
                ).map((item) => (
                  <button
                    key={item.role}
                    onClick={() => {
                      setRole(item.role as UserRole);
                      setShowUserMenu(false);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 text-xs rounded-lg transition-colors ${
                      currentUser.role === item.role
                        ? "bg-blue-600 text-white font-semibold shadow-sm"
                        : "text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="truncate">{item.name}</span>
                      {currentUser.role === item.role && <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />}
                    </div>
                  </button>
                ))}
              </div>

              {/* Divider */}
              <div className="h-px bg-slate-200 dark:bg-slate-800 my-1" />

              {/* Logout / Sign Out Button */}
              <button
                onClick={() => {
                  setShowUserMenu(false);
                  logout();
                }}
                className="w-full flex items-center gap-2 px-2.5 py-2 text-xs rounded-lg text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors font-semibold"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out / Log Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
