import { heroui } from "@heroui/theme"

/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)"],
        mono: ["var(--font-mono)"],
      },
      borderRadius: {
        button: "12px",
        card: "16px",
        input: "10px",
      },
      colors: {
        primary: {
          DEFAULT: "#006FEE", // Example primary color, adjust as needed or use HeroUI's default
          foreground: "#FFFFFF",
        },
      },
    },
  },
  darkMode: "class",
  plugins: [heroui()],
}

module.exports = config;