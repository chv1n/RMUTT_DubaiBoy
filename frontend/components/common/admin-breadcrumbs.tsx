"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { Breadcrumbs, BreadcrumbItem } from "@heroui/breadcrumbs";
import { useTranslation } from "@/components/providers/language-provider";
import Link from "next/link";

export function AdminBreadcrumbs() {
    const pathname = usePathname();
    const { t } = useTranslation();

    if (pathname === "/super-admin") return null;

    const segments = pathname.split("/").filter((segment) => segment !== "");

    // Map specific segments to translation keys or readable names
    const getSegmentName = (segment: string, index: number, allSegments: string[]) => {
        // Handle IDs (numeric or long strings)
        if (!isNaN(Number(segment)) || segment.length > 20) {
            // If it's the last segment and it's an ID, it's likely "Detail"
            // If it's followed by "edit", it's the item being edited
            return t("common.detail"); // Or just show the ID: segment
        }

        switch (segment) {
            case "super-admin":
                return t("common.dashboard");
            case "materials":
                return t("common.materials");
            case "suppliers":
                return t("suppliers.title");
            case "all":
                return t("materials.list"); // Or generic list
            case "new":
                return t("common.add");
            case "edit":
                return t("common.edit");
            case "groups":
                return t("materials.groups");
            case "container-types":
                return t("materials.containerTypes");
            default:
                // Try to translate generic keys or capitalize
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
