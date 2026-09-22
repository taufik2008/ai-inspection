"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export type UserRole = "MANAGER" | "INSPECTOR" | "ADMIN";

export interface CurrentUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  title: string;
}

export const MOCK_USERS: Record<UserRole, CurrentUser> = {
  MANAGER: {
    id: "user-manager-1",
    name: "Budi Pratama",
    email: "budi.manager@inspection-ai.com",
    role: "MANAGER",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    title: "Head of QA & Operations Manager",
  },
  INSPECTOR: {
    id: "user-inspector-1",
    name: "Arief Hidayat",
    email: "arief.inspector@inspection-ai.com",
    role: "INSPECTOR",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    title: "Senior Certified Field Inspector",
  },
  ADMIN: {
    id: "user-admin-1",
    name: "System Administrator",
    email: "admin@inspection-ai.com",
    role: "ADMIN",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
    title: "Super Admin & Infrastructure Manager",
  },
};

interface RBACContextType {
  currentUser: CurrentUser;
  isAuthenticated: boolean;
  isLoaded: boolean;
  setRole: (role: UserRole) => void;
  login: (role?: UserRole, customUser?: { name: string; email: string }) => void;
  logout: () => void;
  canApprove: boolean; // Managers & Admins
  canEditSystem: boolean; // Admins
  canInspect: boolean; // Inspectors & Admins & Managers
  canPublishMarketing: boolean; // Managers & Admins
}

const RBACContext = createContext<RBACContextType>({
  currentUser: MOCK_USERS.MANAGER,
  isAuthenticated: true,
  isLoaded: false,
  setRole: () => {},
  login: () => {},
  logout: () => {},
  canApprove: true,
  canEditSystem: false,
  canInspect: true,
  canPublishMarketing: true,
});

export function RBACProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [role, setRoleState] = useState<UserRole>("MANAGER");
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  const [customUserInfo, setCustomUserInfo] = useState<{ name?: string; email?: string } | null>(null);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  // Load from localStorage if available
  useEffect(() => {
    try {
      const savedRole = localStorage.getItem("inspect_ai_user_role") as UserRole;
      if (savedRole && MOCK_USERS[savedRole]) {
        setRoleState(savedRole);
      }

      const savedAuth = localStorage.getItem("inspect_ai_authenticated");
      if (savedAuth !== null) {
        setIsAuthenticated(savedAuth === "true");
      } else {
        // Default to authenticated for demo convenience
        setIsAuthenticated(true);
        localStorage.setItem("inspect_ai_authenticated", "true");
      }

      const savedUser = localStorage.getItem("inspect_ai_custom_user");
      if (savedUser) {
        setCustomUserInfo(JSON.parse(savedUser));
      }
    } catch (e) {
      console.error("Failed to load auth state", e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  const setRole = (newRole: UserRole) => {
    setRoleState(newRole);
    try {
      localStorage.setItem("inspect_ai_user_role", newRole);
    } catch (e) {
      console.error(e);
    }
  };

  const login = (newRole: UserRole = "MANAGER", customUser?: { name: string; email: string }) => {
    setRoleState(newRole);
    setIsAuthenticated(true);
    if (customUser) {
      setCustomUserInfo(customUser);
      localStorage.setItem("inspect_ai_custom_user", JSON.stringify(customUser));
    } else {
      setCustomUserInfo(null);
      localStorage.removeItem("inspect_ai_custom_user");
    }
    localStorage.setItem("inspect_ai_user_role", newRole);
    localStorage.setItem("inspect_ai_authenticated", "true");
    router.push("/");
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.setItem("inspect_ai_authenticated", "false");
    router.push("/login");
  };

  const baseUser = MOCK_USERS[role] || MOCK_USERS.MANAGER;
  const currentUser: CurrentUser = {
    ...baseUser,
    ...(customUserInfo?.name ? { name: customUserInfo.name } : {}),
    ...(customUserInfo?.email ? { email: customUserInfo.email } : {}),
  };

  const canApprove = role === "MANAGER" || role === "ADMIN";
  const canEditSystem = role === "ADMIN";
  const canInspect = true; // All roles can review inspections
  const canPublishMarketing = role === "MANAGER" || role === "ADMIN";

  return (
    <RBACContext.Provider
      value={{
        currentUser,
        isAuthenticated,
        isLoaded,
        setRole,
        login,
        logout,
        canApprove,
        canEditSystem,
        canInspect,
        canPublishMarketing,
      }}
    >
      {children}
    </RBACContext.Provider>
  );
}

export function useRBAC() {
  return useContext(RBACContext);
}
