"use client";

import React from "react";
import { SidebarProvider, useSidebar } from "@/components/providers/sidebar-provider";
import { LanguageProvider } from "@/components/providers/language-provider";
import { AdminSidebar } from "./admin-sidebar";
import { AdminHeader } from "./admin-header";

// This component consumes the context to handle layout classes
function AdminLayoutContent({ children }: { children: React.ReactNode }) {
    const { toggleMobileSidebar } = useSidebar();

    return (
        <div className="flex h-screen w-full bg-default-50 dark:bg-background overflow-hidden">
            <AdminSidebar />

            <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
                <AdminHeader toggleMobileSidebar={toggleMobileSidebar} />
                <main className="flex-1 overflow-y-auto p-4 sm:p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}

export default function AdminSidebarMain({ children }: { children: React.ReactNode }) {
    return (
        <LanguageProvider>
            <SidebarProvider>
                <AdminLayoutContent>{children}</AdminLayoutContent>
            </SidebarProvider>
        </LanguageProvider>
    );
}
