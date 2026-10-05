/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eef7f0',
          100: '#d5ecd9',
          200: '#aadbba',
          300: '#6dc389',
          400: '#3da663',
          500: '#22884a',
          600: '#1a6d3b',
          700: '#165731',
          800: '#134528',
          900: '#0f3720',
          950: '#071f12',
        },
        accent: {
          50: '#fdf4e7',
          100: '#fbe6c3',
          200: '#f7cc86',
          300: '#f2ac42',
          400: '#ee9520',
          500: '#df7a0e',
          600: '#c45b09',
          700: '#a33f0b',
          800: '#863311',
          900: '#6f2b12',
          950: '#3f1406',
        },
        dark: {
          50: '#f6f6f7',
          100: '#e1e3e5',
          200: '#c3c6cb',
          300: '#9da2a9',
          400: '#797f88',
          500: '#5f656e',
          600: '#4b5058',
          700: '#3f4349',
          800: '#2a2d31',
          900: '#1a1c1f',
          950: '#111214',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Outfit', 'Inter', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        'spin-slow': 'spin 3s linear infinite',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'bounce-gentle': 'bounceGentle 2s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        bounceGentle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        }
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
        'glass-sm': '0 4px 16px 0 rgba(31, 38, 135, 0.1)',
        'glow': '0 0 20px rgba(34, 136, 74, 0.3)',
        'glow-accent': '0 0 20px rgba(238, 149, 32, 0.3)',
      },
    },
  },
  plugins: [],
}
