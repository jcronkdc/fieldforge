#!/bin/bash

# FieldForge Deployment Script
# This script prepares and pushes changes to GitHub for Vercel auto-deployment

echo "🚀 FieldForge Deployment Script"
echo "================================"

# Check if we're in the right directory
if [ ! -f "README.md" ] || [ ! -d "apps/swipe-feed" ]; then
    echo "❌ Error: Must be run from FieldForge root directory"
    exit 1
fi

# Check git status
echo "📋 Checking git status..."
git status

# Add all changes
echo ""
read -p "📝 Do you want to add all changes? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    git add .
    echo "✅ Changes staged"
fi

# Get commit message
echo ""
echo "💬 Enter commit message (or press Enter for default):"
read commit_message
if [ -z "$commit_message" ]; then
    commit_message="Update FieldForge configuration and deployment settings"
fi

# Commit changes
git commit -m "$commit_message"
echo "✅ Changes committed"

# Push to GitHub
echo ""
read -p "🚀 Push to GitHub (this will trigger Vercel deployment)? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    git push origin main
    echo "✅ Pushed to GitHub"
    echo ""
    echo "🎉 Deployment triggered!"
    echo "📊 Monitor deployment at: https://vercel.com/dashboard/project/prj_VxsijypjnqozFi6UeKw2uENCN78c"
    echo "🌐 Production URL: https://fieldforge.vercel.app"
else
    echo "❌ Push cancelled"
fi

echo ""
echo "================================"
echo "✅ Script complete"
