/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        cream: '#FAF8F5',
        'warm-gray': '#F2EDE7',
        'warm-dark': '#E8E0D5',
        stone: { 900: '#1C1917', 700: '#44403C', 500: '#78716C' },
        teal: { 600: '#0D9488', 500: '#14B8A6', 200: '#99F6E4' },
        amber: { 600: '#D97706', 500: '#F59E0B', 200: '#FEF3C7' },
        border: '#D6D3D1',
      },
      fontFamily: {
        display: ['"DM Serif Display"', 'Georgia', 'serif'],
        body: ['"DM Sans"', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      animation: {
        'pulse-dot': 'pulseDot 2s infinite',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        pulseDot: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.4' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
