# Azure DevOps Excel to JSON Pipeline

This Azure DevOps pipeline automatically processes Excel files containing navigation menu items and converts them to JSON configuration for the MonarchSideNavSearchToggler.

## Pipeline File

The pipeline is defined in `azure-pipelines-excel-to-json.yml` and follows the exact format you specified:

```yaml
trigger: none

pool:
  vmImage: 'ubuntu-latest'

variables:
  SHAREPOINT_TENANT: 'https://monarch360demo.sharepoint.com'
  SHAREPOINT_SITE_PATH: '/sites/shan'
  SHAREPOINT_FILE_PATH: 'SiteAssets/monarchSidebarNavConfig.json'
  EXCEL_FILE: 'menu_items.xlsx'
  OUTPUT_FILE: 'updated_monarchSidebarNavConfig.json'

# Define secrets in Azure DevOps UI or as below (for demo)
  SHAREPOINT_CLIENT_ID: $(sharepointClientId)
  SHAREPOINT_CLIENT_SECRET: $(sharepointClientSecret)

steps:
- script: |
    pip install pandas office365-rest-python-client openpyxl
  displayName: 'Install Python dependencies'

- script: |
    python scripts/update_nav.py
  displayName: 'Update SharePoint Navigation'
  env:
    SHAREPOINT_TENANT: $(SHAREPOINT_TENANT)
    SHAREPOINT_SITE_PATH: $(SHAREPOINT_SITE_PATH)
    SHAREPOINT_CLIENT_ID: $(sharepointClientId)
    SHAREPOINT_CLIENT_SECRET: $(sharepointClientSecret)
    SHAREPOINT_FILE_PATH: $(SHAREPOINT_FILE_PATH)
    EXCEL_FILE: $(EXCEL_FILE)
    OUTPUT_FILE: $(OUTPUT_FILE)
```

## Configuration

### Variables

| Variable | Description | Default Value |
|----------|-------------|---------------|
| `SHAREPOINT_TENANT` | SharePoint tenant URL | `https://monarch360demo.sharepoint.com` |
| `SHAREPOINT_SITE_PATH` | Site path within tenant | `/sites/shan` |
| `SHAREPOINT_FILE_PATH` | Path to config file in SharePoint | `SiteAssets/monarchSidebarNavConfig.json` |
| `EXCEL_FILE` | Excel file to process | `menu_items.xlsx` |
| `OUTPUT_FILE` | Output filename in SharePoint | `updated_monarchSidebarNavConfig.json` |

### Secrets

Set these secrets in Azure DevOps Library:

- `sharepointClientId`: Azure AD app registration client ID
- `sharepointClientSecret`: Azure AD app registration client secret

## Excel File Format

Your Excel file should contain the following columns:

| Column | Required | Description | Example |
|--------|----------|-------------|---------|
| `Title` | ✅ Yes | Navigation item title | "Home", "Documents" |
| `Url` | ✅ Yes | Navigation item URL | "https://sharepoint.com/sites/home" |
| `ParentId` | ❌ No | Parent item ID (0 for root items) | 0, 1, 2 |
| `Order` | ❌ No | Display order (defaults to row order) | 1, 2, 3 |

### Example Excel Structure

| Title | Url | ParentId | Order |
|-------|-----|----------|-------|
| Home | https://monarch360demo.sharepoint.com/sites/shan | 0 | 1 |
| Documents | https://monarch360demo.sharepoint.com/sites/shan/Documents | 0 | 2 |
| External Link | https://www.google.com | 0 | 3 |
| Sub Item | https://monarch360demo.sharepoint.com/sites/shan/SubSite | 1 | 1 |

## Target Property Logic

The pipeline automatically determines the `target` property based on the URL:

- **Internal links** (containing `monarch360demo.sharepoint.com`): `target: '_self'`
- **External links** (other URLs): `target: '_blank'`

This replaces the old `isExternal` boolean with the more semantic `target` property.

## Pipeline Steps

### 1. Install Dependencies
```yaml
- script: |
    pip install pandas office365-rest-python-client openpyxl
  displayName: 'Install Python dependencies'
```

### 2. Update SharePoint Navigation
```yaml
- script: |
    python scripts/update_nav.py
  displayName: 'Update SharePoint Navigation'
```

The script will:
- Download existing configuration from SharePoint
- Process the Excel file and convert to navigation items
- Update the configuration with new items
- Upload the updated configuration back to SharePoint

## Setup Instructions

### 1. Create Azure DevOps Pipeline

1. Go to your Azure DevOps project
2. Navigate to **Pipelines** → **New Pipeline**
3. Choose **Azure Repos Git** (or your source)
4. Select **Existing Azure Pipelines YAML file**
5. Choose the `azure-pipelines-excel-to-json.yml` file

### 2. Configure Variables

1. Go to **Pipelines** → **Edit** → **Variables**
2. Add the following variables:
   - `SHAREPOINT_TENANT`: Your SharePoint tenant URL
   - `SHAREPOINT_SITE_PATH`: Your site path
   - `SHAREPOINT_FILE_PATH`: Path to your config file
   - `EXCEL_FILE`: Your Excel file name
   - `OUTPUT_FILE`: Output file name

### 3. Configure Secrets

1. Go to **Library** → **Variable Groups**
2. Create a new variable group
3. Add these secret variables:
   - `sharepointClientId`: Your Azure AD app registration client ID
   - `sharepointClientSecret`: Your Azure AD app registration client secret
4. Link the variable group to your pipeline

### 4. Run the Pipeline

1. Go to **Pipelines** → **Run Pipeline**
2. Select your pipeline
3. Click **Run**

## Generated JSON Structure

The pipeline generates navigation configuration in this format:

```json
{
  "version": "2.1.9.0",
  "items": [
    {
      "id": 1,
      "title": "Home",
      "url": "https://monarch360demo.sharepoint.com/sites/shan",
      "parentId": 0,
      "order": 1,
      "target": "_self"
    },
    {
      "id": 2,
      "title": "External Link",
      "url": "https://www.google.com",
      "parentId": 0,
      "order": 2,
      "target": "_blank"
    }
  ],
  "theme": {
    "primaryColor": "#0078d4",
    "position": "left"
  },
  "sidebar": {
    "isOpen": true,
    "isPinned": false,
    "position": "left"
  }
}
```

## Troubleshooting

### Common Issues

1. **Missing Excel file**: Ensure `menu_items.xlsx` exists in your repository
2. **Authentication errors**: Verify your SharePoint credentials are correct
3. **Missing columns**: Ensure your Excel file has `Title` and `Url` columns
4. **File path issues**: Check that `SHAREPOINT_FILE_PATH` is correct

### Debug Mode

You can test the Excel processing locally:

```bash
# Test without SharePoint operations
python scripts/update_nav.py menu_items.xlsx --test-only

# Full processing (requires SharePoint credentials)
export SHAREPOINT_TENANT="https://your-tenant.sharepoint.com"
export SHAREPOINT_SITE_PATH="/sites/yoursite"
export SHAREPOINT_CLIENT_ID="your-client-id"
export SHAREPOINT_CLIENT_SECRET="your-client-secret"
python scripts/update_nav.py
```

## Integration with MonarchNav

This pipeline follows the same pattern as the [MonarchNav repository](https://github.com/ShahanurSharif/monarchNav) but is specifically adapted for the MonarchSideNavSearchToggler project with:

- Updated property names (`target` instead of `isExternal`)
- Azure DevOps pipeline format
- Enhanced environment variable support
- Improved error handling and logging 