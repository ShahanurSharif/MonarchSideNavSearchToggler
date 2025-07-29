#!/usr/bin/env python3
"""
Test script to run update_nav.py with debugging
"""

import os
import sys

# Set environment variables for testing
os.environ['SHAREPOINT_SITE_URL'] = 'https://monarch360demo.sharepoint.com/sites/shan'
os.environ['SHAREPOINT_CLIENT_ID'] = 'your-client-id'  # Replace with actual
os.environ['SHAREPOINT_CLIENT_SECRET'] = 'your-client-secret'  # Replace with actual
os.environ['SHAREPOINT_FILE_PATH'] = 'SiteAssets/monarchSidebarNavConfig.json'
os.environ['EXCEL_FILE'] = 'menu_items.xlsx'

print("🧪 Testing update_nav.py with environment variables...")
print(f"SHAREPOINT_SITE_URL: {os.environ.get('SHAREPOINT_SITE_URL')}")
print(f"SHAREPOINT_FILE_PATH: {os.environ.get('SHAREPOINT_FILE_PATH')}")
print(f"EXCEL_FILE: {os.environ.get('EXCEL_FILE')}")

# Import and run the main function
try:
    from scripts.update_nav import main
    main()
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc() 