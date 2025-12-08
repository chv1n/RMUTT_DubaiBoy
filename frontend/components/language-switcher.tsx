"use client";

import { useTranslation } from "@/components/providers/language-provider";
import { Button } from "@heroui/button";
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@heroui/dropdown";
import { useEffect, useState } from "react";

export const LanguageSwitcher = () => {
    const { locale, setLocale } = useTranslation();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return <Button variant="light" isIconOnly>EN</Button>;
    }

    return (
        <Dropdown>
            <DropdownTrigger>
                <Button variant="light">
                    {locale.toUpperCase()}
                </Button>
            </DropdownTrigger>
            <DropdownMenu aria-label="Language Actions" onAction={(key) => setLocale(key as "en" | "th" | "ja")}>
                <DropdownItem key="en">EN</DropdownItem>
                <DropdownItem key="th">TH</DropdownItem>
                <DropdownItem key="ja">JP</DropdownItem>
            </DropdownMenu>
        </Dropdown>
    );
};
