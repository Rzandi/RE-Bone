import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
import path from 'path'

import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    vue(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: {
          enabled: true
      },
      includeAssets: ['pwa-icon.png', 'Logo_Skull.jpg'],
      manifest: {
        name: 'Re:BONE',
        short_name: 'Re:BONE',
        description: 'Retro Pixel Art Dungeon Crawler',
        theme_color: '#111111',
        background_color: '#111111',
        display: 'standalone',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'pwa-icon.png',
            sizes: '1024x1024',
            type: 'image/png',
            purpose: 'any'
          }
        ],
        shortcuts: [
            {
                name: "Daily Challenge",
                short_name: "Daily",
                description: "Play today's challenge run",
                url: "/?action=daily",
                icons: [{ src: "pwa-icon.png", sizes: "1024x1024", type: "image/png" }]
            },
            {
                name: "Inventory",
                short_name: "Bag",
                description: "Check your items",
                url: "/?action=inventory",
                icons: [{ src: "pwa-icon.png", sizes: "1024x1024", type: "image/png" }]
            }
        ]
      }
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@game': path.resolve(__dirname, './src/game'),
    },
  },
})
