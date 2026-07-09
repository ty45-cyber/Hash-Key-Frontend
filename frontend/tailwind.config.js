/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        slate: { 950: '#0a0e14', 900: '#111722', 850: '#161d2b', 800: '#1c2534' },
        accent: { DEFAULT: '#4f7cac', muted: '#3a5a80' },
        verdict: { pass: '#3d8f6f', hold: '#c98a2e', block: '#c0483d' },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
    },
  },
  plugins: [],
}