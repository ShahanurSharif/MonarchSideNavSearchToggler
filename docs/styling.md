# Styling Guide

## Overview

This guide covers the styling approach for the SharePoint Framework sidebar search extension, including SCSS structure, responsive design, Fluent UI integration, and best practices.

## SCSS Architecture

### 1. File Structure

```
src/extensions/yourProjectName/
├── YourProjectNameComponent.module.scss    # Main component styles
├── YourProjectNameComponent.tsx            # React component
└── assets/                                 # Optional: images, icons
    ├── icons/
    └── images/
```

### 2. CSS Modules Approach

The project uses CSS Modules for scoped styling:

```scss
// YourProjectNameComponent.module.scss
@import '~@fluentui/react/dist/sass/References.scss';

.buttonContainer {
  position: fixed;
  top: 346px;
  left: 0;
  z-index: 1002;
  transition: left 0.3s ease;
}

.sidebarContainer {
  position: fixed;
  top: 0;
  left: -20%;
  width: 20%;
  height: 100vh;
  z-index: 1001;
  transition: left 0.3s ease;
}
```

**Key Benefits:**
- Scoped styles prevent conflicts
- Automatic class name generation
- Better maintainability
- TypeScript support

## Responsive Design System

### 1. Breakpoint Strategy

```scss
// Responsive breakpoints
$mobile: 480px;
$tablet: 768px;
$desktop: 1024px;

// Sidebar responsive widths
.sidebarContainer {
  position: fixed;
  top: 0;
  left: -20%;
  width: 20%;
  height: 100vh;
  z-index: 1001;
  transition: left 0.3s ease;
  
  @media (max-width: $tablet) {
    left: -30%;
    width: 30%;
  }
  
  @media (max-width: $mobile) {
    left: -40%;
    width: 40%;
  }
}
```

### 2. Responsive JavaScript Integration

```typescript
// Responsive width calculation in TypeScript
private getSidebarWidth(): string {
  if (window.innerWidth <= 480) {
    return '40%';
  } else if (window.innerWidth <= 768) {
    return '30%';
  }
  return '20%';
}

private getContentWidth(): string {
  if (window.innerWidth <= 480) {
    return '60%';
  } else if (window.innerWidth <= 768) {
    return '70%';
  }
  return '80%';
}
```

## Component Styling Structure

### 1. Layout Components

#### Button Container
```scss
.buttonContainer {
  position: fixed;
  top: 346px;
  left: 0;
  z-index: 1002;
  transition: left 0.3s ease;
}
```

#### Sidebar Container
```scss
.sidebarContainer {
  position: fixed;
  top: 0;
  left: -20%;
  width: 20%;
  height: 100vh;
  z-index: 1001;
  transition: left 0.3s ease;
  
  @media (max-width: 768px) {
    left: -30%;
    width: 30%;
  }
  
  @media (max-width: 480px) {
    left: -40%;
    width: 40%;
  }
}
```

#### Main Sidebar
```scss
.sidebar {
  background: #ffffff;
  height: 100%;
  border-right: 1px solid #e1e1e1;
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
}
```

### 2. Header Components

#### Sidebar Header
```scss
.sidebarHeader {
  padding: 20px;
  border-bottom: 1px solid #e1e1e1;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f8f9fa;
  
  h2 {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    color: #323130;
  }
}
```

#### Header Buttons
```scss
.headerButtons {
  display: flex;
  align-items: center;
  gap: 8px;
}

.headerButton {
  background: #e1dfdd;
  border: none;
  font-size: 16px;
  color: #605e5c;
  cursor: pointer;
  padding: 8px;
  border-radius: 4px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  
  &:hover {
    background: #d2d0ce;
    color: #323130;
  }
  
  &:focus {
    outline: 2px solid #005a9e;
    outline-offset: 2px;
    background: #d2d0ce;
  }
  
  span {
    font-size: 16px;
    line-height: 1;
    font-weight: normal;
  }
}
```

### 3. Search Components

#### Search Container
```scss
.searchContainer {
  padding: 20px;
  border-bottom: 1px solid #e1e1e1;
}
```

#### Search Input
```scss
.searchInput {
  width: 100%;
  padding: 12px;
  border: 1px solid #d2d0ce;
  border-radius: 4px;
  font-size: 14px;
  font-family: inherit;
  box-sizing: border-box;
  transition: border-color 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: #005a9e;
    box-shadow: 0 0 0 1px #005a9e;
  }
  
  &::placeholder {
    color: #a19f9d;
  }
}
```

### 4. Search Results Components

#### Results Container
```scss
.searchResults {
  flex: 1;
  overflow-y: auto;
  padding: 0;
}
```

#### Loading States
```scss
.loadingIndicator {
  padding: 20px;
  text-align: center;
  color: #605e5c;
  
  p {
    margin: 8px 0 0 0;
    font-size: 14px;
  }
}

.loadingSpinner {
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 2px solid #f3f3f3;
  border-top: 2px solid #005a9e;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
```

#### Message States
```scss
.defaultMessage {
  padding: 20px;
  text-align: center;
  color: #605e5c;
  
  p {
    margin: 0;
    font-size: 14px;
  }
}

.noResultsMessage {
  padding: 20px;
  text-align: center;
  color: #605e5c;
  
  p {
    margin: 0;
    font-size: 14px;
    font-weight: 500;
  }
}

.errorMessage {
  padding: 20px;
  text-align: center;
  color: #d13438;
  
  p {
    margin: 0;
    font-size: 14px;
  }
}
```

#### Results List
```scss
.searchResultsList {
  padding: 0;
}

.resultsHeader {
  padding: 12px 20px;
  border-bottom: 1px solid #e1e1e1;
  background: #f8f9fa;
  
  p {
    margin: 0;
    font-size: 12px;
    color: #605e5c;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
}
```

#### Individual Result Items
```scss
.searchResultItem {
  border-bottom: 1px solid #edebe9;
  
  &:last-child {
    border-bottom: none;
  }
}

.searchResultLink {
  display: flex;
  align-items: flex-start;
  padding: 12px 20px;
  text-decoration: none;
  color: inherit;
  transition: all 0.2s ease;
  
  &:hover {
    background: #f3f2f1;
    text-decoration: none;
    color: inherit;
  }
  
  &:focus {
    outline: none;
    background: #f3f2f1;
    box-shadow: inset 3px 0 0 #005a9e;
  }
}

.resultIcon {
  flex-shrink: 0;
  font-size: 18px;
  margin-right: 12px;
  margin-top: 2px;
}

.resultContent {
  flex: 1;
  min-width: 0;
}

.resultTitle {
  font-size: 14px;
  font-weight: 500;
  color: #323130;
  margin-bottom: 4px;
  line-height: 1.3;
  word-wrap: break-word;
}

.resultMeta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #605e5c;
  flex-wrap: wrap;
}

.fileType {
  background: #e1dfdd;
  padding: 2px 6px;
  border-radius: 12px;
  font-weight: 500;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.author {
  font-style: italic;
}
```

## Fluent UI Integration

### 1. Theme Integration

```scss
// Import Fluent UI theme variables
@import '~@fluentui/react/dist/sass/References.scss';

// Use Fluent UI color palette
.headerButton {
  background: $ms-color-neutralLight;
  color: $ms-color-neutralSecondary;
  
  &:hover {
    background: $ms-color-neutralLighter;
    color: $ms-color-neutralPrimary;
  }
  
  &:focus {
    outline: 2px solid $ms-color-themePrimary;
    background: $ms-color-neutralLighter;
  }
}
```

### 2. Button Component Integration

```typescript
// Using Fluent UI DefaultButton component
const toggleButton = React.createElement(DefaultButton, {
  id: 'your-project-name-toggle',
  'aria-label': 'Toggle Navigation',
  onClick: this.handleToggle,
  iconProps: { iconName: 'Search' },
  styles: {
    root: {
      minWidth: '47px',
      width: '47px',
      height: '47px',
      borderRadius: '4px',
      border: '1px solid #d2d0ce',
      backgroundColor: '#ffffff',
      color: '#323130'
    },
    rootHovered: {
      backgroundColor: '#f3f2f1',
      borderColor: '#c7c6c4',
      color: '#201f1e'
    },
    rootPressed: {
      backgroundColor: '#edebe9'
    },
    icon: {
      fontSize: '16px',
      fontWeight: '600'
    }
  }
});
```

## Animation and Transitions

### 1. Sidebar Transitions

```scss
// Smooth sidebar transitions
.sidebarContainer {
  transition: left 0.3s ease;
}

.buttonContainer {
  transition: left 0.3s ease;
}

// Content adjustment transitions
.spPageChrome {
  transition: margin-left 0.3s ease, width 0.3s ease;
}
```

### 2. Interactive Element Transitions

```scss
.headerButton {
  transition: all 0.2s ease;
}

.searchInput {
  transition: border-color 0.2s ease;
}

.searchResultLink {
  transition: all 0.2s ease;
}
```

### 3. Loading Animation

```scss
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loadingSpinner {
  animation: spin 1s linear infinite;
}
```

## Accessibility (A11y) Considerations

### 1. Focus Management

```scss
// Focus indicators
.headerButton:focus,
.searchInput:focus,
.searchResultLink:focus {
  outline: 2px solid #005a9e;
  outline-offset: 2px;
}

// Focus within search results
.searchResultLink:focus {
  outline: none;
  background: #f3f2f1;
  box-shadow: inset 3px 0 0 #005a9e;
}
```

### 2. High Contrast Support

```scss
// High contrast mode support
@media (prefers-contrast: high) {
  .sidebar {
    border-right: 2px solid;
  }
  
  .headerButton {
    border: 2px solid;
  }
  
  .searchInput {
    border: 2px solid;
  }
}
```

### 3. Reduced Motion Support

```scss
// Respect user's motion preferences
@media (prefers-reduced-motion: reduce) {
  .sidebarContainer,
  .buttonContainer,
  .headerButton,
  .searchInput,
  .searchResultLink {
    transition: none;
  }
  
  .loadingSpinner {
    animation: none;
  }
}
```

## Dark Mode Support

### 1. CSS Custom Properties Approach

```scss
// CSS custom properties for theme support
:root {
  --sidebar-bg: #ffffff;
  --sidebar-text: #323130;
  --sidebar-border: #e1e1e1;
  --button-bg: #e1dfdd;
  --button-text: #605e5c;
}

[data-theme="dark"] {
  --sidebar-bg: #2d2d30;
  --sidebar-text: #ffffff;
  --sidebar-border: #3e3e42;
  --button-bg: #3e3e42;
  --button-text: #ffffff;
}

.sidebar {
  background: var(--sidebar-bg);
  color: var(--sidebar-text);
  border-right: 1px solid var(--sidebar-border);
}
```

### 2. Automatic Dark Mode Detection

```scss
// System dark mode detection
@media (prefers-color-scheme: dark) {
  .sidebar {
    background: #2d2d30;
    color: #ffffff;
    border-right: 1px solid #3e3e42;
  }
  
  .headerButton {
    background: #3e3e42;
    color: #ffffff;
  }
  
  .searchInput {
    background: #3e3e42;
    color: #ffffff;
    border: 1px solid #5c5c5c;
  }
}
```

## Performance Optimizations

### 1. CSS Optimization

```scss
// Use transform for better performance
.sidebarContainer {
  transform: translateX(-100%);
  transition: transform 0.3s ease;
  
  &.open {
    transform: translateX(0);
  }
}

// Use will-change for animated elements
.loadingSpinner {
  will-change: transform;
}
```

### 2. Efficient Selectors

```scss
// Avoid deep nesting
.searchResultItem {
  // Direct child selectors
  > .searchResultLink {
    // Styles
  }
}

// Use class selectors over element selectors
.resultTitle {
  // Better than .searchResultItem h3
}
```

## Browser Compatibility

### 1. Vendor Prefixes

```scss
// Vendor prefixes for better compatibility
.sidebar {
  -webkit-box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
  -moz-box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
}

.searchInput {
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
}
```

### 2. Fallbacks

```scss
// Fallbacks for older browsers
.sidebar {
  background: #ffffff; /* Fallback */
  background: var(--sidebar-bg, #ffffff);
}

.sidebarContainer {
  /* Fallback positioning */
  left: -20%;
  
  /* Modern approach */
  transform: translateX(-100%);
}
```

## Testing Styles

### 1. Visual Testing

```scss
// Debug styles (remove in production)
.debug {
  .sidebar {
    border: 2px solid red;
  }
  
  .searchResultItem {
    border: 1px solid blue;
  }
}
```

### 2. Cross-browser Testing

Test in multiple browsers:
- Chrome/Edge (Chromium)
- Firefox
- Safari
- Internet Explorer 11 (if required)

## Build and Optimization

### 1. SCSS Compilation

The SPFx build process automatically:
- Compiles SCSS to CSS
- Generates CSS Modules
- Optimizes and minifies output
- Handles vendor prefixes

### 2. Bundle Size Optimization

```typescript
// Lazy load CSS for better performance
const styles = await import('./YourProjectNameComponent.module.scss');
```

## Best Practices

1. **Use CSS Modules** for scoped styling
2. **Follow BEM naming** for clarity
3. **Implement responsive design** from the start
4. **Test accessibility** with screen readers
5. **Support dark mode** when possible
6. **Optimize for performance** with efficient selectors
7. **Use Fluent UI tokens** for consistency
8. **Test across browsers** and devices
9. **Implement proper focus management**
10. **Use semantic HTML** structure

## Next Steps

1. Review [Deployment Guide](./deployment.md) for build optimization
2. Check [Troubleshooting Guide](./troubleshooting.md) for styling issues
3. Follow [Implementation Guide](./implementation.md) for component integration 