#!/bin/bash

set -e
 
echo "🔵 Custom deploy script running..."
 
# Force use of the correct npm bundled with Node v22

export PATH="/c/Program Files/nodejs:$PATH"
 
echo "Node version: $(node -v)"

echo "NPM version: $(npm -v)"

echo "Current directory: $(pwd)"
 
# Clean old builds

rm -rf build
 
echo "📦 Installing dependencies..."

npm install --legacy-peer-deps
 
echo "🏗️ Building React app..."

npm run build
 
# Deploy

mkdir -p /home/site/wwwroot

echo "🧹 Cleaning previous deployment..."

rm -rf /home/site/wwwroot/*

echo "🚀 Copying build files..."

cp -r build/* /home/site/wwwroot/
 
echo "✅ Deployment completed!"
 