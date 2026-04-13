#!/bin/bash

# Blog Deploy Script
# Usage: ./deploy.sh

echo "🚀 Starting deployment..."

# Check for uncommitted changes
if [ -z "$(git status --porcelain | grep -v '^$' )" ]; then
    echo "✅ No changes to deploy"
    exit 0
fi

# Show changes
echo "📝 Changed files:"
git status --short
echo

# Ask for commit message
echo -n "📋 Enter commit message (or press Enter for auto-generated): "
read commit_msg

if [ -z "$commit_msg" ]; then
    commit_msg="chore: code updates"
fi

echo
echo "📦 Files to commit:"
git diff --name-only
echo

# Confirm
echo -n "Proceed with commit and push? (y/n): "
read confirm

if [ "$confirm" != "y" ]; then
    echo "❌ Deployment cancelled"
    exit 1
fi

echo
echo "📦 Staging changes..."
git add -A

echo "💾 Committing..."
git commit -m "$commit_msg"

echo "🚀 Pushing to GitHub..."
git push

echo
echo "✅ Deployment complete!"
echo "🌐 Vercel will deploy automatically"