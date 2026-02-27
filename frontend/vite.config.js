import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
    plugins: [react()],
    server: {
        proxy: {
            '/api': {
                target: 'http://localhost:8000',
                changeOrigin: true,
            }
        }
    },
    define: {
        // Expose VITE_API_URL to the app at build time (used in production)
        __API_URL__: JSON.stringify(process.env.VITE_API_URL || '')
    }
}))
