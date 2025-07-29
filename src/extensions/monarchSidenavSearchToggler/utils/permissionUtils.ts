import { SPHttpClient } from '@microsoft/sp-http';
import { ApplicationCustomizerContext } from '@microsoft/sp-application-base';
import * as React from 'react';

export interface IPermissionInfo {
  hasFullControl: boolean;
  hasManageWeb: boolean;
  hasManageLists: boolean;
  hasAddAndCustomizePages: boolean;
  hasManagePermissions: boolean;
  isSiteOwner: boolean;
}

/**
 * Check if the current user has site owner permissions
 * @param context - The SharePoint context
 * @returns Promise<boolean> - True if user has site owner permissions
 */
export const hasSiteOwnerPermission = async (context: ApplicationCustomizerContext): Promise<boolean> => {
  try {
    const currentUser = context.pageContext.user;
    const siteUrl = context.pageContext.web.absoluteUrl;
    
    // Get current user's permissions
    const userPermissionsUrl = `${siteUrl}/_api/web/currentuser?$select=Id,Title,LoginName&$expand=Groups`;
    const userResponse = await context.spHttpClient.get(userPermissionsUrl, SPHttpClient.configurations.v1);
    
    if (!userResponse.ok) {
      console.warn('Failed to get user information for permission check');
      return false;
    }

    const userData = await userResponse.json();
    
    // Get site owners group
    const ownersGroupUrl = `${siteUrl}/_api/web/sitegroups/getbyname('Owners')/users`;
    const ownersResponse = await context.spHttpClient.get(ownersGroupUrl, SPHttpClient.configurations.v1);
    
    if (!ownersResponse.ok) {
      console.warn('Failed to get site owners group');
      return false;
    }

    const ownersData = await ownersResponse.json();
    const owners = ownersData.value || [];
    
    // Check if current user is in the Owners group
    const isOwner = owners.some((owner: { LoginName: string; Email: string; Id: number }) => 
      owner.LoginName === currentUser.loginName || 
      owner.Email === currentUser.email ||
      owner.Id === userData.Id
    );

    // Also check for Full Control permission
    const permissionUrl = `${siteUrl}/_api/web/effectivebasepermissions`;
    const permissionResponse = await context.spHttpClient.get(permissionUrl, SPHttpClient.configurations.v1);
    
    if (permissionResponse.ok) {
      const permissionData = await permissionResponse.json();
      const hasFullControl = permissionData.High === 32768; // Full Control permission
      
      return isOwner || hasFullControl;
    }

    return isOwner;
  } catch (error) {
    console.error('Error checking site owner permission:', error);
    return false;
  }
};

/**
 * Get detailed permission information for the current user
 * @param context - The SharePoint context
 * @returns Promise<IPermissionInfo> - Detailed permission information
 */
export const getPermissionInfo = async (context: ApplicationCustomizerContext): Promise<IPermissionInfo> => {
  try {
    const siteUrl = context.pageContext.web.absoluteUrl;
    
    // Get user's effective permissions
    const permissionUrl = `${siteUrl}/_api/web/effectivebasepermissions`;
    const permissionResponse = await context.spHttpClient.get(permissionUrl, SPHttpClient.configurations.v1);
    
    if (!permissionResponse.ok) {
      throw new Error('Failed to get user permissions');
    }

    const permissionData = await permissionResponse.json();
    const permissions = permissionData.High || 0;
    
    // Check if user is in Owners group
    const isOwner = await hasSiteOwnerPermission(context);
    
    return {
      hasFullControl: (permissions & 32768) === 32768, // Full Control
      hasManageWeb: (permissions & 16384) === 16384, // Manage Web
      hasManageLists: (permissions & 2048) === 2048, // Manage Lists
      hasAddAndCustomizePages: (permissions & 1024) === 1024, // Add and Customize Pages
      hasManagePermissions: (permissions & 512) === 512, // Manage Permissions
      isSiteOwner: isOwner
    };
  } catch (error) {
    console.error('Error getting permission info:', error);
    return {
      hasFullControl: false,
      hasManageWeb: false,
      hasManageLists: false,
      hasAddAndCustomizePages: false,
      hasManagePermissions: false,
      isSiteOwner: false
    };
  }
};

/**
 * Check if user can edit navigation (site owner or has manage web permissions)
 * @param context - The SharePoint context
 * @returns Promise<boolean> - True if user can edit navigation
 */
export const canEditNavigation = async (context: ApplicationCustomizerContext): Promise<boolean> => {
  try {
    const permissionInfo = await getPermissionInfo(context);
    
    // Allow if user is site owner or has manage web permissions
    return permissionInfo.isSiteOwner || permissionInfo.hasManageWeb || permissionInfo.hasFullControl;
  } catch (error) {
    console.error('Error checking navigation edit permission:', error);
    return false;
  }
};

/**
 * Hook to use permission checking in React components
 * @param context - The SharePoint context
 * @returns Object with permission states and loading state
 */
export const usePermissions = (context: ApplicationCustomizerContext): {
  permissionInfo: IPermissionInfo | undefined;
  canEdit: boolean;
  loading: boolean;
  hasSiteOwnerPermission: boolean;
  hasFullControl: boolean;
  hasManageWeb: boolean;
} => {
  const [permissionInfo, setPermissionInfo] = React.useState<IPermissionInfo | undefined>(undefined);
  const [loading, setLoading] = React.useState(true);
  const [canEdit, setCanEdit] = React.useState(false);

  React.useEffect(() => {
    const checkPermissions = async (): Promise<void> => {
      try {
        setLoading(true);
        const info = await getPermissionInfo(context);
        const editPermission = await canEditNavigation(context);
        
        setPermissionInfo(info);
        setCanEdit(editPermission);
      } catch (error) {
        console.error('Error checking permissions:', error);
        setCanEdit(false);
      } finally {
        setLoading(false);
      }
    };

    checkPermissions().catch((error) => {
      console.error('Error in checkPermissions:', error);
    });
  }, [context]);

  return {
    permissionInfo,
    canEdit,
    loading,
    hasSiteOwnerPermission: permissionInfo?.isSiteOwner || false,
    hasFullControl: permissionInfo?.hasFullControl || false,
    hasManageWeb: permissionInfo?.hasManageWeb || false
  };
}; 