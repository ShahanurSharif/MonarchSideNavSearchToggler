#!/bin/bash

# Local Deployment Test Script
# Usage: ./test-deployment.sh

set -e  # Exit on any error

echo "🚀 Starting local deployment test..."

# Configuration
APP_CATALOG_URL="https://monarch360demo.sharepoint.com/sites/appcatalog"
PACKAGE_PATH="sharepoint/solution/monarch-sidenav.sppkg"

# Check if package exists
if [ ! -f "$PACKAGE_PATH" ]; then
    echo "❌ Error: Package file not found at $PACKAGE_PATH"
    echo "Please run: gulp package-solution --ship"
    exit 1
fi

echo "✅ Package found: $PACKAGE_PATH"
echo "📦 Package size: $(ls -lh $PACKAGE_PATH | awk '{print $5}')"

# Check if user is logged in
echo "🔐 Checking authentication..."
if ! m365 status > /dev/null 2>&1; then
    echo "❌ Not logged in. Please login first:"
    echo "   m365 login --authType password --userName 'your-email@monarch360demo.onmicrosoft.com' --password 'your-password'"
    exit 1
fi

echo "✅ Authentication successful"

# Test connection to SharePoint
echo "🔗 Testing SharePoint connection..."
if ! m365 spo site list --output json > /dev/null 2>&1; then
    echo "❌ Error: Cannot connect to SharePoint"
    exit 1
fi

echo "✅ SharePoint connection successful"

# List existing apps
echo "📋 Listing existing apps in catalog..."
m365 spo app list --appCatalogUrl "$APP_CATALOG_URL" --output json > app_list.json
echo "✅ App list saved to app_list.json"

# Check if our app exists
if jq -e '.[] | select(.Name == "monarch-sidenav.sppkg")' app_list.json > /dev/null 2>&1; then
    echo "⚠️  App already exists in catalog"
    echo "   This will overwrite the existing app"
fi

# Add app to catalog
echo "📤 Adding app to catalog..."
m365 spo app add -p "$PACKAGE_PATH" --overwrite --appCatalogUrl "$APP_CATALOG_URL"
echo "✅ App added to catalog"

# Get app ID
echo "🆔 Getting app ID..."
APP_ID=$(jq -r '.[] | select(.Name == "monarch-sidenav.sppkg") | .ID' app_list.json)
echo "   App ID: $APP_ID"

if [ -z "$APP_ID" ] || [ "$APP_ID" = "null" ]; then
    echo "❌ Error: Could not find app ID"
    echo "Available apps:"
    jq -r '.[] | "   Name: \(.Name), ID: \(.ID)"' app_list.json
    exit 1
fi

# Deploy app
echo "🚀 Deploying app..."
m365 spo app deploy --appId "$APP_ID" --appCatalogUrl "$APP_CATALOG_URL" --scope tenant --wait
echo "✅ App deployed successfully!"

echo "🎉 Local deployment test completed successfully!"
echo "📊 Check your SharePoint App Catalog to verify the deployment" 