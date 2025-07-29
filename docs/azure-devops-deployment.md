# Azure DevOps Deployment Guide

This guide explains how to use the `deploy-to-azure-devops.sh` script to build, package, and deploy the MonarchSideNavSearchToggler SPFx solution to Azure DevOps.

## Overview

The deployment script automates the entire process of:
1. Building the SPFx solution
2. Packaging it for deployment
3. Pushing changes to Azure DevOps
4. Creating deployment tags

## Prerequisites

Before running the deployment script, ensure you have:

- **Node.js** (version 16 or higher)
- **npm** (comes with Node.js)
- **Git** (for version control)
- **Access to Azure DevOps** repository

## Quick Start

### 1. Run Full Deployment

```bash
./deploy-to-azure-devops.sh
```

This will:
- Install dependencies
- Build the project for production
- Package the solution
- Push all changes to Azure DevOps
- Create a deployment tag

### 2. Build Only (No Push)

```bash
./deploy-to-azure-devops.sh --build-only
```

This will only build and package the solution without pushing to Azure DevOps.

### 3. Push Only (No Build)

```bash
./deploy-to-azure-devops.sh --push-only
```

This will only push existing changes to Azure DevOps without rebuilding.

## Script Configuration

The script is pre-configured with your Azure DevOps credentials:

```bash
# Configuration in deploy-to-azure-devops.sh
AZURE_DEVOPS_URL="https://monarch360@dev.azure.com/monarch360/Monarch360/_git/MonarchSideNavSearchToggler"
AZURE_DEVOPS_USERNAME="Records.Manager"
AZURE_DEVOPS_PASSWORD="58PRdPuFdJeVY5GjMuPwvQfpjXMqrXqcdgMbGnU76XcilyAeLkXAJQQJ99BGACAAAAAtrfB1AAASAZDO2JXw"
```

## What the Script Does

### 1. Prerequisites Check
- Verifies Node.js, npm, git are installed
- Checks if gulp is available (installs if needed)
- Confirms you're in the correct project directory

### 2. Dependencies Installation
```bash
npm ci
```
Installs all npm dependencies using clean install.

### 3. Build Process
```bash
gulp clean
gulp build --ship
gulp bundle --ship
gulp package-solution --ship
```
- Cleans previous builds
- Builds for production
- Bundles for production
- Creates the SharePoint package (.sppkg)

### 4. Git Operations
- Sets up Azure DevOps remote
- Stages all changes
- Commits with timestamp
- Pushes to Azure DevOps
- Creates deployment tag

### 5. Package Verification
- Checks that the .sppkg file was created
- Reports package size
- Validates build success

## Output Files

After successful deployment, you'll have:

- **`sharepoint/solution/monarch-sidenav.sppkg`** - SharePoint package file
- **Git commit** with timestamp
- **Deployment tag** (e.g., `v2.1.9.0-deploy-20241223-143022`)

## Troubleshooting

### Common Issues

#### 1. Authentication Errors
```
❌ Failed to push to Azure DevOps
```
**Solution**: The script will automatically try with explicit credentials. If it still fails, check:
- Username and password are correct
- You have write access to the repository
- Network connectivity to Azure DevOps

#### 2. Build Failures
```
❌ Package file not found. Build may have failed.
```
**Solution**: 
- Check for TypeScript/compilation errors
- Ensure all dependencies are installed
- Verify gulp is working correctly

#### 3. Git Issues
```
❌ git is not installed
```
**Solution**: Install git on your system

#### 4. Node.js Issues
```
❌ Node.js is not installed
```
**Solution**: Install Node.js (version 16 or higher)

### Debug Mode

To see detailed output, you can run individual steps:

```bash
# Check prerequisites only
./deploy-to-azure-devops.sh --build-only

# Then push separately
./deploy-to-azure-devops.sh --push-only
```

## Security Considerations

### Credentials Storage

The script stores credentials in the script file. For production use, consider:

1. **Environment Variables**: Move credentials to environment variables
2. **Azure DevOps Personal Access Token**: Use PAT instead of password
3. **Git Credential Manager**: Use Azure DevOps Git Credential Manager

### Example with Environment Variables

```bash
# Set environment variables
export AZURE_DEVOPS_USERNAME="your-username"
export AZURE_DEVOPS_PASSWORD="your-password"

# Run script (modify script to use env vars)
./deploy-to-azure-devops.sh
```

## Integration with CI/CD

### Azure DevOps Pipeline Integration

After pushing to Azure DevOps, you can trigger:

1. **Excel to JSON Pipeline**: Process navigation updates
2. **Deployment Pipeline**: Deploy to SharePoint App Catalog
3. **Testing Pipeline**: Run automated tests

### Example Pipeline Trigger

```yaml
# In your Azure DevOps pipeline
trigger:
  branches:
    include:
    - main
  paths:
    include:
    - sharepoint/solution/*.sppkg
```

## Best Practices

### 1. Version Management
- Always update version in `config/package-solution.json` before deployment
- Use semantic versioning (e.g., 2.1.9.0)
- Tag releases for easy rollback

### 2. Testing
- Test locally before deployment
- Use `gulp serve` for local testing
- Verify package contents before pushing

### 3. Documentation
- Update README.md with changes
- Document any configuration changes
- Keep deployment logs for troubleshooting

### 4. Backup
- Keep local backup of working versions
- Use git tags for important releases
- Document rollback procedures

## Next Steps After Deployment

1. **Verify in Azure DevOps**: Check that changes are pushed correctly
2. **Run Excel Pipeline**: If you have navigation updates in Excel
3. **Deploy to SharePoint**: Upload the .sppkg file to App Catalog
4. **Test in SharePoint**: Verify the solution works in production
5. **Monitor**: Check for any issues in production

## Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review the script output for error messages
3. Verify your Azure DevOps permissions
4. Check network connectivity to Azure DevOps
5. Ensure all prerequisites are installed correctly 