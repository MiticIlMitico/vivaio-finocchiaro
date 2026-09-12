/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        botanical: {
          DEFAULT: '#25570A',
          dark: '#183806',
          deep: '#122A04',
          light: '#357C0E',
          soft: '#B7BEA9',
          muted: '#8E9680',
          tint: '#EBF1E6',
        },
        campo: {
          DEFAULT: '#6BB221',
          hover: '#5F9E1D',
          light: '#EAF5DE',
          dark: '#4C8017'
        },
        ivory: {
          DEFAULT: '#F2F3EB',
          dark: '#E5E7DC',
          light: '#FAFBF8',
        },
        sicily: {
          DEFAULT: '#EA4707',
          hover: '#CF3B02',
          light: '#FDEEE8',
          dark: '#A63002'
        },
        charcoal: {
          DEFAULT: '#282B27',
          light: '#4B4F4A',
          muted: '#737871',
        },
        moss: {
          50: '#f4f7f4',
          100: '#e5ece6',
          200: '#cbd8ce',
          300: '#a3bcab',
          400: '#759b81',
          500: '#527e60',
          600: '#3d644a',
          700: '#25570a',
          800: '#1b3f07',
          900: '#122a04',
          950: '#0b1902'
        }
      },
      fontFamily: {
        sans: ['Manrope', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Cormorant Garamond', 'Georgia', 'serif'],
      }
    },
  },
  plugins: [],
}
