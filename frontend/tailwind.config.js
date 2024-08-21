import { addDynamicIconSelectors } from '@iconify/tailwind';

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'selector',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'arsenic': '#353D46',
        'dark-navy-blue': '#13141F',
        'eerie-black': '#181925',
        'lightGray': '#f4f4f4'
      },
      fontFamily: {
        sans: ['Open Sans', 'sans-serif'],
      }
    },
  },
  plugins: [
    // Iconify plugin
    addDynamicIconSelectors(),
  ],
}

