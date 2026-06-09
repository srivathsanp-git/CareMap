/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        border:     'hsl(var(--border))',
        input:      'hsl(var(--input))',
        ring:       'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary:    { DEFAULT: 'hsl(var(--primary))',     foreground: 'hsl(var(--primary-foreground))'     },
        secondary:  { DEFAULT: 'hsl(var(--secondary))',   foreground: 'hsl(var(--secondary-foreground))'   },
        destructive:{ DEFAULT: 'hsl(var(--destructive))', foreground: 'hsl(var(--destructive-foreground))' },
        muted:      { DEFAULT: 'hsl(var(--muted))',       foreground: 'hsl(var(--muted-foreground))'       },
        accent:     { DEFAULT: 'hsl(var(--accent))',      foreground: 'hsl(var(--accent-foreground))'      },
        card:       { DEFAULT: 'hsl(var(--card))',        foreground: 'hsl(var(--card-foreground))'        },
        sidebar:    { DEFAULT: 'hsl(var(--sidebar))',     foreground: 'hsl(var(--sidebar-foreground))',    accent: 'hsl(var(--sidebar-accent))', border: 'hsl(var(--sidebar-border))' },

        /* CareMap portal palette (warm-paper design system, §2 of UI spec) */
        paper:   '#FAF8F4',
        paper2:  '#F3EFE6',
        ink:     '#1A1A1A',
        ink2:    '#3A3A3A',
        sand:    '#8A8478',
        action:  '#2C5BAA',
        risk:    '#C9483D',
        ok:      '#4C7A3B',
        heat:    { low: '#C9E2BD', mid: '#F2E1A6', high: '#F2C6BF' },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      fontFamily: {
        sans:    ['Inter', 'system-ui', 'sans-serif'],
        display: ['Fraunces', 'Georgia', 'serif'],
        body:    ['"Public Sans"', 'Inter', 'system-ui', 'sans-serif'],
        mono:    ['"JetBrains Mono"', 'ui-monospace', 'Menlo', 'monospace'],
      },
      keyframes: {
        shimmer: { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
      },
      animation: {
        shimmer: 'shimmer 1.5s infinite',
      },
    },
  },
  plugins: [],
}
