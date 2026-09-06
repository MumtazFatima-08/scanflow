/** ScanFlow design tokens
 * Concept: a bright lab notebook / drafting table, not a generic light SaaS
 * dashboard. Warm paper-white base, hand-drawn-diagram amber ink for the
 * active signal, cool teal for data flow. Same token names as the original
 * dark build (ink-* / paper-* / signal-*) but with roles flipped: `ink` is
 * now literal ink — dark text and rule lines on paper — and `paper` is the
 * page itself. Monospace stays reserved for diegetic content (logs, rule
 * IDs, hashes) — never decoration on ordinary labels.
 */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Backgrounds, panels, borders — palest to boldest.
        ink: {
          950: '#FFFFFF',
          900: '#FAF8F3',
          800: '#F2EEE3',
          700: '#E6E0CF',
          600: '#D5CCB2',
          500: '#B6AA84',
        },
        // Text — darkest ink to faintest caption.
        paper: {
          100: '#211E13',
          300: '#524C39',
          500: '#8C8367',
        },
        signal: {
          amber: '#B5701C',
          amberDim: '#E9C892',
          teal: '#1F7F72',
          tealDim: '#BFE3DC',
          red: '#B23A2E',
          green: '#3D7D40',
        },
      },
      fontFamily: {
        sans: ['"Manrope"', 'system-ui', 'sans-serif'],
        display: ['"Space Grotesk"', '"Manrope"', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      boxShadow: {
        panel: '0 1px 0 0 rgba(255,255,255,0.6) inset, 0 1px 2px rgba(33,30,19,0.08)',
      },
      backgroundImage: {
        grid: 'linear-gradient(rgba(33,30,19,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(33,30,19,0.05) 1px, transparent 1px)',
      },
      backgroundSize: {
        grid: '28px 28px',
      },
    },
  },
  plugins: [],
}
