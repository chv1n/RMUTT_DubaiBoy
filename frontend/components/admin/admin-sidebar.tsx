"use client";

import React, { useState } from "react";
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
import { getSidebarItems, getBottomItems, sidebarItems, bottomItems, MenuItem, SubMenuItem } from "@/config/menu";
import { useTranslation } from "@/components/providers/language-provider";
import { authService } from "@/services/auth.service";
import { ConfirmModal } from "@/components/common/confirm-modal";
import { usePermission } from "@/hooks/use-permission";
import { UserRole, User } from "@/types/user";


export function AdminSidebar() {
    const pathname = usePathname();
    const { isCollapsed, toggleSidebar, isMobileOpen, closeMobileSidebar } = useSidebar();
    const { t } = useTranslation();
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
    const { userRole, hasRole } = usePermission();

    const [user, setUser] = useState<User | null>(null);

    React.useEffect(() => {
        const u = authService.getUser();
        setUser(u);
    }, []);

    // Helper to check if a menu item is active
    const isItemActive = (item: MenuItem) => {
        if (item.href) return pathname === item.href;
        if (item.children) return item.children.some(child => pathname === child.href);
        return false;
    };

    const handleLogout = () => {
        setIsLogoutModalOpen(false);
        authService.logout();
    };

    const getFilteredItems = (items: MenuItem[]) => {
        return items.filter(item => {
            // If item has specific allowedRoles, check permission
            if (item.allowedRoles && item.allowedRoles.length > 0) {
                if (!hasRole(item.allowedRoles)) return false;
            }

            // If item has children, filter them as well
            if (item.children) {
                const filteredChildren = item.children.filter((child: SubMenuItem) => {
                    if (child.allowedRoles && child.allowedRoles.length > 0) {
                        return hasRole(child.allowedRoles);
                    }
                    return true;
                });
                // If all children are filtered out and item has no href itself (is just a group), hide it
                // OR if we want to show it but empty? Usually hide.
                // But we can attach the filtered children back to a copy of item to render.
                if (filteredChildren.length === 0 && !item.href) return false;

                // Note: We are filtering "in place" for rendering. 
                // Since sidebarItems is constant, we shouldn't mutate it.
                // The map function below handles rendering, so we should logic separation.
                // Better approach: create a new filtered list.
                return true;
            }

            return true;
        }).map(item => {
            if (item.children) {
                return {
                    ...item,
                    children: item.children.filter((child: SubMenuItem) => {
                        if (child.allowedRoles && child.allowedRoles.length > 0) {
                            return hasRole(child.allowedRoles);
                        }
                        return true;
                    })
                };
            }
            return item;
        }).filter(item => {
            // Second pass to remove groups that became empty
            if (item.children && item.children.length === 0 && !item.href) {
                return false;
            }
            return true;
        });
    };

    const filteredSidebarItems = React.useMemo(() => {
        const items = getSidebarItems(userRole);
        return getFilteredItems(items);
    }, [userRole, pathname]); // pathname might not strictly be needed if items don't react to it, but good practice if active state logic moves there

    const filteredBottomItems = React.useMemo(() => {
        const items = getBottomItems(userRole);
        return getFilteredItems(items);
    }, [userRole, pathname]);

    const SidebarContent = () => (
        <>
            <div className={cn("flex items-center gap-3 px-6 py-6 h-20", isCollapsed ? "justify-center px-2" : "")}>
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-primary-500 to-secondary-500 flex items-center justify-center shadow-lg shadow-primary-500/30">
                        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                    </div>

                </div>
                {!isCollapsed && <div className="font-black tracking-tight">
                    <span className="text-default-900">Material</span>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-secondary-600">Core</span>
                </div>}
            </div>

            <ScrollShadow className="flex-1 px-3 py-2 gap-2 flex flex-col">
                {/* Main Menu */}
                <div className="flex flex-col gap-1">
                    {!isCollapsed && <p className="text-xs font-semibold text-default-500 uppercase px-3 mb-2 mt-2">{t("common.materials")}</p>}
                    {filteredSidebarItems.map((item) => (
                        <SidebarItem key={item.key} item={item} isCollapsed={isCollapsed} isActive={isItemActive(item)} pathname={pathname} t={t} />
                    ))}
                </div>

                {/* Bottom Menu */}
                {/* <div className="mt-auto flex flex-col gap-1">
                    {!isCollapsed && <p className="text-xs font-semibold text-default-500 uppercase px-3 mb-2 mt-4">{t("common.system")}</p>}
                    {filteredBottomItems.map((item) => (
                        <SidebarItem key={item.key} item={item} isCollapsed={isCollapsed} isActive={isItemActive(item)} pathname={pathname} t={t} />
                    ))}
                </div> */}
            </ScrollShadow>



            <div className={cn("p-4 border-t border-divider", isCollapsed ? "flex justify-center" : "")}>
                <div
                    className={cn(
                        "flex items-center gap-3 p-2 rounded-xl hover:bg-default-100 cursor-pointer transition-colors group",
                        isCollapsed ? "justify-center" : ""
                    )}
                    onClick={() => setIsLogoutModalOpen(true)}
                >
                    <Avatar
                        name={(user?.fullname || user?.username || "U").substring(0, 2).toUpperCase()}
                        size="sm"
                        isBordered
                        className="transition-transform group-hover:scale-105"
                        classNames={{
                            base: "bg-primary text-white"
                        }}
                    />
                    {!isCollapsed && (
                        <div className="flex flex-col flex-1 min-w-0">
                            <span className="text-sm font-semibold truncate">{user?.fullname || user?.username || "User"}</span>
                            <span className="text-xs text-default-500 truncate">{user?.email || "..."}</span>
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

            <ConfirmModal
                isOpen={isLogoutModalOpen}
                onClose={() => setIsLogoutModalOpen(false)}
                onConfirm={handleLogout}
                title="Logout Confirmation"
                message="Are you sure you want to log out of your account?"
                confirmText="Logout"
                variant="danger"
            />
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
