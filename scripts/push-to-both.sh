#!/bin/bash

# Chore Champ - Push to Both Dev and Test Branches
# Run this to push current code to both dev and test branches

set -e

echo "🚀 Chore Champ - Push to Dev & Test"
echo "===================================="
echo ""

# Check if we're in a git repository
if [ ! -d ".git" ]; then
    echo "❌ Not a git repository. Run: git init"
    exit 1
fi

# Get current branch
CURRENT_BRANCH=$(git branch --show-current)
echo "📍 Current branch: $CURRENT_BRANCH"
echo ""

# Stage all changes
echo "📦 Staging all changes..."
git add .

# Check if there are changes
if git diff --cached --quiet; then
    echo "⚠️  No changes to commit. Pushing anyway..."
    echo ""
else
    # Commit changes
    COMMIT_MSG="Update dev & test branches: $(git log -1 --pretty=format:'%s')"
    git commit -m "$COMMIT_MSG"
    echo "✅ Committed changes"
    echo ""
fi

# Create or switch to dev branch and push
echo "📦 Creating dev branch and pushing..."
git checkout -b dev 2>/dev/null || git checkout dev
git push -u origin dev

echo "✅ Dev branch pushed!"
echo ""

# Create or switch to test branch and push
echo "📦 Creating test branch and pushing..."
git checkout -b test 2>/dev/null || git checkout test
git push -u origin test

echo "✅ Test branch pushed!"
echo ""

echo "===================================="
echo "✅ Push to dev & test complete!"
echo "===================================="
echo ""
echo "🌐 Your environments:"
echo "   - Dev:   dev.YOUR_PROJECT.pages.dev"
echo "   - Test:  test.YOUR_PROJECT.pages.dev"
echo "   - Prod:  YOUR_PROJECT.pages.dev (main branch)"
echo ""
echo "📝 Next steps:"
echo "   1. Configure Cloudflare Pages branch settings (web UI)"
echo "   2. Visit dev.YOUR_PROJECT.pages.dev to test"
echo "   3. Push to main when ready for production"
echo ""
