import { defineConfig } from 'vite'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  base: '/',
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        dashboard: resolve(__dirname, 'src/dashboard/dashboard.html'),
        login: resolve(__dirname, 'src/auth/login.html'),
        register: resolve(__dirname, 'src/auth/register.html'),
        result: resolve(__dirname, 'src/result/result.html')
      }
    },
    outDir: 'dist',
    emptyOutDir: true
  }
})
