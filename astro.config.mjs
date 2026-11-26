import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// For a GitHub "user site" (repository named USERNAME.github.io) the site lives
// at the root of the domain, so no `base` is needed.
export default defineConfig({
  // The final public address. Used for the sitemap and canonical links.
  site: 'https://poonam-bhadane.github.io',
  output: 'static',
  trailingSlash: 'ignore',
  integrations: [sitemap()],
});
