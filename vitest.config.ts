import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

/**
 * Les adapters et le client bas niveau sont volontairement **purs** : ni Vue, ni
 * Nuxt, ni réseau. Ils se testent donc sans environnement Nuxt, ce qui garde la
 * suite instantanée.
 */
export default defineConfig({
  resolve: {
    alias: {
      '~': fileURLToPath(new URL('./app', import.meta.url)),
      '~~': fileURLToPath(new URL('.', import.meta.url)),
    },
  },
  test: {
    environment: 'node',
    include: ['tests/**/*.spec.ts'],
    coverage: {
      provider: 'v8',
      include: ['app/core/adapters/**', 'app/core/http/api-client.ts', 'app/core/http/errors.ts'],
      reporter: ['text', 'html'],
    },
  },
})
