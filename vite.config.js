export default {
  root: './',
  publicDir: 'public',
  base: './',
  server: {
    host: true
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: true,
    minify: true,
    // Important for GLB files
    assetsInlineLimit: 0
  },
  // Ensure GLB files are handled properly
  assetsInclude: ['**/*.glb']
}