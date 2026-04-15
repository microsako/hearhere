#!/bin/bash

# HearHere 项目启动脚本

echo "🚀 启动 HearHere 项目..."

# 1. 启动后端服务
echo "📦 启动后端服务..."
cd /home/ubuntu/hearhere/backend

# 检查后端是否已运行
if pm2 describe hearhere-backend 2>/dev/null | grep -q "online"; then
    echo "✅ 后端服务已在运行"
else
    # 安装依赖（如果需要）
    if [ ! -d "node_modules" ]; then
        echo "📥 安装后端依赖..."
        npm install
    fi
    
    # 启动后端
    pm2 start server.js --name hearhere-backend
    echo "✅ 后端服务已启动"
fi

# 2. 启动前端服务
echo "📦 启动前端服务..."
cd /home/ubuntu/hearhere/frontend

# 检查前端是否已运行
if pm2 describe hearhere-frontend 2>/dev/null | grep -q "online"; then
    echo "✅ 前端服务已在运行"
else
    # 安装依赖（如果需要）
    if [ ! -d "node_modules" ]; then
        echo "📥 安装前端依赖..."
        npm install
    fi
    
    # 使用PM2启动前端（持久化）
    pm2 start /home/ubuntu/hearhere/ecosystem.config.js --only hearhere-frontend
    echo "✅ 前端服务已启动"
fi

echo ""
echo "✨ 项目启动完成！"
echo "📍 前端地址: http://你的服务器IP:8080"
echo "📍 后端地址: http://localhost:3000"
echo ""
echo "查看日志："
echo "  pm2 logs hearhere-backend    # 后端日志"
echo "  pm2 logs hearhere-frontend   # 前端日志"
echo ""
echo "停止服务："
echo "  pm2 stop all                 # 停止所有服务"
echo ""
echo "重要：执行以下命令保存PM2进程列表（服务器重启后自动恢复）："
echo "  pm2 save"
