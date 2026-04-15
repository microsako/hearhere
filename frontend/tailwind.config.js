/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
    // 包含组件库的样式（确保组件库样式生效）
    "./node_modules/@wxperia/liquid-glass-vue/**/*.{vue,js,ts}"
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
