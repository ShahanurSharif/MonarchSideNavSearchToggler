# Deployment Checklist

## ✅ Pre-Deployment Setup

- [ ] Azure AD App Registration created
- [ ] Client Secret generated and copied
- [ ] API Permissions configured and granted admin consent
- [ ] GitHub Secrets added:
  - [ ] `M365_CLIENT_ID`
  - [ ] `M365_CLIENT_SECRET`
  - [ ] `M365_TENANT_ID`
  - [ ] `APP_CATALOG_URL`
- [ ] GitHub Actions workflow updated

## ✅ Build Process

- [ ] `gulp clean`
- [ ] `gulp build --ship`
- [ ] `gulp bundle --ship`
- [ ] `gulp package-solution --ship`
- [ ] Verify `.sppkg` file created

## ✅ Git Operations

- [ ] Code committed
- [ ] Version updated in `package-solution.json`
- [ ] Tag created: `git tag v2.1.9.0`
- [ ] Tag pushed: `git push origin v2.1.9.0`

## ✅ Deployment

- [ ] GitHub Actions workflow triggered
- [ ] Build completed successfully
- [ ] Authentication successful
- [ ] App added to catalog
- [ ] App deployed to tenant
- [ ] Verify in SharePoint App Catalog

## 🔧 Troubleshooting Commands

```bash
# Test M365 CLI connection
m365 login --authType clientSecret --clientId "YOUR_ID" --clientSecret "YOUR_SECRET" --tenant "YOUR_TENANT"
m365 spo site list

# Check app catalog
m365 spo app list --appCatalogUrl "https://monarch360demo.sharepoint.com/sites/appcatalog"

# Manual deployment
m365 spo app add -p sharepoint/solution/monarch-sidenav.sppkg --overwrite --appCatalogUrl "https://monarch360demo.sharepoint.com/sites/appcatalog"
```

## 📞 Support

- Check GitHub Actions logs for detailed errors
- Verify all secrets are correctly set
- Test M365 CLI commands manually
- Review Azure AD audit logs 