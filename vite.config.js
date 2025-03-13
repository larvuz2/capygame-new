import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: './',
  publicDir: 'public',
  base: './',
  server: {
    host: true,
    // Add CORS headers for local development
    headers: {
      'Access-Control-Allow-Origin': '*',
    }
  },
  resolve: {
    alias: {
      // Add path aliases for easier imports
      '@': resolve(__dirname, './src'),
      '@assets': resolve(__dirname, './src/assets'),
    }
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: true,
    minify: true,
    // Copy model files to output
    assetsInlineLimit: 0, // Don't inline any assets (important for GLB files)
    rollupOptions: {
      output: {
        manualChunks: {
          // Split vendor code for better caching
          'vendor': ['three', '@dimforge/rapier3d-compat']
        }
      }
    }
  },
  // Special file handling for GLB files
  assetsInclude: ['**/*.glb']
})