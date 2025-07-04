# Project Setup Guide

## Prerequisites

Before creating a new SPFx project with sidebar search functionality, ensure you have:

### Required Software
- **Node.js**: v22.14.0 or higher (use NVM for version management)
- **Yeoman**: Global installation (`npm install -g yo`)
- **SharePoint Framework Generator**: `npm install -g @microsoft/generator-sharepoint`
- **Gulp**: Global installation (`npm install -g gulp-cli`)

### Development Environment
- **Visual Studio Code** (recommended)
- **SharePoint Online** tenant for testing
- **App Catalog** site collection for deployment

## Step 1: Create New SPFx Project

```bash
# Create new directory
mkdir your-project-name
cd your-project-name

# Generate SPFx project
yo @microsoft/sharepoint
```

### Generator Options
When prompted, select:
- **What is your solution name?**: `your-project-name`
- **Which type of client-side component?**: `Extension`
- **Which type of client-side extension?**: `Application Customizer`
- **What is your Application Customizer name?**: `YourProjectNameApplicationCustomizer`
- **What is your Application Customizer description?**: `Your description`

## Step 2: Configure Package.json

Update your `package.json` with the required dependencies:

```json
{
  "name": "your-project-name",
  "version": "1.0.0",
  "private": true,
  "engines": {
    "node": ">=22.14.0 < 23.0.0"
  },
  "main": "lib/index.js",
  "scripts": {
    "build": "gulp bundle",
    "clean": "gulp clean",
    "test": "gulp test"
  },
  "dependencies": {
    "@fluentui/react": "^8.123.0",
    "@microsoft/decorators": "1.21.1",
    "@microsoft/sp-application-base": "1.21.1",
    "@microsoft/sp-core-library": "1.21.1",
    "@microsoft/sp-dialog": "1.21.1",
    "react": "17.0.1",
    "react-dom": "17.0.1",
    "tslib": "2.3.1"
  },
  "devDependencies": {
    "@microsoft/eslint-config-spfx": "1.21.1",
    "@microsoft/eslint-plugin-spfx": "1.21.1",
    "@microsoft/rush-stack-compiler-5.3": "0.1.0",
    "@microsoft/sp-build-web": "1.21.1",
    "@microsoft/sp-module-interfaces": "1.21.1",
    "@rushstack/eslint-config": "4.0.1",
    "@types/react": "17.0.45",
    "@types/react-dom": "17.0.17",
    "@types/webpack-env": "~1.15.2",
    "ajv": "^6.12.5",
    "eslint": "8.57.1",
    "gulp": "4.0.2",
    "typescript": "~5.3.3"
  }
}
```

## Step 3: Install Dependencies

```bash
npm install
```

## Step 4: Update TypeScript Configuration

Ensure your `tsconfig.json` includes:

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

## Step 5: Configure Gulpfile

Update `gulpfile.js` with SASS warning suppression:

```javascript
'use strict';

const build = require('@microsoft/sp-build-web');

build.addSuppression(`Warning - [sass] The local CSS class 'ms-Grid' is not camelCase and will not be type-safe.`);

var getTasks = build.rig.getTasks;
build.rig.getTasks = function () {
  var result = getTasks.call(build.rig);
  result.set('serve', result.get('serve-deprecated'));
  return result;
};

build.initialize(require('gulp'));
```

## Step 6: Configure SPFx Settings

### config/config.json
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

### config/package-solution.json
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
      "termsOfUseUrl": "https://yourcompany.com/terms"
    },
    "metadata": {
      "shortDescription": {
        "default": "Your project description"
      },
      "longDescription": {
        "default": "Your detailed project description"
      },
      "screenshotPaths": [],
      "videoUrl": "",
      "categories": []
    }
  },
  "paths": {
    "zippedPackage": "solution/your-project-name.sppkg"
  }
}
```

## Step 7: Create Directory Structure

```bash
# Create documentation directory
mkdir docs

# Create any additional directories needed
mkdir -p src/extensions/yourProjectName/components
```

## Step 8: Verify Setup

Test the basic setup:

```bash
# Clean build
gulp clean

# Build the project
gulp build

# Serve for development
gulp serve
```

## Step 9: Generate Unique GUIDs

You'll need to generate unique GUIDs for:
- Solution ID in `package-solution.json`
- Component ID in the manifest file

Use online GUID generators or PowerShell:
```powershell
[System.Guid]::NewGuid()
```

## Step 10: Initial Commit

```bash
git init
git add .
git commit -m "Initial SPFx project setup"
```

## Next Steps

1. Follow the [Configuration Guide](./configuration.md) to set up the specific configurations
2. Implement the components following the [Implementation Guide](./implementation.md)
3. Apply styling using the [Styling Guide](./styling.md)

## Common Setup Issues

### Node Version Issues
- Use Node Version Manager (NVM) to manage Node.js versions
- Ensure compatibility with SPFx version requirements

### Permission Issues
- Run terminal as administrator on Windows
- Use `sudo` on macOS/Linux for global npm installations

### SharePoint Generator Issues
- Update to latest generator: `npm update -g @microsoft/generator-sharepoint`
- Clear npm cache: `npm cache clean --force`

### Build Issues
- Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Clear SPFx cache: `gulp clean` 