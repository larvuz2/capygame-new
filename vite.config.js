export default {
  root: './',
  publicDir: 'public',
  base: './', // This ensures assets are loaded relative to the base URL
  server: {
    host: true
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: true,
    minify: true,
    // Important for GLB files - ensure they're not inlined
    assetsInlineLimit: 0,
    // Copy GLB files as-is without processing
    rollupOptions: {
      output: {
        manualChunks: undefined
      }
    }
  },
  // Ensure GLB files are handled properly
  assetsInclude: ['**/*.glb']
}