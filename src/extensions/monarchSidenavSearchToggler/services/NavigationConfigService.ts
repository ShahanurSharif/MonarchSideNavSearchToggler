import { ApplicationCustomizerContext } from '@microsoft/sp-application-base';
import { SPHttpClient, SPHttpClientResponse } from '@microsoft/sp-http';
import { ISidebarNavConfig, DefaultNavigationConfig, INavigationItem } from '../interfaces/INavigationInterfaces';

export class NavigationConfigService {
  private static readonly CONFIG_FILE_NAME = 'monarchSidebarNav.json';
  private static readonly CONFIG_LIST_NAME = 'Site Assets';
  private static readonly CACHE_KEY = 'monarch-sidebar-nav-config';
  private static readonly CACHE_EXPIRY_HOURS = 24; // Cache expires after 24 hours

  private context: ApplicationCustomizerContext;

  constructor(context: ApplicationCustomizerContext) {
    this.context = context;
  }

  /**
   * Loads navigation configuration from SharePoint or cache
   */
  public async loadConfiguration(): Promise<ISidebarNavConfig> {
    try {
      // Try to get from cache first
      const cachedConfig = this.getCachedConfig();
      if (cachedConfig) {
        console.log('MonarchSidebarNav: Loaded configuration from cache');
        return cachedConfig;
      }

      // Try to load from SharePoint
      const config = await this.loadFromSharePoint();
      if (config) {
        console.log('MonarchSidebarNav: Loaded configuration from SharePoint');
        this.cacheConfig(config);
        return config;
      }

      // Fall back to default configuration
      console.log('MonarchSidebarNav: Using default configuration');
      const defaultConfig = this.createDefaultConfig();
      await this.saveConfiguration(defaultConfig);
      return defaultConfig;

    } catch (error) {
      console.error('MonarchSidebarNav: Error loading configuration:', error);
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
        this.cacheConfig(config);
        console.log('MonarchSidebarNav: Configuration saved successfully');
        return true;
      }

      console.error('MonarchSidebarNav: Failed to save configuration');
      return false;

    } catch (error) {
      console.error('MonarchSidebarNav: Error saving configuration:', error);
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

    const requiredFields = ['version', 'navigation', 'theme', 'searchEnabled', 'autoSave'];
    for (const field of requiredFields) {
      if (!(field in config)) {
        console.warn(`MonarchSidebarNav: Missing required field: ${field}`);
        return false;
      }
    }

    if (!Array.isArray((config as ISidebarNavConfig).navigation)) {
      console.warn('MonarchSidebarNav: Navigation must be an array');
      return false;
    }

    return this.validateNavigationItems((config as ISidebarNavConfig).navigation);
  }

  /**
   * Searches navigation items
   */
  public searchNavigationItems(items: INavigationItem[], query: string): Array<{item: INavigationItem, path: string[]}> {
    const results: Array<{item: INavigationItem, path: string[]}> = [];
    const searchTerm = query.toLowerCase();

    const searchRecursive = (navItems: INavigationItem[], currentPath: string[] = []): void => {
      for (const item of navItems) {
        const itemPath = [...currentPath, item.title];
        
        // Check if title or URL matches
        if (item.title.toLowerCase().includes(searchTerm) || 
            item.url.toLowerCase().includes(searchTerm)) {
          results.push({ item, path: itemPath });
        }

        // Search children recursively
        if (item.children && item.children.length > 0) {
          searchRecursive(item.children, itemPath);
        }
      }
    };

    searchRecursive(items);
    return results;
  }

  /**
   * Gets navigation item by ID (recursive search)
   */
  public findNavigationItemById(items: INavigationItem[], id: string): INavigationItem | undefined {
    for (const item of items) {
      if (item.id === id) {
        return item;
      }
      
      if (item.children) {
        const found = this.findNavigationItemById(item.children, id);
        if (found) {
          return found;
        }
      }
    }
    return undefined;
  }

  /**
   * Adds a new navigation item (immutable, monarchNav convention)
   */
  public addNavigationItem(config: ISidebarNavConfig, newItem: INavigationItem, parentId?: string): boolean {
    try {
      if (!newItem.id) {
        newItem.id = this.generateUniqueId(config.navigation);
      }
      if (parentId) {
        // Add to parent's children immutably
        const updateChildren = (items: INavigationItem[]): INavigationItem[] =>
          items.map(item =>
            item.id === parentId
              ? { ...item, children: [...(item.children || []), newItem].sort((a, b) => a.order - b.order) }
              : { ...item, children: item.children ? updateChildren(item.children) : undefined }
          );
        config.navigation = updateChildren(config.navigation);
        return true;
      } else {
        // Add to root level immutably
        config.navigation = [...config.navigation, newItem].sort((a, b) => a.order - b.order);
        return true;
      }
    } catch (error) {
      console.error('MonarchSidebarNav: Error adding navigation item:', error);
      return false;
    }
  }

  /**
   * Updates an existing navigation item (immutable, monarchNav convention)
   */
  public updateNavigationItem(config: ISidebarNavConfig, updatedItem: INavigationItem): boolean {
    try {
      const updateRecursive = (items: INavigationItem[]): INavigationItem[] =>
        items.map(item =>
          item.id === updatedItem.id
            ? { ...updatedItem }
            : { ...item, children: item.children ? updateRecursive(item.children) : undefined }
        );
      config.navigation = updateRecursive(config.navigation);
      return true;
    } catch (error) {
      console.error('MonarchSidebarNav: Error updating navigation item:', error);
      return false;
    }
  }

  /**
   * Removes a navigation item by ID (immutable, monarchNav convention)
   */
  public removeNavigationItem(config: ISidebarNavConfig, id: string): boolean {
    try {
      // Recursively filter out the item with the given id
      const removeRecursive = (items: INavigationItem[]): INavigationItem[] =>
        items
          .filter(item => item.id !== id)
          .map(item => ({
            ...item,
            children: item.children ? removeRecursive(item.children) : undefined
          }));
      const newNavigation = removeRecursive(config.navigation);
      // Only update if something was actually removed
      if (newNavigation.length !== config.navigation.length ||
          JSON.stringify(newNavigation) !== JSON.stringify(config.navigation)) {
        config.navigation = newNavigation;
        return true;
      }
      return false;
    } catch (error) {
      console.error('MonarchSidebarNav: Error removing navigation item:', error);
      return false;
    }
  }

  /**
   * Adds a new navigation item and saves to SharePoint (monarchNav convention)
   */
  public async addAndSaveNavigationItem(newItem: INavigationItem, parentId?: string): Promise<boolean> {
    // Always load the latest config from SharePoint
    const config = await this.loadConfiguration();
    const success = this.addNavigationItem(config, newItem, parentId);
    if (success) {
      const saved = await this.saveConfiguration(config);
      if (saved) {
        console.log('MonarchSidebarNav: Navigation item added and saved successfully');
        return true;
      }
    }
    console.error('MonarchSidebarNav: Failed to add and save navigation item');
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
        console.log('MonarchSidebarNav: Navigation item updated and saved successfully');
        return true;
      }
    }
    console.error('MonarchSidebarNav: Failed to update and save navigation item');
    return false;
  }

  /**
   * Removes a navigation item by ID and saves to SharePoint (monarchNav convention)
   */
  public async removeAndSaveNavigationItem(id: string): Promise<boolean> {
    const config = await this.loadConfiguration();
    const success = this.removeNavigationItem(config, id);
    if (success) {
      const saved = await this.saveConfiguration(config);
      if (saved) {
        console.log('MonarchSidebarNav: Navigation item removed and saved successfully');
        return true;
      }
    }
    console.error('MonarchSidebarNav: Failed to remove and save navigation item');
    return false;
  }

  /**
   * Gets the sidebar toggler position from localStorage
   */
  public getTogglerPosition(): string | undefined {
    try {
      return localStorage.getItem('monarch-sidebar-toggler-position') || undefined;
    } catch (error) {
      console.warn('MonarchSidebarNav: Failed to get toggler position from localStorage:', error);
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
      console.warn('MonarchSidebarNav: Failed to set toggler position in localStorage:', error);
    }
  }

  private async loadFromSharePoint(): Promise<ISidebarNavConfig | undefined> {
    try {
      const siteUrl = this.context.pageContext.web.absoluteUrl;
      const fileUrl = `${siteUrl}/${NavigationConfigService.CONFIG_LIST_NAME}/${NavigationConfigService.CONFIG_FILE_NAME}`;
      
      const response: SPHttpClientResponse = await this.context.spHttpClient.get(
        fileUrl,
        SPHttpClient.configurations.v1
      );

      if (response.ok) {
        const configText = await response.text();
        const config = JSON.parse(configText);
        
        if (this.validateConfiguration(config)) {
          return config;
        }
      }

      return undefined;
    } catch (error) {
      console.warn('MonarchSidebarNav: Could not load configuration from SharePoint:', error);
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
        console.error(`MonarchSidebarNav: Save failed. Status: ${response.status} ${response.statusText}. Body: ${errorText}`);
      }

      return response.ok;
    } catch (error) {
      console.error('MonarchSidebarNav: Error saving to SharePoint:', error);
      return false;
    }
  }

  private getCachedConfig(): ISidebarNavConfig | undefined {
    try {
      const cachedData = localStorage.getItem(NavigationConfigService.CACHE_KEY);
      if (!cachedData) {
        return undefined;
      }

      const parsed = JSON.parse(cachedData);
      const currentTime = new Date().getTime();

      // Check if cache has expired
      if (currentTime > parsed.expiry) {
        localStorage.removeItem(NavigationConfigService.CACHE_KEY);
        return undefined;
      }

      if (this.validateConfiguration(parsed.config)) {
        return parsed.config;
      }

      return undefined;
    } catch (error) {
      console.warn('MonarchSidebarNav: Error reading cached config:', error);
      return undefined;
    }
  }

  private cacheConfig(config: ISidebarNavConfig): void {
    try {
      const expiryTime = new Date().getTime() + (NavigationConfigService.CACHE_EXPIRY_HOURS * 60 * 60 * 1000);
      const cacheData = {
        config,
        expiry: expiryTime,
        timestamp: new Date().toISOString()
      };
      localStorage.setItem(NavigationConfigService.CACHE_KEY, JSON.stringify(cacheData));
    } catch (error) {
      console.warn('MonarchSidebarNav: Failed to cache config:', error);
    }
  }

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
        console.warn('MonarchSidebarNav: Invalid navigation item:', item);
        return false;
      }

      if (item.children && !this.validateNavigationItems(item.children)) {
        return false;
      }
    }
    return true;
  }

  private generateUniqueId(existingItems: INavigationItem[]): string {
    const getAllIds = (items: INavigationItem[]): string[] => {
      let ids: string[] = [];
      for (const item of items) {
        ids.push(item.id);
        if (item.children) {
          ids = ids.concat(getAllIds(item.children));
        }
      }
      return ids;
    };

    const existingIds = getAllIds(existingItems);
    let counter = 1;
    let newId = `nav-item-${counter}`;
    
    while (existingIds.indexOf(newId) !== -1) {
      counter++;
      newId = `nav-item-${counter}`;
    }

    return newId;
  }
}