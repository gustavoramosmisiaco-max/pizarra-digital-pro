import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  base: '/pizarra-digital-pro/',
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
  },
  optimizeDeps: {
    include: ['fabric', 'pdfjs-dist', 'jspdf', 'idb-keyval']
  }
});
