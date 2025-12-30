// /** @type {import('tailwindcss').Config} */
// export default {
//   content: ['./index.html', './src/**/*.{ts,tsx}'],
//   theme: { extend: {} },
//   plugins: [],
// }


module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{ts,tsx,js,jsx}",
    "./src/styles/**/*.css",   // include pro.css
  ],
  theme: { extend: {} },
  plugins: [],
}