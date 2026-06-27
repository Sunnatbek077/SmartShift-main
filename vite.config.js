import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Production build uchun base path
  base: './',
  server: {
    proxy: {
      '/yandex-api': {
        target: 'https://tts.api.cloud.yandex.net',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/yandex-api/, '')
      }
    }
  },
  test: {
    globals: true,
    environment: 'jsdom'
  }
})
