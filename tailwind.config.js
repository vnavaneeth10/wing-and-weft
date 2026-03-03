/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          cream: '#e9e3cb',
          red: '#bc3d3e',
          orange: '#e69358',
          gold: '#b6893c',
          'cream-dark': '#d4cdb0',
          'red-dark': '#9e3233',
          'red-light': '#d44f50',
          'gold-light': '#c8a050',
        },
        dark: {
          bg: '#1a1410',
          card: '#231d17',
          border: '#3a2e24',
          text: '#f0e8d6',
          muted: '#b8a88a',
        }
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        body: ['"Raleway"', 'sans-serif'],
        accent: ['"Playfair Display"', 'serif'],
      },
      animation: {
        'scroll-left': 'scrollLeft 30s linear infinite',
        'scroll-left-fast': 'scrollLeft 15s linear infinite',
        'fade-in': 'fadeIn 0.6s ease forwards',
        'slide-up': 'slideUp 0.5s ease forwards',
        'shimmer': 'shimmer 1.5s infinite',
        'ribbon': 'ribbon 25s linear infinite',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        scrollLeft: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        ribbon: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
      },
    },
  },
  plugins: [],
};
