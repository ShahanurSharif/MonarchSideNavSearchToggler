# Troubleshooting Guide

## Overview

This guide covers common issues, debugging techniques, and solutions for the SharePoint Framework sidebar search extension. Use this guide to diagnose and resolve problems during development, deployment, and runtime.

## Development Issues

### 1. Build and Compilation Errors

#### TypeScript Compilation Errors

**Issue:** TypeScript compilation fails with type errors

```bash
Error: Property 'xyz' does not exist on type 'ABC'
```

**Solutions:**
```bash
# Check TypeScript configuration
tsc --noEmit

# Update type definitions
npm install @types/react@17.0.45 @types/react-dom@17.0.17

# Clear TypeScript cache
rm -rf lib/ node_modules/.cache/
npm install
```

#### SCSS Compilation Errors

**Issue:** SCSS compilation fails

```bash
Error: Invalid CSS after "...": expected "}", was "{"
```

**Solutions:**
```scss
// Check SCSS syntax
// Ensure proper nesting and semicolons
.sidebar {
  background: #ffffff; // Add semicolon
  
  .header { // Proper nesting
    padding: 20px;
  }
}
```

#### Module Resolution Errors

**Issue:** Cannot resolve module imports

```bash
Error: Cannot resolve module '@fluentui/react'
```

**Solutions:**
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Check package.json versions
npm list @fluentui/react

# Update SPFx dependencies
npm update @microsoft/sp-*
```

### 2. Gulp Task Errors

#### Gulp Serve Fails

**Issue:** `gulp serve` command fails to start

**Solutions:**
```bash
# Clear gulp cache
gulp clean

# Check Node.js version
node --version  # Should be 22.14.0+

# Reinstall gulp globally
npm uninstall -g gulp-cli
npm install -g gulp-cli@latest

# Check for port conflicts
netstat -an | grep :4321
```

#### Bundle Task Errors

**Issue:** `gulp bundle` fails with webpack errors

**Solutions:**
```bash
# Clear webpack cache
rm -rf node_modules/.cache/

# Check for circular dependencies
npm install --save-dev circular-dependency-plugin

# Increase Node.js memory
export NODE_OPTIONS="--max-old-space-size=8192"
gulp bundle --ship
```

### 3. SPFx Configuration Issues

#### Invalid Manifest

**Issue:** Component manifest validation fails

```json
// Check manifest structure
{
  "$schema": "https://developer.microsoft.com/json-schemas/spfx/client-side-extension-manifest.schema.json",
  "id": "valid-guid-here",
  "alias": "ValidComponentName",
  "componentType": "Extension",
  "extensionType": "ApplicationCustomizer",
  "version": "*",
  "manifestVersion": 2,
  "requiresCustomScript": false
}
```

#### Package Solution Errors

**Issue:** `gulp package-solution` fails

**Solutions:**
```bash
# Validate package-solution.json
cat config/package-solution.json | jq .

# Check for valid GUIDs
# Regenerate GUIDs if needed
uuidgen  # On macOS/Linux
```

## Runtime Issues

### 1. SharePoint Search API Problems

#### Search API Returns 500 Error

**Issue:** Search requests fail with "Unknown Error"

**Root Cause:** Incorrect OData configuration or missing headers

**Solution:**
```typescript
// Correct configuration
const config = new SPHttpClientConfiguration({
  defaultODataVersion: ODataVersion.v3  // Must be v3
});

const response = await this.props.context.spHttpClient.get(
  searchUrl,
  config,
  {
    headers: {
      'Accept': 'application/json;odata=minimalmetadata;charset=utf-8'  // Required header
    }
  }
);
```

#### Search API Returns 403 Forbidden

**Issue:** Access denied when calling search API

**Root Cause:** Insufficient permissions

**Solutions:**
```powershell
# Check user permissions
Get-SPOUser -Site $siteUrl -LoginName $userEmail

# Grant search permissions
Set-SPOSite -Identity $siteUrl -SearchScope Tenant

# Enable custom scripts if needed
Set-SPOSite -Identity $siteUrl -DenyAddAndCustomizePages $false
```

#### No Search Results Returned

**Issue:** Search API succeeds but returns no results

**Debugging Steps:**
```typescript
// Add comprehensive logging
console.log('Search URL:', searchUrl);
console.log('Search response:', await response.json());

// Test query format
const testQuery = "'test*'";  // Single quotes with wildcard

// Check search scope
const scopedQuery = `'${query}*' AND site:${this.context.pageContext.web.absoluteUrl}`;
```

### 2. UI and Styling Issues

#### Sidebar Not Appearing

**Issue:** Sidebar doesn't show when toggled

**Debugging Steps:**
```javascript
// Check DOM elements
console.log('Button container:', document.getElementById('your-project-name-button-container'));
console.log('Sidebar container:', document.getElementById('your-project-name-sidebar-container'));

// Check CSS classes
const sidebar = document.querySelector('.sidebarContainer');
console.log('Sidebar styles:', window.getComputedStyle(sidebar));
```

**Solutions:**
```scss
// Ensure proper z-index
.sidebarContainer {
  z-index: 1001 !important;
  position: fixed !important;
}

// Check for CSS conflicts
.sidebarContainer {
  left: -20% !important;
  transition: left 0.3s ease !important;
}
```

#### Content Not Adjusting

**Issue:** SharePoint content doesn't move when sidebar opens

**Solution:**
```typescript
// Ensure SPPageChrome exists
private ensureContentAdjustment(isOpen: boolean): void {
  const spPageChrome = document.getElementById('SPPageChrome');
  
  if (!spPageChrome) {
    console.warn('SPPageChrome not found, retrying...');
    setTimeout(() => this.ensureContentAdjustment(isOpen), 500);
    return;
  }
  
  // Apply styles with !important if needed
  if (isOpen) {
    spPageChrome.style.setProperty('margin-left', this.getSidebarWidth(), 'important');
    spPageChrome.style.setProperty('width', this.getContentWidth(), 'important');
  }
}
```

## Getting Help

### 1. Microsoft Documentation
- [SharePoint Framework documentation](https://docs.microsoft.com/en-us/sharepoint/dev/spfx/)
- [SharePoint Search API reference](https://docs.microsoft.com/en-us/sharepoint/dev/apis/search-rest-api)

### 2. Community Resources
- [SharePoint Developer Community](https://techcommunity.microsoft.com/t5/sharepoint-developer/bd-p/SharePointDev)
- [SPFx GitHub repository](https://github.com/SharePoint/sp-dev-docs)
- [Stack Overflow SPFx tag](https://stackoverflow.com/questions/tagged/spfx)

### 3. Support Channels
- Microsoft Support for SharePoint Online
- SharePoint Developer forums
- GitHub issues for specific problems

## Escalation Process

1. **Level 1:** Check this troubleshooting guide
2. **Level 2:** Search community forums and documentation
3. **Level 3:** Create detailed issue report with:
   - Environment details
   - Steps to reproduce
   - Error messages
   - Browser console logs
   - Network trace
4. **Level 4:** Contact Microsoft Support if business-critical

Remember to always include detailed information when reporting issues, including environment details, exact error messages, and steps to reproduce the problem.
