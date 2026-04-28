/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          bg: '#490665',
          surface: '#6A1067',
          border: '#880579',
          primary: '#E514A3',
          hover: '#E23BBF',
          accent: '#F96DEA',
        }
      }
    },
  },
  plugins: [],
}
