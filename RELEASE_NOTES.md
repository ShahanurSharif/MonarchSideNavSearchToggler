# Release Notes

## Version 2.2.0.0 (Latest)

### 🎉 Major Features
- **Dynamic Sidebar Positioning**: Sidebar can now be positioned on the left or right side of the screen
- **Permission-Based Access Control**: Only site owners and users with appropriate permissions can access edit functionality
- **Enhanced UI/UX**: Improved sidebar footer with "Settings" label and better visual feedback

### ✨ New Features
- **Sidebar Position Control**: Added dropdown in theme settings to control sidebar position (Left/Right)
- **Permission System**: Implemented comprehensive permission checking for edit functionality
  - Site Owner permissions required for edit access
  - Full Control and Manage Web permissions also grant edit access
  - Edit buttons are hidden for users without proper permissions
- **Streamlined Configuration**: Removed redundant position property from theme config
- **Conditional Rendering**: Eliminated sidebar "flash" by rendering only after configuration is loaded

### 🔧 Technical Improvements
- **Performance Optimization**: Reduced configuration redundancy for better performance
- **TypeScript Enhancements**: Improved type safety and removed unused imports
- **Error Handling**: Better error handling for permission checks and configuration loading
- **Code Organization**: Created dedicated permission utilities (`permissionUtils.ts`)

### 🐛 Bug Fixes
- Fixed sidebar and toggle button positioning issues
- Resolved configuration loading race conditions
- Fixed TypeScript compilation errors and linting warnings
- Corrected sidebar position persistence in configuration

### 📁 Files Modified
- `src/extensions/monarchSidenavSearchToggler/MonarchSidenavSearchToggler.tsx`
- `src/extensions/monarchSidenavSearchToggler/components/ThemeSettingsModal.tsx`
- `src/extensions/monarchSidenavSearchToggler/components/SidebarNavigation.tsx`
- `src/extensions/monarchSidenavSearchToggler/components/SidebarToggleButton.tsx`
- `src/extensions/monarchSidenavSearchToggler/interfaces/INavigationInterfaces.ts`
- `src/extensions/monarchSidenavSearchToggler/utils/permissionUtils.ts` (New)

### 🔒 Security
- Implemented proper permission validation for all edit operations
- Enhanced security by restricting edit access to authorized users only

---

## Version 2.1.9.0

### 🎉 Major Features
- **Excel to JSON Navigation Updates**: Automated navigation configuration updates from Excel files
- **CI/CD Pipeline Integration**: GitHub Actions and Azure DevOps pipeline support
- **Python Script Automation**: Script to update SharePoint navigation from Excel data

### ✨ New Features
- **Excel Integration**: Python script to read Excel files and update navigation configuration
- **CI/CD Pipelines**: Automated build and deployment workflows
- **Azure DevOps Integration**: Push script for Azure DevOps repository
- **Environment Variable Support**: Secure credential management

### 🔧 Technical Improvements
- **Automated Deployment**: Streamlined deployment process with CI/CD
- **Script Automation**: Python script for bulk navigation updates
- **Secure Credentials**: Environment variable-based authentication

### 📁 Files Added
- `scripts/update_nav.py`
- `azure-pipelines-excel-to-json.yml`
- `push-to-azure.sh`
- `.env` (for local development)
- Various documentation files

---

## Version 2.1.8.0

### 🎉 Major Features
- **Theme Configuration Modal**: Comprehensive theme settings interface
- **Advanced Styling Options**: Enhanced customization capabilities
- **Real-time Preview**: Live preview of theme changes

### ✨ New Features
- **Theme Settings Modal**: Complete theme configuration interface
- **Color Customization**: Background, text, and accent color controls
- **Font Size Controls**: Adjustable font sizes for better readability
- **Real-time Updates**: Instant preview of theme changes

### 🔧 Technical Improvements
- **Modal Architecture**: Improved modal component structure
- **State Management**: Better theme state handling
- **User Experience**: Enhanced theme configuration workflow

---

## Version 2.1.7.0

### 🎉 Major Features
- **Navigation Configuration Modal**: Advanced navigation item management
- **Drag and Drop Support**: Enhanced navigation item reordering
- **Search Functionality**: Improved navigation search capabilities

### ✨ New Features
- **Navigation Config Modal**: Complete navigation management interface
- **Item Management**: Add, edit, delete navigation items
- **Hierarchical Support**: Parent-child navigation relationships
- **Search Enhancement**: Better search performance and accuracy

### 🔧 Technical Improvements
- **Modal Components**: Improved modal architecture
- **State Management**: Enhanced navigation state handling
- **User Interface**: Better navigation management experience

---

## Version 2.1.6.0

### 🎉 Major Features
- **Sidebar Toggle Button**: Draggable toggle button for sidebar control
- **Enhanced Navigation**: Improved navigation item rendering
- **Configuration Persistence**: Better configuration saving and loading

### ✨ New Features
- **Draggable Toggle**: Sidebar toggle button with drag functionality
- **Navigation Items**: Enhanced navigation item display
- **Configuration Service**: Improved configuration management

### 🔧 Technical Improvements
- **Component Architecture**: Better component structure
- **State Management**: Enhanced state handling
- **User Experience**: Improved sidebar interaction

---

## Version 2.1.0

### 🎉 Initial Release
- **Sidebar Navigation**: Basic sidebar navigation functionality
- **Search Integration**: Search functionality within sidebar
- **Theme Support**: Basic theme customization
- **Configuration Management**: Navigation configuration system

### ✨ Core Features
- **Sidebar Component**: Main sidebar navigation component
- **Search Capability**: Search within navigation items
- **Theme Configuration**: Basic theme settings
- **Configuration Persistence**: Save and load navigation configuration

### 🔧 Technical Foundation
- **React Components**: Core React component architecture
- **SharePoint Integration**: SharePoint Framework (SPFx) integration
- **TypeScript Support**: Full TypeScript implementation
- **CSS Modules**: Component-scoped styling 