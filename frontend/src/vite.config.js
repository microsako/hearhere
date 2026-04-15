// hearhere/frontend/vite.config.js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 8080, // 强制指定端口为 8080
    host: '0.0.0.0' // 可选：允许外部访问（比如服务器IP）
  }
})