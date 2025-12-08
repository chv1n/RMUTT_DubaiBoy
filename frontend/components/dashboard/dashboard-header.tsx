"use client";

import React from "react";
import { Button } from "@heroui/button";
import { Calendar, Download, Settings, ChevronDown } from "lucide-react";
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@heroui/dropdown";
import { useTranslation } from "@/components/providers/language-provider";

interface DashboardHeaderProps {
    title: string;
    onExport?: () => void;
}

export function DashboardHeader({ title, onExport }: DashboardHeaderProps) {
    const { t } = useTranslation();

    return (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">

            <div className="flex flex-wrap gap-2 items-center">
                <Dropdown>
                    <DropdownTrigger>
                        <Button
                            variant="bordered"
                            startContent={<Calendar size={16} />}
                            endContent={<ChevronDown size={14} />}
                            className="bg-white dark:bg-default-50 border-default-200"
                        >
                            {t("common.ranges.thisWeek")}
                        </Button>
                    </DropdownTrigger>
                    <DropdownMenu aria-label="Date Range">
                        <DropdownItem key="today">{t("common.ranges.today")}</DropdownItem>
                        <DropdownItem key="week">{t("common.ranges.thisWeek")}</DropdownItem>
                        <DropdownItem key="month">{t("common.ranges.thisMonth")}</DropdownItem>
                        <DropdownItem key="year">{t("common.ranges.thisYear")}</DropdownItem>
                    </DropdownMenu>
                </Dropdown>

                <Button
                    variant="bordered"
                    startContent={<Settings size={16} />}
                    className="bg-white dark:bg-default-50 border-default-200"
                >
                    {t("common.customize")}
                </Button>

                <Button
                    color="primary"
                    startContent={<Download size={16} />}
                    onPress={onExport}
                    className="shadow-md"
                >
                    {t("common.export")}
                </Button>
            </div>
        </div>
    );
}
