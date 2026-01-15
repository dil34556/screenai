const defaultTheme = require('tailwindcss/defaultTheme');
const colors = require('tailwindcss/colors');

/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/**/*.{js,jsx,ts,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                border: "#E0E3E7", // M3 Outline Variant
                input: "#E0E3E7",
                ring: "#0B57D0",   // Google Blue
                background: "#FDFCFF", // M3 Surface
                foreground: "#1F1F1F", // M3 On Surface
                primary: {
                    DEFAULT: "#0B57D0", // Google Blue
                    foreground: "#FFFFFF",
                    container: "#D3E3FD", // M3 Primary Container
                    onContainer: "#041E49", // M3 On Primary Container
                },
                secondary: {
                    DEFAULT: "#C2E7FF", // Light Blue (Secondary Container) 
                    foreground: "#001D35", // On Secondary Container
                    container: "#C2E7FF",
                    onContainer: "#001D35",
                },
                destructive: {
                    DEFAULT: "#B3261E", // M3 Error
                    foreground: "#FFFFFF",
                },
                muted: {
                    DEFAULT: "#F0F2F5", // Surface Variant / Muted
                    foreground: "#444746", // On Surface Variant
                },
                accent: {
                    DEFAULT: "#D3E3FD",
                    foreground: "#041E49",
                },
                popover: {
                    DEFAULT: "#FFFFFF",
                    foreground: "#1F1F1F",
                },
                card: {
                    DEFAULT: "#FFFFFF", // Surface
                    foreground: "#1F1F1F",
                },
                surface: {
                    light: "#FDFCFF",
                    DEFAULT: "#FDFCFF",
                    variant: "#F0F4F8",
                }
            },
            borderRadius: {
                lg: "1.25rem", // 20px
                md: "0.75rem", // 12px
                sm: "0.5rem",  // 8px
                pill: "9999px",
            },
            fontFamily: {
                sans: ['Roboto', 'Inter', 'sans-serif'],
                heading: ['Product Sans', 'Google Sans', 'sans-serif'],
            },
            backgroundImage: {
                'none': 'none',
            },
            boxShadow: {
                'glass': '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.1), inset 0 1px 0 0 rgba(255, 255, 255, 0.08)',
                'glass-hover': '0 0 15px rgba(66, 133, 244, 0.2), inset 0 1px 0 0 rgba(255, 255, 255, 0.2)', // Micro-Glow
                'glow': '0 0 20px rgba(75, 144, 255, 0.3)',
            },
            animation: {
                'fade-in': 'fadeIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
                'slide-up': 'slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { opacity: '0', transform: 'translateY(15px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
            },
        },
    },
    plugins: [],
}
