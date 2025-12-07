"use client";

import React from "react";
import { useTranslation as useI18NextTranslation } from "react-i18next";

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}

export const useTranslation = () => {
    const { t, i18n } = useI18NextTranslation();

    const setLocale = (lang: string) => {
        i18n.changeLanguage(lang);
    };

    return {
        t,
        locale: i18n.language ? i18n.language.substring(0, 2) : 'en',
        setLocale,
        i18n
    };
};
