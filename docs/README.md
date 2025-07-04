# SharePoint Framework Sidebar Search Extension

## Overview

This SharePoint Framework (SPFx) Application Customizer implements a collapsible sidebar with document search functionality that can be deployed to any SharePoint site. The extension provides a toggle button that opens/closes a sidebar containing a search interface for finding documents within the current SharePoint site.

## Architecture

```
MonarchSideNavSearchToggler/
├── docs/                           # Documentation
├── config/                         # SPFx configuration files
│   ├── config.json                # Main SPFx configuration
│   ├── package-solution.json      # Solution packaging configuration
│   └── serve.json                 # Development server configuration
├── src/
│   ├── extensions/
│   │   └── monarchSidenavSearchToggler/
│   │       ├── MonarchSidenavSearchTogglerApplicationCustomizer.ts  # Main extension entry point
│   │       ├── MonarchSidenavSearchToggler.tsx                      # React component
│   │       ├── MonarchSidenavSearchToggler.module.scss              # Styling
│   │       ├── MonarchSidenavSearchTogglerApplicationCustomizer.manifest.json  # Extension manifest
│   │       └── loc/                                                 # Localization files
│   └── index.ts                   # Extension entry point
├── sharepoint/                    # SharePoint deployment assets
├── package.json                   # Node.js dependencies
├── tsconfig.json                  # TypeScript configuration
└── gulpfile.js                    # Build configuration
```

## Key Features

- **Collapsible Sidebar**: Toggle button that opens/closes a sidebar overlay
- **Document Search**: Search SharePoint documents with real-time results
- **Responsive Design**: Adapts to different screen sizes (desktop, tablet, mobile)
- **State Persistence**: Remembers sidebar state using localStorage (1-year cache)
- **File Type Filtering**: Supports doc, docx, pdf, ppt, pptx, xls, xlsx, txt, csv files
- **SharePoint Integration**: Uses SPFx APIs for seamless SharePoint integration

## Technical Stack

- **SharePoint Framework (SPFx)**: v1.21.1
- **React**: v17.0.1
- **TypeScript**: v5.3.3
- **Fluent UI**: v8.123.0
- **Node.js**: v22.14.0+
- **SCSS**: For styling

## Quick Start

1. **Prerequisites**: Install Node.js 22.14.0+ and Yeoman SPFx generator
2. **Clone/Setup**: Use this structure as a template
3. **Install**: `npm install`
4. **Develop**: `gulp serve`
5. **Build**: `gulp bundle --ship`
6. **Package**: `gulp package-solution --ship`
7. **Deploy**: Upload .sppkg to SharePoint App Catalog

## Documentation Structure

- [Project Setup](./setup.md) - Initial setup and scaffolding
- [Configuration](./configuration.md) - SPFx and build configuration
- [Implementation](./implementation.md) - Code structure and components
- [Search API](./search-api.md) - SharePoint Search API integration
- [Styling](./styling.md) - SCSS and responsive design
- [Deployment](./deployment.md) - Building and deploying to SharePoint
- [Troubleshooting](./troubleshooting.md) - Common issues and solutions

## Key Components

### 1. Application Customizer
- Entry point for the SPFx extension
- Handles React component mounting/unmounting
- Manages extension lifecycle

### 2. React Component
- Main UI component with state management
- Handles search functionality and results display
- Manages sidebar toggle and caching

### 3. Search Integration
- SharePoint REST API integration
- OData v3 configuration for proper API communication
- Document filtering and result formatting

### 4. Responsive Styling
- Mobile-first responsive design
- Fluent UI integration
- CSS modules for scoped styling

## Best Practices Implemented

- **Error Handling**: Comprehensive error handling for API calls
- **Performance**: Debounced search (300ms) to prevent excessive API calls
- **Accessibility**: ARIA labels and keyboard navigation support
- **Security**: Proper content security and XSS prevention
- **Caching**: Smart localStorage caching with expiration
- **Responsive**: Mobile-friendly responsive design

## Development Notes

- The extension requires deployment to SharePoint for full functionality
- Search API calls will fail in localhost development due to CORS restrictions
- Always test search functionality in deployed SharePoint environment
- Use proper SPFx configuration for SharePoint Search API (OData v3)

## Next Steps

Follow the detailed guides in the documentation to implement this same structure in your own project. 