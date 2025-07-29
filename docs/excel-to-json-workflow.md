# Excel to JSON Navigation Workflow

This workflow automatically processes Excel files containing navigation menu items and converts them to JSON configuration for the MonarchSideNavSearchToggler.

## Overview

The workflow is triggered when:
- Excel files (`menu_items.xlsx`) are pushed to the repository
- The `update_nav.py` script is modified
- Manual workflow dispatch from GitHub Actions

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

The workflow automatically determines the `target` property based on the URL:

- **Internal links** (containing `monarch360demo.sharepoint.com`): `target: '_self'`
- **External links** (other URLs): `target: '_blank'`

This replaces the old `isExternal` boolean with the more semantic `target` property.

## Workflow Steps

### 1. Validation
- Checks Excel file structure
- Validates required columns (`Title`, `Url`)
- Reports any missing or empty data

### 2. Processing
- Converts Excel rows to navigation items
- Applies target logic for internal/external links
- Preserves existing configuration (theme, sidebar settings)

### 3. SharePoint Update
- Downloads current configuration from SharePoint
- Updates only the navigation items
- Uploads updated configuration back to SharePoint

## Manual Execution

You can manually trigger the workflow from GitHub Actions:

1. Go to **Actions** tab in your repository
2. Select **Excel to JSON Navigation Update**
3. Click **Run workflow**
4. Fill in the parameters:
   - **Excel file path**: Path to your Excel file (default: `menu_items.xlsx`)
   - **SharePoint site URL**: Your SharePoint site URL
   - **App catalog URL**: Your app catalog URL

## Required Secrets

Set these secrets in your GitHub repository settings:

- `SHAREPOINT_CLIENT_ID`: Azure AD app registration client ID
- `SHAREPOINT_CLIENT_SECRET`: Azure AD app registration client secret

## Generated JSON Structure

The workflow generates navigation configuration in this format:

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
    "position": "left",
    // ... other theme properties
  },
  "sidebar": {
    "isOpen": true,
    "isPinned": false,
    "position": "left"
  }
}
```

## Testing Locally

You can test the Excel processing locally:

```bash
# Test without SharePoint operations
python scripts/update_nav.py menu_items.xlsx --test-only

# Full processing (requires SharePoint credentials)
export SHAREPOINT_SITE_URL="https://your-site.sharepoint.com"
export SHAREPOINT_CLIENT_ID="your-client-id"
export SHAREPOINT_CLIENT_SECRET="your-client-secret"
python scripts/update_nav.py menu_items.xlsx
```

## Troubleshooting

### Common Issues

1. **Missing required columns**: Ensure your Excel file has `Title` and `Url` columns
2. **Authentication errors**: Verify your SharePoint credentials are correct
3. **File not found**: Check that the Excel file path is correct

### Debug Mode

The workflow includes extensive logging to help debug issues:

- Excel file validation results
- Processing statistics
- SharePoint operation status
- Generated JSON preview

## Integration with MonarchNav

This workflow follows the same pattern as the [MonarchNav repository](https://github.com/ShahanurSharif/monarchNav) but is specifically adapted for the MonarchSideNavSearchToggler project with:

- Updated property names (`target` instead of `isExternal`)
- SharePoint integration for configuration management
- GitHub Actions automation
- Enhanced validation and error handling 