"use client";

import React from "react";
import {
    LayoutDashboard,
    Users,
    Settings,
    BarChart3,
    Package,
    HelpCircle,
    Calendar,
    Layers,
    Truck,
    Warehouse,
    ClipboardList
} from "lucide-react";

import { UserRole } from "@/types/user";
import { getRolePath } from "@/lib/role-path";

export interface SubMenuItem {
    key: string;
    label: string;
    href: string;
    allowedRoles?: UserRole[];
}

export interface MenuItem {
    key: string;
    label: string;
    icon: React.ReactNode;
    href?: string;
    children?: SubMenuItem[];
    allowedRoles?: UserRole[];
}

// Role Groups for convenience
const ALL_ROLES: UserRole[] = ['SUPER_ADMIN', 'ADMIN', 'PRODUCTION_MANAGER', 'INVENTORY_MANAGER', 'PURCHASE_MANAGER', 'USER'];
const MANAGERS_AND_ADMINS: UserRole[] = ['SUPER_ADMIN', 'ADMIN', 'PRODUCTION_MANAGER', 'INVENTORY_MANAGER', 'PURCHASE_MANAGER'];
const ADMINS: UserRole[] = ['SUPER_ADMIN', 'ADMIN'];

export const getSidebarItems = (role: UserRole | null): MenuItem[] => {
    const prefix = getRolePath(role);

    return [
        {
            key: "home",
            label: "common.home",
            icon: <LayoutDashboard className="w-5 h-5" />,
            href: `${prefix}`,
            allowedRoles: ALL_ROLES
        },
        {
            key: "analytics",
            label: "common.analytics",
            icon: <BarChart3 className="w-5 h-5" />,
            href: `${prefix}/analytics`,
            allowedRoles: ['SUPER_ADMIN', 'ADMIN', 'PRODUCTION_MANAGER', 'PURCHASE_MANAGER']
        },
        {
            key: "inventory",
            label: "inventory.title",
            icon: <ClipboardList className="w-5 h-5" />,
            allowedRoles: ['SUPER_ADMIN', 'ADMIN', 'INVENTORY_MANAGER', 'USER'],
            children: [
                { key: "dashboard-inventory", label: "common.dashboard", href: `${prefix}/inventory`, allowedRoles: ALL_ROLES },
                { key: "inv-balance", label: "inventory.balance", href: `${prefix}/inventory/balance`, allowedRoles: ['SUPER_ADMIN', 'ADMIN', 'INVENTORY_MANAGER'] },
                { key: "inv-transactions", label: "inventory.transactions", href: `${prefix}/inventory/transactions`, allowedRoles: ['SUPER_ADMIN', 'ADMIN', 'INVENTORY_MANAGER'] },
            ]
        },

        {
            key: "plans",
            label: "plan.title",
            icon: <Calendar className="w-5 h-5" />,
            allowedRoles: ['SUPER_ADMIN', 'ADMIN', 'PRODUCTION_MANAGER', 'USER'],
            children: [
                { key: "dashboard-plans", label: "common.dashboard", href: `${prefix}/plans`, allowedRoles: ALL_ROLES },
                { key: "all-plans", label: "plan.list", href: `${prefix}/plans/management`, allowedRoles: ['SUPER_ADMIN', 'ADMIN', 'PRODUCTION_MANAGER'] },
            ],
        },
        {
            key: "products",
            label: "products.title",
            icon: <Package className="w-5 h-5" />,
            allowedRoles: ['SUPER_ADMIN', 'ADMIN', 'PRODUCTION_MANAGER', 'USER'],
            children: [
                { key: "dashboard-products", label: "common.dashboard", href: `${prefix}/products`, allowedRoles: ALL_ROLES },
                { key: "all-products", label: "products.list", href: `${prefix}/products/all`, allowedRoles: ['SUPER_ADMIN', 'ADMIN', 'PRODUCTION_MANAGER'] },
                { key: "product-types", label: "products.productTypes", href: `${prefix}/products/types`, allowedRoles: ['SUPER_ADMIN', 'ADMIN', 'PRODUCTION_MANAGER'] },
            ],
        },

        {
            key: "materials",
            label: "materials.title",
            icon: <Layers className="w-5 h-5" />,
            allowedRoles: ['SUPER_ADMIN', 'ADMIN', 'INVENTORY_MANAGER', 'PURCHASE_MANAGER', 'USER'],
            children: [
                { key: "dashboard-materials", label: "common.dashboard", href: `${prefix}/materials`, allowedRoles: ALL_ROLES },
                { key: "all-materials", label: "materials.list", href: `${prefix}/materials/all`, allowedRoles: ['SUPER_ADMIN', 'ADMIN', 'INVENTORY_MANAGER', 'PURCHASE_MANAGER'] },
                { key: "material-groups", label: "materials.groups", href: `${prefix}/materials/groups`, allowedRoles: ['SUPER_ADMIN', 'ADMIN', 'INVENTORY_MANAGER', 'PURCHASE_MANAGER'] },
                { key: "container-types", label: "materials.containerTypes", href: `${prefix}/materials/container-types`, allowedRoles: ['SUPER_ADMIN', 'ADMIN', 'INVENTORY_MANAGER', 'PURCHASE_MANAGER'] },
                { key: "units", label: "materials.unit", href: `${prefix}/materials/units`, allowedRoles: ['SUPER_ADMIN', 'ADMIN', 'INVENTORY_MANAGER', 'PURCHASE_MANAGER'] },
            ],
        },
        {
            key: "suppliers",
            label: "suppliers.title",
            icon: <Truck className="w-5 h-5" />,
            allowedRoles: ['SUPER_ADMIN', 'ADMIN', 'PURCHASE_MANAGER', 'USER'],
            children: [
                { key: "dashboard-suppliers", label: "common.dashboard", href: `${prefix}/suppliers`, allowedRoles: ALL_ROLES },
                { key: "all-suppliers", label: "suppliers.list", href: `${prefix}/suppliers/all`, allowedRoles: ['SUPER_ADMIN', 'ADMIN', 'PURCHASE_MANAGER'] },
            ],
        },
        {
            key: "warehouses",
            label: "warehouses.title",
            icon: <Warehouse className="w-5 h-5" />,
            allowedRoles: ['SUPER_ADMIN', 'ADMIN', 'INVENTORY_MANAGER', 'USER'],
            children: [
                { key: "dashboard-warehouses", label: "common.dashboard", href: `${prefix}/warehouse`, allowedRoles: ALL_ROLES },
                { key: "all-warehouses", label: "warehouses.list", href: `${prefix}/warehouse/all`, allowedRoles: ['SUPER_ADMIN', 'ADMIN', 'INVENTORY_MANAGER'] },
            ],
        },
        {
            key: "users",
            label: "users.title",
            icon: <Users className="w-5 h-5" />,
            allowedRoles: ADMINS,
            children: [
                { key: "dashboard-users", label: "common.dashboard", href: `${prefix}/users`, allowedRoles: ADMINS },
                { key: "all-users", label: "users.list", href: `${prefix}/users/all`, allowedRoles: ADMINS },
                { key: "audit-logs", label: "audit.title", href: `${prefix}/audit-logs`, allowedRoles: ['SUPER_ADMIN'] },
            ]
        },
    ];
};

export const getBottomItems = (role: UserRole | null): MenuItem[] => {
    const prefix = getRolePath(role);
    return [
        {
            key: "settings",
            label: "common.settings",
            icon: <Settings className="w-5 h-5" />,
            href: `${prefix}`, // Assuming settings page is at root or similar
        },
        {
            key: "help",
            label: "common.help",
            icon: <HelpCircle className="w-5 h-5" />,
            href: `${prefix}`,
        },
    ];
};

// Deprecated
export const sidebarItems: MenuItem[] = [];
export const bottomItems: MenuItem[] = [];
