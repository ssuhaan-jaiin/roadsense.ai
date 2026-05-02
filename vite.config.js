import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    {
      name: 'roadsense-index-meta',
      transformIndexHtml(html) {
        const env = loadEnv(mode, process.cwd(), '')
        const site = (env.VITE_SITE_URL || '').trim().replace(/\/$/, '')
        /** WhatsApp prefers an absolute HTTPS URL for previews */
        const ogImage =
          site ? `${site}/og-preview.png` : '/og-preview.png'
        return html.replace(/%OG_IMAGE%/g, ogImage)
      }
    }
  ],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true
      }
    }
  },
  preview: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true
      }
    }
  }
}))
