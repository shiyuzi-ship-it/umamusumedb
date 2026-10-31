import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';
import { readFileSync } from 'node:fs';

// Skill detail pages that are marked noindex (evolved skills, and JP-only skills on the English site) stay out of the sitemap.
const skillsData = JSON.parse(readFileSync(new URL('./public/data/skills.json', import.meta.url), 'utf-8'));
const noindexSkillPaths = new Set();
for (const sk of skillsData) {
  if (sk.rarity === 'evolved') { noindexSkillPaths.add(`/skills/${sk.id}/`); noindexSkillPaths.add(`/ja/skills/${sk.id}/`); }
  else if (sk.server === 'jp') noindexSkillPaths.add(`/skills/${sk.id}/`);
}

export default defineConfig({
  site: 'https://umamusumedb.com',
  output: 'static',
  trailingSlash: 'always',
  integrations: [
    react(),
    tailwind({
      applyBaseStyles: false,
    }),
    sitemap({
      filter: (page) =>
        !page.includes('/api/') &&
        !page.includes('/admin/') &&
        !noindexSkillPaths.has(new URL(page).pathname),
      changefreq: 'weekly',
      priority: 0.7,
      lastmod: new Date(),
    }),
  ],
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'ja', 'zh'],
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