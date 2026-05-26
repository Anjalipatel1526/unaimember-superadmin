/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary:   '#4c58fa',
          secondary: '#3d45e8',
          tint:      '#EEF0FF',
          hover:     '#E8EAFD',
          active:    '#D6D9FB',
          border:    '#E5E7EB',
        },
        surface: {
          bg:      '#FFFFFF',
          sidebar: '#FFFFFF',
          card:    '#FFFFFF',
        },
        ink: {
          heading: '#111827',
          body:    '#374151',
          muted:   '#6B7280',
        },
      },
      fontFamily: {
        inter: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        card:       '0 1px 3px 0 rgb(0 0 0 / 0.06), 0 1px 2px -1px rgb(0 0 0 / 0.04)',
        'card-hover':'0 4px 12px 0 rgb(0 0 0 / 0.10), 0 2px 4px -1px rgb(0 0 0 / 0.06)',
      },
    },
  },
  plugins: [],
}
