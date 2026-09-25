import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';
export default defineConfig({
  base: '/trail/',
  build: { outDir: '../trail', emptyOutDir: true, target: 'es2020', assetsInlineLimit: 0 },
  plugins: [VitePWA({
    registerType: 'autoUpdate',
    includeAssets: ['icon-192.png', 'icon-512.png'],
    manifest: { name: 'The Nomad Trail', short_name: 'Nomad Trail', description: 'Circumnavigate the planet in 365 days. Pack light. Trust no kettle.',
      start_url: '/trail/', scope: '/trail/', display: 'standalone', orientation: 'portrait', background_color: '#0b0f1a', theme_color: '#0b0f1a',
      icons: [{ src: 'icon-192.png', sizes: '192x192', type: 'image/png' }, { src: 'icon-512.png', sizes: '512x512', type: 'image/png' }] },
    workbox: {
      globPatterns: ['**/*.{js,css,html,png,json,ogg,wav,woff2}'], globIgnores: ['review/**'], maximumFileSizeToCacheInBytes: 6 * 1024 * 1024,
      // the review hub lives under /trail/review/ and must not be swallowed by the app-shell navigation fallback
      navigateFallbackDenylist: [/\/review(\/|$)/, /\/review\//],
    },
  })],
});
