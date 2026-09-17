import react from '@vitejs/plugin-react'
import basicSsl from '@vitejs/plugin-basic-ssl'
import { VitePWA } from 'vite-plugin-pwa'
import { defineConfig } from 'vitest/config'

const isTest = process.env.VITEST === 'true'
const httpsDev =
  process.env.HTTPS === '1' || process.env.npm_lifecycle_event === 'dev:https'

export default defineConfig({
  base: '/facthunter/',
  plugins: [
    react(),
    ...(!isTest && httpsDev ? [basicSsl()] : []),
    ...(!isTest
      ? [
          VitePWA({
            strategies: 'injectManifest',
            srcDir: 'src',
            filename: 'sw.ts',
            registerType: 'prompt',
            injectRegister: false,
            includeAssets: [
              'icon.png',
              'empty-journal.png',
              'hunter-badge.png',
            ],
            injectManifest: {
              globPatterns: [
                '**/*.{js,css,html,ico,png,svg,webmanifest}',
              ],
            },
            manifest: {
              name: 'FactHunter',
              short_name: 'FactHunter',
              lang: 'nb',
              start_url: '/facthunter/',
              scope: '/facthunter/',
              display: 'standalone',
              background_color: '#f3ead7',
              theme_color: '#0a2f2e',
              icons: [
                {
                  src: 'icon.png',
                  sizes: '512x512',
                  type: 'image/png',
                  purpose: 'any',
                },
                {
                  src: 'icon.png',
                  sizes: '512x512',
                  type: 'image/png',
                  purpose: 'maskable',
                },
              ],
            },
          }),
        ]
      : []),
  ],
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
    setupFiles: ['./src/test-setup.ts'],
  },
})
