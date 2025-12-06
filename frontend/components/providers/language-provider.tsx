"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { en } from "@/config/locales/en";
import { th } from "@/config/locales/th";

type Locale = "en" | "th";
type Translations = typeof en;

interface LanguageContextType {
    locale: Locale;
    setLocale: (locale: Locale) => void;
    t: (key: string) => string;
    translations: Translations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [locale, setLocale] = useState<Locale>("en");
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const storedLocale = localStorage.getItem("locale") as Locale;
        if (storedLocale && (storedLocale === "en" || storedLocale === "th")) {
            setLocale(storedLocale);
        }
    }, []);

    const handleSetLocale = (newLocale: Locale) => {
        setLocale(newLocale);
        localStorage.setItem("locale", newLocale);
    };

    const translations = locale === "th" ? th : en;

    const t = (path: string) => {
        const keys = path.split(".");
        let current: any = translations;
        for (const key of keys) {
            if (current[key] === undefined) {
                console.warn(`Translation key not found: ${path}`);
                return path;
            }
            current = current[key];
        }
        return current as string;
    };

    return (
        <LanguageContext.Provider value={{ locale, setLocale: handleSetLocale, t, translations }}>
            {mounted ? children : <div className="invisible">{children}</div>}
        </LanguageContext.Provider>
    );
}

export function useTranslation() {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error("useTranslation must be used within a LanguageProvider");
    }
    return context;
}
