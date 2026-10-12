#!/bin/bash

# Commit and push current code to test branch
set -e

echo "📝 Committing and pushing current code to test branch"
echo "===================================================="
echo ""

# Check for changes
if git diff --quiet; then
    echo "✅ No changes to commit"
else
    echo "📦 Found changes to commit:"
    git diff --stat
    
    echo ""
    echo "Staging all changes..."
    git add .
    
    echo "Creating commit..."
    git commit -m "Update code with latest changes"
fi

# Check current branch
CURRENT_BRANCH=$(git branch --show-current)
echo ""
echo "📋 Current branch: $CURRENT_BRANCH"
echo ""

# Check if test branch exists
if git branch --list 2>/dev/null | grep -q "test"; then
    echo "✅ Switching to test branch..."
    git checkout test
    echo "🚀 Pushing to test branch..."
    git push origin test
    echo ""
    echo "✅ Pushed to test branch!"
    echo "🌐 Test URL: https://test.YOUR_PROJECT.pages.dev"
else
    echo "⚠️  Test branch doesn't exist locally"
    echo ""
    echo "Would you like to:"
    echo "  1. Create and push to test branch? (y/n)"
    read -p "Enter choice: " CREATE_TEST
    if [ "$CREATE_TEST" = "y" ]; then
        git checkout -b test
        git push -u origin test
        echo ""
        echo "✅ Created and pushed to test branch!"
        echo "🌐 Test URL: https://test.YOUR_PROJECT.pages.dev"
    else
        echo "Creating test branch for next push..."
    fi
fi

echo ""
echo "======================================"
