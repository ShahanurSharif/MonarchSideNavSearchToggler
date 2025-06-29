# Monarch Side Navigation Search Toggler

A SharePoint Framework (SPFx) Application Customizer that adds a toggleable side navigation panel to SharePoint sites with a push-content effect.

## Overview

This component creates a hamburger menu button that, when clicked, slides out a sidebar from the left side of the screen. The sidebar pushes the SharePoint content to the right instead of overlaying it, creating a smooth, professional user experience.

## Features

- Toggle button positioned below SharePoint's command bar
- Sidebar slides in from the left with smooth animations
- Pushes SharePoint content to the right (no overlay)
- Responsive design for desktop, tablet, and mobile
- Professional styling matching SharePoint's design language
- Knowledge base style navigation with categories and sub-items
- Search functionality in the sidebar
- Clean DOM management with proper cleanup

## Installation

### Prerequisites

- Node.js (version 16 or higher)
- SharePoint Framework development environment
- SPFx version 1.21.1 or compatible

### Development Setup

1. Clone or download the project
2. Navigate to the project directory
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start development server:
   ```bash
   gulp serve
   ```

### Deployment

1. Build the solution:
   ```bash
   gulp build
   ```
2. Bundle for production:
   ```bash
   gulp bundle --ship
   ```
3. Package the solution:
   ```bash
   gulp package-solution --ship
   ```
4. Upload the `.sppkg` file to your SharePoint App Catalog
5. Deploy and activate on target sites

## Usage

Once deployed, the component automatically appears on SharePoint pages with:

- A circular toggle button on the left side of the screen
- Positioned below the SharePoint command bar (120px from top)
- Click the button to open/close the sidebar
- The sidebar includes a search box and navigation categories

### Default Navigation Structure

```
Home
IT Support
  - Printer Connection
  - Password Reset
  - VPN Access
  - MFA Setup
Human Resources
  - Expense Reimbursement
  - Time Off Requests
```

## Customization Guide

### Changing Button Position

Edit the button position in `MonarchSidenavSearchToggler.module.scss`:

```scss
.buttonContainer {
  position: fixed;
  top: 120px;        // Change vertical position
  left: 20px;        // Change horizontal position
  z-index: 1002;
}
```

### Modifying Sidebar Width

Update responsive widths in the JavaScript:

```typescript
private getSidebarWidth(): string {
  if (window.innerWidth <= 480) {
    return '40%';     // Mobile width
  } else if (window.innerWidth <= 768) {
    return '30%';     // Tablet width
  }
  return '20%';       // Desktop width
}
```

### Updating Navigation Content

Modify the navigation structure in the `injectSidebar()` method:

```typescript
// Find this section in MonarchSidenavSearchToggler.tsx
<nav class="${styles.navigation}">
  <ul class="${styles.navList}">
    <li class="${styles.navItem}">
      <a href="#" class="${styles.navLink}">Your New Link</a>
    </li>
    // Add more navigation items here
  </ul>
</nav>
```

### Styling Customization

All styles are in `MonarchSidenavSearchToggler.module.scss`:

#### Button Colors
```scss
.toggleButton {
  background: #498205;    // Default button color
  
  &:hover {
    background: #294903;  // Hover color
  }
}
```

#### Sidebar Colors
```scss
.sidebar {
  background: #ffffff;    // Sidebar background
  border-right: 1px solid #e1e1e1;  // Border color
}

.sidebarHeader {
  background: #f8f9fa;   // Header background
}
```

#### Navigation Link Colors
```scss
.navLink {
  color: #323130;        // Link text color
  
  &:hover {
    background: #f3f2f1; // Hover background
    border-left-color: #498205;  // Hover accent
    color: #498205;      // Hover text color
  }
}
```

## Technical Architecture

### Component Structure

```
MonarchSidenavSearchTogglerApplicationCustomizer
├── Creates DOM container
├── Renders MonarchSidenavSearchToggler component
└── Handles cleanup on disposal

MonarchSidenavSearchToggler (React Class Component)
├── componentDidMount()
│   ├── injectToggleButton() - Creates hamburger button
│   └── injectSidebar() - Creates sidebar HTML
├── handleToggle() - Manages open/close logic
├── getSidebarWidth() / getContentWidth() - Responsive calculations
└── cleanup() - Removes DOM elements
```

### DOM Manipulation

The component directly manipulates the SharePoint DOM:

1. **Target Element**: `document.getElementById('SPPageChrome')`
2. **Applied Styles**:
   - `margin-left`: Pushes content right
   - `width`: Resizes content area
   - `transition`: Smooth animations

### Event Handling

- Toggle button click event
- Close button click event
- Responsive window resize (handled by CSS media queries)

## Extension Guide

### Adding New Navigation Categories

1. Open `MonarchSidenavSearchToggler.tsx`
2. Find the `injectSidebar()` method
3. Add new category structure:

```typescript
<li class="${styles.navItem}">
  <div class="${styles.navCategory}">
    <span class="${styles.categoryTitle}">Your New Category</span>
    <ul class="${styles.subNavList}">
      <li class="${styles.subNavItem}">
        <a href="#" class="${styles.subNavLink}">Sub Item 1</a>
      </li>
      <li class="${styles.subNavItem}">
        <a href="#" class="${styles.subNavLink}">Sub Item 2</a>
      </li>
    </ul>
  </div>
</li>
```

### Adding Search Functionality

The search input is already present. To make it functional:

1. Add event listener in `injectSidebar()`:

```typescript
const searchInput = document.querySelector('.${styles.searchInput}') as HTMLInputElement;
if (searchInput) {
  searchInput.addEventListener('input', this.handleSearch);
}
```

2. Implement search method:

```typescript
private handleSearch = (event: Event): void => {
  const searchTerm = (event.target as HTMLInputElement).value.toLowerCase();
  const navItems = document.querySelectorAll('.${styles.subNavLink}');
  
  navItems.forEach(item => {
    const text = item.textContent?.toLowerCase() || '';
    const listItem = item.closest('.${styles.subNavItem}') as HTMLElement;
    if (text.includes(searchTerm)) {
      listItem.style.display = 'block';
    } else {
      listItem.style.display = 'none';
    }
  });
};
```

### Adding Animation Effects

Enhance the hamburger button animation:

```scss
.hamburger {
  span {
    transition: all 0.3s ease;
  }
}

// Add this for active state
.buttonContainer.open .hamburger {
  span:nth-child(1) {
    transform: rotate(45deg) translate(5px, 5px);
  }
  span:nth-child(2) {
    opacity: 0;
  }
  span:nth-child(3) {
    transform: rotate(-45deg) translate(7px, -6px);
  }
}
```

### Adding Configuration Options

Create a configuration interface:

```typescript
export interface ISidebarConfig {
  buttonPosition: { top: number; left: number };
  sidebarWidth: { desktop: string; tablet: string; mobile: string };
  colors: { primary: string; hover: string; background: string };
  navigationItems: INavigationItem[];
}

export interface INavigationItem {
  title: string;
  url?: string;
  subItems?: INavigationItem[];
}
```

## Troubleshooting

### Common Issues

**Button not appearing:**
- Check if the component is properly deployed
- Verify the z-index values (button should be 1002)
- Check browser console for JavaScript errors

**Sidebar not sliding properly:**
- Verify CSS transitions are not disabled
- Check if SharePoint theme is overriding styles
- Ensure SPPageChrome element exists on the page

**Content not pushing correctly:**
- Confirm SPPageChrome element is being targeted
- Check if other customizations are interfering
- Verify responsive width calculations

**Styling issues:**
- Clear browser cache
- Check if SharePoint's CSS is overriding custom styles
- Verify SCSS compilation was successful

### Debug Mode

Add debug logging to troubleshoot issues:

```typescript
private handleToggle = (): void => {
  console.log('Toggle clicked, current state:', this.state.isOpen);
  const spPageChrome = document.getElementById('SPPageChrome');
  console.log('SPPageChrome element found:', !!spPageChrome);
  
  // Rest of toggle logic...
};
```

### Browser Compatibility

Tested and supported on:
- Chrome (latest)
- Edge (latest)
- Firefox (latest)
- Safari (latest)

## Performance Considerations

- Component uses direct DOM manipulation for better performance
- CSS transitions are hardware-accelerated
- Event listeners are properly cleaned up
- Minimal bundle size impact

## File Structure

```
src/extensions/monarchSidenavSearchToggler/
├── MonarchSidenavSearchToggler.tsx           # Main React component
├── MonarchSidenavSearchToggler.module.scss   # Component styles
├── MonarchSidenavSearchTogglerApplicationCustomizer.ts  # SPFx customizer
└── loc/
    ├── en-us.js                              # Localization strings
    └── myStrings.d.ts                        # String type definitions
```

## Contributing

When extending this component:

1. Follow TypeScript best practices
2. Maintain responsive design principles
3. Test on all supported browsers
4. Update documentation for new features
5. Ensure proper cleanup in component lifecycle

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review browser console for errors
3. Verify SharePoint compatibility
4. Test in isolation to rule out conflicts

---

This component provides a solid foundation for side navigation in SharePoint. The modular structure makes it easy to extend and customize for specific organizational needs. 