/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // Los colores se manejan desde index.css con variables CSS + @layer utilities
      // Aquí solo extendemos lo que Tailwind NO cubre por defecto
      spacing: {
        'sidebar-width': '280px',
        'container-margin': '24px',
      },
      fontFamily: {
        'public-sans': ['Public Sans', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
