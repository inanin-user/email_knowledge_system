
import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],

  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',

        surface: 'var(--surface)',
        'surface-muted': 'var(--surface-muted)',
        border: 'var(--border)',

        confirm: 'var(--confirm)',
        'confirm-hover': 'var(--confirm-hover)',
        'confirm-foreground': 'var(--confirm-foreground)',

        cancel: 'var(--cancel)',
        'cancel-hover': 'var(--cancel-hover)',
        'cancel-foreground': 'var(--cancel-foreground)',

        selected: 'var(--selected)',
        'selected-hover': 'var(--selected-hover)',
        'selected-foreground': 'var(--selected-foreground)',

        'root-cause': 'var(--root-cause)',
        'root-cause-border': 'var(--root-cause-border)',
        'root-cause-foreground': 'var(--root-cause-foreground)',

        'message-user': 'var(--message-user)',
        'message-user-foreground':
          'var(--message-user-foreground)',
        'message-reply': 'var(--message-reply)',
        'message-reply-foreground':
          'var(--message-reply-foreground)',
      },

      fontFamily: {
        sans: [
          'Arial',
          'Helvetica',
          'sans-serif',
        ],
        mono: [
          'var(--font-geist-mono)',
          'monospace',
        ],
      },

      borderRadius: {
        xl: '0.75rem',
      },
    },
  },

  plugins: [],
};

export default config;
