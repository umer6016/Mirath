#!/usr/bin/env bash
# ==============================================================================
# MIRATH (ميراث) — One-Click GitHub Repository Creation & Deployment Script
# ==============================================================================

set -e

# Ensure ~/.local/bin is in PATH for gh CLI
export PATH="$HOME/.local/bin:$PATH"

echo "========================================================"
echo "  MIRATH (ميراث) — Sacred Islamic Knowledge Treasury"
echo "  GitHub Repository Creation & Deployment"
echo "========================================================"
echo ""

# Check if gh CLI is authenticated
if command -v gh >/dev/null 2>&1 && gh auth status >/dev/null 2>&1; then
    echo "✓ GitHub CLI is authenticated!"
    echo "Creating GitHub repository 'Mirath' and pushing main branch..."
    
    # Check if repo already exists on remote
    if gh repo view umer6016/Mirath >/dev/null 2>&1; then
        echo "✓ Repository umer6016/Mirath already exists. Pushing latest code..."
        git push -u origin main
    else
        echo "Creating new repository on GitHub: umer6016/Mirath..."
        gh repo create Mirath --public --source=. --remote=origin --push
    fi

    echo ""
    echo "========================================================"
    echo "✓ Repository created and pushed successfully!"
    echo "  Repo URL: https://github.com/umer6016/Mirath"
    echo ""
    echo "Site is live at:"
    echo "  → https://mirath.me"
    echo "  → https://umer6016.github.io/Mirath/"
    echo "========================================================"
    exit 0
fi

echo "GitHub authentication required."
echo "Choose one of the 2 quick options below:"
echo ""
echo "OPTION 1 (Recommended - 15 seconds):"
echo "  Run:"
echo "    gh auth login"
echo "  Follow the prompt (select GitHub.com -> HTTPS -> Login with a web browser),"
echo "  then run this script again: ./deploy.sh"
echo ""
echo "OPTION 2 (Personal Access Token):"
echo "  If you have a GitHub Personal Access Token (classic or fine-grained with repo access):"
echo "  Run:"
echo "    git remote set-url origin https://<YOUR_TOKEN>@github.com/umer6016/Mirath.git"
echo "    git push -u origin main"
echo ""
echo "========================================================"
