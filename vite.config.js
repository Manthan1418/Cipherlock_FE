import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    build: {
        sourcemap: false,
        chunkSizeWarningLimit: 900,
        rollupOptions: {
            output: {
                manualChunks: {
                    vendor_react: ['react', 'react-dom', 'react-router-dom'],
                    vendor_firebase: ['firebase/app', 'firebase/auth'],
                    vendor_motion: ['framer-motion'],
                    vendor_charts: ['recharts'],
                    vendor_three: ['three', '@react-three/fiber', '@react-three/drei'],
                },
            },
        },
    },
})
