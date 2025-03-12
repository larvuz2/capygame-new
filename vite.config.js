// vite.config.js
export default {
  // Base public path when served in production
  base: './',
  
  // Configure server options
  server: {
    // Open browser on server start
    open: true,
    // Configure CORS for the dev server
    cors: true
  }
};