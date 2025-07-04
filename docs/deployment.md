# Deployment Guide

## Overview

This guide covers the complete deployment process for the SharePoint Framework sidebar search extension, from building the solution to deploying it in SharePoint environments.

## Prerequisites

Before deploying, ensure you have:
- SPFx project built and tested
- SharePoint Online tenant with App Catalog
- Appropriate permissions for deployment
- Production-ready configuration

## Build Process

### 1. Development Build

```bash
# Clean previous builds
gulp clean

# Build for development
gulp build

# Serve for local testing
gulp serve
```

### 2. Production Build

```bash
# Clean previous builds
gulp clean

# Build for production with optimizations
gulp bundle --ship

# Package the solution
gulp package-solution --ship
```

**Key Differences:**
- `--ship` flag enables production optimizations
- Minification and bundling are applied
- Source maps are excluded
- Performance optimizations are enabled

### 3. Build Validation

```bash
# Validate the build
gulp build --ship

# Check for TypeScript errors
tsc --noEmit

# Validate package
gulp package-solution --ship
```

## Solution Packaging

### 1. Package Structure

The build process creates the following package structure:

```
solution/
├── your-project-name.sppkg           # SharePoint package
├── debug/                            # Debug assets
└── temp/                             # Temporary build files
```

### 2. Package Contents

The `.sppkg` file contains:
- Client-side assets (JS, CSS)
- SharePoint feature definitions
- Manifest files
- Asset references

### 3. Package Validation

```bash
# Validate package structure
unzip -l solution/your-project-name.sppkg

# Check package size
ls -lh solution/your-project-name.sppkg
```

## SharePoint App Catalog Deployment

### 1. Tenant App Catalog Deployment

#### Upload to App Catalog

```powershell
# PowerShell example
Connect-SPOService -Url https://yourtenant-admin.sharepoint.com

# Upload app package
Add-SPOApp -Path "./solution/your-project-name.sppkg" -Overwrite
```

#### Manual Upload Process

1. Navigate to SharePoint Admin Center
2. Go to "More features" → "Apps" → "App Catalog"
3. Click "Apps for SharePoint"
4. Click "Upload" or "New"
5. Select your `.sppkg` file
6. Click "Deploy"

### 2. Site Collection App Catalog Deployment

#### Enable Site Collection App Catalog

```powershell
# PowerShell to enable site collection app catalog
Add-SPOSiteCollectionAppCatalog -Site "https://yourtenant.sharepoint.com/sites/yoursite"
```

#### Upload to Site Collection

1. Navigate to your site collection
2. Go to "Site Contents" → "Apps for SharePoint"
3. Click "Upload" or "New"
4. Select your `.sppkg` file
5. Click "Deploy"

### 3. Application Customizer Deployment

#### Automatic Deployment (Recommended)

Configure in `package-solution.json`:

```json
{
  "solution": {
    "skipFeatureDeployment": true,
    "isDomainIsolated": false
  }
}
```

#### Manual Deployment

```powershell
# PowerShell to add Application Customizer
$ctx = Get-SPOContext -Url "https://yourtenant.sharepoint.com/sites/yoursite"
$customActions = $ctx.Web.UserCustomActions
$customAction = $customActions.Add()
$customAction.Title = "YourProjectName"
$customAction.Location = "ClientSideExtension.ApplicationCustomizer"
$customAction.ClientSideComponentId = "your-component-guid"
$customAction.ClientSideComponentProperties = '{"testMessage":"Production"}'
$customAction.Update()
$ctx.ExecuteQuery()
```

## Environment-Specific Deployment

### 1. Development Environment

```bash
# Development build and serve
gulp clean
gulp build
gulp serve --config dev-config
```

**Dev Configuration (`config/serve.json`):**
```json
{
  "port": 4321,
  "https": true,
  "serveConfigurations": {
    "default": {
      "pageUrl": "https://yourtenant.sharepoint.com/sites/dev",
      "customActions": {
        "your-component-id": {
          "location": "ClientSideExtension.ApplicationCustomizer",
          "properties": {
            "testMessage": "Development Mode"
          }
        }
      }
    }
  }
}
```

### 2. Testing Environment

```bash
# Build for testing
gulp bundle --ship
gulp package-solution --ship

# Deploy to test app catalog
```

**Test Configuration:**
- Use dedicated test app catalog
- Configure test-specific properties
- Enable detailed logging

### 3. Production Environment

```bash
# Production build
gulp clean
gulp bundle --ship
gulp package-solution --ship

# Deploy to production app catalog
```

**Production Configuration:**
- Minimize logging
- Optimize for performance
- Use production API endpoints

## Deployment Automation

### 1. Azure DevOps Pipeline

```yaml
# azure-pipelines.yml
trigger:
  branches:
    include:
      - main

pool:
  vmImage: 'ubuntu-latest'

variables:
  buildConfiguration: 'Release'

steps:
- task: NodeTool@0
  inputs:
    versionSpec: '22.x'
  displayName: 'Install Node.js'

- script: |
    npm install
  displayName: 'Install dependencies'

- script: |
    gulp clean
    gulp bundle --ship
    gulp package-solution --ship
  displayName: 'Build solution'

- task: PublishBuildArtifacts@1
  inputs:
    pathToPublish: 'solution'
    artifactName: 'spfx-package'
  displayName: 'Publish artifacts'

- task: SharePointAppDeploy@1
  inputs:
    appCatalogUrl: '$(APP_CATALOG_URL)'
    appPackagePath: 'solution/*.sppkg'
    overwriteExistingApp: true
  displayName: 'Deploy to SharePoint'
```

### 2. GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy SPFx Solution

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '22.x'
        
    - name: Install dependencies
      run: npm install
      
    - name: Build solution
      run: |
        gulp clean
        gulp bundle --ship
        gulp package-solution --ship
        
    - name: Upload artifact
      uses: actions/upload-artifact@v2
      with:
        name: spfx-package
        path: solution/*.sppkg
```

### 3. PowerShell Deployment Script

```powershell
# deploy.ps1
param(
    [Parameter(Mandatory=$true)]
    [string]$TenantUrl,
    
    [Parameter(Mandatory=$true)]
    [string]$AppCatalogUrl,
    
    [Parameter(Mandatory=$true)]
    [string]$PackagePath,
    
    [Parameter(Mandatory=$false)]
    [switch]$Overwrite = $false
)

# Connect to SharePoint
Write-Host "Connecting to SharePoint..." -ForegroundColor Green
Connect-SPOService -Url $TenantUrl

# Upload app package
Write-Host "Uploading app package..." -ForegroundColor Green
if ($Overwrite) {
    Add-SPOApp -Path $PackagePath -Overwrite
} else {
    Add-SPOApp -Path $PackagePath
}

# Deploy app
Write-Host "Deploying app..." -ForegroundColor Green
$app = Get-SPOApp | Where-Object { $_.Title -eq "YourProjectName" }
if ($app) {
    Install-SPOApp -Identity $app.Id
    Write-Host "App deployed successfully!" -ForegroundColor Green
} else {
    Write-Error "App not found in catalog"
}
```

## Post-Deployment Configuration

### 1. Application Customizer Properties

```powershell
# Configure application customizer properties
$customAction = Get-SPOCustomAction -Web $webUrl -Identity "your-component-id"
$customAction.ClientSideComponentProperties = @"
{
  "testMessage": "Production Environment",
  "enableDebugMode": false,
  "cacheExpiration": 3600
}
"@
$customAction.Update()
```

### 2. Permissions Configuration

```powershell
# Grant necessary permissions
Set-SPOSite -Identity $siteUrl -DenyAddAndCustomizePages $false
Set-SPOTenant -CustomScriptEnabled $true
```

### 3. Feature Activation

```powershell
# Activate features if needed
Enable-SPOFeature -Identity "your-feature-id" -Url $siteUrl
```

## Monitoring and Validation

### 1. Deployment Validation

```powershell
# Validate deployment
$apps = Get-SPOApp
$yourApp = $apps | Where-Object { $_.Title -eq "YourProjectName" }
if ($yourApp) {
    Write-Host "App Status: $($yourApp.AppCatalogVersion)" -ForegroundColor Green
} else {
    Write-Error "App not found"
}
```

### 2. Runtime Validation

```javascript
// Browser console validation
console.log('Checking for extension...');
const extensionElement = document.getElementById('your-project-name-root');
if (extensionElement) {
    console.log('✓ Extension loaded successfully');
} else {
    console.error('✗ Extension not found');
}
```

### 3. Performance Monitoring

```javascript
// Performance monitoring
if (window.performance) {
    const loadTime = window.performance.timing.loadEventEnd - window.performance.timing.navigationStart;
    console.log(`Page load time: ${loadTime}ms`);
}
```

## Rollback Procedures

### 1. App Catalog Rollback

```powershell
# Remove current version
Remove-SPOApp -Identity "your-app-id"

# Upload previous version
Add-SPOApp -Path "./solution/previous-version.sppkg" -Overwrite

# Deploy previous version
Install-SPOApp -Identity "your-app-id"
```

### 2. Feature Rollback

```powershell
# Deactivate feature
Disable-SPOFeature -Identity "your-feature-id" -Url $siteUrl

# Remove custom actions
Remove-SPOCustomAction -Identity "your-component-id" -Web $webUrl
```

### 3. Emergency Rollback

```powershell
# Quick emergency rollback
$customActions = Get-SPOCustomAction -Web $webUrl
$customActions | Where-Object { $_.Title -eq "YourProjectName" } | Remove-SPOCustomAction
```

## Multi-Tenant Deployment

### 1. Tenant Isolation

```json
// package-solution.json for multi-tenant
{
  "solution": {
    "isDomainIsolated": true,
    "skipFeatureDeployment": true,
    "webApiPermissionRequests": []
  }
}
```

### 2. Tenant-Specific Configuration

```typescript
// Runtime tenant detection
const tenantUrl = this.context.pageContext.site.absoluteUrl;
const tenantId = this.context.pageContext.aadInfo.tenantId;

// Load tenant-specific configuration
const config = await this.loadTenantConfig(tenantId);
```

### 3. Deployment Script for Multiple Tenants

```powershell
# multi-tenant-deploy.ps1
$tenants = @(
    @{ Url = "https://tenant1-admin.sharepoint.com"; Name = "Tenant1" },
    @{ Url = "https://tenant2-admin.sharepoint.com"; Name = "Tenant2" }
)

foreach ($tenant in $tenants) {
    Write-Host "Deploying to $($tenant.Name)..." -ForegroundColor Green
    Connect-SPOService -Url $tenant.Url
    Add-SPOApp -Path $PackagePath -Overwrite
    Write-Host "Deployment to $($tenant.Name) completed" -ForegroundColor Green
}
```

## Security Considerations

### 1. Content Security Policy

```json
// CSP configuration
{
  "webApiPermissionRequests": [
    {
      "resource": "Microsoft Graph",
      "scope": "Sites.Read.All"
    }
  ]
}
```

### 2. Secure API Endpoints

```typescript
// Use secure API endpoints
const apiUrl = this.context.pageContext.web.absoluteUrl + "/_api/search/query";
const secureHeaders = {
    'Accept': 'application/json;odata=minimalmetadata;charset=utf-8',
    'Content-Type': 'application/json;odata=minimalmetadata;charset=utf-8',
    'X-RequestDigest': await this.getRequestDigest()
};
```

### 3. Permission Validation

```typescript
// Validate permissions before deployment
private async validatePermissions(): Promise<boolean> {
    try {
        const permissions = await this.context.spHttpClient.get(
            `${this.context.pageContext.web.absoluteUrl}/_api/web/effectiveBasePermissions`,
            SPHttpClient.configurations.v1
        );
        return permissions.ok;
    } catch (error) {
        console.error('Permission validation failed:', error);
        return false;
    }
}
```

## Best Practices

### 1. Deployment Checklist

- [ ] Code reviewed and approved
- [ ] Unit tests passing
- [ ] Integration tests passing
- [ ] Performance benchmarks met
- [ ] Security scan completed
- [ ] Documentation updated
- [ ] Rollback plan prepared
- [ ] Monitoring configured

### 2. Version Management

```json
// package.json versioning
{
  "version": "1.2.3",
  "scripts": {
    "version:patch": "npm version patch",
    "version:minor": "npm version minor",
    "version:major": "npm version major"
  }
}
```

### 3. Environment Variables

```typescript
// Environment-specific configuration
const config = {
    apiUrl: process.env.NODE_ENV === 'production' 
        ? 'https://api.production.com' 
        : 'https://api.development.com',
    debugMode: process.env.NODE_ENV !== 'production'
};
```

## Troubleshooting Deployment Issues

### 1. Common Build Errors

```bash
# Clear cache and rebuild
gulp clean
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
gulp build --ship
```

### 2. Package Deployment Errors

```powershell
# Check app catalog permissions
Get-SPOSiteGroup -Site $appCatalogUrl
```

### 3. Runtime Errors

```javascript
// Enable debug mode
localStorage.setItem('SPFxDebugMode', 'true');
location.reload();
```

## Next Steps

1. Review [Troubleshooting Guide](./troubleshooting.md) for common issues
2. Set up monitoring and alerting
3. Plan regular updates and maintenance
4. Document operational procedures
5. Train support team on troubleshooting

## Support and Maintenance

- Regular updates following Microsoft release cycle
- Monitor performance metrics
- Review security updates
- Update documentation
- Maintain deployment scripts 