"use client";

import React from "react";
import {
    LayoutDashboard,
    Users,
    Settings,
    FileText,
    BarChart3,
    Shield,
    ShoppingCart,
    Package,
    CreditCard,
    HelpCircle,
    LucideIcon
} from "lucide-react";

export interface SubMenuItem {
    key: string;
    label: string;
    href: string;
}

export interface MenuItem {
    key: string;
    label: string;
    icon: React.ReactNode;
    href?: string;
    children?: SubMenuItem[];
}

export const sidebarItems: MenuItem[] = [
    {
        key: "dashboard",
        label: "common.dashboard",
        icon: <LayoutDashboard className="w-5 h-5" />,
        href: "/super-admin",
    },
    {
        key: "materials",
        label: "common.materials",
        icon: <Users className="w-5 h-5" />,
        children: [
            { key: "dashboard-materials", label: "common.dashboard", href: "/super-admin/materials" },
            { key: "all-materials", label: "materials.list", href: "/super-admin/materials/all" },
            { key: "material-groups", label: "materials.groups", href: "/super-admin/materials/groups" },
            { key: "container-types", label: "materials.containerTypes", href: "/super-admin/materials/container-types" },
        ],
    },
    {
        key: "suppliers",
        label: "suppliers.title",
        icon: <Package className="w-5 h-5" />,
        children: [
            { key: "dashboard-suppliers", label: "common.dashboard", href: "/super-admin/suppliers" },
            { key: "all-suppliers", label: "suppliers.list", href: "/super-admin/suppliers/all" },
        ],
    },
    {
        key: "ecommerce",
        label: "ecommerce.title",
        icon: <ShoppingCart className="w-5 h-5" />,
        children: [
            { key: "products", label: "ecommerce.products", href: "" },
            { key: "orders", label: "ecommerce.orders", href: "" },
            { key: "customers", label: "ecommerce.customers", href: "" },
        ],
    },
    {
        key: "analytics",
        label: "common.analytics",
        icon: <BarChart3 className="w-5 h-5" />,
        href: "",
    },
    {
        key: "reports",
        label: "common.reports",
        icon: <FileText className="w-5 h-5" />,
        href: "",
    },
];

export const bottomItems: MenuItem[] = [
    {
        key: "settings",
        label: "common.settings",
        icon: <Settings className="w-5 h-5" />,
        href: "/super-admin/",
    },
    {
        key: "help",
        label: "common.help",
        icon: <HelpCircle className="w-5 h-5" />,
        href: "/super-admin/",
    },
];
