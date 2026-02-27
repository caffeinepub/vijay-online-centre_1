import typography from '@tailwindcss/typography';
import containerQueries from '@tailwindcss/container-queries';
import animate from 'tailwindcss-animate';

/** @type {import('tailwindcss').Config} */
export default {
    darkMode: ['class'],
    content: ['index.html', 'src/**/*.{js,ts,jsx,tsx,html,css}'],
    theme: {
        container: {
            center: true,
            padding: '2rem',
            screens: {
                '2xl': '1400px'
            }
        },
        extend: {
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
                heading: ['Poppins', 'Inter', 'system-ui', 'sans-serif'],
            },
            colors: {
                border: 'oklch(var(--border))',
                input: 'oklch(var(--input))',
                ring: 'oklch(var(--ring) / <alpha-value>)',
                background: 'oklch(var(--background))',
                foreground: 'oklch(var(--foreground))',
                primary: {
                    DEFAULT: 'oklch(var(--primary) / <alpha-value>)',
                    foreground: 'oklch(var(--primary-foreground))'
                },
                secondary: {
                    DEFAULT: 'oklch(var(--secondary) / <alpha-value>)',
                    foreground: 'oklch(var(--secondary-foreground))'
                },
                destructive: {
                    DEFAULT: 'oklch(var(--destructive) / <alpha-value>)',
                    foreground: 'oklch(var(--destructive-foreground))'
                },
                muted: {
                    DEFAULT: 'oklch(var(--muted) / <alpha-value>)',
                    foreground: 'oklch(var(--muted-foreground) / <alpha-value>)'
                },
                accent: {
                    DEFAULT: 'oklch(var(--accent) / <alpha-value>)',
                    foreground: 'oklch(var(--accent-foreground))'
                },
                popover: {
                    DEFAULT: 'oklch(var(--popover))',
                    foreground: 'oklch(var(--popover-foreground))'
                },
                card: {
                    DEFAULT: 'oklch(var(--card))',
                    foreground: 'oklch(var(--card-foreground))'
                },
                chart: {
                    1: 'oklch(var(--chart-1))',
                    2: 'oklch(var(--chart-2))',
                    3: 'oklch(var(--chart-3))',
                    4: 'oklch(var(--chart-4))',
                    5: 'oklch(var(--chart-5))'
                },
                sidebar: {
                    DEFAULT: 'oklch(var(--sidebar))',
                    foreground: 'oklch(var(--sidebar-foreground))',
                    primary: 'oklch(var(--sidebar-primary))',
                    'primary-foreground': 'oklch(var(--sidebar-primary-foreground))',
                    accent: 'oklch(var(--sidebar-accent))',
                    'accent-foreground': 'oklch(var(--sidebar-accent-foreground))',
                    border: 'oklch(var(--sidebar-border))',
                    ring: 'oklch(var(--sidebar-ring))'
                },
                navy: {
                    DEFAULT: 'oklch(0.12 0.06 250)',
                    mid: 'oklch(0.18 0.07 250)',
                    light: 'oklch(0.25 0.06 250)',
                },
                'electric-blue': {
                    DEFAULT: 'oklch(0.45 0.18 250)',
                    light: 'oklch(0.55 0.18 250)',
                    dark: 'oklch(0.35 0.16 250)',
                },
                gold: {
                    DEFAULT: 'oklch(0.75 0.15 60)',
                    dark: 'oklch(0.65 0.18 55)',
                    light: 'oklch(0.85 0.12 65)',
                },
                slate: {
                    dark: 'oklch(0.2 0.04 240)',
                },
                success: 'oklch(0.55 0.18 145)',
                warning: 'oklch(0.75 0.15 60)',
            },
            borderRadius: {
                lg: 'var(--radius)',
                md: 'calc(var(--radius) - 2px)',
                sm: 'calc(var(--radius) - 4px)',
                xl: '1rem',
                '2xl': '1.5rem',
            },
            boxShadow: {
                xs: '0 1px 2px 0 rgba(0,0,0,0.05)',
                card: '0 4px 16px rgba(0,0,0,0.08)',
                'card-hover': '0 8px 24px rgba(0,0,0,0.12)',
                navy: '0 4px 20px rgba(10, 22, 40, 0.3)',
                glow: '0 0 20px oklch(0.45 0.18 250 / 0.4)',
                'gold-glow': '0 0 20px oklch(0.75 0.15 60 / 0.4)',
            },
            keyframes: {
                'accordion-down': {
                    from: { height: '0' },
                    to: { height: 'var(--radix-accordion-content-height)' }
                },
                'accordion-up': {
                    from: { height: 'var(--radix-accordion-content-height)' },
                    to: { height: '0' }
                },
                'bounce-in': {
                    '0%': { transform: 'scale(0) translateY(20px)', opacity: '0' },
                    '60%': { transform: 'scale(1.1) translateY(-5px)', opacity: '1' },
                    '100%': { transform: 'scale(1) translateY(0)', opacity: '1' },
                },
                'slide-up': {
                    '0%': { transform: 'translateY(100%)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
            },
            animation: {
                'accordion-down': 'accordion-down 0.2s ease-out',
                'accordion-up': 'accordion-up 0.2s ease-out',
                'bounce-in': 'bounce-in 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
                'slide-up': 'slide-up 0.3s ease-out',
            }
        }
    },
    plugins: [typography, containerQueries, animate]
};
