// @ts-check
import { defineConfig, fontProviders } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

import icon from "astro-icon";

// https://astro.build/config
export default defineConfig({
  site: 'https://s1nn3rv2.github.io',
  base: '/portfolio/',
  vite: {
    plugins: [tailwindcss()]
  },

  fonts: [{
    provider: fontProviders.google(),
    name: "JetBrains Mono",
    cssVariable: "--font-mono",
  },
  {
    provider: fontProviders.google(),
    name: "Inter",
    cssVariable: "--font-sans",
    subsets: ["latin", "latin-ext"],
  }],

  integrations: [icon({
    include: {
      mdi: ["github", "code-braces", "email", "linkedin", "briefcase-outline", "folder-open", "heart", "steam", "google-play", "web", "language-typescript", "console", "email-outline", "send"],
  }})]
});
