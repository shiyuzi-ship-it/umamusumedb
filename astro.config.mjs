import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  site: 'https://umamusumedb.com',
  output: 'static',
  trailingSlash: 'always',
  integrations: [
    react(),
    tailwind({
      applyBaseStyles: false,
    }),
  ],
  // Sitemaps are generated after the build by scripts/build-sitemaps.mjs (per locale, with hreflang alternates).
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'ja', 'zh', 'zh-tw', 'ko'],
    routing: {
      prefixDefaultLocale: false
    }
  },
  build: {
    // Ensure assets are properly handled
    assets: 'assets',
    // Output directory for Cloudflare Pages
    outDir: './dist'
  },
  // Prefetch links for better performance
  prefetch: {
    prefetchAll: true
  }
});