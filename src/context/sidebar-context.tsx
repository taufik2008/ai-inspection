"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface SidebarContextType {
  isCollapsed: boolean;
  isAutohide: boolean;
  isHovered: boolean;
  toggleCollapse: () => void;
  toggleAutohide: () => void;
  setIsHovered: (hovered: boolean) => void;
}

const SidebarContext = createContext<SidebarContextType>({
  isCollapsed: false,
  isAutohide: false,
  isHovered: false,
  toggleCollapse: () => {},
  toggleAutohide: () => {},
  setIsHovered: () => {},
});

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isAutohide, setIsAutohide] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const savedCollapsed = localStorage.getItem("inspect_ai_sidebar_collapsed");
    const savedAutohide = localStorage.getItem("inspect_ai_sidebar_autohide");

    if (savedCollapsed !== null) {
      setIsCollapsed(savedCollapsed === "true");
    }
    if (savedAutohide !== null) {
      setIsAutohide(savedAutohide === "true");
    }
  }, []);

  const toggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem("inspect_ai_sidebar_collapsed", String(next));
      return next;
    });
  };

  const toggleAutohide = () => {
    setIsAutohide((prev) => {
      const next = !prev;
      localStorage.setItem("inspect_ai_sidebar_autohide", String(next));
      if (next) {
        setIsCollapsed(true);
      }
      return next;
    });
  };

  return (
    <SidebarContext.Provider
      value={{
        isCollapsed,
        isAutohide,
        isHovered,
        toggleCollapse,
        toggleAutohide,
        setIsHovered,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  return useContext(SidebarContext);
}
