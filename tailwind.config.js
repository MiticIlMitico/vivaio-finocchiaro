/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        moss: {
          50: '#f4f7f4',
          100: '#e5ece6',
          200: '#cbd8ce',
          300: '#a3bcab',
          400: '#759b81',
          500: '#527e60',
          600: '#3d644a',
          700: '#2c4b37',
          800: '#1b3524',
          900: '#122418',
          950: '#09130d'
        },
        clay: {
          50: '#fdf7f4',
          100: '#faeee7',
          200: '#f3d9cb',
          300: '#e8bba4',
          400: '#d79475',
          500: '#c57451',
          600: '#b05737',
          700: '#8e432a',
          800: '#743725',
          900: '#5f3022'
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Fraunces', 'Georgia', 'serif'],
      }
    },
  },
  plugins: [],
}
