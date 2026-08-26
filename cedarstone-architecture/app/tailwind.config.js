/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink:    '#08090A',   // page ground
        char:   '#0E1012',   // panel
        char2:  '#15181B',   // raised panel
        line:   'rgba(245,245,243,0.10)',
        line2:  'rgba(245,245,243,0.22)',
        bone:   '#F5F5F3',   // primary type
        ash:    '#A8ABAA',   // secondary type
        dim:    '#6B6F70',   // tertiary type
        ember:  '#D99A5B',   // interior light, single accent
        emberD: '#8C5F33'
      },
      fontFamily: {
        display: ['Archivo', 'Helvetica Neue', 'Arial', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace']
      },
      letterSpacing: {
        tightest: '-0.045em',
        label: '0.22em'
      },
      transitionTimingFunction: {
        arch: 'cubic-bezier(0.16, 1, 0.3, 1)'
      }
    }
  },
  plugins: []
};
