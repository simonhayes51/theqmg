#!/bin/bash
set -e

echo "Installing server dependencies..."
cd server
npm ci
cd ..

echo "Installing client dependencies..."
cd client
npm ci

echo "Building client..."
npm run build
cd ..

echo "Build complete!"
