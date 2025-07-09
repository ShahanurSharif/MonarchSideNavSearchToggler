# Save Functionality Implementation

## Overview
The MonarchSidenavSearchToggler now includes comprehensive save functionality that persists navigation items, sidebar state, and user preferences to a configuration file.

## Configuration File
- **Location**: `sharepoint/assets/monarchSidebarNavConfig.json`
- **Structure**: Contains theme settings, navigation items, and sidebar state

## Features

### Auto-Save
The following actions automatically trigger configuration saves:
- Adding new navigation items
- Editing existing navigation items
- Deleting navigation items
- Toggling pin/unpin state
- Changing toggle button position
- Opening/closing sidebar

### Manual Save
- A dedicated "Save" button appears in config mode
- Shows save status (saving, success, error)
- Located next to the Edit button in the header

### Persistent State
The following settings are saved and restored:
- **Navigation Items**: Complete hierarchy with titles, URLs, and order
- **Sidebar State**: Open/closed, pinned/unpinned
- **Toggle Position**: Vertical position of the toggle button
- **Sidebar Width**: Current width setting

## Configuration Service

### Location
`src/extensions/monarchSidenavSearchToggler/services/ConfigurationService.ts`

### Key Methods
- `loadConfiguration()`: Loads config from JSON file
- `saveConfiguration()`: Saves current state to JSON file
- `getDefaultConfiguration()`: Provides fallback defaults

### Error Handling
- Graceful fallback to default configuration if loading fails
- Console logging for debugging
- User-friendly error messages

## Development Notes

### SharePoint Integration
The current implementation includes:
- LocalStorage fallback for development
- SharePoint REST API integration (commented out)
- Form digest handling for SharePoint operations

### Future Enhancements
- Real SharePoint file operations
- User-specific configurations
- Configuration versioning
- Backup/restore functionality

## Usage

1. **Enable Config Mode**: Click the Edit button in the sidebar header
2. **Make Changes**: Add, edit, or delete navigation items
3. **Auto-Save**: Changes are automatically saved
4. **Manual Save**: Use the Save button for immediate persistence
5. **Reload**: Configuration is automatically loaded on page refresh

## File Structure
```
sharepoint/assets/
├── monarchSidebarNavConfig.json    # Configuration file
└── ...

src/extensions/monarchSidenavSearchToggler/
├── services/
│   └── ConfigurationService.ts     # Save/load logic
└── MonarchSidenavSearchToggler.tsx # Main component with save integration
``` 