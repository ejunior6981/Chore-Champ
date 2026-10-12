#!/bin/bash

# Chore Champ - Git Workflow Script
# Pushes current code to dev and test branches

set -e

echo "🚀 Chore Champ - Git Workflow"
echo "=============================="
echo ""

# Check if we're in a git repository
if [ ! -d ".git" ]; then
    echo "❌ Not a git repository. Please initialize git first:"
    echo "   git init"
    echo "   git add ."
    echo "   git commit -m \"Initial commit\""
    exit 1
fi

# Get current branch
CURRENT_BRANCH=$(git branch --show-current)
echo "📍 Current branch: $CURRENT_BRANCH"
echo ""

# Check if there are uncommitted changes
if git diff --quiet; then
    echo "✅ No uncommitted changes"
else
    echo "⚠️  You have uncommitted changes. Staging them..."
    git add .
    git status
    echo ""
    read -p "Commit these changes? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git commit -m "Update code: $(git log -1 --pretty=format:'%s')"
    else
        echo "❌ Aborting push. Discarding uncommitted changes."
        exit 1
    fi
fi

# Create or switch to dev branch and push
echo ""
echo "📦 Creating dev branch and pushing..."
git checkout -b dev 2>/dev/null || git checkout dev
git add .
git commit -m "Update dev branch: $(git log -1 --pretty=format:'%s')"
git push -u origin dev

echo "✅ Dev branch pushed successfully!"
echo ""

# Create or switch to test branch and push
echo "📦 Creating test branch and pushing..."
git checkout -b test 2>/dev/null || git checkout test
git add .
git commit -m "Update test branch: $(git log -1 --pretty=format:'%s')"
git push -u origin test

echo "✅ Test branch pushed successfully!"
echo ""

echo "=============================="
echo "✅ Git Workflow Complete!"
echo "=============================="
echo ""
echo "📋 Your branches are now set up:"
echo "   - Dev:   dev.YOUR_PROJECT.pages.dev"
echo "   - Test:  test.YOUR_PROJECT.pages.dev"
echo "   - Prod:  YOUR_PROJECT.pages.dev (main branch)"
echo ""
echo "📝 Next steps:"
echo "   1. Configure Cloudflare Pages branch settings (web UI)"
echo "   2. Visit dev.YOUR_PROJECT.pages.dev to test"
echo "   3. Push to main when ready for production"
echo ""
