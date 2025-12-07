"use client";

import React from "react";
import { useTranslation as useI18NextTranslation } from "react-i18next";

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [isMounted, setIsMounted] = React.useState(false);

    React.useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) {
        return null; // or a loading spinner
    }

    return <>{children}</>;
}

export const useTranslation = () => {
    const { t, i18n } = useI18NextTranslation();
    const [isMounted, setIsMounted] = React.useState(false);

    React.useEffect(() => {
        setIsMounted(true);
    }, []);

    const effectiveT = (key: string, options?: any): string => {
        if (!isMounted) return key;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return t(key, options) as any;
    };

    const setLocale = (lang: string) => {
        i18n.changeLanguage(lang);
    };

    return {
        t: effectiveT,
        locale: isMounted && i18n.language ? i18n.language.substring(0, 2) : 'en',
        setLocale,
        i18n
    };
};
