// @ts-check
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://eureadyseller.com',
  output: 'static',
  build: {
    format: 'directory',
  },
  compressHTML: true,
});
