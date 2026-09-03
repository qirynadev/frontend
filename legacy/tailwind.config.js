/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx,vue}",
  ],
  theme: {
    extend: {
      fontFamily: {
        poppins: ['Poppins', 'Segoe UI', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Design tokens "Étudier en France" (handoff Qiryna)
        qiryna: {
          red: '#FC1E3D',
          'red-hover': '#E2122F',
          'red-press': '#C70E29',
          navy: '#0A1330',
          'navy-deep': '#14264F',
          'icon-navy': '#1A2247',
          text: '#5A6387',
          muted: '#8085A9',
          border: '#E9EBF2',
          'border-2': '#EEF0F6',
          'badge-bg': '#FEF5F6',
          blue: '#E5ECFB',
          green: '#E3F3E4',
          pink: '#FCE7EE',
          purple: '#ECE9F8',
          orange: '#FDEBD8',
        },
        // Tokens sémantiques clair/sombre (résolus via variables CSS, voir src/assets/styles/theme/tokens.css)
        surface: 'var(--color-surface)',
        'surface-alt': 'var(--color-surface-alt)',
        'surface-tint': 'var(--color-surface-tint)',
        ink: 'var(--color-ink)',
        'ink-muted': 'var(--color-ink-muted)',
        'border-default': 'var(--color-border)',
      },
      borderRadius: {
        'q-sm': '12px',
        'q-md': '14px',
        'q-card': '16px',
        'q-lg': '18px',
        'q-xl': '24px',
      },
      boxShadow: {
        'q-btn': '0 14px 26px rgba(252,30,61,.30)',
        'q-card': '0 20px 50px rgba(10,19,48,.08)',
        'q-nav': '0 4px 24px rgba(10,19,48,.06)',
        'q-soft': '0 10px 30px rgba(10,19,48,.06)',
      },
    },
  },
  plugins: [],
}
