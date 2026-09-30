import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: { app: 'index.html', typography: 'typography.html' },
    },
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  base: './', // Relative path to the root of the domain
});
