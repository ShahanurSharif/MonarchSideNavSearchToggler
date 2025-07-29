#!/usr/bin/env python3
"""
Test script to verify Excel processing with target property
"""

import pandas as pd
import json
import sys
import os

def test_excel_processing():
    """Test the Excel processing logic"""
    
    # Test data - simulate Excel rows
    test_data = [
        {
            'Title': 'Home',
            'Url': 'https://monarch360demo.sharepoint.com/sites/shan',
            'ParentId': 0,
            'Order': 1
        },
        {
            'Title': 'External Link',
            'Url': 'https://www.google.com',
            'ParentId': 0,
            'Order': 2
        },
        {
            'Title': 'Documents',
            'Url': 'https://monarch360demo.sharepoint.com/sites/shan/Documents',
            'ParentId': 0,
            'Order': 3
        },
        {
            'Title': 'Child Item',
            'Url': 'https://www.microsoft.com',
            'ParentId': 1,
            'Order': 1
        }
    ]
    
    # Create DataFrame
    df = pd.DataFrame(test_data)
    print("Test Data:")
    print(df.to_string())
    print("\n" + "="*50 + "\n")
    
    # Test the conversion logic
    items = []
    for index, row in df.iterrows():
        title = str(row.get('Title', '')).strip() if pd.notna(row.get('Title')) else ''
        url = str(row.get('Url', '')).strip() if pd.notna(row.get('Url')) else ''
        parent_id = int(row.get('ParentId', 0)) if pd.notna(row.get('ParentId')) else 0
        order = int(row.get('Order', index + 1)) if pd.notna(row.get('Order')) else index + 1
        
        if not title:
            continue
            
        # Determine target based on URL
        target = '_self'  # Default to same window
        if url.startswith('http') and 'monarch360demo.sharepoint.com' not in url:
            target = '_blank'  # External links open in new tab
        
        item = {
            "id": index + 1,
            "title": title,
            "url": url,
            "parentId": parent_id,
            "order": order,
            "target": target
        }
        items.append(item)
    
    print("Converted Navigation Items:")
    for item in items:
        print(f"  ID: {item['id']}")
        print(f"  Title: {item['title']}")
        print(f"  URL: {item['url']}")
        print(f"  Parent ID: {item['parentId']}")
        print(f"  Order: {item['order']}")
        print(f"  Target: {item['target']}")
        print(f"  External: {'Yes' if item['target'] == '_blank' else 'No'}")
        print()
    
    # Test with actual Excel file if it exists
    excel_file = "menu_items.xlsx"
    if os.path.exists(excel_file):
        print("Testing with actual Excel file...")
        try:
            actual_df = pd.read_excel(excel_file)
            print(f"Found {len(actual_df)} rows in {excel_file}")
            print("Columns:", list(actual_df.columns))
            print("\nFirst few rows:")
            print(actual_df.head().to_string())
        except Exception as e:
            print(f"Error reading Excel file: {e}")
    else:
        print(f"Excel file {excel_file} not found")

if __name__ == "__main__":
    test_excel_processing() 