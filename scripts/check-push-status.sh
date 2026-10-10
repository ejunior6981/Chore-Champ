#!/bin/bash

# Check current git status and branches
echo "📊 Current Git Status"
echo "====================="
echo ""

# Check current branch
echo "Current Branch:"
git branch --show-current

echo ""
echo "All Local Branches:"
git branch -a

echo ""
echo "Checking for remote branches..."
git ls-remote --heads origin 2>/dev/null | grep -E "dev|test|main" || echo "  (No remote branches found yet)"

echo ""
echo "Checking for uncommitted changes..."
if git diff --quiet; then
    echo "✅ No uncommitted changes"
else
    echo "⚠️  You have uncommitted changes:"
    git status --short
    echo ""
    echo "Would you like to:"
    echo "  1. Stage and commit changes?"
    echo "  2. Discard changes?"
    echo "  3. Push without committing?"
fi
