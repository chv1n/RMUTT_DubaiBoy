"use client";

import React from "react";
import { Avatar } from "@heroui/avatar";
import { ScrollShadow } from "@heroui/scroll-shadow";
import { Button } from "@heroui/button";
import { Tooltip } from "@heroui/tooltip";
import { Accordion, AccordionItem } from "@heroui/accordion";
import { Listbox, ListboxItem } from "@heroui/listbox";
import { Popover, PopoverTrigger, PopoverContent } from "@heroui/popover";
import {
    LogOut,
    ChevronLeft,
    ChevronRight,
    Menu
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/components/providers/sidebar-provider";
import { sidebarItems, bottomItems, MenuItem } from "@/config/admin-menu";
import { useTranslation } from "@/components/providers/language-provider";



export function AdminSidebar() {
    const pathname = usePathname();
    const { isCollapsed, toggleSidebar, isMobileOpen, closeMobileSidebar } = useSidebar();
    const { t } = useTranslation();

    // Helper to check if a menu item is active
    const isItemActive = (item: MenuItem) => {
        if (item.href) return pathname === item.href;
        if (item.children) return item.children.some(child => pathname === child.href);
        return false;
    };

    const SidebarContent = () => (
        <>
            <div className={cn("flex items-center gap-3 px-6 py-6 h-20", isCollapsed ? "justify-center px-2" : "")}>
                <div className="w-8 h-8 min-w-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground  font-bold">
                    MC
                </div>
                {!isCollapsed && <span className="font-bold text-lg whitespace-nowrap">MeterialCore</span>}
            </div>

            <ScrollShadow className="flex-1 px-3 py-2 gap-2 flex flex-col">
                {/* Main Menu */}
                <div className="flex flex-col gap-1">
                    {!isCollapsed && <p className="text-xs font-semibold text-default-500 uppercase px-3 mb-2 mt-2">{t("common.materials")}</p>}
                    {sidebarItems.map((item) => (
                        <SidebarItem key={item.key} item={item} isCollapsed={isCollapsed} isActive={isItemActive(item)} pathname={pathname} t={t} />
                    ))}
                </div>

                {/* Bottom Menu */}
                <div className="mt-auto flex flex-col gap-1">
                    {!isCollapsed && <p className="text-xs font-semibold text-default-500 uppercase px-3 mb-2 mt-4">{t("common.system")}</p>}
                    {bottomItems.map((item) => (
                        <SidebarItem key={item.key} item={item} isCollapsed={isCollapsed} isActive={isItemActive(item)} pathname={pathname} t={t} />
                    ))}
                </div>
            </ScrollShadow>

            <div className={cn("p-4 border-t border-divider", isCollapsed ? "flex justify-center" : "")}>
                <div className={cn(
                    "flex items-center gap-3 p-2 rounded-xl hover:bg-default-100 cursor-pointer transition-colors group",
                    isCollapsed ? "justify-center" : ""
                )}>
                    <Avatar src="https://i.pravatar.cc/150?u=a042581f4e29026024d" size="sm" isBordered className="transition-transform group-hover:scale-105" />
                    {!isCollapsed && (
                        <div className="flex flex-col flex-1 min-w-0">
                            <span className="text-sm font-semibold truncate">Super Admin</span>
                            <span className="text-xs text-default-500 truncate">admin@system.com</span>
                        </div>
                    )}
                    {!isCollapsed && <LogOut className="w-4 h-4 text-default-400 group-hover:text-danger transition-colors" />}
                </div>
            </div>
        </>
    );

    return (
        <>
            {/* Desktop Sidebar */}
            <div
                className={cn(
                    "hidden md:flex flex-col h-screen border-r border-default/20 bg-background sticky top-0 transition-all duration-300 ease-in-out z-40",
                    isCollapsed ? "w-20" : "w-64"
                )}
            >
                <SidebarContent />

                {/* Toggle Button */}
                <Button
                    isIconOnly
                    size="sm"
                    variant="light"
                    className="absolute -right-3 top-9 bg-background border border-divider rounded-full shadow-sm z-50 hidden md:flex"
                    onClick={toggleSidebar}
                >
                    {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
                </Button>
            </div>

            {/* Mobile Sidebar Overlay */}
            {isMobileOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
                    onClick={closeMobileSidebar}
                />
            )}

            {/* Mobile Sidebar Drawer */}
            <div
                className={cn(
                    "fixed inset-y-0 left-0 w-64 bg-background z-50 transform transition-transform duration-300 ease-in-out md:hidden border-r border-divider",
                    isMobileOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                <SidebarContent />
            </div>
        </>
    );
}

function SidebarItem({ item, isCollapsed, isActive, pathname, t }: { item: MenuItem, isCollapsed: boolean, isActive: boolean, pathname: string, t: (key: string) => string }) {
    // Case 1: Item with children (Submenu)
    if (item.children) {
        if (isCollapsed) {
            // Collapsed with children -> Popover
            return (
                <Popover placement="right-start" offset={10}>
                    <PopoverTrigger>
                        <div className={cn(
                            "w-full flex items-center justify-center p-2 rounded-xl cursor-pointer transition-colors",
                            isActive ? "bg-primary/10 text-primary" : "text-default-500 hover:bg-default-100 hover:text-default-900"
                        )}>
                            {item.icon}
                        </div>
                    </PopoverTrigger>
                    <PopoverContent className="p-1 min-w-[180px]">
                        <div className="px-2  text-xs font-semibold text-default-500 uppercase border-b border-divider mb-1">
                            {t(item.label)}
                        </div>
                        <Listbox aria-label={t(item.label)}>
                            {item.children.map((child) => (
                                <ListboxItem
                                    key={child.key}
                                    href={child.href}
                                    as={Link}
                                    className={cn(pathname === child.href ? "text-primary" : "")}
                                    startContent={<div className={cn("w-1.5 h-1.5 rounded-full", pathname === child.href ? "bg-primary" : "bg-default-300")} />}
                                >
                                    {t(child.label)}
                                </ListboxItem>
                            ))}
                        </Listbox>
                    </PopoverContent>
                </Popover>
            );
        } else {
            // Expanded with children -> Accordion
            return (
                <Accordion
                    isCompact
                    hideIndicator={false}
                    keepContentMounted
                    defaultExpandedKeys={isActive ? [item.key] : []}
                    itemClasses={{
                        base: "px-0",
                        trigger: cn(
                            " py-2 rounded-xl data-[hover=true]:bg-default-100 transition-colors",
                            isActive ? "text-primary" : "text-default-600"
                        ),
                        title: "text-sm font-medium",
                        content: "pb-0 pl-0",
                        indicator: "text-default-400"
                    }}
                >
                    <AccordionItem
                        key={item.key}
                        aria-label={t(item.label)}
                        title={
                            <div className="flex items-center gap-3">
                                {item.icon}
                                <span>{t(item.label)}</span>
                            </div>
                        }
                    >
                        <div className="flex flex-col gap-1 pl-3 pb-2">
                            {item.children.map((child) => (
                                <Link
                                    key={child.key}
                                    href={child.href}
                                    className={cn(
                                        "text-sm py-2 px-3 rounded-lg transition-colors flex items-center gap-2",
                                        pathname === child.href
                                            ? "bg-primary/10 text-primary font-medium"
                                            : "text-default-500 hover:text-default-900 hover:bg-default-100"
                                    )}
                                >
                                    <div className={cn("w-1.5 h-1.5 rounded-full", pathname === child.href ? "bg-primary" : "bg-default-300")} />
                                    {t(child.label)}
                                </Link>
                            ))}
                        </div>
                    </AccordionItem>
                </Accordion>
            );
        }
    }

    // Case 2: Simple Item (No children)
    if (isCollapsed) {
        return (
            <Tooltip content={t(item.label)} placement="right">
                <Link
                    href={item.href || "#"}
                    className={cn(
                        "w-full flex items-center justify-center p-2 rounded-xl cursor-pointer transition-colors",
                        isActive ? "bg-primary/10 text-primary" : "text-default-500 hover:bg-default-100 hover:text-default-900"
                    )}
                >
                    {item.icon}
                </Link>
            </Tooltip>
        );
    }

    return (
        <Link
            href={item.href || "#"}
            className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors",
                isActive
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-default-600 hover:bg-default-100 hover:text-default-900"
            )}
        >
            {item.icon}
            <span className="text-sm">{t(item.label)}</span>
        </Link>
    );
}
