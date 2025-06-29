import * as React from 'react';
import { DefaultButton } from '@fluentui/react/lib/Button';
import styles from './MonarchSidenavSearchToggler.module.scss';

export interface IMonarchSidenavSearchTogglerProps {
  description: string;
}

export default class MonarchSidenavSearchToggler extends React.Component<IMonarchSidenavSearchTogglerProps, { isOpen: boolean }> {
  private readonly CACHE_KEY = 'monarch-sidenav-toggle-state';
  private readonly CACHE_EXPIRY_HOURS = 365 * 24; // Cache expires after 365 days (1 year)

  constructor(props: IMonarchSidenavSearchTogglerProps) {
    super(props);
    // Load cached state or default to false
    const cachedState = this.loadToggleState();
    this.state = { isOpen: cachedState };
  }

  public componentDidMount(): void {
    this.injectToggleButton();
    this.injectSidebar();
    
    // Apply cached state if sidebar should be open
    if (this.state.isOpen) {
      // Increased delay to ensure SPPageChrome is fully loaded
      setTimeout(() => {
        console.log('MonarchSideNav: Applying cached open state');
        this.applyToggleState(true);
        
        // Double-check SPPageChrome adjustment after another small delay
        setTimeout(() => {
          this.ensureContentAdjustment(true);
        }, 200);
      }, 300);
    }
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
          <h2 class="${styles.sidebarTitle}">Browse all articles</h2>
          <div class="${styles.headerButtons}">
            <button id="monarch-sidebar-settings" class="${styles.headerButton}" aria-label="Settings">
              <span style="font-size: 16px;">⚙</span>
            </button>
            <button id="monarch-sidebar-close" class="${styles.headerButton}" aria-label="Close">
              <span style="font-size: 16px;">&times;</span>
            </button>
          </div>
        </div>
        <div class="${styles.searchContainer}">
          <input type="text" placeholder="Search articles..." class="${styles.searchInput}" />
        </div>
        <nav class="${styles.navigation}">
          <ul class="${styles.navList}">
            <li class="${styles.navItem}">
              <a href="#" class="${styles.navLink}">Home</a>
            </li>
            <li class="${styles.navItem}">
              <div class="${styles.navCategory}">
                <span class="${styles.categoryTitle}">IT Support</span>
                <ul class="${styles.subNavList}">
                  <li class="${styles.subNavItem}">
                    <a href="#" class="${styles.subNavLink}">Printer Connection</a>
                  </li>
                  <li class="${styles.subNavItem}">
                    <a href="#" class="${styles.subNavLink}">Password Reset</a>
                  </li>
                  <li class="${styles.subNavItem}">
                    <a href="#" class="${styles.subNavLink}">VPN Access</a>
                  </li>
                  <li class="${styles.subNavItem}">
                    <a href="#" class="${styles.subNavLink}">MFA Setup</a>
                  </li>
                </ul>
              </div>
            </li>
            <li class="${styles.navItem}">
              <div class="${styles.navCategory}">
                <span class="${styles.categoryTitle}">Human Resources</span>
                <ul class="${styles.subNavList}">
                  <li class="${styles.subNavItem}">
                    <a href="#" class="${styles.subNavLink}">Expense Reimbursement</a>
                  </li>
                  <li class="${styles.subNavItem}">
                    <a href="#" class="${styles.subNavLink}">Time Off Requests</a>
                  </li>
                </ul>
              </div>
            </li>
          </ul>
        </nav>
      </div>
    `;

    document.body.appendChild(sidebarContainer);

    // Add close button event listener
    const closeButton = document.getElementById('monarch-sidebar-close');
    if (closeButton) {
      closeButton.addEventListener('click', this.handleToggle);
    }

    // Add settings button event listener
    const settingsButton = document.getElementById('monarch-sidebar-settings');
    if (settingsButton) {
      settingsButton.addEventListener('click', this.handleSettings);
    }
  }

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

  private updateToggleIcon(): void {
    const buttonContainer = document.getElementById('monarch-sidenav-button-container');
    if (buttonContainer) {
      // Re-render the button with updated icon
      const toggleButton = React.createElement(DefaultButton, {
        id: 'monarch-sidenav-toggle',
        'aria-label': 'Toggle Navigation',
        onClick: this.handleToggle,
        iconProps: { iconName: this.state.isOpen ? 'Pin' : 'Search' },
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

    // Update icon
    this.updateToggleIcon();
  }

  private handleToggle = (): void => {
    const newIsOpen = !this.state.isOpen;
    this.setState({ isOpen: newIsOpen }, () => {
      // Save state to cache
      this.saveToggleState(newIsOpen);
      // Apply the visual changes
      this.applyToggleState(newIsOpen);
    });
  };

  private handleSettings = (): void => {
    console.log('MonarchSideNav: Settings clicked');
    // You can add settings functionality here
    alert('Settings functionality can be added here!');
  };

  private cleanup(): void {
    // Remove event listeners
    const toggleButton = document.getElementById('monarch-sidenav-toggle');
    const closeButton = document.getElementById('monarch-sidebar-close');
    const settingsButton = document.getElementById('monarch-sidebar-settings');
    
    if (toggleButton) {
      toggleButton.removeEventListener('click', this.handleToggle);
    }
    
    if (closeButton) {
      closeButton.removeEventListener('click', this.handleToggle);
    }

    if (settingsButton) {
      settingsButton.removeEventListener('click', this.handleSettings);
    }

    // Remove injected elements
    const buttonContainer = document.getElementById('monarch-sidenav-button-container');
    const sidebarContainer = document.getElementById('monarch-sidenav-sidebar-container');
    
    if (buttonContainer) {
      buttonContainer.remove();
    }
    
    if (sidebarContainer) {
      sidebarContainer.remove();
    }
    
    // Reset SPPageChrome styles
    const spPageChrome = document.getElementById('SPPageChrome');
    if (spPageChrome) {
      spPageChrome.style.marginLeft = '';
      spPageChrome.style.width = '';
    }

    // Clear cached state
    this.clearToggleState();
  }

  /**
   * Saves the toggle state to browser localStorage with expiry
   * @param isOpen - The current toggle state
   */
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
      console.warn('MonarchSideNav: Failed to save toggle state to cache:', error);
    }
  }

  /**
   * Loads the toggle state from browser localStorage
   * @returns The cached toggle state or false if not found/expired
   */
  private loadToggleState(): boolean {
    try {
      const cachedData = localStorage.getItem(this.CACHE_KEY);
      if (!cachedData) {
        return false; // Default state
      }

      const parsedData = JSON.parse(cachedData);
      const currentTime = new Date().getTime();

      // Check if cache has expired
      if (currentTime > parsedData.expiry) {
        localStorage.removeItem(this.CACHE_KEY);
        console.log('MonarchSideNav: Cache expired (after 1 year), using default state');
        return false; // Default state for expired cache
      }

      console.log('MonarchSideNav: Loaded cached state:', parsedData.value);
      return parsedData.value;
    } catch (error) {
      console.warn('MonarchSideNav: Failed to load toggle state from cache:', error);
      return false; // Default state on error
    }
  }

  /**
   * Clears the cached toggle state from localStorage
   */
  private clearToggleState(): void {
    try {
      localStorage.removeItem(this.CACHE_KEY);
      console.log('MonarchSideNav: Cache cleared');
    } catch (error) {
      console.warn('MonarchSideNav: Failed to clear toggle state cache:', error);
    }
  }

  /**
   * Gets information about the current cache state
   * @returns Object with cache information or undefined if no cache exists
   */
  public getCacheInfo(): { value: boolean; expiry: Date; hoursRemaining: number } | undefined {
    try {
      const cachedData = localStorage.getItem(this.CACHE_KEY);
      if (!cachedData) {
        return undefined;
      }

      const parsedData = JSON.parse(cachedData);
      const currentTime = new Date().getTime();
      const hoursRemaining = Math.max(0, (parsedData.expiry - currentTime) / (1000 * 60 * 60));

      return {
        value: parsedData.value,
        expiry: new Date(parsedData.expiry),
        hoursRemaining: Math.round(hoursRemaining * 100) / 100
      };
    } catch (error) {
      console.warn('MonarchSideNav: Failed to get cache info:', error);
      return undefined;
    }
  }

  /**
   * Ensures the SharePoint content is properly adjusted
   * @param isOpen - Whether sidebar should be open
   */
  private ensureContentAdjustment(isOpen: boolean): void {
    const spPageChrome = document.getElementById('SPPageChrome');
    const buttonContainer = document.getElementById('monarch-sidenav-button-container');
    
    if (!spPageChrome) {
      console.warn('MonarchSideNav: SPPageChrome not found, retrying...');
      // Retry after another delay if SPPageChrome not found
      setTimeout(() => {
        this.ensureContentAdjustment(isOpen);
      }, 500);
      return;
    }

    const sidebarWidth = this.getSidebarWidth();
    const contentWidth = this.getContentWidth();

    if (isOpen) {
      console.log('MonarchSideNav: Adjusting content for open state', { sidebarWidth, contentWidth });
      spPageChrome.style.marginLeft = sidebarWidth;
      spPageChrome.style.width = contentWidth;
      spPageChrome.style.transition = 'margin-left 0.3s ease, width 0.3s ease';
      
      // Move button
      if (buttonContainer) {
        buttonContainer.style.left = sidebarWidth;
      }
    } else {
      console.log('MonarchSideNav: Resetting content for closed state');
      spPageChrome.style.marginLeft = '0px';
      spPageChrome.style.width = '100%';
      spPageChrome.style.transition = 'margin-left 0.3s ease, width 0.3s ease';
      
      // Reset button
      if (buttonContainer) {
        buttonContainer.style.left = '0px';
      }
    }
  }

  public render(): React.ReactElement<IMonarchSidenavSearchTogglerProps> {
    return <div style={{ display: 'none' }} />;
  }
}
