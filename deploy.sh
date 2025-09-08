#!/bin/bash

# Deploy to Fly.io
echo "🚀 Deploying to Fly.io..."

# Navigate to server directory
cd apps/server

# Deploy using the root Dockerfile
fly deploy --dockerfile ../../Dockerfile

echo "✅ Deployment complete!"
