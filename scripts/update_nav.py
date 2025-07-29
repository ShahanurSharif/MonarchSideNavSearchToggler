#!/usr/bin/env python3
"""
Navigation Update Script for MonarchSideNavSearchToggler
Following MonarchNav pattern: https://github.com/ShahanurSharif/monarchNav
"""

import pandas as pd
import json
import subprocess
import sys
import os
import tempfile

def run_powershell_command(command):
    """Execute PowerShell command and return output"""
    try:
        result = subprocess.run(
            ["pwsh", "-Command", command],
            capture_output=True,
            text=True,
            check=True
        )
        return result.stdout.strip()
    except subprocess.CalledProcessError as e:
        print(f"PowerShell command failed: {e}")
        print(f"Error output: {e.stderr}")
        return None

def download_existing_config():
    """Download existing monarchSidebarNavConfig.json from SharePoint Site Assets"""
    print("Downloading existing navigation config from SharePoint...")

    site_url = os.getenv('SHAREPOINT_SITE_URL')
    client_id = os.getenv('SHAREPOINT_CLIENT_ID')
    client_secret = os.getenv('SHAREPOINT_CLIENT_SECRET')

    if not all([site_url, client_id, client_secret]):
        raise ValueError("Missing SharePoint credentials. Set SHAREPOINT_SITE_URL, SHAREPOINT_CLIENT_ID, SHAREPOINT_CLIENT_SECRET")

    # Connect to SharePoint
    connect_cmd = f"""
    Connect-PnPOnline -Url "{site_url}" -ClientId "{client_id}" -ClientSecret "{client_secret}"
    """.strip()

    if run_powershell_command(connect_cmd) is None:
        raise Exception("Failed to connect to SharePoint")

    # Download the config file
    temp_dir = tempfile.gettempdir()
    local_path = os.path.join(temp_dir, "monarchSidebarNavConfig.json")

    download_cmd = f'Get-PnPFile -Url "SiteAssets/monarchSidebarNavConfig.json" -Path "{temp_dir}" -FileName "monarchSidebarNavConfig.json" -AsFile'

    if run_powershell_command(download_cmd) is None:
        raise Exception("Failed to download config file")

    # Read and return the config
    with open(local_path, 'r', encoding='utf-8') as f:
        config = json.load(f)

    print(f"Downloaded config with {len(config.get('items', []))} items")
    return config

def read_excel_data(excel_file):
    """Read navigation data from Excel file"""
    print(f"Reading Excel file: {excel_file}")

    try:
        df = pd.read_excel(excel_file)
        print(f"Found {len(df)} rows in Excel")
        return df
    except Exception as e:
        raise Exception(f"Failed to read Excel file: {e}")

def convert_excel_to_nav_items(df):
    """Convert Excel data to navigation items following MonarchNav pattern"""
    items = []

    for index, row in df.iterrows():
        # Handle NaN values
        title = str(row.get('Title', '')).strip() if pd.notna(row.get('Title')) else ''
        url = str(row.get('Url', '')).strip() if pd.notna(row.get('Url')) else ''
        parent_id = int(row.get('ParentId', 0)) if pd.notna(row.get('ParentId')) else 0

        if not title:  # Skip empty titles
            continue

        item = {
            "id": index + 1,  # Start from 1
            "title": title,
            "url": url,
            "parentId": parent_id,
            "isExternal": url.startswith('http') and 'monarch360demo.sharepoint.com' not in url
        }

        items.append(item)

    print(f"Converted to {len(items)} navigation items")
    return items

def update_items_from_excel(config, excel_file):
    """Update only the items array in config from Excel data"""
    print("Updating navigation items from Excel...")

    # Read Excel data
    df = read_excel_data(excel_file)

    # Convert to navigation items
    new_items = convert_excel_to_nav_items(df)

    # Update only the items array, preserve everything else
    config['items'] = new_items

    print(f"Updated config with {len(new_items)} items")
    return config

def upload_to_sharepoint(config):
    """Upload updated config back to SharePoint Site Assets"""
    print("Uploading updated config to SharePoint...")

    # Save to temporary file
    temp_dir = tempfile.gettempdir()
    local_path = os.path.join(temp_dir, "monarchSidebarNavConfig_updated.json")

    with open(local_path, 'w', encoding='utf-8') as f:
        json.dump(config, f, indent=2, ensure_ascii=False)

    # Upload to SharePoint
    upload_cmd = f'Add-PnPFile -Path "{local_path}" -Folder "SiteAssets" -NewFileName "monarchSidebarNavConfig.json"'

    if run_powershell_command(upload_cmd) is None:
        raise Exception("Failed to upload config file")

    print("Successfully uploaded updated config to SharePoint")

    # Clean up temp file
    os.remove(local_path)

def main():
    """Main function following MonarchNav pattern"""
    if len(sys.argv) != 2:
        print("Usage: python update_nav.py <excel_file>")
        print("Example: python update_nav.py menu_items.xlsx")
        sys.exit(1)

    excel_file = sys.argv[1]

    if not os.path.exists(excel_file):
        print(f"Error: Excel file '{excel_file}' not found")
        sys.exit(1)

    try:
        # Step 1: Download existing config from SharePoint
        config = download_existing_config()

        # Step 2: Update items from Excel (preserve other properties)
        updated_config = update_items_from_excel(config, excel_file)

        # Step 3: Upload back to SharePoint
        upload_to_sharepoint(updated_config)

        print("\n✅ Navigation update completed successfully!")
        print("The navigation config has been updated in SharePoint Site Assets.")

    except Exception as e:
        print(f"\n❌ Error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()