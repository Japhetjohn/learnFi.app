/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Primary Purple
        primary: {
          50: '#E0D9FF',
          100: '#E0D9FF',
          200: '#B5A3FF',
          300: '#8B6FFF',
          400: '#6A4BFF',
          500: '#4400FF',
          600: '#3700CC',
          700: '#2B0099',
          800: '#1F0066',
          900: '#130033',
        },
        // Accent Pink
        accent: {
          300: '#FFA3B7',
          400: '#FF7A92',
          500: '#FF4D6D',
          600: '#E64461',
          700: '#CC3B56',
        },
        // Dark Mode Neutrals
        dark: {
          primary: '#030305',
          secondary: '#0B0B0E',
          tertiary: '#151518',
          surface: '#1F1F23',
          border: '#2A2A2F',
        },
        // Light Mode Neutrals
        light: {
          primary: '#FFFFFF',
          secondary: '#F6F8FB',
          tertiary: '#EEF2F6',
          border: '#E1E8ED',
        },
        // Text Colors Dark Mode
        'text-dark': {
          primary: '#E6F0FF',
          secondary: '#B8C8E0',
          tertiary: '#8A9AB8',
          disabled: '#5A6A88',
        },
        // Text Colors Light Mode
        'text-light': {
          primary: '#0B0B0E',
          secondary: '#4A4A52',
          tertiary: '#6E6E78',
          disabled: '#9E9EA8',
        },
        // Semantic Colors
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
        info: '#3B82F6',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        display: ['Cal Sans', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      fontSize: {
        xs: '0.75rem',
        sm: '0.875rem',
        base: '1rem',
        lg: '1.125rem',
        xl: '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem',
        '4xl': '2.25rem',
        '5xl': '3rem',
      },
      borderRadius: {
        sm: '0.25rem',
        DEFAULT: '0.5rem',
        md: '0.75rem',
        lg: '1rem',
        xl: '1.5rem',
        '2xl': '2rem',
      },
      boxShadow: {
        sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        DEFAULT: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        glow: '0 0 20px rgba(68, 0, 255, 0.5)',
        'glow-pink': '0 0 20px rgba(255, 77, 109, 0.5)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('@tailwindcss/forms'),
    require('tailwindcss-animate'),
  ],
}
