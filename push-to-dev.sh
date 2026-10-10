#!/bin/bash

# Chore Champ - Push to Dev Branch (Direct Script)
# Run: ./push-to-dev.sh

set -e

echo "🚀 Chore Champ - Push to Dev Branch"
echo "======================================"
echo ""

# Check if we're in a git repository
if [ ! -d ".git" ]; then
    echo "❌ Not a git repository. Run: git init"
    exit 1
fi

# Check if branches are configured
DEV_BRANCH_EXISTS=$(git branch -r | grep -c "origin/dev" 2>/dev/null || echo "0")
TEST_BRANCH_EXISTS=$(git branch -r | grep -c "origin/test" 2>/dev/null || echo "0")

echo "📋 Branch Status:"
echo "   - Dev branch exists: $([ "$DEV_BRANCH_EXISTS" -gt 0 ] && echo '✅' || echo '❌')"
echo "   - Test branch exists: $([ "$TEST_BRANCH_EXISTS" -gt 0 ] && echo '✅' || echo '❌')"
echo ""

# Stage all changes
echo "📦 Staging all changes..."
git add .

# Check if there are changes
if git diff --cached --quiet; then
    echo "ℹ️  No changes to commit. Pushing current state..."
else
    # Commit changes
    COMMIT_MSG="Update dev branch: $(git log -1 --pretty=format:'%s')"
    git commit -m "$COMMIT_MSG"
    echo "✅ Committed changes"
    echo ""
fi

# Create or switch to dev branch
echo "📦 Pushing to dev branch..."
if [ "$DEV_BRANCH_EXISTS" -eq 0 ]; then
    git checkout -b dev 2>/dev/null || git checkout dev
else
    git checkout dev 2>/dev/null || git switch dev
fi
git push -u origin dev
echo "✅ Dev branch pushed!"
echo ""

echo "======================================"
echo "✅ Push to dev complete!"
echo "======================================"
echo ""
echo "🌐 Your environments:"
echo "   - Dev:   dev.YOUR_PROJECT.pages.dev"
echo "   - Test:  test.YOUR_PROJECT.pages.dev"
echo "   - Prod:  YOUR_PROJECT.pages.dev (main branch)"
echo ""
echo "📝 Next steps:"
echo "   1. Configure Cloudflare Pages branch settings (web UI)"
echo "   2. Visit dev.YOUR_PROJECT.pages.dev to test"
echo "   3. Visit test.YOUR_PROJECT.pages.dev to test"
echo ""
echo "📚 For more info: docs/PUSH-TO-TEST-INSTRUCTIONS.md"
echo ""
