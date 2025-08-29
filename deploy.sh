#!/bin/bash

echo "🚀 NextGen AI Hackathon Deployment Script"
echo "=========================================="

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI is not installed"
    echo "Please run: npm install -g vercel"
    exit 1
fi

# Check if logged in
if ! vercel whoami &> /dev/null; then
    echo "❌ Not logged in to Vercel"
    echo "Please run: vercel login"
    exit 1
fi

echo "✅ Vercel CLI is installed and logged in"

# Build project
echo "🔨 Building project..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed"
    exit 1
fi

echo "✅ Build successful"

# Deploy to Vercel
echo "🚀 Deploying to Vercel..."
vercel --prod

if [ $? -eq 0 ]; then
    echo "🎉 Deployment successful!"
    echo ""
    echo "📋 Next steps:"
    echo "1. Set environment variables in Vercel Dashboard:"
    echo "   NEXT_PUBLIC_API_BASE=https://your-railway-backend-url.railway.app"
    echo "2. Redeploy to apply environment variables:"
    echo "   vercel --prod"
    echo ""
    echo "🔗 Your project should now be accessible!"
else
    echo "❌ Deployment failed"
    exit 1
fi
