/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'carriya-green': '#2ECC71',
        'carriya-dark': '#101820',
        'carriya-gray': '#A9A9A9',
        'carriya-light-gray': '#949494',
        'carriya-yellow': '#E5E523',
        'carriya-light-green': '#C7FFDF',
      },
      fontFamily: {
        'roboto': ['Roboto', 'sans-serif'],
        serif: ['"Playfair Display"', 'serif'],
        'nunito': ['Nunito', 'sans-serif'],
        'poppins': ['Poppins', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
