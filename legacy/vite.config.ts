import { fileURLToPath, URL } from 'node:url';
import { resolve, dirname } from "node:path";

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import VueI18nPlugin from '@intlify/unplugin-vue-i18n/vite';
import { VitePWA } from 'vite-plugin-pwa';
import { compression } from 'vite-plugin-compression2';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue({
      template: {
        compilerOptions: {
          isCustomElement: (tag) => tag === 'video-player-container'
        }
      }
    }),
    tailwindcss(),
    VueI18nPlugin({
      runtimeOnly: false,
      include: resolve(dirname(fileURLToPath(import.meta.url)), './src/locales/**'),
    }),
    compression({ algorithms: ['gzip'], exclude: [/\.(br)$/, /\.(gz)$/] }),
    compression({ algorithms: ['brotliCompress'], exclude: [/\.(br)$/, /\.(gz)$/] }),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'logo.svg', 'apple-touch-icon-180x180.png', 'pwa-*.png', 'maskable-icon-512x512.png'],
      manifest: {
        name: 'Qiryna — Étudier à l\'étranger',
        short_name: 'Qiryna',
        description: 'Plateforme éducative pour trouver votre école, mentor et cours à l\'étranger.',
        theme_color: '#c0392b',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait-primary',
        start_url: '/',
        lang: 'fr',
        categories: ['education', 'travel'],
        icons: [
          {
            src: 'pwa-64x64.png',
            sizes: '64x64',
            type: 'image/png',
          },
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'maskable-icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webp,woff,woff2}'],
        maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\..*\/all-data/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-all-data',
              expiration: { maxAgeSeconds: 3600 },
            },
          },
          {
            urlPattern: /^https:\/\/.*\/storage\/.*/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'storage-images',
              expiration: { maxEntries: 100, maxAgeSeconds: 86400 },
            },
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '~bootstrap': resolve(__dirname, './node_modules/bootstrap'),
    },
  },
  server: {
    allowedHosts: ['.ngrok-free.app', '.ngrok.io','.share.zrok.io'],
    proxy: {
      '/api': {
        target: 'https://admin.stage.qiryna.com',
        changeOrigin: true,
        secure: true,
      },
    },
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
      'Cross-Origin-Embedder-Policy': 'unsafe-none',
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-vue': ['vue', 'vue-router', 'pinia', 'pinia-plugin-persistedstate'],
          'vendor-element': ['element-plus'],
          'vendor-i18n': ['vue-i18n'],
          'vendor-ui': ['@headlessui/vue', 'vue3-carousel'],
          'vendor-stripe': ['@stripe/stripe-js'],
        },
      },
    },
  },
});
