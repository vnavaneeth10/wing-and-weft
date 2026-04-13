import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import sitemap from 'vite-plugin-sitemap'

export default defineConfig({
  plugins: [
    react(),
    sitemap({
      hostname: 'https://wingandweft.com',  // ← replace with your actual domain
      dynamicRoutes: [
        '/',
        '/categories',
        '/our-story',
        '/contact',
        '/search',
      ],
      exclude: [
        '/admin',
        '/admin/*',
        '/404',
      ],
    }),
  ],
  server: {
    port: 3000,
    open: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          icons: ['lucide-react'],
        },
      },
    },
  },
})