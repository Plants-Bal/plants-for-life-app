// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // You might not need to specify 'root' if index.html is at the project root.
  // If index.html is NOT at the project root (e.g. in src/), you might need:
  // root: 'src', 
  // build: {
  //   outDir: '../dist' // Adjust if root is changed
  // }
  // But standard Vite expects index.html at the project root.
});
