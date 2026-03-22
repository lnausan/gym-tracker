/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './app.jsx'],
  theme: {
    extend: {
      fontFamily: {
        heading: ['"Bebas Neue"', 'cursive'],
        body: ['"DM Sans"', 'sans-serif'],
      },
      colors: {
        gym: {
          bg: '#0a0a0f',
          card: 'rgba(255,255,255,0.05)',
          border: 'rgba(255,255,255,0.10)',
          muted: 'rgba(255,255,255,0.45)',
        },
        day: {
          lunes: '#ef4444',
          martes: '#f97316',
          miercoles: '#a855f7',
          jueves: '#22c55e',
          sabado: '#3b82f6',
        },
      },
      animation: {
        check: 'check 0.4s ease-out forwards',
        'pulse-glow': 'pulseGlow 1.5s ease-in-out infinite',
        'pr-pop': 'prPop 0.6s ease-out forwards',
        'slide-up': 'slideUp 0.3s ease-out forwards',
        'fade-in': 'fadeIn 0.2s ease-out forwards',
      },
      keyframes: {
        check: {
          '0%': { transform: 'scale(0)', opacity: '0' },
          '50%': { transform: 'scale(1.2)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 5px currentColor' },
          '50%': { boxShadow: '0 0 20px currentColor, 0 0 40px currentColor' },
        },
        prPop: {
          '0%': { transform: 'scale(0) rotate(-10deg)', opacity: '0' },
          '60%': { transform: 'scale(1.3) rotate(5deg)' },
          '100%': { transform: 'scale(1) rotate(0deg)', opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
