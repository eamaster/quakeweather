import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  base: '/quakeweather/', // Base path for deployment on hesam.me/quakeweather/
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src/client'),
      '@server': path.resolve(__dirname, './src/server'),
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'mapbox-gl': ['mapbox-gl'],
          'react-vendor': ['react', 'react-dom'],
        },
      },
    },
  },
  server: {
    proxy: {
      // Proxy API requests to Pages dev server
      // Works with both /api/* and /quakeweather/api/* paths
      '/api': {
        target: 'http://localhost:8787',
        changeOrigin: true,
      },
      '/quakeweather/api': {
        target: 'http://localhost:8787',
        changeOrigin: true,
        rewrite: (path) => path.replace('/quakeweather', ''),
      },
    },
  },
});

