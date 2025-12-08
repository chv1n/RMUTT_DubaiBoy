import { useState, useEffect } from "react";

/**
 * Hook to get the primary color from CSS variables
 * Useful for syncing charts (Recharts) with the application theme
 */
export function usePrimaryColor(defaultColor: string = "#006FEE") {
    const [primaryColor, setPrimaryColor] = useState(defaultColor);

    useEffect(() => {
        // Helper to safely get the computed style
        const getThemeColor = () => {
            if (typeof window === "undefined") return;
            
            try {
                const color = getComputedStyle(document.documentElement)
                    .getPropertyValue("--color-primary")
                    .trim();

                if (color) {
                    setPrimaryColor(color);
                }
            } catch (e) {
                console.warn("Failed to get theme color from CSS variable", e);
            }
        };

        getThemeColor();
        
        // Optional: Could add a MutationObserver on document.documentElement if theme changes dynamically without reload
        // But for most cases, running on mount is sufficient
    }, []);

    return primaryColor;
}
