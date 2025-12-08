"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface SidebarContextType {
    isCollapsed: boolean;
    toggleSidebar: () => void;
    isMobileOpen: boolean;
    toggleMobileSidebar: () => void;
    closeMobileSidebar: () => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        const storedCollapsed = localStorage.getItem("sidebarCollapsed");
        if (storedCollapsed) {
            setIsCollapsed(JSON.parse(storedCollapsed));
        }

        const handleResize = () => {
            if (window.innerWidth < 768) {
                setIsCollapsed(false);
            }
        };

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const toggleSidebar = () => {
        const newState = !isCollapsed;
        setIsCollapsed(newState);
        localStorage.setItem("sidebarCollapsed", JSON.stringify(newState));
    };

    const toggleMobileSidebar = () => setIsMobileOpen(!isMobileOpen);
    const closeMobileSidebar = () => setIsMobileOpen(false);

    // We always render the provider, but we might want to avoid rendering children until mounted if they rely on specific client state
    // However, for the context to exist, we MUST render the provider.
    // To avoid hydration mismatch for isCollapsed, we can use the default (false) initially, 
    // and then update it after mount (which the useEffect above does).

    return (
        <SidebarContext.Provider
            value={{
                isCollapsed,
                toggleSidebar,
                isMobileOpen,
                toggleMobileSidebar,
                closeMobileSidebar,
            }}
        >
            {children}
        </SidebarContext.Provider>
    );
}

export function useSidebar() {
    const context = useContext(SidebarContext);
    if (context === undefined) {
        throw new Error("useSidebar must be used within a SidebarProvider");
    }
    return context;
}
