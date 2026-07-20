/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Deep navy / charcoal canvas
        ink: {
          50: '#f4f5f8',
          100: '#e4e7ee',
          200: '#c8cede',
          300: '#a0abc4',
          400: '#7181a5',
          500: '#53628a',
          600: '#414d70',
          700: '#353f5b',
          800: '#20273b',
          900: '#151a29',
          950: '#0c0f1a',
        },
        // Warm gold / amber highlight
        gold: {
          50: '#fdf9ed',
          100: '#f8eecb',
          200: '#f1db93',
          300: '#e9c25a',
          400: '#e3ab33',
          500: '#d4901f',
          600: '#bb7018',
          700: '#9c5118',
          800: '#7f401a',
          900: '#6a3618',
          950: '#3d1c0a',
        },
        // Soft cream surfaces
        cream: {
          50: '#fdfcf9',
          100: '#faf6ee',
          200: '#f3ebd9',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['"Fraunces"', 'Georgia', 'serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(12, 15, 26, 0.04), 0 8px 24px rgba(12, 15, 26, 0.06)',
        'card-hover': '0 2px 4px rgba(12, 15, 26, 0.06), 0 16px 40px rgba(12, 15, 26, 0.1)',
      },
      keyframes: {
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(4px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.3s ease-out',
      },
    },
  },
  plugins: [],
};
