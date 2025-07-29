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
    
    # Use environment variables for file path if available
    file_path = os.getenv('SHAREPOINT_FILE_PATH', '/sites/shan/SiteAssets/monarchSidebarNavConfig.json')
    file_url = file_path
    
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
        # Use the actual column names from Excel
        title = str(row.get('title', '')).strip() if pd.notna(row.get('title')) else ''
        url = str(row.get('url', '')).strip() if pd.notna(row.get('url')) else ''
        parentId = int(row.get('parentId', 0)) if pd.notna(row.get('parentId')) else 0
        order = int(row.get('order', index + 1)) if pd.notna(row.get('order')) else index + 1
        target = str(row.get('target', '_self')).strip() if pd.notna(row.get('target')) else '_self'
        
        if not title:
            continue
        
        item = {
            "id": int(row.get('id', index + 1)) if pd.notna(row.get('id')) else index + 1,
            "title": title,
            "url": url,
            "parentId": parentId,
            "order": order,
            "target": target
        }
        items.append(item)
    print(f"Converted to {len(items)} navigation items")
    return items

def update_items_from_excel(config, excel_file):
    """Update only the items array in config from Excel data"""
    print("Updating navigation items from Excel...")
    df = read_excel_data(excel_file)
    new_items = convert_excel_to_nav_items(df)
    
    # Debug: Print what we're updating
    print(f"Original config items count: {len(config.get('items', []))}")
    print(f"New items count: {len(new_items)}")
    print(f"Sample new items: {new_items[:2] if new_items else 'No items'}")
    
    # If config is empty or doesn't have items, create a fresh config
    if not config or not config.get('items'):
        print("⚠️  Config is empty, creating fresh config...")
        config = {
            "version": "2.1.9.0",
            "items": new_items,
            "theme": {
                "primaryColor": "#0078d4",
                "secondaryColor": "#106ebe",
                "backgroundColor": "#ffffff",
                "textColor": "#323130",
                "hoverColor": "#f3f2f1",
                "fontFamily": "Segoe UI, system-ui, sans-serif",
                "fontSize": "14px",
                "borderRadius": "4px",
                "sidebarWidth": "300px",
                "borderEnabled": False,
                "borderColor": "#d2d0ce",
                "paddingTopBottom": "2px",
                "logoUrl": "",
                "logoSize": "40px",
                "siteName": "Monarch360",
                "siteUrl": "",
                "position": "left"
            },
            "sidebar": {
                "isOpen": True,
                "isPinned": False,
                "position": "left"
            },
            "searchEnabled": True,
            "autoSave": True,
            "lastModified": "",
            "createdBy": "Excel Update Script",
            "modifiedBy": "Excel Update Script"
        }
    else:
        # Update existing config
        config['items'] = new_items
    
    print(f"Updated config with {len(new_items)} items")
    print(f"Final config items count: {len(config.get('items', []))}")
    return config

def upload_to_sharepoint(site_url, client_id, client_secret, local_path):
    """Upload updated config back to SharePoint Site Assets"""
    print("Uploading updated config to SharePoint...")
    ctx = ClientContext(site_url).with_credentials(ClientCredential(client_id, client_secret))
    
    # Use environment variables for folder path if available
    folder_path = os.getenv('SHAREPOINT_FILE_PATH', '/sites/shan/SiteAssets/monarchSidebarNavConfig.json')
    folder_path = '/'.join(folder_path.split('/')[:-1])  # Remove filename to get folder path
    
    # Always use the original filename, not OUTPUT_FILE
    original_filename = 'monarchSidebarNavConfig.json'
    
    print(f"Uploading to folder: {folder_path}")
    print(f"Uploading file: {original_filename}")
    
    target_folder = ctx.web.get_folder_by_server_relative_url(folder_path)
    
    # First, try to delete the existing file if it exists
    try:
        existing_file = ctx.web.get_file_by_server_relative_url(f"{folder_path}/{original_filename}")
        existing_file.delete_object().execute_query()
        print(f"Deleted existing file: {original_filename}")
    except Exception as e:
        print(f"File doesn't exist or couldn't delete: {e}")
    
    # Upload the new file
    with open(local_path, "rb") as content_file:
        file_content = content_file.read()
    target_folder.upload_file(original_filename, file_content).execute_query()
    print(f"Successfully uploaded updated config to SharePoint as {original_filename}")

def main():
    # Check if we have command line arguments or environment variables
    if len(sys.argv) < 2 and not os.getenv('EXCEL_FILE'):
        print("Usage: python update_nav.py <excel_file> [--test-only]")
        print("Example: python update_nav.py menu_items.xlsx")
        print("Example: python update_nav.py menu_items.xlsx --test-only")
        print("Or set EXCEL_FILE environment variable for Azure DevOps pipeline")
        sys.exit(1)

    excel_file = sys.argv[1] if len(sys.argv) > 1 else os.getenv('EXCEL_FILE', 'menu_items.xlsx')
    test_only = len(sys.argv) > 2 and sys.argv[2] == '--test-only'
    
    if not os.path.exists(excel_file):
        print(f"Error: Excel file '{excel_file}' not found")
        sys.exit(1)

    if test_only:
        print("🧪 Test mode: Processing Excel file without SharePoint operations...")
        try:
            # Test Excel processing only
            df = read_excel_data(excel_file)
            new_items = convert_excel_to_nav_items(df)
            print(f"\n✅ Test completed successfully!")
            print(f"📊 Processed {len(new_items)} navigation items")
            print("📋 Sample items:")
            for i, item in enumerate(new_items[:3]):  # Show first 3 items
                print(f"  {i+1}. {item['title']} -> {item['url']} (target: {item['target']})")
            if len(new_items) > 3:
                print(f"  ... and {len(new_items) - 3} more items")
        except Exception as e:
            print(f"\n❌ Test failed: {e}")
            sys.exit(1)
    else:
        # Use conventional environment variable names
        site_url = os.getenv('SHAREPOINT_SITE_URL')
        client_id = os.getenv('SHAREPOINT_CLIENT_ID')
        client_secret = os.getenv('SHAREPOINT_CLIENT_SECRET')
        
        if not all([site_url, client_id, client_secret]):
            print("Missing SharePoint credentials. Set SHAREPOINT_SITE_URL, SHAREPOINT_CLIENT_ID, SHAREPOINT_CLIENT_SECRET")
            sys.exit(1)

        try:
            # Step 1: Download existing config from SharePoint
            config, local_path = download_existing_config(site_url, client_id, client_secret)
            print(f"Downloaded config structure: {list(config.keys()) if config else 'No config'}")
            print(f"Downloaded config items: {len(config.get('items', [])) if config else 0}")

            # Step 2: Update items from Excel (preserve other properties)
            updated_config = update_items_from_excel(config, excel_file)
            print(f"Updated config items: {len(updated_config.get('items', []))}")

            # Step 3: Save updated config to temp file
            with open(local_path, "w", encoding="utf-8") as f:
                json.dump(updated_config, f, indent=2, ensure_ascii=False)
            print(f"Saved config to: {local_path}")

            # Step 4: Upload back to SharePoint
            upload_to_sharepoint(site_url, client_id, client_secret, local_path)

            print("\n✅ Navigation update completed successfully!")
            print("The navigation config has been updated in SharePoint Site Assets.")

        except Exception as e:
            print(f"\n❌ Error: {e}")
            sys.exit(1)

if __name__ == "__main__":
    main()