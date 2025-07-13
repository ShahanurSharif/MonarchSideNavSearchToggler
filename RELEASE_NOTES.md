# Release Notes - MonarchSideNavSearchToggler

## Version 2.1.3 (Latest) - 2024-12-19

### 🚀 Major Fixes
- **Fixed Toggle Button Visibility**: Resolved critical issue where toggle button was not showing in production
- **Fixed Property Configuration**: Corrected XML files to use proper `description` property instead of `testMessage`
- **Enhanced Toggle Button Styling**: Improved visibility with higher z-index (9999) and better background opacity
- **Removed Border**: Removed border from toggle button per client request for cleaner appearance

### 🔧 Technical Improvements
- **Added Comprehensive Debug Logging**: Enhanced troubleshooting capabilities with detailed console logs
- **Fixed Function Order**: Resolved linter warnings by reordering function definitions
- **Added Version Sync Script**: Created `sync-version.js` for automated version management across all files
- **Improved Error Handling**: Better retry logic and error recovery for configuration loading

### 📦 Deployment
- **Production Build**: Successfully built and packaged for production deployment
- **Package Size**: 231KB optimized package
- **Version Sync**: All version numbers synchronized to 2.1.3 across package.json, manifest, and solution files

### 🐛 Bug Fixes
- Fixed infinite loop in search functionality
- Resolved pin/unpin sidebar state persistence issues
- Fixed SharePoint style override conflicts
- Improved sidebar loading experience with retry logic
- Fixed UI/UX issues with header padding and theme font size application

---

## Version 2.1.2 - 2024-12-19

### 🎨 UI/UX Improvements
- **Sidebar Header Padding**: Changed from 4px 20px to 4px 8px for better spacing
- **Theme Font Size**: Restricted theme font size application to navigation list items only
- **SharePoint Style Overrides**: Enhanced CSS injection with !important rules and MutationObserver for persistent styling

### 🔧 Technical Enhancements
- **Loading Experience**: Moved loading indicator inside sidebar for better UX
- **Configuration Loading**: Added retry logic for hard reloads (up to 2 retries)
- **State Management**: Fixed React state closure issues by passing explicit pin state during save

### 🐛 Bug Fixes
- Fixed infinite loop in search functionality by memoizing search results
- Resolved pin/unpin sidebar behavior with proper state persistence
- Fixed SharePoint overriding custom styles with enhanced CSS injection
- Resolved linter warnings related to function order and missing return types

---

## Version 2.1.1 - 2024-12-19

### 🎨 UI/UX Improvements
- **Sidebar Header Padding**: Changed from 4px 20px to 4px 8px for better spacing
- **Theme Font Size**: Restricted theme font size application to navigation list items only
- **SharePoint Style Overrides**: Enhanced CSS injection with !important rules and MutationObserver for persistent styling

### 🔧 Technical Enhancements
- **Loading Experience**: Moved loading indicator inside sidebar for better UX
- **Configuration Loading**: Added retry logic for hard reloads (up to 2 retries)
- **State Management**: Fixed React state closure issues by passing explicit pin state during save

### 🐛 Bug Fixes
- Fixed infinite loop in search functionality by memoizing search results
- Resolved pin/unpin sidebar behavior with proper state persistence
- Fixed SharePoint overriding custom styles with enhanced CSS injection
- Resolved linter warnings related to function order and missing return types

---

## Version 2.1.0 - 2024-12-19

### 🎨 UI/UX Improvements
- **Sidebar Header Padding**: Changed from 4px 20px to 4px 8px for better spacing
- **Theme Font Size**: Restricted theme font size application to navigation list items only
- **SharePoint Style Overrides**: Enhanced CSS injection with !important rules and MutationObserver for persistent styling

### 🔧 Technical Enhancements
- **Loading Experience**: Moved loading indicator inside sidebar for better UX
- **Configuration Loading**: Added retry logic for hard reloads (up to 2 retries)
- **State Management**: Fixed React state closure issues by passing explicit pin state during save

### 🐛 Bug Fixes
- Fixed infinite loop in search functionality by memoizing search results
- Resolved pin/unpin sidebar behavior with proper state persistence
- Fixed SharePoint overriding custom styles with enhanced CSS injection
- Resolved linter warnings related to function order and missing return types

---

## Version 2.0.0 - 2024-12-19

### 🚀 Major Features
- **Hierarchical Navigation**: Full support for parent-child navigation structure
- **Search Functionality**: Real-time search with highlighting and filtering
- **Theme Customization**: Comprehensive theme system with color, font, and layout options
- **Pin/Unpin Sidebar**: Persistent sidebar state with content adjustment
- **Configuration Management**: JSON-based configuration with SharePoint integration

### 🎨 UI Components
- **Sidebar Navigation**: Collapsible hierarchical navigation with icons
- **Search Interface**: Real-time search with clear functionality
- **Theme Settings Modal**: Comprehensive theme customization interface
- **Navigation Config Modal**: Add, edit, and delete navigation items
- **Toggle Button**: Draggable toggle button for sidebar control

### 🔧 Technical Features
- **SharePoint Integration**: Full SPFx application customizer implementation
- **Configuration Service**: SharePoint list-based configuration storage
- **Responsive Design**: Mobile-friendly responsive layout
- **Accessibility**: ARIA labels and keyboard navigation support
- **Error Handling**: Comprehensive error handling and retry logic

---

## Version 1.0.0 - 2024-12-19

### 🎉 Initial Release
- **Basic Sidebar Navigation**: Simple navigation structure
- **Toggle Functionality**: Basic sidebar show/hide functionality
- **SharePoint Integration**: SPFx application customizer foundation
- **Configuration System**: Basic configuration management

---

## Installation Instructions

1. **Upload Package**: Upload `monarch-sidenav.sppkg` to SharePoint App Catalog
2. **Deploy Solution**: Deploy the solution to your SharePoint environment
3. **Activate Features**: Activate the application customizer feature
4. **Configure Navigation**: Use the configuration interface to set up navigation items
5. **Customize Theme**: Apply theme settings as needed

## Configuration

The extension uses a JSON configuration file stored in SharePoint that includes:
- Navigation items with hierarchical structure
- Theme settings (colors, fonts, layout)
- Sidebar state (open/closed, pinned/unpinned)
- Toggle button position

## Support

For issues or questions, please check the console logs for debugging information and refer to the documentation in the `/docs` folder. 