#!/bin/bash

echo "🚀 重启 HearHere 项目..."

# 1. 重启后端服务
echo "📦 重启后端服务..."
cd /home/ubuntu/hearhere/backend

# 先删除旧进程（如果存在）
pm2 delete hearhere-backend 2>/dev/null

# 安装依赖（如果需要）
if [ ! -d "node_modules" ]; then
    echo "📥 安装后端依赖..."
    npm install
fi

# 启动后端（PM2 守护进程，关闭 SSH 也不会停）
pm2 start server.js --name hearhere-backend
echo "✅ 后端服务已重启"

# 2. 重启前端服务
echo "📦 重启前端服务..."
cd /home/ubuntu/hearhere/frontend

# 先删除旧进程（如果存在）
pm2 delete hearhere-frontend 2>/dev/null

# 安装依赖（如果需要）
if [ ! -d "node_modules" ]; then
    echo "📥 安装前端依赖..."
    npm install
fi

# 启动前端（PM2 守护进程，关闭 SSH 也不会停）
pm2 start /home/ubuntu/hearhere/ecosystem.config.js --only hearhere-frontend
echo "✅ 前端服务已重启"

echo ""
echo "✨ 项目重启完成！（守护进程模式，关闭 SSH 不会停止）"
echo "📍 前端地址: http://你的服务器IP:8080"
echo "📍 后端地址: http://localhost:3000"
echo ""
echo "查看日志："
echo "  pm2 logs hearhere-backend    # 后端日志"
echo "  pm2 logs hearhere-frontend   # 前端日志"
echo ""
echo "停止服务："
echo "  pm2 delete all               # 删除所有进程"
