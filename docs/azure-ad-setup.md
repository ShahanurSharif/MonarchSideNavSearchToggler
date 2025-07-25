# Azure AD App Registration Setup for SharePoint Deployment

This guide will help you set up an Azure AD app registration for deploying SharePoint solutions using GitHub Actions.

## Prerequisites

- Access to Azure Portal with Global Administrator or Application Administrator role
- Your SharePoint tenant URL (e.g., `https://monarch360demo.sharepoint.com`)

## Step 1: Create Azure AD App Registration

### 1.1 Navigate to Azure Portal
1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to **Azure Active Directory** → **App registrations**
3. Click **New registration**

### 1.2 Configure App Registration
- **Name**: `Monarch360 SharePoint Deployer` (or your preferred name)
- **Supported account types**: `Accounts in this organizational directory only`
- **Redirect URI**: Leave blank (not needed for service principal)
- Click **Register**

### 1.3 Note Important Information
After registration, note down:
- **Application (client) ID** - You'll need this for `M365_CLIENT_ID`
- **Directory (tenant) ID** - You'll need this for `M365_TENANT_ID`

## Step 2: Create Client Secret

### 2.1 Generate Secret
1. In your app registration, go to **Certificates & secrets**
2. Click **New client secret**
3. Add a description (e.g., "GitHub Actions Deployment")
4. Choose expiration (recommend 12 months)
5. Click **Add**

### 2.2 Copy Secret Value
⚠️ **IMPORTANT**: Copy the secret value immediately - you won't be able to see it again!
- This value will be your `M365_CLIENT_SECRET`

## Step 3: Configure API Permissions

### 3.1 Add Permissions
1. Go to **API permissions**
2. Click **Add a permission**
3. Select **SharePoint**
4. Choose **Application permissions**
5. Add these permissions:
   - `Sites.FullControl.All`
   - `AppCatalog.ReadWrite.All`
   - `User.Read.All` (if needed)

### 3.2 Grant Admin Consent
1. Click **Grant admin consent for [Your Organization]**
2. Confirm the permissions

## Step 4: Add GitHub Secrets

### 4.1 Navigate to GitHub Repository
1. Go to your GitHub repository
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**

### 4.2 Add Required Secrets
Add these secrets:

| Secret Name | Value | Description |
|-------------|-------|-------------|
| `M365_CLIENT_ID` | Your Application (client) ID | From Step 1.3 |
| `M365_CLIENT_SECRET` | Your client secret value | From Step 2.2 |
| `M365_TENANT_ID` | Your Directory (tenant) ID | From Step 1.3 |
| `APP_CATALOG_URL` | `https://monarch360demo.sharepoint.com/sites/appcatalog` | Your app catalog URL |

## Step 5: Test the Setup

### 5.1 Manual Test (Optional)
```bash
# Install M365 CLI
npm install -g @pnp/cli-microsoft365

# Test login
m365 login --authType clientSecret --clientId "YOUR_CLIENT_ID" --clientSecret "YOUR_CLIENT_SECRET" --tenant "YOUR_TENANT_ID"

# Test connection
m365 spo site list
```

### 5.2 Trigger Deployment
1. Create a new tag: `git tag v2.1.9.1`
2. Push the tag: `git push origin v2.1.9.1`
3. Check GitHub Actions for deployment status

## Troubleshooting

### Common Issues

#### "Insufficient privileges to complete the operation"
- Ensure the app has the correct API permissions
- Grant admin consent for the permissions
- Verify the app registration is in the correct tenant

#### "App ID not found in App Catalog"
- Ensure the app catalog URL is correct
- Verify the app was successfully added to the catalog
- Check if the app name matches exactly

#### "Authentication failed"
- Verify all secrets are correctly set in GitHub
- Check that the client secret hasn't expired
- Ensure the app registration is active

### Security Best Practices

1. **Rotate secrets regularly** - Set up a reminder to regenerate client secrets
2. **Use least privilege** - Only grant necessary permissions
3. **Monitor usage** - Check Azure AD audit logs for unusual activity
4. **Secure storage** - Never commit secrets to source code

## Next Steps

After successful setup:
1. Test the deployment with a new tag
2. Monitor the deployment logs
3. Verify the solution appears in your SharePoint App Catalog
4. Consider setting up notifications for deployment status

## Support

If you encounter issues:
1. Check the GitHub Actions logs for detailed error messages
2. Verify all secrets are correctly configured
3. Test the M365 CLI commands manually
4. Review Azure AD audit logs for authentication issues 