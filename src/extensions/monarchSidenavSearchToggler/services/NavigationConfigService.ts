import { ApplicationCustomizerContext } from '@microsoft/sp-application-base';
import { SPHttpClient, SPHttpClientResponse } from '@microsoft/sp-http';
import { ISidebarNavConfig, DefaultNavigationConfig, INavigationItem } from '../interfaces/INavigationInterfaces';

export class NavigationConfigService {
  private static readonly CONFIG_FILE_NAME = 'monarchSidebarNavConfig.json';
  private static readonly CONFIG_LIST_NAME = 'SiteAssets';

  private context: ApplicationCustomizerContext;

  constructor(context: ApplicationCustomizerContext) {
    this.context = context;
  }

  /**
   * Loads navigation configuration from SharePoint or cache
   */
  public async loadConfiguration(): Promise<ISidebarNavConfig> {
    try {
      // Always load from SharePoint (no caching)
      const config = await this.loadFromSharePoint();
      if (config) {
        console.log('MonarchSideNavSearchToggler: Loaded configuration from SharePoint');
        return config;
      }

      // Fall back to default configuration
      console.log('MonarchSideNavSearchToggler: Using default configuration');
      const defaultConfig = this.createDefaultConfig();
      await this.saveConfiguration(defaultConfig);
      return defaultConfig;

    } catch (error) {
      console.error('MonarchSideNavSearchToggler: Error loading configuration:', error);
      return this.createDefaultConfig();
    }
  }

  /**
   * Saves navigation configuration to SharePoint
   */
  public async saveConfiguration(config: ISidebarNavConfig): Promise<boolean> {
    try {
      config.lastModified = new Date().toISOString();
      config.modifiedBy = this.context.pageContext.user.displayName || 'Unknown';

      const success = await this.saveToSharePoint(config);
      if (success) {
        console.log('MonarchSideNavSearchToggler: Configuration saved successfully');
        return true;
      }

      console.error('MonarchSideNavSearchToggler: Failed to save configuration');
      return false;

    } catch (error) {
      console.error('MonarchSideNavSearchToggler: Error saving configuration:', error);
      return false;
    }
  }

  /**
   * Validates navigation configuration structure
   */
  public validateConfiguration(config: unknown): config is ISidebarNavConfig {
    if (!config || typeof config !== 'object') {
      return false;
    }

    const configObj = config as Record<string, unknown>;

    // Handle migration from old "navigation" property to new "items" property
    if (configObj.navigation && !configObj.items) {
      console.log('MonarchSideNavSearchToggler: Migrating from navigation to items property');
      configObj.items = configObj.navigation;
      delete configObj.navigation;
    }

    // Add default sidebar configuration if missing
    if (!configObj.sidebar) {
      console.log('MonarchSideNavSearchToggler: Adding default sidebar configuration');
      configObj.sidebar = {
        isOpen: true,
        isPinned: false,
        position: 'left'
      };
    }

    const requiredFields = ['version', 'items', 'theme', 'searchEnabled', 'autoSave'];
    for (const field of requiredFields) {
      if (!(field in configObj)) {
        console.warn(`MonarchSideNavSearchToggler: Missing required field: ${field}`);
        return false;
      }
    }

    if (!Array.isArray(configObj.items)) {
      console.warn('MonarchSideNavSearchToggler: Items must be an array');
      return false;
    }

    return this.validateNavigationItems(configObj.items);
  }

  /**
   * Searches navigation items
   */
  public searchNavigationItems(items: INavigationItem[], query: string): Array<{item: INavigationItem, path: string[]}> {
    const results: Array<{item: INavigationItem, path: string[]}> = [];
    const searchTerm = query.toLowerCase();

    // Build path for each item - simple approach to avoid TypeScript issues
    const buildPath = (item: INavigationItem): string[] => {
      const path: string[] = [item.title];
      
      // Find parent if exists (parentId > 0)
      if (item.parentId > 0) {
        const parent = items.find(i => i.id === item.parentId);
        if (parent) {
          const parentPath = buildPath(parent);
          return [...parentPath, item.title];
        }
      }
      
      return path;
    };
    
    // Search all items
    for (const item of items) {
      if (item.title.toLowerCase().includes(searchTerm) || 
          item.url.toLowerCase().includes(searchTerm)) {
        results.push({ item, path: buildPath(item) });
      }
    }

    return results;
  }

  /**
   * Gets navigation item by ID (flat array search)
   */
  public findNavigationItemById(items: INavigationItem[], id: number): INavigationItem | undefined {
    return items.find(item => item.id === id);
  }

  /**
   * Adds a new navigation item (immutable, monarchNav convention)
   */
  public addNavigationItem(config: ISidebarNavConfig, newItem: INavigationItem, parentId?: number): boolean {
    try {
      if (!newItem.id) {
        newItem.id = this.generateUniqueId(config.items);
      }
      
      // Set parentId based on parameter (0 for root items)
      newItem.parentId = parentId || 0;
      
      // Add to flat array and sort by order
      config.items = [...config.items, newItem].sort((a, b) => a.order - b.order);
      return true;
    } catch (error) {
      console.error('MonarchSideNavSearchToggler: Error adding navigation item:', error);
      return false;
    }
  }

  /**
   * Updates an existing navigation item (immutable, monarchNav convention)
   */
  public updateNavigationItem(config: ISidebarNavConfig, updatedItem: INavigationItem): boolean {
    try {
      // Update item in flat array
      const itemIndex = config.items.findIndex(item => item.id === updatedItem.id);
      if (itemIndex !== -1) {
        config.items = [...config.items];
        config.items[itemIndex] = { ...updatedItem };
        return true;
      }
      return false;
    } catch (error) {
      console.error('MonarchSideNavSearchToggler: Error updating navigation item:', error);
      return false;
    }
  }

  /**
   * Removes a navigation item by ID (immutable, monarchNav convention)
   */
  public removeNavigationItem(config: ISidebarNavConfig, id: number): boolean {
    try {
      // Remove item from flat array and also remove any children
      const initialLength = config.items.length;
      config.items = config.items.filter(item => item.id !== id && item.parentId !== id);
      
      // Return true if something was removed
      return config.items.length !== initialLength;
    } catch (error) {
      console.error('MonarchSideNavSearchToggler: Error removing navigation item:', error);
      return false;
    }
  }

  /**
   * Adds a new navigation item and saves to SharePoint (monarchNav convention)
   */
  public async addAndSaveNavigationItem(newItem: INavigationItem, parentId?: number): Promise<boolean> {
    // Always load the latest config from SharePoint
    const config = await this.loadConfiguration();
    const success = this.addNavigationItem(config, newItem, parentId);
    if (success) {
      const saved = await this.saveConfiguration(config);
      if (saved) {
        console.log('MonarchSideNavSearchToggler: Navigation item added and saved successfully');
        return true;
      }
    }
    console.error('MonarchSideNavSearchToggler: Failed to add and save navigation item');
    return false;
  }

  /**
   * Updates an existing navigation item and saves to SharePoint (monarchNav convention)
   */
  public async updateAndSaveNavigationItem(updatedItem: INavigationItem): Promise<boolean> {
    const config = await this.loadConfiguration();
    const success = this.updateNavigationItem(config, updatedItem);
    if (success) {
      const saved = await this.saveConfiguration(config);
      if (saved) {
        console.log('MonarchSideNavSearchToggler: Navigation item updated and saved successfully');
        return true;
      }
    }
    console.error('MonarchSideNavSearchToggler: Failed to update and save navigation item');
    return false;
  }

  /**
   * Removes a navigation item by ID and saves to SharePoint (monarchNav convention)
   */
  public async removeAndSaveNavigationItem(id: number): Promise<boolean> {
    const config = await this.loadConfiguration();
    const success = this.removeNavigationItem(config, id);
    if (success) {
      const saved = await this.saveConfiguration(config);
      if (saved) {
        console.log('MonarchSideNavSearchToggler: Navigation item removed and saved successfully');
        return true;
      }
    }
    console.error('MonarchSideNavSearchToggler: Failed to remove and save navigation item');
    return false;
  }

  /**
   * Gets the sidebar toggler position from localStorage
   */
  public getTogglerPosition(): string | undefined {
    try {
      return localStorage.getItem('monarch-sidebar-toggler-position') || undefined;
    } catch (error) {
      console.warn('MonarchSideNavSearchToggler: Failed to get toggler position from localStorage:', error);
      return undefined;
    }
  }

  /**
   * Sets the sidebar toggler position in localStorage
   */
  public setTogglerPosition(position: string): void {
    try {
      localStorage.setItem('monarch-sidebar-toggler-position', position);
    } catch (error) {
      console.warn('MonarchSideNavSearchToggler: Failed to set toggler position in localStorage:', error);
    }
  }

  private async loadFromSharePoint(): Promise<ISidebarNavConfig | undefined> {
    try {
      const siteUrl = this.context.pageContext.web.absoluteUrl;
      const fileUrl = `${siteUrl}/${NavigationConfigService.CONFIG_LIST_NAME}/${NavigationConfigService.CONFIG_FILE_NAME}`;
      
      console.log('MonarchSideNavSearchToggler: Attempting to load config from:', fileUrl);
      
      const response: SPHttpClientResponse = await this.context.spHttpClient.get(
        fileUrl,
        SPHttpClient.configurations.v1
      );

      console.log('MonarchSideNavSearchToggler: SharePoint response status:', response.status, response.statusText);

      if (response.ok) {
        const configText = await response.text();
        console.log('MonarchSideNavSearchToggler: Raw config text length:', configText.length);
        const config = JSON.parse(configText);
        console.log('MonarchSideNavSearchToggler: Parsed config:', config);
        
        if (this.validateConfiguration(config)) {
          console.log('MonarchSideNavSearchToggler: Configuration validation passed');
          return config;
        } else {
          console.warn('MonarchSideNavSearchToggler: Configuration validation failed');
        }
      } else {
        console.warn('MonarchSideNavSearchToggler: Failed to fetch config file. Status:', response.status);
      }

      return undefined;
    } catch (error) {
      console.warn('MonarchSideNavSearchToggler: Could not load configuration from SharePoint:', error);
      return undefined;
    }
  }

  private async saveToSharePoint(config: ISidebarNavConfig): Promise<boolean> {
    try {
      const siteUrl = this.context.pageContext.web.absoluteUrl;
      const serverRelativeUrl = `${this.context.pageContext.web.serverRelativeUrl.replace(/\/$/, '')}/${NavigationConfigService.CONFIG_LIST_NAME}`;
      const configJson = JSON.stringify(config, null, 2);
      const blob = new Blob([configJson], { type: 'application/json' });

      // Use REST API to save file to Site Assets library
      const uploadUrl = `${siteUrl}/_api/web/GetFolderByServerRelativeUrl('${serverRelativeUrl}')/Files/add(overwrite=true,url='${NavigationConfigService.CONFIG_FILE_NAME}')`;

      // Console logging for debugging - log navigation object and entire config
      console.log('MonarchSideNavSearchToggler: About to save to SharePoint - Navigation object:', config.items);
      console.log('MonarchSideNavSearchToggler: About to save to SharePoint - Full config data:', config);
      console.log('MonarchSideNavSearchToggler: About to save to SharePoint - JSON string length:', configJson.length);

      const response: SPHttpClientResponse = await this.context.spHttpClient.post(
        uploadUrl,
        SPHttpClient.configurations.v1,
        {
          body: blob
        }
      );

      if (!response.ok) {
        let errorText = '';
        try {
          errorText = await response.text();
        } catch {
          // Intentionally ignore error when reading error text
        }
        console.error(`MonarchSideNavSearchToggler: Save failed. Status: ${response.status} ${response.statusText}. Body: ${errorText}`);
      }

      return response.ok;
    } catch (error) {
      console.error('MonarchSideNavSearchToggler: Error saving to SharePoint:', error);
      return false;
    }
  }

  // Cache methods removed - only toggle position is cached now

  private createDefaultConfig(): ISidebarNavConfig {
    const config = { ...DefaultNavigationConfig };
    config.createdBy = this.context.pageContext.user.displayName || 'System';
    config.modifiedBy = config.createdBy;
    config.lastModified = new Date().toISOString();
    return config;
  }

  private validateNavigationItems(items: INavigationItem[]): boolean {
    for (const item of items) {
      if (!item.id || !item.title || !item.url || typeof item.order !== 'number') {
        console.warn('MonarchSideNavSearchToggler: Invalid navigation item:', item);
        return false;
      }
    }
    return true;
  }

  private generateUniqueId(existingItems: INavigationItem[]): number {
    const existingIds = existingItems.map(item => item.id);
    const maxId = existingIds.length > 0 ? Math.max(...existingIds) : 0;
    return maxId + 1;
  }
}