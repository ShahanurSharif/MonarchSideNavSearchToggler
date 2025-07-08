import * as React from 'react';
import { DefaultButton } from '@fluentui/react/lib/Button';
import { IDropdownOption } from '@fluentui/react/lib/Dropdown';
import { 
  INavigationItem, 
  INavigationSearchResult,
  IComponentState,
  INavigationProps,
  IThemeConfig,
  DefaultNavigationConfig 
} from './interfaces/INavigationInterfaces';
import { NavigationConfigService } from './services/NavigationConfigService';
import { NavigationConfigModal } from './components/NavigationConfigModal';
import { ThemeConfigModal } from './components/ThemeConfigModal';
import styles from './MonarchSidenavSearchToggler.module.scss';

export default class MonarchSidenavSearchToggler extends React.Component<INavigationProps, IComponentState> {
  private readonly CACHE_KEY = 'monarch-sidenav-toggle-state';
  private readonly CACHE_EXPIRY_HOURS = 365 * 24; // Cache expires after 365 days (1 year)
  private searchTimeout: number | null = null;
  private configService: NavigationConfigService;

  constructor(props: INavigationProps) {
    super(props);
    
    this.configService = new NavigationConfigService(props.context);
    
    // Load cached state or default to false
    const cachedState = this.loadToggleState();
    this.state = { 
      isOpen: cachedState,
      searchQuery: '',
      searchResults: [],
      isSearching: false,
      hasSearched: false,
      navigationConfig: DefaultNavigationConfig,
      modalState: {
        isVisible: false,
        mode: 'add'
      },
      isConfigMode: false,
      hasUnsavedChanges: false
    };
  }

  public async componentDidMount(): Promise<void> {
    // Load navigation configuration
    try {
      const config = await this.configService.loadConfiguration();
      this.initializeIsExpanded(config.navigation);
      this.setState({ navigationConfig: config });
    } catch (error) {
      console.error('MonarchSidebarNav: Failed to load configuration:', error);
    }

    this.injectToggleButton();
    this.injectSidebar();
    
    // Apply cached state if sidebar should be open
    if (this.state.isOpen) {
      setTimeout(() => {
        console.log('MonarchSidebarNav: Applying cached open state');
        this.applyToggleState(true);
        
        setTimeout(() => {
          this.ensureContentAdjustment(true);
        }, 200);
      }, 300);
    }
    this.makeToggleButtonDraggable();
  }

  public componentWillUnmount(): void {
    this.cleanup();
  }

  private injectToggleButton(): void {
    const buttonContainer = document.createElement('div');
    buttonContainer.id = 'monarch-sidenav-button-container';
    buttonContainer.className = styles.buttonContainer;
    
    // Create FluentUI button using React
    const toggleButton = React.createElement(DefaultButton, {
      id: 'monarch-sidenav-toggle',
      'aria-label': 'Toggle Navigation',
      onClick: this.handleToggle,
      iconProps: { iconName: 'GlobalNavButton' },
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

    // Render the React component to the container
    import(/* webpackChunkName: 'react-dom' */ 'react-dom').then((ReactDOM) => {
      ReactDOM.render(toggleButton, buttonContainer);
    }).catch((error) => {
      console.error('Failed to load ReactDOM:', error);
    });

    document.body.appendChild(buttonContainer);
  }

  private injectSidebar(): void {
    const sidebarContainer = document.createElement('div');
    sidebarContainer.id = 'monarch-sidenav-sidebar-container';
    sidebarContainer.className = styles.sidebarContainer;
    
    sidebarContainer.innerHTML = `
      <div class="${styles.sidebar}">
        <div class="${styles.sidebarHeader}">
          <h2 class="${styles.sidebarTitle}">Navigation</h2>
          <div class="${styles.headerButtons}">
            <button id="monarch-sidebar-settings" class="${styles.headerButton}" aria-label="Settings" title="Configure Navigation">
              <span style="font-size: 16px;">⚙️</span>
            </button>
            <button id="monarch-sidebar-edit" class="${styles.headerButton}" aria-label="Edit Mode" title="Edit Navigation">
              <span style="font-size: 16px;">✏️</span>
            </button>
            <button id="monarch-sidebar-close" class="${styles.headerButton}" aria-label="Close">
              <span style="font-size: 16px;">&times;</span>
            </button>
          </div>
        </div>
        <div class="${styles.searchContainer}">
          <input type="text" id="navigation-search-input" placeholder="Search navigation..." class="${styles.searchInput}" />
        </div>
        <div class="${styles.navigationContent}" id="navigation-content-container">
          <div class="${styles.defaultMessage}">
            <p>Loading navigation...</p>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(sidebarContainer);

    // Add event listeners
    const closeButton = document.getElementById('monarch-sidebar-close');
    if (closeButton) {
      closeButton.addEventListener('click', this.handleToggle);
    }

    const settingsButton = document.getElementById('monarch-sidebar-settings');
    if (settingsButton) {
      settingsButton.addEventListener('click', this.handleThemeSettings);
    }

    const editButton = document.getElementById('monarch-sidebar-edit');
    if (editButton) {
      editButton.addEventListener('click', this.handleEditMode);
    }

    const searchInput = document.getElementById('navigation-search-input') as HTMLInputElement;
    if (searchInput) {
      searchInput.addEventListener('input', this.handleSearchInput);
    }

    // Initial render of navigation
    this.renderNavigation();
  }

  private handleSearchInput = (event: Event): void => {
    const target = event.target as HTMLInputElement;
    const query = target.value.trim();
    
    // Clear existing timeout
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }

    this.setState({ searchQuery: query });

    // If query is empty, show all navigation
    if (query === '') {
      this.setState({ 
        searchResults: [], 
        isSearching: false, 
        hasSearched: false 
      });
      this.renderNavigation();
      return;
    }

    // Debounce search - wait 300ms after user stops typing
    this.searchTimeout = setTimeout(() => {
      this.performNavigationSearch(query);
    }, 300);
  };

  private performNavigationSearch(query: string): void {
    if (!query || query.length < 1) {
      return;
    }

    console.log('MonarchSidebarNav: Performing navigation search for:', query);
    this.setState({ isSearching: true, hasSearched: true });

    try {
      const results = this.configService.searchNavigationItems(this.state.navigationConfig.navigation, query);
      const searchResults: INavigationSearchResult[] = results.map(result => ({
        item: result.item,
        matchType: result.item.title.toLowerCase().includes(query.toLowerCase()) ? 'title' : 'url',
        highlightedTitle: this.highlightSearchTerm(result.item.title, query),
        path: result.path
      }));

      console.log('MonarchSidebarNav: Navigation search results:', searchResults);
      
      this.setState({ 
        searchResults, 
        isSearching: false 
      });
      this.renderSearchResults(searchResults);
    } catch (error) {
      console.error('MonarchSidebarNav: Navigation search error:', error);
      this.setState({ 
        searchResults: [], 
        isSearching: false 
      });
      this.renderErrorMessage();
    }
  }

  private highlightSearchTerm(text: string, searchTerm: string): string {
    if (!searchTerm) return text;
    // Escape special regex characters for security
    const escaped = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    try {
      const regex = new RegExp(`(${escaped})`, 'gi');
      return text.replace(regex, '<mark>$1</mark>');
    } catch {
      return text;
    }
  }

  private renderNavigation(): void {
    const container = document.getElementById('navigation-content-container');
    if (!container) return;

    const { navigationConfig, isConfigMode } = this.state;

    if (navigationConfig.navigation.length === 0) {
      container.innerHTML = `
        <div class="${styles.emptyState}">
          <p>No navigation items configured</p>
          ${isConfigMode ? `<button class="${styles.addButton}" id="add-nav-item">Add Navigation Item</button>` : ''}
        </div>
      `;
      
      if (isConfigMode) {
        const addButton = document.getElementById('add-nav-item');
        if (addButton) {
          addButton.addEventListener('click', this.handleAddNavItem);
        }
      }
      return;
    }

    const navigationHtml = this.renderNavigationItems(navigationConfig.navigation, 0);
    
    container.innerHTML = `
      <div class="${styles.navigationList}">
        ${navigationHtml}
        ${isConfigMode ? `
          <div class="${styles.configActions}">
            <button class="${styles.addButton}" id="add-nav-item">
              <span>➕</span> Add Navigation Item
            </button>
          </div>
        ` : ''}
      </div>
    `;

    // Add event listeners for navigation items
    this.addNavigationEventListeners();
    
    if (isConfigMode) {
      const addButton = document.getElementById('add-nav-item');
      if (addButton) {
        addButton.addEventListener('click', this.handleAddNavItem);
      }
    }
  }

  private renderNavigationItems(items: INavigationItem[], level: number): string {
    return items
      .sort((a, b) => a.order - b.order)
      .map(item => {
        const hasChildren = item.children && item.children.length > 0;
        const indent = level * 16;
        const isExpanded = item.isExpanded || false;
        
        return `
          <div class="${styles.navItem}" data-level="${level}">
            <div class="${styles.navItemContent}" 
                 style="padding-left: ${indent}px" 
                 data-id="${item.id}">
              ${hasChildren ? `
                <button class="${styles.expandButton}" 
                        data-id="${item.id}" 
                        aria-label="${isExpanded ? 'Collapse' : 'Expand'}">
                  <span>${isExpanded ? '▼' : '▶'}</span>
                </button>
              ` : '<span class="nav-spacer" style="width: 16px; display: inline-block;"></span>'}
              
              <a href="${item.url}" 
                 target="${item.target || '_self'}" 
                 class="${styles.navLink}"
                 data-id="${item.id}">
                <span class="${styles.navTitle}">${item.title}</span>
              </a>
              
              ${this.state.isConfigMode ? `
                <div class="${styles.configButtons}">
                  <button class="${styles.configButton}" 
                          data-action="edit" 
                          data-id="${item.id}"
                          title="Edit Item">
                    ✏️
                  </button>
                  <button class="${styles.configButton}" 
                          data-action="delete" 
                          data-id="${item.id}"
                          title="Delete Item">
                    🗑️
                  </button>
                  <button class="${styles.configButton}" 
                          data-action="add-child" 
                          data-id="${item.id}"
                          title="Add Child Item">
                    ➕
                  </button>
                </div>
              ` : ''}
            </div>
            
            ${hasChildren && isExpanded ? `
              <div class="${styles.navChildren}">
                ${this.renderNavigationItems(item.children!, level + 1)}
              </div>
            ` : ''}
          </div>
        `;
      }).join('');
  }

  private renderSearchResults(results: INavigationSearchResult[]): void {
    const container = document.getElementById('navigation-content-container');
    if (!container) return;

    if (results.length === 0) {
      container.innerHTML = `
        <div class="${styles.noResultsMessage}">
          <p>No navigation items found</p>
        </div>
      `;
      return;
    }

    const resultsHtml = results.map(result => {
      const pathText = result.path.length > 1 ? result.path.slice(0, -1).join(' > ') : '';
      
      return `
        <div class="${styles.searchResultItem}">
          <a href="${result.item.url}" 
             target="${result.item.target || '_self'}" 
             class="${styles.searchResultLink}">
            <div class="${styles.resultIcon}"></div>
            <div class="${styles.resultContent}">
              <div class="${styles.resultTitle}">${result.highlightedTitle}</div>
              ${pathText ? `<div class="${styles.resultPath}">${pathText}</div>` : ''}
              <div class="${styles.resultUrl}">${result.item.url}</div>
            </div>
          </a>
        </div>
      `;
    }).join('');

    container.innerHTML = `
      <div class="${styles.searchResultsList}">
        <div class="${styles.resultsHeader}">
          <p>${results.length} navigation item${results.length !== 1 ? 's' : ''} found</p>
        </div>
        ${resultsHtml}
      </div>
    `;
  }

  private renderErrorMessage(): void {
    const container = document.getElementById('navigation-content-container');
    if (container) {
      container.innerHTML = `
        <div class="${styles.errorMessage}">
          <p>Unable to search navigation items.</p>
          <p>Please try again or check the configuration.</p>
        </div>
      `;
    }
  }

  private addNavigationEventListeners(): void {
    // Expand/collapse buttons
    const expandButtons = document.querySelectorAll(`.${styles.expandButton}`);
    expandButtons.forEach(button => {
      button.addEventListener('click', this.handleExpandCollapse);
    });

    // Configuration buttons
    if (this.state.isConfigMode) {
      const configButtons = document.querySelectorAll(`.${styles.configButton}`);
      configButtons.forEach(button => {
        button.addEventListener('click', this.handleConfigAction);
      });
    }
  }

  private handleExpandCollapse = (event: Event): void => {
    event.preventDefault();
    event.stopPropagation();
    
    const button = event.target as HTMLElement;
    const id = button.getAttribute('data-id');
    
    if (id) {
      this.toggleNavigationItem(id);
    }
  };

  private handleConfigAction = (event: Event): void => {
    event.preventDefault();
    event.stopPropagation();
    
    const button = event.target as HTMLElement;
    const action = button.getAttribute('data-action');
    const id = button.getAttribute('data-id');
    
    if (!action || !id) return;

    switch (action) {
      case 'edit':
        this.handleEditNavItem(id);
        break;
      case 'delete':
        this.handleDeleteNavItem(id);
        break;
      case 'add-child':
        this.handleAddChildNavItem(id);
        break;
    }
  };

  private toggleNavigationItem(id: string): void {
    // Use a deep clone to ensure React re-renders
    const config = JSON.parse(JSON.stringify(this.state.navigationConfig));
    const updateExpanded = (items: INavigationItem[]): boolean => {
      for (const item of items) {
        if (item.id === id) {
          item.isExpanded = !item.isExpanded;
          return true;
        }
        if (item.children && updateExpanded(item.children)) {
          return true;
        }
      }
      return false;
    };
    if (updateExpanded(config.navigation)) {
      this.setState({ navigationConfig: config });
      this.renderNavigation();
    }
  }

  private handleAddNavItem = (): void => {
    this.setState({
      modalState: {
        isVisible: true,
        mode: 'add'
      }
    });
  };

  private handleAddChildNavItem = (parentId: string): void => {
    this.setState({
      modalState: {
        isVisible: true,
        mode: 'add',
        parentId
      }
    });
  };

  private handleEditNavItem = (id: string): void => {
    const item = this.configService.findNavigationItemById(this.state.navigationConfig.navigation, id);
    if (item) {
      this.setState({
        modalState: {
          isVisible: true,
          mode: 'edit',
          editingItem: { ...item }
        }
      });
    }
  };

  private handleDeleteNavItem = (id: string): void => {
    if (confirm('Are you sure you want to delete this navigation item and all its children?')) {
      const config = { ...this.state.navigationConfig };
      if (this.configService.removeNavigationItem(config, id)) {
        this.setState({ 
          navigationConfig: config,
          hasUnsavedChanges: true 
        });
        this.renderNavigation();
        
        if (config.autoSave) {
          this.saveConfiguration();
        }
      }
    }
  };

  private handleEditMode = (): void => {
    const newConfigMode = !this.state.isConfigMode;
    this.setState({ isConfigMode: newConfigMode });
    
    // Update edit button appearance
    const editButton = document.getElementById('monarch-sidebar-edit');
    if (editButton) {
      editButton.style.backgroundColor = newConfigMode ? '#0078d4' : '';
      editButton.style.color = newConfigMode ? '#ffffff' : '';
      editButton.title = newConfigMode ? 'Exit Edit Mode' : 'Edit Navigation';
    }
    
    this.renderNavigation();
  };

  private handleThemeSettings = (): void => {
    this.setState({
      modalState: {
        isVisible: true,
        mode: 'theme'
      }
    });
  };

  private handleNavigationModalSave = (item: INavigationItem, parentId?: string): void => {
    const config = { ...this.state.navigationConfig };
    
    if (this.state.modalState.mode === 'edit') {
      this.configService.updateNavigationItem(config, item);
    } else {
      this.configService.addNavigationItem(config, item, parentId);
    }
    
    this.setState({ 
      navigationConfig: config,
      hasUnsavedChanges: true,
      modalState: { isVisible: false, mode: 'add' }
    });
    
    this.renderNavigation();
    
    if (config.autoSave) {
      this.saveConfiguration();
    }
  };

  private handleNavigationModalCancel = (): void => {
    this.setState({
      modalState: { isVisible: false, mode: 'add' }
    });
  };

  private handleThemeModalSave = (theme: IThemeConfig): void => {
    const config = { ...this.state.navigationConfig };
    config.theme = theme;
    
    this.setState({ 
      navigationConfig: config,
      hasUnsavedChanges: true,
      modalState: { isVisible: false, mode: 'add' }
    });
    
    this.applyTheme(theme);
    
    if (config.autoSave) {
      this.saveConfiguration();
    }
  };

  private handleThemeModalCancel = (): void => {
    this.setState({
      modalState: { isVisible: false, mode: 'add' }
    });
  };

  private handleThemeModalReset = (): void => {
    // Reset theme will be handled in the modal
  };

  private applyTheme(theme: IThemeConfig): void {
    const sidebar = document.querySelector(`.${styles.sidebar}`) as HTMLElement;
    if (sidebar) {
      sidebar.style.setProperty('--primary-color', theme.primaryColor);
      sidebar.style.setProperty('--secondary-color', theme.secondaryColor);
      sidebar.style.setProperty('--background-color', theme.backgroundColor);
      sidebar.style.setProperty('--text-color', theme.textColor);
      sidebar.style.setProperty('--hover-color', theme.hoverColor);
      sidebar.style.setProperty('--font-family', theme.fontFamily);
      sidebar.style.setProperty('--font-size', theme.fontSize);
      sidebar.style.setProperty('--border-radius', theme.borderRadius);
      sidebar.style.width = theme.sidebarWidth;
    }
  }

  private async saveConfiguration(): Promise<void> {
    try {
      const success = await this.configService.saveConfiguration(this.state.navigationConfig);
      if (success) {
        this.setState({ hasUnsavedChanges: false });
        console.log('MonarchSidebarNav: Configuration saved successfully');
      } else {
        console.error('MonarchSidebarNav: Failed to save configuration');
      }
    } catch (error) {
      console.error('MonarchSidebarNav: Error saving configuration:', error);
    }
  }

  private getParentOptions(): IDropdownOption[] {
    const options: IDropdownOption[] = [];
    
    const addOptions = (items: INavigationItem[], prefix = ''): void => {
      for (const item of items) {
        options.push({
          key: item.id,
          text: `${prefix}${item.title}`
        });
        
        if (item.children && item.children.length > 0) {
          addOptions(item.children, `${prefix}${item.title} > `);
        }
      }
    };
    
    addOptions(this.state.navigationConfig.navigation);
    return options;
  }

  private getSidebarWidth(): string {
    if (window.innerWidth <= 480) {
      return '80%';
    } else if (window.innerWidth <= 768) {
      return '50%';
    }
    return this.state.navigationConfig.theme.sidebarWidth || '300px';
  }

  private getContentWidth(): string {
    if (window.innerWidth <= 480) {
      return '20%';
    } else if (window.innerWidth <= 768) {
      return '50%';
    }
    const sidebarWidth = parseInt(this.state.navigationConfig.theme.sidebarWidth.replace('px', ''));
    return `calc(100% - ${sidebarWidth}px)`;
  }

  private updateToggleIcon(): void {
    const buttonContainer = document.getElementById('monarch-sidenav-button-container');
    if (buttonContainer) {
      const toggleButton = React.createElement(DefaultButton, {
        id: 'monarch-sidenav-toggle',
        'aria-label': 'Toggle Navigation',
        onClick: this.handleToggle,
        iconProps: { iconName: this.state.isOpen ? 'ChromeBack' : 'GlobalNavButton' },
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

      import(/* webpackChunkName: 'react-dom' */ 'react-dom').then((ReactDOM) => {
        ReactDOM.render(toggleButton, buttonContainer);
      }).catch((error) => {
        console.error('Failed to load ReactDOM:', error);
      });
    }
  }

  private applyToggleState(isOpen: boolean): void {
    const buttonContainer = document.getElementById('monarch-sidenav-button-container');
    const sidebarContainer = document.getElementById('monarch-sidenav-sidebar-container');
    const spPageChrome = document.getElementById('SPPageChrome');
    
    const sidebarWidth = this.getSidebarWidth();
    const contentWidth = this.getContentWidth();

    if (isOpen) {
      // Open sidebar
      if (sidebarContainer) {
        sidebarContainer.style.left = '0%';
      }
      
      // Push SPPageChrome to the right
      if (spPageChrome) {
        spPageChrome.style.marginLeft = sidebarWidth;
        spPageChrome.style.width = contentWidth;
        spPageChrome.style.transition = 'margin-left 0.3s ease, width 0.3s ease';
      }
      
      // Move toggle button with the sidebar
      if (buttonContainer) {
        buttonContainer.style.left = sidebarWidth;
      }
    } else {
      // Close sidebar
      if (sidebarContainer) {
        sidebarContainer.style.left = `-${sidebarWidth}`;
      }
      
      // Reset SPPageChrome position
      if (spPageChrome) {
        spPageChrome.style.marginLeft = '0px';
        spPageChrome.style.width = '100%';
        spPageChrome.style.transition = 'margin-left 0.3s ease, width 0.3s ease';
      }
      
      // Reset toggle button position
      if (buttonContainer) {
        buttonContainer.style.left = '0px';
      }
    }

    // Update icon and apply theme
    this.updateToggleIcon();
    this.applyTheme(this.state.navigationConfig.theme);
  }

  private handleToggle = (): void => {
    const newIsOpen = !this.state.isOpen;
    this.setState({ isOpen: newIsOpen }, () => {
      this.saveToggleState(newIsOpen);
      this.applyToggleState(newIsOpen);
    });
  };

  private cleanup(): void {
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }

    // Remove event listeners and elements
    const elements = [
      'monarch-sidenav-toggle',
      'monarch-sidebar-close',
      'monarch-sidebar-settings',
      'monarch-sidebar-edit',
      'navigation-search-input'
    ];
    
    elements.forEach(id => {
      const element = document.getElementById(id);
      if (element) {
        element.removeEventListener('click', this.handleToggle);
        element.removeEventListener('click', this.handleThemeSettings);
        element.removeEventListener('click', this.handleEditMode);
        element.removeEventListener('input', this.handleSearchInput);
      }
    });

    const buttonContainer = document.getElementById('monarch-sidenav-button-container');
    const sidebarContainer = document.getElementById('monarch-sidenav-sidebar-container');
    
    if (buttonContainer) buttonContainer.remove();
    if (sidebarContainer) sidebarContainer.remove();
    
    // Reset SPPageChrome styles
    const spPageChrome = document.getElementById('SPPageChrome');
    if (spPageChrome) {
      spPageChrome.style.marginLeft = '';
      spPageChrome.style.width = '';
    }

    this.clearToggleState();
  }

  private saveToggleState(isOpen: boolean): void {
    try {
      const expiryTime = new Date().getTime() + (this.CACHE_EXPIRY_HOURS * 60 * 60 * 1000);
      const cacheData = {
        value: isOpen,
        expiry: expiryTime,
        timestamp: new Date().toISOString()
      };
      localStorage.setItem(this.CACHE_KEY, JSON.stringify(cacheData));
    } catch (error) {
      console.warn('MonarchSidebarNav: Failed to save toggle state to cache:', error);
    }
  }

  private loadToggleState(): boolean {
    try {
      const cachedData = localStorage.getItem(this.CACHE_KEY);
      if (!cachedData) {
        return false;
      }

      const parsedData = JSON.parse(cachedData);
      const currentTime = new Date().getTime();

      if (currentTime > parsedData.expiry) {
        localStorage.removeItem(this.CACHE_KEY);
        console.log('MonarchSidebarNav: Cache expired (after 1 year), using default state');
        return false;
      }

      console.log('MonarchSidebarNav: Loaded cached state:', parsedData.value);
      return parsedData.value;
    } catch (error) {
      console.warn('MonarchSidebarNav: Failed to load toggle state from cache:', error);
      return false;
    }
  }

  private clearToggleState(): void {
    try {
      localStorage.removeItem(this.CACHE_KEY);
      console.log('MonarchSidebarNav: Cache cleared');
    } catch (error) {
      console.warn('MonarchSidebarNav: Failed to clear toggle state cache:', error);
    }
  }

  private ensureContentAdjustment(isOpen: boolean): void {
    const spPageChrome = document.getElementById('SPPageChrome');
    const buttonContainer = document.getElementById('monarch-sidenav-button-container');
    
    if (!spPageChrome) {
      console.warn('MonarchSidebarNav: SPPageChrome not found, retrying...');
      setTimeout(() => {
        this.ensureContentAdjustment(isOpen);
      }, 500);
      return;
    }

    const sidebarWidth = this.getSidebarWidth();
    const contentWidth = this.getContentWidth();

    if (isOpen) {
      console.log('MonarchSidebarNav: Adjusting content for open state', { sidebarWidth, contentWidth });
      spPageChrome.style.marginLeft = sidebarWidth;
      spPageChrome.style.width = contentWidth;
      spPageChrome.style.transition = 'margin-left 0.3s ease, width 0.3s ease';
      
      if (buttonContainer) {
        buttonContainer.style.left = sidebarWidth;
      }
    } else {
      console.log('MonarchSidebarNav: Resetting content for closed state');
      spPageChrome.style.marginLeft = '0px';
      spPageChrome.style.width = '100%';
      spPageChrome.style.transition = 'margin-left 0.3s ease, width 0.3s ease';
      
      if (buttonContainer) {
        buttonContainer.style.left = '0px';
      }
    }
  }

  private makeToggleButtonDraggable(): void {
    const buttonContainer = document.getElementById('monarch-sidenav-button-container');
    if (!buttonContainer) return;

    let isDragging = false;
    let startY = 0;
    let startTop = 0;

    // Restore position from localStorage
    const savedTop = localStorage.getItem('monarch-sidenav-toggle-top');
    if (savedTop) {
      buttonContainer.style.top = savedTop;
    }

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      startY = e.clientY;
      startTop = parseInt(buttonContainer.style.top || '20', 10);
      document.body.style.userSelect = 'none';
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaY = e.clientY - startY;
      let newTop = startTop + deltaY;
      // Clamp to viewport
      newTop = Math.max(0, Math.min(window.innerHeight - 48, newTop));
      buttonContainer.style.top = `${newTop}px`;
    };

    const onMouseUp = () => {
      if (isDragging) {
        isDragging = false;
        localStorage.setItem('monarch-sidenav-toggle-top', buttonContainer.style.top);
        document.body.style.userSelect = '';
      }
    };

    buttonContainer.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  }

  private initializeIsExpanded(items: INavigationItem[]): void {
    for (const item of items) {
      if (item.children && item.children.length > 0) {
        if (typeof item.isExpanded !== 'boolean') {
          item.isExpanded = false;
        }
        this.initializeIsExpanded(item.children);
      }
    }
  }

  public render(): React.ReactElement<INavigationProps> {
    const { modalState, navigationConfig } = this.state;
    
    return (
      <div style={{ display: 'none' }}>
        <NavigationConfigModal
          isVisible={modalState.isVisible && (modalState.mode === 'add' || modalState.mode === 'edit')}
          mode={modalState.mode as 'add' | 'edit'}
          item={modalState.editingItem}
          parentOptions={this.getParentOptions()}
          onSave={this.handleNavigationModalSave}
          onCancel={this.handleNavigationModalCancel}
        />
        
        <ThemeConfigModal
          isVisible={modalState.isVisible && modalState.mode === 'theme'}
          theme={navigationConfig.theme}
          onSave={this.handleThemeModalSave}
          onCancel={this.handleThemeModalCancel}
          onReset={this.handleThemeModalReset}
        />
      </div>
    );
  }
}

// Legacy interface exports for compatibility
export interface IMonarchSidenavSearchTogglerProps extends INavigationProps {}
export interface ISearchResult {
  Title: string;
  Path: string;
  FileType: string;
  LastModifiedTime: string;
  Author: string;
  HitHighlightedSummary: string;
}
