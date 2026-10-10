#!/usr/bin/env bash

# Create and push Git branches that Cloudflare Pages can deploy as previews.

set -euo pipefail

PROJECT_NAME="${1:-chore-champ}"
BRANCHES=(dev test)

echo "Chore Champ - Cloudflare Pages Dev/Test Setup"
echo "=============================================="
echo ""

if ! REPO_ROOT="$(git rev-parse --show-toplevel 2>/dev/null)"; then
    echo "Error: run this script from inside the Git repository." >&2
    exit 1
fi
cd "$REPO_ROOT"

if ! git remote get-url origin >/dev/null 2>&1; then
    echo "Error: no Git remote named 'origin' is configured." >&2
    exit 1
fi

if ! BASE_COMMIT="$(git rev-parse --verify HEAD 2>/dev/null)"; then
    echo "Error: the repository has no commit to create branches from." >&2
    exit 1
fi

if ! git symbolic-ref --quiet --short HEAD >/dev/null; then
    echo "Error: check out a branch before running this script (HEAD is detached)." >&2
    exit 1
fi

if [ -n "$(git status --porcelain)" ]; then
    echo "Warning: uncommitted changes will not be included in the branches being pushed."
    echo ""
fi

for branch in "${BRANCHES[@]}"; do
    echo "Setting up '$branch'..."

    if ! git show-ref --verify --quiet "refs/heads/$branch"; then
        if ! REMOTE_REF="$(git ls-remote --heads origin "refs/heads/$branch")"; then
            echo "Error: could not check remote branch '$branch' on origin." >&2
            exit 1
        fi

        if [ -n "$REMOTE_REF" ]; then
            git fetch origin "refs/heads/$branch:refs/remotes/origin/$branch"
            git branch --track "$branch" "origin/$branch"
            echo "Fetched existing remote branch '$branch'."
        else
            git branch "$branch" "$BASE_COMMIT"
            echo "Created '$branch' from the current commit."
        fi
    else
        echo "Using existing local branch '$branch'."
    fi

    git push --set-upstream origin "$branch"
    echo ""
done

if [ ! -e ".env.cloudflare" ]; then
    cat > .env.cloudflare <<'EOF'
# Cloudflare Pages environment variable checklist.
# Configure actual values in the Cloudflare Pages dashboard; do not commit secrets.

# Production (main branch)
# DATABASE_URL=
# CLOUDFLARE_ACCESS_URL=
# CLOUDFLARE_ACCESS_CLIENT_ID=
# CLOUDFLARE_ACCESS_CLIENT_SECRET=
# GEMINI_API_KEY=

# Dev/test preview branches (optional)
# DATABASE_URL=
# CLOUDFLARE_ACCESS_URL=
# CLOUDFLARE_ACCESS_CLIENT_ID=
# CLOUDFLARE_ACCESS_CLIENT_SECRET=
# GEMINI_API_KEY=
EOF
    echo "Created .env.cloudflare as an environment-variable checklist."
else
    echo "Keeping existing .env.cloudflare unchanged."
fi

echo ""
echo "Git branches are ready for Cloudflare Pages project '$PROJECT_NAME'."
echo "Ensure the Pages project is connected to this repository and uses the intended production branch."
echo "Configure branch-specific settings and environment variables in the Cloudflare dashboard."
echo "Cloudflare Pages deploys pushed branches automatically; no Wrangler branch command is needed."
echo ""
echo "Example preview URLs (when enabled for this project):"
echo "  https://dev.$PROJECT_NAME.pages.dev"
echo "  https://test.$PROJECT_NAME.pages.dev"
