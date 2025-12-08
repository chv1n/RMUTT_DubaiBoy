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
    LucideIcon,
    Box,
    Calendar,
    Layers,
    Truck,
    Warehouse
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
        key: "home",
        label: "common.home",
        icon: <LayoutDashboard className="w-5 h-5" />,
        href: "/super-admin",
    },
    {
        key: "users",
        label: "user.title",
        icon: <Users className="w-5 h-5" />,
        href: "/super-admin/users",
    },
    {
        key: "plans",
        label: "plan.title",
        icon: <Calendar className="w-5 h-5" />,
        href: "/super-admin/plans",
    },
    {
        key: "products",
        label: "products.title",
        icon: <Package className="w-5 h-5" />,
        children: [
            { key: "all-products", label: "products.list", href: "/super-admin/products" },
            { key: "product-types", label: "products.productTypes", href: "/super-admin/products/types" },
        ],
    },

    {
        key: "materials",
        label: "materials.title",
        icon: <Layers className="w-5 h-5" />,
        children: [
            { key: "dashboard-materials", label: "common.dashboard", href: "/super-admin/materials" },
            { key: "all-materials", label: "materials.list", href: "/super-admin/materials/all" },
            { key: "material-groups", label: "materials.groups", href: "/super-admin/materials/groups" },
            { key: "container-types", label: "materials.containerTypes", href: "/super-admin/materials/container-types" },
            { key: "units", label: "materials.unit", href: "/super-admin/materials/units" },
        ],
    },
    {
        key: "suppliers",
        label: "suppliers.title",
        icon: <Truck className="w-5 h-5" />,
        children: [
            { key: "dashboard-suppliers", label: "common.dashboard", href: "/super-admin/suppliers" },
            { key: "all-suppliers", label: "suppliers.list", href: "/super-admin/suppliers/all" },
        ],
    },
    {
        key: "warehouses",
        label: "warehouses.title",
        icon: <Warehouse className="w-5 h-5" />,
        href: "/super-admin/warehouse",
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
