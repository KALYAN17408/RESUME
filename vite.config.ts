/// <reference types="vitest" />
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const verificationToken = env.VITE_GOOGLE_SITE_VERIFICATION?.trim() || '';

  return {
    plugins: [
      react(),
      {
        name: 'google-site-verification-transform',
        transformIndexHtml(html: string) {
          const metaTag = verificationToken
            ? `<meta name="google-site-verification" content="${verificationToken}" />`
            : '<!-- Google Search Console verification tag: configure VITE_GOOGLE_SITE_VERIFICATION in .env -->';
          return html.replace('<!-- %GOOGLE_SITE_VERIFICATION% -->', metaTag);
        },
      },
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      port: 5173,
      host: true,
    },
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: ['./tests/setup.ts'],
      css: false,
      include: ['tests/**/*.{test,spec}.{ts,tsx}'],
    },
  };
});
