#!/bin/bash

# Chore Champ - Dev/Test Environment Setup Script
# This script automates the GitHub branch creation and pushes
# Make executable: chmod +x scripts/setup-dev-environments.sh

echo "🚀 Chore Champ - Dev/Test Environment Setup"
echo "==========================================="
echo ""

# Check if we're in a git repository
if [ ! -d ".git" ]; then
    echo "❌ Not a git repository. Please initialize git first:"
    echo "   git init"
    echo "   git add ."
    echo "   git commit -m \"Initial commit\""
    echo ""
    read -p "Press Enter to continue without git setup..."
    exit 1
fi

# Check if branches already exist
echo "📋 Checking existing branches..."
BRANCHES=$(git branch | grep -E '^\*|dev|test|feature' | tr -d ' *' | grep -v '\*')

if echo "$BRANCHES" | grep -q "dev"; then
    echo "✅ Dev branch already exists"
else
    echo "📦 Creating dev branch..."
    git checkout -b dev 2>/dev/null || git checkout dev 2>/dev/null || git branch dev
    echo ""
fi

if echo "$BRANCHES" | grep -q "test"; then
    echo "✅ Test branch already exists"
else
    echo "📦 Creating test branch..."
    git checkout -b test 2>/dev/null || git branch test
    echo ""
fi

# Create commit if there are changes
if git diff --quiet; then
    echo "⚠️  No changes to commit. Creating commit with current state..."
    git add .
    git commit -m "Setup dev and test branches for Cloudflare Pages"
fi

# Push branches
echo ""
echo "🚀 Pushing branches to GitHub..."

# Push dev branch
if git push origin dev 2>&1; then
    echo "✅ Dev branch pushed successfully"
else
    echo "⚠️  Dev branch push failed. Check your GitHub remote URL:"
    echo "   git remote -v"
    echo "   Try: git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git"
fi

# Push test branch
if git push origin test 2>&1; then
    echo "✅ Test branch pushed successfully"
else
    echo "⚠️  Test branch push failed. Check your GitHub remote URL:"
    echo "   git remote -v"
fi

echo ""
echo "=========================================="
echo "✅ Branch Creation Complete!"
echo "=========================================="
echo ""
echo "📋 Next Steps:"
echo ""
echo "1. Go to your Cloudflare Pages project:"
echo "   https://dash.cloudflare.com/profile/accounts/*/pages/projects/YOUR_PROJECT"
echo ""
echo "2. Click 'Settings' → 'Branches'"
echo ""
echo "3. Add branch configurations:"
echo "   - Branch: 'dev' → Production subdomain: 'dev'"
echo "   - Branch: 'test' → Production subdomain: 'test'"
echo "   - Branch: 'main' → (leave blank for production)"
echo ""
echo "4. Click 'Save'"
echo ""
echo "5. Your dev environment will be available at:"
echo "   https://dev.YOUR_PROJECT.pages.dev"
echo ""
echo "6. Your test environment will be available at:"
echo "   https://test.YOUR_PROJECT.pages.dev"
echo ""
echo "=========================================="
echo "📚 For detailed instructions, see:"
echo "   docs/CLOUDFLARE-QUICK-START.md"
echo "   docs/CLOUDFLARE-DEV-SETUP.md"
echo "=========================================="
echo ""
