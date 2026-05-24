/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Lavanderia OS palette
        stone: {
          50: '#FAF8F5',
          100: '#F2EDE7',
          200: '#E8E0D5',
          300: '#D6D3D1',
          400: '#A8A29E',
          500: '#78716C',
          600: '#57534E',
          700: '#44403C',
          800: '#292524',
          900: '#1C1917',
          950: '#0A0908',
        },
        teal: {
          50: '#F0FDFA',
          100: '#CCFBF1',
          200: '#99F6E4',
          300: '#5EEAD4',
          400: '#2DD4BF',
          500: '#14B8A6',
          600: '#0D9488',
          700: '#0F766E',
          800: '#115E59',
          900: '#134E4A',
        },
        amber: {
          50: '#FFFBEB',
          100: '#FEF3C7',
          200: '#FDE68A',
          300: '#FCD34D',
          400: '#FBBF24',
          500: '#F59E0B',
          600: '#D97706',
          700: '#B45309',
        },
      },
      fontFamily: {
        display: ['DM Serif Display', 'Georgia', 'serif'],
        body: ['DM Sans', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      fontSize: {
        '2xs': ['0.6875rem', { lineHeight: '1.2' }],
        xs: ['0.75rem', { lineHeight: '1.2' }],
        sm: ['0.8125rem', { lineHeight: '1.3' }],
        base: ['0.875rem', { lineHeight: '1.5' }],
        lg: ['0.9375rem', { lineHeight: '1.5' }],
        xl: ['1.125rem', { lineHeight: '1.3' }],
        '2xl': ['1.25rem', { lineHeight: '1.2' }],
        '3xl': ['1.5rem', { lineHeight: '1.15' }],
        '4xl': ['2rem', { lineHeight: '1.1' }],
        '5xl': ['2.5rem', { lineHeight: '1.1' }],
      },
      borderRadius: {
        sm: '0.375rem',
        md: '0.75rem',
        lg: '1rem',
        xl: '1.5rem',
      },
      boxShadow: {
        'sm': '0 1px 2px rgba(28,25,23,0.05)',
        'md': '0 4px 12px rgba(28,25,23,0.08)',
        'lg': '0 8px 30px rgba(28,25,23,0.12)',
        'xl': '0 16px 50px rgba(28,25,23,0.16)',
      },
      spacing: {
        '4.5': '1.125rem',
        '18': '4.5rem',
        'sidebar': '260px',
        'topbar': '60px',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease',
        'slide-up': 'slideUp 0.3s ease',
        'pulse-dot': 'pulseDot 2s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseDot: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.4' },
        },
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
