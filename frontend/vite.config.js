import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';

export default defineConfig({
  plugins: [vue()],
  base: './',
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  server: {
    host: '0.0.0.0',
    port: 8080,
    open: false,
    cors: true,
    strictPort: true,
    hmr: {
      host: '118.89.119.213',
      port: 8080
    }
  }
});