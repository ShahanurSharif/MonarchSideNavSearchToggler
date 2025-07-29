#!/usr/bin/env python3
"""
Navigation Update Script for MonarchSideNavSearchToggler
Following MonarchNav pattern: https://github.com/ShahanurSharif/monarchNav
Uses office365-rest-python-client for SharePoint file operations.
"""

import pandas as pd
import json
import sys
import os
import tempfile
from office365.sharepoint.client_context import ClientContext
from office365.runtime.auth.client_credential import ClientCredential

def download_existing_config(site_url, client_id, client_secret):
    """Download existing monarchSidebarNavConfig.json from SharePoint Site Assets"""
    print("Downloading existing navigation config from SharePoint...")

    ctx = ClientContext(site_url).with_credentials(ClientCredential(client_id, client_secret))
    file_url = "/sites/shan/SiteAssets/monarchSidebarNavConfig.json"
    temp_dir = tempfile.gettempdir()
    local_path = os.path.join(temp_dir, "monarchSidebarNavConfig.json")

    with open(local_path, "wb") as f:
        response = ctx.web.get_file_by_server_relative_url(file_url).download(f).execute_query()
    with open(local_path, "r", encoding="utf-8") as f:
        config = json.load(f)

    print(f"Downloaded config with {len(config.get('items', []))} items")
    return config, local_path

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
        title = str(row.get('Title', '')).strip() if pd.notna(row.get('Title')) else ''
        url = str(row.get('Url', '')).strip() if pd.notna(row.get('Url')) else ''
        parent_id = int(row.get('ParentId', 0)) if pd.notna(row.get('ParentId')) else 0
        if not title:
            continue
        item = {
            "id": index + 1,
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
    df = read_excel_data(excel_file)
    new_items = convert_excel_to_nav_items(df)
    config['items'] = new_items
    print(f"Updated config with {len(new_items)} items")
    return config

def upload_to_sharepoint(site_url, client_id, client_secret, local_path):
    """Upload updated config back to SharePoint Site Assets"""
    print("Uploading updated config to SharePoint...")
    ctx = ClientContext(site_url).with_credentials(ClientCredential(client_id, client_secret))
    target_folder = ctx.web.get_folder_by_server_relative_url("/sites/shan/SiteAssets")
    with open(local_path, "rb") as content_file:
        file_content = content_file.read()
    target_folder.upload_file("monarchSidebarNavConfig.json", file_content).execute_query()
    print("Successfully uploaded updated config to SharePoint")

def main():
    if len(sys.argv) != 2:
        print("Usage: python update_nav.py <excel_file>")
        print("Example: python update_nav.py menu_items.xlsx")
        sys.exit(1)

    excel_file = sys.argv[1]
    if not os.path.exists(excel_file):
        print(f"Error: Excel file '{excel_file}' not found")
        sys.exit(1)

    site_url = os.getenv('SHAREPOINT_SITE_URL')
    client_id = os.getenv('SHAREPOINT_CLIENT_ID')
    client_secret = os.getenv('SHAREPOINT_CLIENT_SECRET')
    if not all([site_url, client_id, client_secret]):
        print("Missing SharePoint credentials. Set SHAREPOINT_SITE_URL, SHAREPOINT_CLIENT_ID, SHAREPOINT_CLIENT_SECRET")
        sys.exit(1)

    try:
        # Step 1: Download existing config from SharePoint
        config, local_path = download_existing_config(site_url, client_id, client_secret)

        # Step 2: Update items from Excel (preserve other properties)
        updated_config = update_items_from_excel(config, excel_file)

        # Step 3: Save updated config to temp file
        with open(local_path, "w", encoding="utf-8") as f:
            json.dump(updated_config, f, indent=2, ensure_ascii=False)

        # Step 4: Upload back to SharePoint
        upload_to_sharepoint(site_url, client_id, client_secret, local_path)

        print("\n✅ Navigation update completed successfully!")
        print("The navigation config has been updated in SharePoint Site Assets.")

    except Exception as e:
        print(f"\n❌ Error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()