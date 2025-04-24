/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: "#ffffff",
          dark: "#1a1a1a",
        },
        foreground: {
          DEFAULT: "#171717",
          dark: "#f5f5f5",
        },
        primary: {
          DEFAULT: "#2c2c2c",
          light: "#404040",
          dark: "#1a1a1a",
        },
        secondary: {
          DEFAULT: "#71717a",
          light: "#a1a1aa",
          dark: "#d4d4d8",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)"],
      },
    },
  },
  plugins: [],
};
