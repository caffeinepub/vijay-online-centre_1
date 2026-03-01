/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'oklch(var(--background) / <alpha-value>)',
        foreground: 'oklch(var(--foreground) / <alpha-value>)',
        card: {
          DEFAULT: 'var(--card)',
          foreground: 'var(--card-foreground)',
        },
        popover: {
          DEFAULT: 'var(--popover)',
          foreground: 'var(--popover-foreground)',
        },
        primary: {
          DEFAULT: 'var(--primary)',
          foreground: 'var(--primary-foreground)',
        },
        secondary: {
          DEFAULT: 'var(--secondary)',
          foreground: 'var(--secondary-foreground)',
        },
        muted: {
          DEFAULT: 'var(--muted)',
          foreground: 'var(--muted-foreground)',
        },
        accent: {
          DEFAULT: 'var(--accent)',
          foreground: 'var(--accent-foreground)',
        },
        destructive: {
          DEFAULT: 'var(--destructive)',
          foreground: 'var(--destructive-foreground)',
        },
        border: 'var(--border)',
        input: 'var(--input)',
        ring: 'var(--ring)',

        // Saffron palette
        saffron: {
          DEFAULT: 'oklch(0.70 0.16 50)',
          light: 'oklch(0.80 0.14 55)',
          dark: 'oklch(0.60 0.18 45)',
        },

        // Navy palette
        navy: {
          50: 'oklch(0.95 0.01 250)',
          100: 'oklch(0.88 0.02 250)',
          200: 'oklch(0.75 0.03 250)',
          300: 'oklch(0.62 0.04 250)',
          400: 'oklch(0.50 0.04 250)',
          500: 'oklch(0.40 0.04 250)',
          600: 'oklch(0.32 0.04 250)',
          700: 'oklch(0.26 0.035 250)',
          800: 'oklch(0.20 0.03 250)',
          900: 'oklch(0.14 0.025 250)',
          950: 'oklch(0.10 0.02 250)',
        },

        // Status colors
        'status-active': 'var(--status-active)',
        'status-completed': 'var(--status-completed)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Poppins', 'Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
        xl: 'calc(var(--radius) + 4px)',
        '2xl': 'calc(var(--radius) + 8px)',
      },
      boxShadow: {
        'navy': '0 4px 24px -4px oklch(0.10 0.02 250 / 0.6)',
        'saffron': '0 4px 24px -4px oklch(0.70 0.16 50 / 0.3)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [
    require('tailwindcss-animate'),
    require('@tailwindcss/typography'),
  ],
};
