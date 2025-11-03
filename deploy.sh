#!/bin/bash
set -e  # Exit immediately if a command fails
 
echo "🔵 Custom deploy script running..."
echo "Node version: $(node -v)"
echo "NPM version: $(npm -v)"
echo "Current directory: $(pwd)"
 
# Clean any old build output to prevent cache issues
rm -rf build
 
echo "📦 Installing dependencies..."
# Use npm ci if lockfile exists, else fallback to npm install
if [ -f package-lock.json ]; then
  npm ci
else
  npm install
fi
 
echo "🏗️ Building React app..."
npm run build
 
# Ensure target directory exists
mkdir -p /home/site/wwwroot
 
echo "🧹 Cleaning previous deployment files..."
rm -rf /home/site/wwwroot/*
 
echo "🚀 Copying new build to wwwroot..."
cp -r build/* /home/site/wwwroot/
 
echo "✅ Deployment completed successfully!"