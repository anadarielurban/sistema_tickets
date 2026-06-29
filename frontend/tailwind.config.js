/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'municipio': {
          orange: '#E88251',
          yellow: '#F3C370',
          blue: '#3186BB',
          'blue-light': '#5DB5E1',
          teal: '#4B807D',
          'teal-light': '#769F9D',
          wine: '#7E274C',
          gray: '#514346',
          'gray-light': '#F0F0F0',
          white: '#FFFFFF',
        }
      }
    },
  },
  plugins: [],
}