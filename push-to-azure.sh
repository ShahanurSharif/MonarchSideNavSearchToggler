#!/bin/bash

# Simple script to push to Azure DevOps
AZURE_DEVOPS_URL="https://monarch360@dev.azure.com/monarch360/Monarch360/_git/MonarchSideNavSearchToggler"
USERNAME="Records.Manager"
PASSWORD="58PRdPuFdJeVY5GjMuPwvQfpjXMqrXqcdgMbGnU76XcilyAeLkXAJQQJ99BGACAAAAAtrfB1AAASAZDO2JXw"

echo "🚀 Pushing to Azure DevOps..."

# Add Azure DevOps remote if not exists
if ! git remote get-url azure-devops &> /dev/null; then
    git remote add azure-devops "$AZURE_DEVOPS_URL"
fi

# Stage and commit changes
git add .
git commit -m "Update - $(date '+%Y-%m-%d %H:%M:%S')"

# Push to Azure DevOps
CREDENTIAL_URL="https://$USERNAME:$PASSWORD@dev.azure.com/monarch360/Monarch360/_git/MonarchSideNavSearchToggler"
git push "$CREDENTIAL_URL" main

echo "✅ Successfully pushed to Azure DevOps!" 