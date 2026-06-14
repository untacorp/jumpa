import { defineConfig } from 'astro/config';
import node from '@astrojs/node';
import react from '@astrojs/react';
import svelte from '@astrojs/svelte';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  output: 'server',
  adapter: node({
    mode: 'standalone'
  }),
  integrations: [
    react({ include: ['**/react/**/*'] }),
    svelte()
  ],
  server: {
    host: true,
    port: 4321
  },
  vite: {
    plugins: [tailwindcss()],
    server: {
      allowedHosts: ['web-app', 'localhost', '127.0.0.1']
    },
    resolve: {
      dedupe: ['react', 'react-dom']
    },
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'react-dom/client'
      ],
      exclude: [
        'svelte'
      ]
    }
  }
});
