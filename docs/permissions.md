# Permission System for Monarch Sidebar Navigation

## Overview

The Monarch Sidebar Navigation component now includes a comprehensive permission system that restricts edit functionality to users with appropriate permissions. This ensures that only authorized users can modify the navigation configuration.

## How It Works

### Permission Levels

The system checks for the following permission levels:

1. **Site Owner**: Users who are members of the SharePoint site's "Owners" group
2. **Full Control**: Users with full control permissions on the site
3. **Manage Web**: Users with manage web permissions

### Permission Functions

#### `hasSiteOwnerPermission(context)`
- Checks if the current user is a member of the site's "Owners" group
- Returns `true` if user has site owner permissions

#### `getPermissionInfo(context)`
- Gets detailed permission information for the current user
- Returns an object with all permission flags

#### `canEditNavigation(context)`
- Determines if the user can edit navigation
- Returns `true` if user is site owner OR has manage web permissions OR has full control

#### `usePermissions(context)` (React Hook)
- React hook for components to check permissions
- Returns permission states and loading state

## Implementation

### Files Modified

1. **`src/extensions/monarchSidenavSearchToggler/utils/permissionUtils.ts`**
   - Contains all permission checking logic
   - Provides utility functions and React hook

2. **`src/extensions/monarchSidenavSearchToggler/MonarchSidenavSearchToggler.tsx`**
   - Main component now uses permission checking
   - Edit button only shows for authorized users

3. **`src/extensions/monarchSidenavSearchToggler/components/SidebarNavigation.tsx`**
   - Navigation component respects permission settings
   - Edit/delete/add buttons only show for authorized users

### Permission Checks Applied

The following UI elements are now permission-controlled:

1. **Main Edit Button**: Only visible to users with edit permissions
2. **Navigation Item Edit Buttons**: Only visible in config mode for authorized users
3. **Navigation Item Delete Buttons**: Only visible in config mode for authorized users
4. **Add Child Buttons**: Only visible in config mode for authorized users
5. **Add Root Button**: Only visible in config mode for authorized users
6. **Theme Settings Button**: Only visible in config mode for authorized users

## Usage

### For Developers

```typescript
import { usePermissions } from './utils/permissionUtils';

// In your component
const { canEdit, loading, hasSiteOwnerPermission } = usePermissions(context);

// Conditionally render edit functionality
{canEdit && !loading && (
  <button onClick={handleEdit}>Edit</button>
)}
```

### For End Users

- **Site Owners**: Can see and use all edit functionality
- **Regular Users**: Can only view the navigation, no edit buttons visible
- **Loading State**: Edit buttons are hidden while permissions are being checked

## Security Benefits

1. **Prevents Unauthorized Changes**: Only authorized users can modify navigation
2. **Role-Based Access**: Respects SharePoint's built-in permission system
3. **Graceful Degradation**: Non-authorized users still see the navigation but without edit controls
4. **Performance**: Permission checks are cached and only run when needed

## Troubleshooting

### Common Issues

1. **Edit buttons not showing**: Check if user has site owner or manage web permissions
2. **Permission loading forever**: Check browser console for API errors
3. **Incorrect permissions**: Verify SharePoint group membership

### Debug Information

The permission system logs detailed information to the browser console:

- Permission check results
- API call success/failure
- User group membership status
- Effective permissions

## Future Enhancements

Potential improvements to consider:

1. **Custom Permission Groups**: Allow site admins to define custom permission groups
2. **Item-Level Permissions**: Different permissions for different navigation items
3. **Audit Logging**: Track who made changes and when
4. **Permission Caching**: Cache permissions for better performance 