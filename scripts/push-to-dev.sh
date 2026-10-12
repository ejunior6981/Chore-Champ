#!/bin/bash

# Chore Champ - Quick Push to Dev Branch
# Run this to push current code to dev branch

set -e

echo "🚀 Pushing to Dev Branch"
echo "=========================="
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
fi

# Commit if there are changes
if ! git diff --cached --quiet; then
    COMMIT_MSG="Update dev branch: $(git log -1 --pretty=format:'%s')"
    git commit -m "$COMMIT_MSG"
    echo "✅ Committed changes"
else
    echo "ℹ️  No new changes to commit"
fi

# Create or switch to dev branch
echo ""
echo "📦 Switching to dev branch..."
git checkout -b dev 2>/dev/null || git checkout dev

# Push to dev branch
echo "🚀 Pushing to dev branch..."
git push -u origin dev

echo ""
echo "=========================="
echo "✅ Push to dev complete!"
echo "=========================="
echo ""
echo "🌐 Dev environment: dev.YOUR_PROJECT.pages.dev"
echo ""
echo "📝 To push to test branch:"
echo "   ./scripts/push-to-test.sh"
echo ""
echo "📝 To push to main (production):"
echo "   git checkout main && git push origin main"
echo ""
