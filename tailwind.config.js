/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Forge color palette
        'void': '#0B0B0C',
        'charred': '#121316',
        'steel': '#16181D',
        'steel-light': '#1E2127',
        'mournshard': '#C8A04A',
        'ember': '#F59E0B',
        'shadow': '#8B1E2E',
        'text-primary': '#EDEEF0',
        'text-muted': '#A5AAB4'
      },
      fontFamily: {
        'headline': ['Archivo Black', 'system-ui', 'sans-serif'],
        'body': ['Inter', 'system-ui', 'sans-serif'],
        'wisdom': ['Merriweather', 'serif']
      },
      animation: {
        'forge-strike': 'forgeStrike 0.3s ease-out',
        'ember-glow': 'emberGlow 2s ease-in-out infinite',
        'gold-pulse': 'goldPulse 0.4s ease-out',
        'molten-pour': 'moltenPour 0.6s ease-out'
      },
      keyframes: {
        forgeStrike: {
          '0%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(0.95)', opacity: '0.9' },
          '100%': { transform: 'scale(1)', opacity: '1' }
        },
        emberGlow: {
          '0%, 100%': { opacity: '0.5', filter: 'drop-shadow(0 0 10px #F59E0B)' },
          '50%': { opacity: '0.8', filter: 'drop-shadow(0 0 20px #F59E0B)' }
        },
        goldPulse: {
          '0%': { backgroundColor: '#121316' },
          '50%': { backgroundColor: '#C8A04A', transform: 'scale(1.02)' },
          '100%': { backgroundColor: '#121316' }
        },
        moltenPour: {
          '0%': { transform: 'scaleX(0)', transformOrigin: 'left' },
          '100%': { transform: 'scaleX(1)', transformOrigin: 'left' }
        }
      },
      boxShadow: {
        'forge': '0 4px 20px rgba(0, 0, 0, 0.5), inset 0 1px 2px rgba(200, 160, 74, 0.1)',
        'ember': '0 0 30px rgba(245, 158, 11, 0.3)'
      },
      backgroundImage: {
        'stone-texture': 'url("data:image/svg+xml,%3Csvg width="100" height="100" xmlns="http://www.w3.org/2000/svg"%3E%3Cfilter id="noise"%3E%3CfeTurbulence baseFrequency="0.9" numOctaves="4" /%3E%3C/filter%3E%3Crect width="100" height="100" filter="url(%23noise)" opacity="0.03"/%3E%3C/svg%3E")'
      }
    },
  },
  plugins: [],
}