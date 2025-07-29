#!/bin/bash

# Load environment variables from .env file
if [ -f ".env" ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

# Simple script to push to Azure DevOps
AZURE_DEVOPS_URL="https://monarch360@dev.azure.com/monarch360/Monarch360/_git/MonarchSideNavSearchToggler"
USERNAME="Records.Manager"
PASSWORD="${AZURE_DEVOPS_PASSWORD:-}"

echo "🚀 Pushing to Azure DevOps..."

# Check if password is loaded
if [ -z "$PASSWORD" ]; then
    echo "❌ Azure DevOps password not found. Please check your .env file."
    exit 1
fi

# Add Azure DevOps remote if not exists
if ! git remote get-url azure-devops &> /dev/null; then
    git remote add azure-devops "$AZURE_DEVOPS_URL"
fi

# Stage and commit changes
git add .
git commit -m "Update - $(date '+%Y-%m-%d %H:%M:%S')"

# Push to Azure DevOps
CREDENTIAL_URL="https://$USERNAME:$PASSWORD@dev.azure.com/monarch360/Monarch360/_git/MonarchSideNavSearchToggler"
git push "$CREDENTIAL_URL" master --force

echo "✅ Successfully pushed to Azure DevOps!" 