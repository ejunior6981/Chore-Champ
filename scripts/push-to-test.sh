#!/bin/bash

# Chore Champ - Quick Push to Test Branch
# Run this to push current code to test branch

set -e

echo "🚀 Pushing to Test Branch"
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
    COMMIT_MSG="Update test branch: $(git log -1 --pretty=format:'%s')"
    git commit -m "$COMMIT_MSG"
    echo "✅ Committed changes"
else
    echo "ℹ️  No new changes to commit"
fi

# Create or switch to test branch
echo ""
echo "📦 Switching to test branch..."
git checkout -b test 2>/dev/null || git checkout test

# Push to test branch
echo "🚀 Pushing to test branch..."
git push -u origin test

echo ""
echo "=========================="
echo "✅ Push to test complete!"
echo "=========================="
echo ""
echo "🌐 Test environment: test.YOUR_PROJECT.pages.dev"
echo ""
echo "📝 To push to dev branch:"
echo "   ./scripts/push-to-dev.sh"
echo ""
echo "📝 To push to main (production):"
echo "   git checkout main && git push origin main"
echo ""
