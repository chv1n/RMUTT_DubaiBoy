"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { Breadcrumbs, BreadcrumbItem } from "@heroui/breadcrumbs";
import { useTranslation } from "@/components/providers/language-provider";
import Link from "next/link";

export function AdminBreadcrumbs() {
    const pathname = usePathname();
    const { t } = useTranslation();

    const ROOTS = ['super-admin', 'admin', 'user', 'inventory-manager', 'prouction-manager', 'purchase-maneger'];

    // If we are at any root, don't show breadcrumbs (or show empty?)
    if (ROOTS.some(r => pathname === `/${r}`)) return null;

    const segments = pathname.split("/").filter((segment) => segment !== "");

    // Map specific segments to translation keys or readable names
    const getSegmentName = (segment: string, index: number, allSegments: string[]) => {
        // Handle IDs (numeric or long strings)
        if (!isNaN(Number(segment)) || segment.length > 20) {
            return t("common.detail");
        }

        if (ROOTS.includes(segment)) {
            return t("common.dashboard");
        }

        switch (segment) {
            case "materials":
                return t("common.materials");
            case "suppliers":
                return t("suppliers.title");
            case "all":
                return t("materials.list");
            case "new":
                return t("common.add");
            case "edit":
                return t("common.edit");
            case "groups":
                return t("materials.groups");
            case "container-types":
                return t("materials.containerTypes");
            default:
                return segment.charAt(0).toUpperCase() + segment.slice(1);
        }
    };

    const breadcrumbItems = segments.map((segment, index) => {
        const path = `/${segments.slice(0, index + 1).join("/")}`;
        const isLast = index === segments.length - 1;
        const name = getSegmentName(segment, index, segments);

        return (
            <BreadcrumbItem key={path} isCurrent={isLast}>
                {isLast ? (
                    name
                ) : (
                    <Link href={path}>{name}</Link>
                )}
            </BreadcrumbItem>
        );
    });

    return (
        <Breadcrumbs size="lg" className="mb-4">
            {breadcrumbItems}
        </Breadcrumbs>
    );
}
