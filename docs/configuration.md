# Configuration Guide

## Overview

This guide covers all the configuration files and settings required for the SharePoint Framework sidebar search extension.

## SPFx Configuration Files

### 1. config/config.json

This is the main SPFx configuration file that defines bundles and localized resources.

```json
{
  "$schema": "https://developer.microsoft.com/json-schemas/spfx-build/config.2.0.schema.json",
  "version": "2.0",
  "bundles": {
    "your-project-name-application-customizer": {
      "components": [
        {
          "entrypoint": "./lib/extensions/yourProjectName/YourProjectNameApplicationCustomizer.js",
          "manifest": "./src/extensions/yourProjectName/YourProjectNameApplicationCustomizer.manifest.json"
        }
      ]
    }
  },
  "externals": {},
  "localizedResources": {
    "YourProjectNameApplicationCustomizerStrings": "lib/extensions/yourProjectName/loc/{locale}.js"
  }
}
```

**Key Points:**
- Bundle name should match your project naming convention
- Entrypoint path must match your actual file structure
- Manifest path must point to your component manifest

### 2. config/package-solution.json

Defines the SharePoint solution package configuration.

```json
{
  "$schema": "https://developer.microsoft.com/json-schemas/spfx-build/package-solution.schema.json",
  "solution": {
    "name": "your-project-name-client-side-solution",
    "id": "your-unique-guid-here",
    "version": "1.0.0.0",
    "includeClientSideAssets": true,
    "skipFeatureDeployment": true,
    "isDomainIsolated": false,
    "developer": {
      "name": "Your Name",
      "websiteUrl": "https://yourcompany.com",
      "privacyUrl": "https://yourcompany.com/privacy",
      "termsOfUseUrl": "https://yourcompany.com/terms",
      "mpnId": "Undefined-1.21.1"
    },
    "metadata": {
      "shortDescription": {
        "default": "Sidebar search extension for SharePoint"
      },
      "longDescription": {
        "default": "Provides a collapsible sidebar with document search functionality"
      },
      "screenshotPaths": [],
      "videoUrl": "",
      "categories": []
    },
    "features": [
      {
        "title": "Application Extension - Deployment of custom action",
        "description": "Deploys a custom action with ClientSideComponentId association",
        "id": "your-feature-guid-here",
        "version": "1.0.0.0",
        "assets": {
          "elementManifests": [
            "elements.xml",
            "ClientSideInstance.xml"
          ]
        }
      }
    ]
  },
  "paths": {
    "zippedPackage": "solution/your-project-name.sppkg"
  }
}
```

**Key Points:**
- `skipFeatureDeployment: true` allows tenant-wide deployment
- `includeClientSideAssets: true` bundles assets in the package
- Generate unique GUIDs for solution ID and feature ID

### 3. config/serve.json

Development server configuration for local testing.

```json
{
  "$schema": "https://developer.microsoft.com/json-schemas/spfx-build/spfx-serve.schema.json",
  "port": 4321,
  "https": true,
  "serveConfigurations": {
    "default": {
      "pageUrl": "https://yourtenant.sharepoint.com/sites/yoursite",
      "customActions": {
        "your-component-id": {
          "location": "ClientSideExtension.ApplicationCustomizer",
          "properties": {
            "testMessage": "Test message"
          }
        }
      }
    }
  }
}
```

**Key Points:**
- Replace `yourtenant` and `yoursite` with actual values
- Component ID should match your manifest file
- HTTPS is required for SharePoint integration

## Component Configuration

### 4. Extension Manifest

`src/extensions/yourProjectName/YourProjectNameApplicationCustomizer.manifest.json`

```json
{
  "$schema": "https://developer.microsoft.com/json-schemas/spfx/client-side-extension-manifest.schema.json",
  "id": "your-unique-component-guid",
  "alias": "YourProjectNameApplicationCustomizer",
  "componentType": "Extension",
  "extensionType": "ApplicationCustomizer",
  "version": "*",
  "manifestVersion": 2,
  "requiresCustomScript": false
}
```

**Key Points:**
- Generate unique GUID for component ID
- `requiresCustomScript: false` allows deployment to sites without custom script
- Version "*" takes version from package.json

### 5. Localization Configuration

#### String Definitions: `src/extensions/yourProjectName/loc/myStrings.d.ts`

```typescript
declare interface IYourProjectNameApplicationCustomizerStrings {
  Title: string;
  Description: string;
}

declare module 'YourProjectNameApplicationCustomizerStrings' {
  const strings: IYourProjectNameApplicationCustomizerStrings;
  export = strings;
}
```

#### English Strings: `src/extensions/yourProjectName/loc/en-us.js`

```javascript
define([], function() {
  return {
    "Title": "Your Project Name Application Customizer",
    "Description": "Provides sidebar search functionality"
  }
});
```

## Build Configuration

### 6. TypeScript Configuration

`tsconfig.json` - Ensure proper TypeScript compilation:

```json
{
  "extends": "./node_modules/@microsoft/rush-stack-compiler-5.3/includes/tsconfig-web.json",
  "compilerOptions": {
    "target": "es5",
    "forceConsistentCasingInFileNames": true,
    "module": "esnext",
    "moduleResolution": "node",
    "jsx": "react",
    "declaration": true,
    "sourceMap": true,
    "experimentalDecorators": true,
    "skipLibCheck": true,
    "outDir": "lib",
    "inlineSources": false,
    "noImplicitAny": true,
    "typeRoots": [
      "./node_modules/@types",
      "./node_modules/@microsoft"
    ],
    "types": [
      "webpack-env"
    ],
    "lib": [
      "es5",
      "dom",
      "es2015.collection",
      "es2015.promise",
      "es2015.core"
    ]
  },
  "include": [
    "src/**/*.ts",
    "src/**/*.tsx"
  ]
}
```

### 7. Gulp Configuration

`gulpfile.js` - Build process configuration:

```javascript
'use strict';

const build = require('@microsoft/sp-build-web');

// Suppress SASS warnings for non-camelCase CSS classes
build.addSuppression(`Warning - [sass] The local CSS class 'ms-Grid' is not camelCase and will not be type-safe.`);

// Configure tasks
var getTasks = build.rig.getTasks;
build.rig.getTasks = function () {
  var result = getTasks.call(build.rig);
  
  // Use deprecated serve task (more stable)
  result.set('serve', result.get('serve-deprecated'));
  
  return result;
};

build.initialize(require('gulp'));
```

## SharePoint Deployment Assets

### 8. elements.xml

`sharepoint/assets/elements.xml` - SharePoint feature definition:

```xml
<?xml version="1.0" encoding="utf-8"?>
<Elements xmlns="http://schemas.microsoft.com/sharepoint/">
    <CustomAction 
        Title="YourProjectNameApplicationCustomizer"
        Location="ClientSideExtension.ApplicationCustomizer"
        ClientSideComponentId="your-component-guid"
        ClientSideComponentProperties="{&quot;testMessage&quot;:&quot;Test message&quot;}">
    </CustomAction>
</Elements>
```

### 9. ClientSideInstance.xml

`sharepoint/assets/ClientSideInstance.xml` - Client-side component registration:

```xml
<?xml version="1.0" encoding="utf-8"?>
<Elements xmlns="http://schemas.microsoft.com/sharepoint/">
    <ClientSideComponentInstance 
        Title="YourProjectNameApplicationCustomizer"
        Location="ClientSideExtension.ApplicationCustomizer"
        ComponentId="your-component-guid"
        Properties="{&quot;testMessage&quot;:&quot;Test message&quot;}">
    </ClientSideComponentInstance>
</Elements>
```

## Environment-Specific Configuration

### Development Environment

For local development, update `config/serve.json`:

```json
{
  "serveConfigurations": {
    "default": {
      "pageUrl": "https://yourtenant.sharepoint.com/sites/dev",
      "customActions": {
        "your-component-id": {
          "location": "ClientSideExtension.ApplicationCustomizer",
          "properties": {
            "testMessage": "Development Mode"
          }
        }
      }
    }
  }
}
```

### Production Environment

For production deployment, update properties in the SharePoint App Catalog or through PowerShell:

```powershell
# Example PowerShell for setting properties
$customAction = Get-SPCustomAction -Web https://yourtenant.sharepoint.com/sites/prod -Identity "your-component-id"
$customAction.ClientSideComponentProperties = '{"testMessage":"Production Mode"}'
$customAction.Update()
```

## Security Configuration

### Content Security Policy

If you encounter CSP issues, you may need to configure `config/config.json`:

```json
{
  "externals": {
    "lodash": {
      "path": "https://cdn.jsdelivr.net/npm/lodash@4.17.21/lodash.min.js",
      "globalName": "_"
    }
  }
}
```

### Custom Script Settings

Ensure your SharePoint site allows custom scripts:

```powershell
# PowerShell to enable custom scripts
Set-SPOSite -Identity "https://yourtenant.sharepoint.com/sites/yoursite" -DenyAddAndCustomizePages $false
```

## Validation and Testing

### Configuration Validation

```bash
# Validate configuration
gulp build

# Test serve configuration
gulp serve

# Validate package
gulp package-solution
```

### Common Configuration Issues

1. **GUID Conflicts**: Ensure all GUIDs are unique
2. **Path Mismatches**: Verify file paths in config files
3. **Version Conflicts**: Check SPFx version compatibility
4. **Permission Issues**: Verify SharePoint permissions

## Best Practices

1. **Version Control**: Always version control configuration files
2. **Environment Separation**: Use different configurations for dev/prod
3. **Security**: Never commit sensitive information
4. **Documentation**: Document any custom configurations
5. **Testing**: Test configurations in isolated environments

## Next Steps

1. Follow the [Implementation Guide](./implementation.md) to create the components
2. Review [Deployment Guide](./deployment.md) for production deployment
3. Check [Troubleshooting Guide](./troubleshooting.md) for common issues 