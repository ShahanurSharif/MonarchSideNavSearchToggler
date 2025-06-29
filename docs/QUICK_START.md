# Quick Start Guide

Get the Monarch Side Navigation Toggler running in 5 minutes.

## Prerequisites Check

Before starting, make sure you have:
- Node.js version 16 or higher
- SharePoint development environment set up
- Access to a SharePoint site for testing

## Step 1: Development Setup

```bash
# Install dependencies
npm install

# Start development server
gulp serve
```

## Step 2: Test the Component

1. Open your SharePoint workbench: `https://yourtenant.sharepoint.com/_layouts/15/workbench.aspx`
2. Add the Application Customizer to test it
3. You should see a circular button on the left side
4. Click the button to open/close the sidebar

## Step 3: Quick Customization

### Change Button Color
Edit `MonarchSidenavSearchToggler.module.scss` line 25:
```scss
background: #your-color-here;
```

### Add Your Navigation Links
Edit `MonarchSidenavSearchToggler.tsx` around line 70:
```typescript
<li class="${styles.navItem}">
  <a href="your-link" class="${styles.navLink}">Your Link Title</a>
</li>
```

### Adjust Button Position
Edit `MonarchSidenavSearchToggler.module.scss` line 4:
```scss
top: 120px;    // Move up/down
left: 20px;    // Move left/right
```

## Step 4: Deploy to SharePoint

```bash
# Build for production
gulp build

# Create package
gulp bundle --ship
gulp package-solution --ship
```

Upload the `.sppkg` file from `sharepoint/solution/` to your App Catalog.

## Common Customizations

### Make Sidebar Wider
In `MonarchSidenavSearchToggler.tsx`, change the width percentages:
```typescript
return '25%';  // Instead of '20%' for desktop
```

### Change Sidebar Content
Replace the navigation HTML in the `injectSidebar()` method with your own content.

### Different Colors
Update these CSS variables in the SCSS file:
- Button color: `.toggleButton background`
- Sidebar background: `.sidebar background`
- Link colors: `.navLink color` and hover states

## Troubleshooting

**Button not showing?**
- Check browser console for errors
- Verify the component is deployed correctly

**Sidebar not sliding?**
- Make sure no other CSS is interfering
- Check if SPPageChrome element exists on your page

**Styling looks wrong?**
- Clear browser cache
- Check if SharePoint theme is overriding styles

## Next Steps

- Read the full [README.md](./README.md) for detailed documentation
- Customize the navigation structure for your needs
- Add your own branding and colors
- Test on different devices and browsers

## File Locations

- Main component: `src/extensions/monarchSidenavSearchToggler/MonarchSidenavSearchToggler.tsx`
- Styles: `src/extensions/monarchSidenavSearchToggler/MonarchSidenavSearchToggler.module.scss`
- App customizer: `src/extensions/monarchSidenavSearchToggler/MonarchSidenavSearchTogglerApplicationCustomizer.ts`

That's it! You now have a working side navigation component. Check the full documentation for advanced customization options. 