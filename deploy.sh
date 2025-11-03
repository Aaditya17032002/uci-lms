#!/bin/bash

set -e
 
echo "🔵 Custom deploy script running..."
 
# Force correct Node version path

export PATH="/opt/nodejs/22/bin:$PATH"
 
echo "Node version: $(node -v)"

echo "NPM version: $(npm -v)"
 
# Verify we're using correct versions

NODE_VERSION=$(node -v)

if [[ ! "$NODE_VERSION" =~ ^v2[0-9] ]]; then

  echo "❌ ERROR: Wrong Node version detected: $NODE_VERSION"

  exit 1

fi
 
echo "Current directory: $(pwd)"
 
rm -rf build node_modules
 
echo "📦 Installing dependencies..."

npm install --force
 
echo "🏗️ Building React app..."

npm run build
 
mkdir -p /home/site/wwwroot

echo "🧹 Cleaning previous deployment..."

rm -rf /home/site/wwwroot/*

echo "🚀 Copying build files..."

cp -r build/* /home/site/wwwroot/
 
echo "✅ Deployment completed!"
 