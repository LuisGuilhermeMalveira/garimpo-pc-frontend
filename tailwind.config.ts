import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // paleta escura, densa e funcional (UX.md)
        base: '#0b0f14',
        surface: '#141a22',
        surface2: '#1b232d',
        borda: '#27313d',
        texto: '#e6edf3',
        muted: '#8b97a6',
        // veredito / frescor
        verde: '#3fb950',
        amarelo: '#d29922',
        laranja: '#db8a2a',
        vermelho: '#f85149',
        roxo: '#a371f7',
        azul: '#3b82f6',
      },
    },
  },
  plugins: [],
};

export default config;
