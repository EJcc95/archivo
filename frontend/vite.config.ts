import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    // Configurar headers para desarrollo
    headers: {
      // NO configurar CSP aquí - se maneja en el backend
      // Esto evita conflictos de CSP entre frontend y backend
    },
    port: 5173, // Puerto por defecto de Vite
    proxy: {
      // Opcional: Proxy para desarrollo (si el backend está en otro puerto)
      // '/api': {
      //   target: 'http://localhost:3001',
      //   changeOrigin: true,
      // }
    }
  },
})
