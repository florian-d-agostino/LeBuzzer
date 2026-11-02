import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'



// Vite configuration
export default defineConfig({

    plugins: [react()],

    // SockJS expects global
    define: {
        global: 'globalThis',
    },

    server: {
        port: 5173,
    },

})
