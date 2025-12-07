"use client";

import React from "react";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import { Search, Bell, Settings, Menu } from "lucide-react";
import { ThemeSwitch } from "@/components/theme-switch";
import { useSidebar } from "@/components/providers/sidebar-provider";
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@heroui/dropdown";
import { useTranslation } from "@/components/providers/language-provider";


type AdminHeaderProps = {
    toggleMobileSidebar: () => void;
};

export function AdminHeader({ toggleMobileSidebar }: AdminHeaderProps) {
    // const { toggleMobileSidebar } = useSidebar(); // Removed internal hook usage
    const { locale, setLocale } = useTranslation();

    return (
        <header className="h-16    bg-background  backdrop-blur-lg flex items-center justify-between px-4 sm:px-6 sticky top-0 z-30">
            <div className="flex items-center gap-4 w-full sm:w-1/3">
                <Button
                    isIconOnly
                    variant="light"
                    className="md:hidden -ml-2"
                    onPress={toggleMobileSidebar}
                >
                    <Menu size={24} />
                </Button>

                <Input
                    classNames={{
                        base: "max-w-full sm:max-w-[20rem] h-10",
                        mainWrapper: "h-full",
                        input: "text-small",
                        inputWrapper: "h-full font-normal text-default-500 bg-default-400/20 dark:bg-default-500/20",
                    }}
                    placeholder="Type to search..."
                    size="sm"
                    startContent={<Search size={18} />}
                    type="search"
                />
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
                <Button isIconOnly variant="light" size="sm" radius="full" className="hidden sm:flex">
                    <Bell size={20} className="text-default-500" />
                </Button>
                <Button isIconOnly variant="light" size="sm" radius="full" className="hidden sm:flex">
                    <Settings size={20} className="text-default-500" />
                </Button>
                <div className="w-px h-6 bg-divider mx-1 hidden sm:block" />
                <Dropdown>
                    <DropdownTrigger>
                        <Button variant="light" size="sm" className="min-w-0 px-2 uppercase font-bold">
                            {locale}
                        </Button>
                    </DropdownTrigger>
                    <DropdownMenu aria-label="Language Actions" onAction={(key) => setLocale(key as "en" | "th" | "ja")}>
                        <DropdownItem key="en">English</DropdownItem>
                        <DropdownItem key="th">ไทย</DropdownItem>
                        <DropdownItem key="ja">日本語</DropdownItem>
                    </DropdownMenu>
                </Dropdown>
                <ThemeSwitch />
            </div>
        </header>
    );
}
