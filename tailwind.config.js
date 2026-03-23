/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          // ─── Base surfaces ─────────────────────────────────────────────
          cream:        '#FAF6EF',   // warm page background
          'cream-dark': '#EDE5D4',   // section contrast, input backgrounds
          'cream-pale': '#FDF9F4',   // card backgrounds, hover surfaces

          // ─── Signature accent — deep wine ──────────────────────────────
          red:          '#7A1F2E',   // primary accent
          'red-dark':   '#5C1520',   // pressed / dark hover
          'red-light':  '#9E3348',   // light hover
          'red-pale':   '#F5E8EB',   // tinted badges, active nav bg

          // ─── Gold ───────────────────────────────────────────────────────
          gold:         '#9C6F2E',   // eyebrow labels, dividers, stars
          'gold-light': '#C49A4A',   // hover highlights
          'gold-pale':  '#F7EDD8',   // gold-tinted section backgrounds

          // ─── Warm amber (ribbon, decorative) ───────────────────────────
          orange:       '#B8622A',

          // ─── Text tokens ────────────────────────────────────────────────
          ink:          '#1C1109',   // primary body text
          'ink-soft':   '#4A3728',   // secondary text, captions
          'ink-muted':  '#8C7060',   // placeholders, disabled
        },
        dark: {
          bg:     '#1a1410',
          card:   '#231d17',
          border: '#3a2e24',
          text:   '#f0e8d6',
          muted:  '#b8a88a',
        },
      },
      fontFamily: {
        // Hero headings, brand name — the luxury editorial voice
        display: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        // Section headings, product names
        accent:  ['"Playfair Display"', 'Georgia', 'serif'],
        // Body copy, nav, UI, buttons — DM Sans (was Raleway)
        body:    ['"DM Sans"', 'system-ui', 'sans-serif'],
        // ALL-CAPS labels, ribbon, badges, eyebrow text
        label:   ['"Raleway"', 'system-ui', 'sans-serif'],
      },
      letterSpacing: {
        luxury:  '0.14em',  // uppercase label / tag text
        widest2: '0.22em',  // hero eyebrow / sub-labels
      },
      animation: {
        'scroll-left':      'scrollLeft 30s linear infinite',
        'scroll-left-fast': 'scrollLeft 15s linear infinite',
        'fade-in':          'fadeIn 0.6s ease forwards',
        'slide-up':         'slideUp 0.5s ease forwards',
        'shimmer':          'shimmer 1.5s infinite',
        'ribbon':           'ribbon 25s linear infinite',
        'float':            'float 3s ease-in-out infinite',
      },
      keyframes: {
        scrollLeft: {
          '0%':   { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        ribbon: {
          '0%':   { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%':      { transform: 'translateY(-8px)' },
        },
      },
    },
  },
  plugins: [],
};