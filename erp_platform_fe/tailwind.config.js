/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'var(--color-primary, #0a65ff)',
          hover: 'var(--color-primary-hover, #0052d4)',
          light: 'var(--color-primary-light, #f0f6ff)',
        },
        bg: {
          primary: 'var(--color-bg-primary, #ffffff)',
          secondary: 'var(--color-bg-secondary, #f8fafc)',
          tertiary: 'var(--color-bg-tertiary, #f1f5f9)',
          sidebar: 'var(--color-bg-sidebar, #ffffff)',
        },
        text: {
          primary: 'var(--color-text-primary, #0f172a)',
          secondary: 'var(--color-text-secondary, #475569)',
          tertiary: 'var(--color-text-tertiary, #94a3b8)',
        }
      },
      transitionProperty: {
        width: 'width',
        spacing: 'margin, padding',
      }
    },
  },
  plugins: [],
  corePlugins: {
    preflight: false,
  }
}
