/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#6C63FF',
        secondary: '#FF6B6B',
        background: '#1a1a2e',
        surface: '#16213e',
        card: '#0f3460',
        success: '#4CAF50',
        warning: '#FF9800',
        danger: '#F44336',
      },
    },
  },
  plugins: [],
}
