/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          50: '#FAF8F5',
          100: '#FAF6F0',
          200: '#F4EAE0',
          300: '#EADBC8',
        },
        cozy: {
          beige: '#FAF6F0',
          brown: '#8D7B68',
          wood: '#6F5F50',
          darkWood: '#4A3E3D',
          terracotta: '#C87A53',
          moss: '#A8B296',
          lavender: '#E1D9EC',
          sage: '#B2C8BA',
          sand: '#EAD8C0',
          sunset: '#E78895'
        }
      },
      fontFamily: {
        cozy: ['Quicksand', 'Gaegu', 'Inter', 'sans-serif'],
        display: ['Playfair Display', 'serif'],
      },
      boxShadow: {
        'cozy': '0 8px 30px rgba(141, 123, 104, 0.12)',
        'cozy-hover': '0 12px 40px rgba(141, 123, 104, 0.2)',
        'glass': '0 8px 32px 0 rgba(141, 123, 104, 0.08)',
      },
      borderRadius: {
        'cozy': '20px',
        'cozy-lg': '32px'
      },
      animation: {
        'coffee-steam': 'steam 4s ease-in-out infinite',
        'float-lantern': 'float 6s ease-in-out infinite',
        'cloud-move': 'cloudMove 120s linear infinite',
        'fire-flicker': 'fireFlicker 0.2s ease-in-out infinite',
        'vinyl-spin': 'spin 12s linear infinite',
      },
      keyframes: {
        steam: {
          '0%, 100%': { transform: 'translateY(0) scale(0.9) opacity(0.2)' },
          '50%': { transform: 'translateY(-15px) scale(1.1) opacity(0.6)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
          '50%': { transform: 'translateY(-12px) rotate(2deg)' },
        },
        cloudMove: {
          '0%': { transform: 'translateX(-10%)' },
          '100%': { transform: 'translateX(110%)' },
        },
        fireFlicker: {
          '0%, 100%': { transform: 'scale(1) rotate(-2deg)', opacity: 0.95 },
          '50%': { transform: 'scale(1.05) rotate(2deg)', opacity: 1 },
        }
      }
    },
  },
  plugins: [],
}
