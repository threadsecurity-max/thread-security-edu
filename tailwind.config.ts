import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1440px',
      },
    },
    screens: {
      xs: '320px',
      sm: '480px',
      md: '640px',
      lg: '768px',
      xl: '1024px',
      '2xl': '1280px',
      '3xl': '1440px',
      '4xl': '1920px',
    },
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: '#FFFFFF',
          dark: '#E6E6E6',
          foreground: '#000000',
        },
        secondary: {
          DEFAULT: '#000000',
          light: '#1D1D1D',
          foreground: '#FFFFFF',
        },
        security: {
          green: '#C6FF34',
          'green-soft': '#DFF8EA',
          'green-dark': '#1BA85C',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          dark: '#1D1D1D',
          muted: '#FFFFFF',
        },
        muted: {
          DEFAULT: '#66737D',
          foreground: '#66737D',
        },
        accent: {
          DEFAULT: '#000000',
          foreground: '#C6FF34',
        },
        card: {
          DEFAULT: '#FFFFFF',
          dark: '#1D1D1D',
          foreground: '#000000',
        },
        ai: {
          violet: '#7E3BED',
          'violet-dark': '#330066',
          'violet-light': '#6F2DA8',
          text: '#FFFFFF',
          secondary: '#FFFFFF',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'sans-serif'],
        display: ['var(--font-outfit)', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Courier New', 'monospace'],
      },
      borderRadius: {
        lg: '16px',
        md: '12px',
        sm: '8px',
        xl: '20px',
        '2xl': '24px',
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
        'pulse-subtle': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'pulse-subtle': 'pulse-subtle 3s ease-in-out infinite',
      },
      boxShadow: {
        glass: '0 8px 32px 0 rgba(7, 26, 43, 0.12)',
        'glass-hover': '0 12px 40px 0 rgba(7, 26, 43, 0.18)',
        neo: '4px 4px 10px rgba(4, 17, 28, 0.15), -4px -4px 10px rgba(255, 255, 255, 0.8)',
        'neo-inset': 'inset 2px 2px 5px rgba(4, 17, 28, 0.2), inset -2px -2px 5px rgba(255, 255, 255, 0.7)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
