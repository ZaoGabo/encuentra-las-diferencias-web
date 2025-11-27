import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer';
import viteCompression from 'vite-plugin-compression';

export default defineConfig({
  plugins: [
    react(),
    // Optimización de imágenes - Convierte PNG a WebP y reduce tamaño
    ViteImageOptimizer({
      png: {
        quality: 80,
      },
      jpeg: {
        quality: 80,
      },
      webp: {
        quality: 80,
      },
    }),
    // Compresión Gzip
    viteCompression({
      algorithm: 'gzip',
      ext: '.gz',
      threshold: 1024, // Solo comprimir archivos > 1KB
    }),
    // Compresión Brotli (mejor que gzip)
    viteCompression({
      algorithm: 'brotliCompress',
      ext: '.br',
      threshold: 1024,
    }),
  ],
  build: {
    // Optimizaciones de build
    target: 'es2015',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Eliminar console.log en producción
        drop_debugger: true,
      },
    },
    rollupOptions: {
      output: {
        // Code splitting manual para optimizar carga
        manualChunks: {
          // Separar dependencias de React
          'react-vendor': ['react', 'react-dom'],
          // Separar iconos
          'icons': ['lucide-react'],
          // Separar componentes grandes
          'game-components': [
            './src/components/GameHeader',
            './src/components/ImageCanvas',
            './src/components/DifferencesPanel',
          ],
        },
        // Nombres de archivos con hash para mejor caching
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
      },
    },
    // Aumentar límite de chunk warning
    chunkSizeWarningLimit: 600,
  },
  // Optimizaciones de desarrollo
  server: {
    hmr: {
      overlay: true,
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: './src/setupTests.js',
    globals: true,
    coverage: {
      provider: 'v8'
    }
  }
});

