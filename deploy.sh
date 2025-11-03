#!/bin/bash
echo "Custom deploy script running..."
npm ci --force
npm run build
cp -r build/* /home/site/wwwroot