import * as React from 'react';
import { ApplicationCustomizerContext } from '@microsoft/sp-application-base';
import { SidebarNavigation } from './components/SidebarNavigation';
import { SidebarToggleButton } from './components/SidebarToggleButton';
import { NavigationConfigModal } from './components/NavigationConfigModal';
import { ThemeSettingsModal } from './components/ThemeSettingsModal';
import styles from './MonarchSidenavSearchToggler.module.scss';
import { IDropdownOption } from '@fluentui/react/lib/Dropdown';
import { Icon } from '@fluentui/react/lib/Icon';
import { NavigationConfigService } from './services/NavigationConfigService';
import { DefaultTheme, IThemeConfig } from './interfaces/INavigationInterfaces';

// Extend NavItem to include 'order' and require 'url'
export interface NavItem {
  id: number;
  title: string;
  target?: '_blank' | '_self'; // Optional target for links
  url: string;
  order: number;
  parentId: number; // 0 for root items, number for child items
}

interface MonarchSidenavSearchTogglerProps {
  description?: string;
  context: ApplicationCustomizerContext;
}

export default function MonarchSidenavSearchToggler({ context }: MonarchSidenavSearchTogglerProps): React.ReactElement<MonarchSidenavSearchTogglerProps> {
  const [nav, setNav] = React.useState<NavItem[]>([]);
  const [search, setSearch] = React.useState('');
  const [isConfig, setIsConfig] = React.useState(false);
  const [isOpen, setIsOpen] = React.useState(true);
  const [toggleTop, setToggleTop] = React.useState<number>(() => {
    const configService = new NavigationConfigService(context);
    return parseInt(configService.getTogglerPosition() || '100', 10);
  });
  const [modalState, setModalState] = React.useState<{
    isVisible: boolean;
    mode: 'add' | 'edit';
    editingItem?: NavItem;
    parentId?: number;
    parentTitle?: string;
  }>({ isVisible: false, mode: 'add' });
  const [themeModalVisible, setThemeModalVisible] = React.useState(false);
  const [currentTheme, setCurrentTheme] = React.useState(DefaultTheme);
  const [sidebarWidth, setSidebarWidth] = React.useState(300);
  const [isPinned, setIsPinned] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);

  const sidebarHiddenLeft = -1 * (sidebarWidth + 20);

  // Create NavigationConfigService instance
  const configService = React.useMemo((): NavigationConfigService => new NavigationConfigService(context), [context]);

  // Update loadConfiguration to only set isLoading(false) after config is loaded or default is set
  const loadConfiguration = async (retryCount = 0): Promise<void> => {
    try {
      setIsLoading(true);
      console.log(`🔄 Loading configuration (attempt ${retryCount + 1})...`);
      
      const config = await configService.loadConfiguration();
      console.log('MonarchSideNavSearchToggler: Loaded config:', config);
      
      // Set navigation items
      setNav(config.items);
      // Set sidebar configuration from config
      if (config.sidebar) {
        const newIsOpen = config.sidebar.isOpen ?? true;
        const newIsPinned = config.sidebar.isPinned ?? false;
        setIsOpen(newIsOpen);
        setIsPinned(newIsPinned);
        console.log('MonarchSideNavSearchToggler: Set sidebar state - isOpen:', newIsOpen, 'isPinned:', newIsPinned);
      } else {
        // Set default values if no sidebar config
        setIsOpen(true);
        setIsPinned(false);
        console.log('MonarchSideNavSearchToggler: Using default sidebar state - isOpen: true, isPinned: false');
      }
      // Set theme configuration
      if (config.theme) {
        setCurrentTheme(config.theme);
        // Set sidebar width from theme
        if (config.theme.sidebarWidth) {
          const width = parseInt(config.theme.sidebarWidth.replace('px', ''), 10);
          if (!isNaN(width)) {
            setSidebarWidth(width);
            console.log('MonarchSideNavSearchToggler: Set sidebar width:', width);
          }
        }
      }
      console.log('✅ Configuration loaded successfully');
      setIsLoading(false);
    } catch (error) {
      console.error('MonarchSideNavSearchToggler: Failed to load configuration:', error);
      // Retry logic for hard reloads (up to 2 retries)
      if (retryCount < 2) {
        console.log(`🔄 Retrying configuration load in 1 second... (attempt ${retryCount + 2})`);
        setTimeout(() => {
          loadConfiguration(retryCount + 1).catch(retryError => {
            console.error('MonarchSideNavSearchToggler: Retry failed:', retryError);
            setDefaultConfiguration();
          });
        }, 1000);
        return;
      }
      // Use default values if all retries fail
      setDefaultConfiguration();
    }
  };

  // Helper function to set default configuration
  const setDefaultConfiguration = (): void => {
    console.log('🔄 Setting default configuration...');
    setNav([
      {
        "id": 1,
        "title": "Home",
        "url": "/",
        "target": "_self",
        "order": 1,
        "parentId": 0
      },
      {
        "id": 2,
        "title": "Documents",
        "url": "/documents",
        "target": "_self",
        "order": 2,
        "parentId": 0
      },
      {
        "id": 5,
        "title": "Policies",
        "url": "/documents/policies",
        "target": "_self",
        "order": 1,
        "parentId": 2
      },
      {
        "id": 6,
        "title": "Procedures",
        "url": "/documents/procedures",
        "target": "_self",
        "order": 2,
        "parentId": 2
      }
    ]);
    setIsOpen(true);
    setIsPinned(false);
    setSidebarWidth(300);
    setIsLoading(false);
    console.log('✅ Default configuration set');
  };

  // Load configuration on component mount
  React.useEffect((): (() => void) => {
    // Small delay to ensure SharePoint is fully loaded
    const timeoutId = setTimeout(() => {
      loadConfiguration().catch(error => {
        console.error('Failed to load configuration:', error);
      });
    }, 500);
    
    return (): void => clearTimeout(timeoutId);
  }, []);

  const saveConfiguration = async (): Promise<void> => {
    try {
      console.log('🔄 saveConfiguration called with current nav:', nav);
      const config = await configService.loadConfiguration();
      config.items = nav;
      
      // Update sidebar configuration
      config.sidebar = {
        isOpen,
        isPinned,
        position: 'left' // We only support left position for now
      };
      
      // Update theme configuration
      config.theme = currentTheme;
      
      console.log('🔄 Saving config with sidebar state:', config.sidebar);
      const success = await configService.saveConfiguration(config);
      if (success) {
        console.log('✅ Configuration saved successfully');
      } else {
        console.error('❌ Configuration save returned false');
      }
    } catch (error) {
      console.error('❌ Failed to save configuration:', error);
    }
  };

  // Save configuration with specific pin state (to avoid closure issues)
  const saveConfigurationWithPinState = async (pinState: boolean): Promise<void> => {
    try {
      console.log('🔄 saveConfigurationWithPinState called with pin state:', pinState);
      const config = await configService.loadConfiguration();
      config.items = nav;
      
      // Update sidebar configuration with the provided pin state
      config.sidebar = {
        isOpen,
        isPinned: pinState, // Use the provided pin state instead of state variable
        position: 'left' // We only support left position for now
      };
      
      // Update theme configuration
      config.theme = currentTheme;
      
      console.log('🔄 Saving config with sidebar state:', config.sidebar);
      const success = await configService.saveConfiguration(config);
      if (success) {
        console.log('✅ Configuration saved successfully with pin state:', pinState);
      } else {
        console.error('❌ Configuration save returned false');
      }
    } catch (error) {
      console.error('❌ Failed to save configuration:', error);
    }
  };

  // Push effect for pinned sidebar with persistent styling
  React.useEffect((): (() => void) => {
    let mutationObserver: MutationObserver | null = null;
    let styleElement: HTMLStyleElement | null = null;
    
    const applyPersistentStyles = (): void => {
      const spPageChrome = document.getElementById('SPPageChrome');
      if (!spPageChrome) {
        console.warn('⚠️ SPPageChrome element not found');
        return;
      }

      console.log('🔄 Applying sidebar state:', { isOpen, isPinned, sidebarWidth });
      
      // Remove existing style element
      if (styleElement) {
        styleElement.remove();
      }
      
      // Create new style element with !important rules
      styleElement = document.createElement('style');
      styleElement.id = 'monarch-sidebar-styles';
      
      if (isOpen && isPinned) {
        styleElement.textContent = `
          #SPPageChrome {
            margin-left: ${sidebarWidth}px !important;
            width: calc(100% - ${sidebarWidth}px) !important;
            transition: margin-left 0.3s, width 0.3s !important;
          }
        `;
        console.log('✅ Sidebar pinned - content adjusted with persistent styles');
      } else {
        styleElement.textContent = `
          #SPPageChrome {
            margin-left: 0px !important;
            width: 100% !important;
            transition: margin-left 0.3s, width 0.3s !important;
          }
        `;
        console.log('✅ Sidebar unpinned - content reset with persistent styles');
      }
      
      document.head.appendChild(styleElement);
    };
    
    // Apply styles immediately
    const timeoutId = setTimeout(applyPersistentStyles, 50);
    
    // Set up MutationObserver to watch for SharePoint style changes
    const targetNode = document.getElementById('SPPageChrome');
    if (targetNode) {
      mutationObserver = new MutationObserver((mutations) => {
        let shouldReapply = false;
        
        mutations.forEach((mutation) => {
          if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
            // Check if SharePoint changed our styles
            const currentStyle = (mutation.target as HTMLElement).style;
            if (isOpen && isPinned) {
              if (currentStyle.marginLeft !== `${sidebarWidth}px` || 
                  currentStyle.width !== `calc(100% - ${sidebarWidth}px)`) {
                shouldReapply = true;
              }
            } else {
              if (currentStyle.marginLeft !== '0px' || currentStyle.width !== '100%') {
                shouldReapply = true;
              }
            }
          }
        });
        
        if (shouldReapply) {
          console.log('🔄 SharePoint modified styles, reapplying...');
          setTimeout(applyPersistentStyles, 10);
        }
      });
      
      mutationObserver.observe(targetNode, {
        attributes: true,
        attributeFilter: ['style']
      });
    }
    
    return (): void => {
      clearTimeout(timeoutId);
      if (mutationObserver) {
        mutationObserver.disconnect();
      }
      if (styleElement) {
        styleElement.remove();
      }
      console.log('🧹 Cleanup: SPPageChrome styles and observers removed');
    };
  }, [isOpen, isPinned, sidebarWidth]);

  // Utility to find an item by id
  const findItemById = (items: NavItem[], id: number): NavItem | undefined => {
    return items.find(item => item.id === id);
  };

  // Utility to get parent options for modal
  const getParentOptions = (): IDropdownOption[] => {
    const options: IDropdownOption[] = [];
    // Only show root items (parentId = 0) as potential parents
    const rootItems = nav.filter(item => item.parentId === 0);
    for (const item of rootItems) {
      options.push({ key: item.id, text: item.title });
    }
    return options;
  };

  // Move saveConfigurationWithNav above all usages
  const saveConfigurationWithNav = async (navArray: NavItem[]): Promise<void> => {
    try {
      const config = await configService.loadConfiguration();
      config.items = navArray;
      
      // Update sidebar configuration
      config.sidebar = {
        isOpen,
        isPinned,
        position: 'left' // We only support left position for now
      };
      
      // Update theme configuration
      config.theme = currentTheme;
      
      const success = await configService.saveConfiguration(config);
      if (success) {
        console.log('✅ Configuration saved successfully');
      } else {
        console.error('❌ Configuration save returned false');
      }
    } catch (error) {
      console.error('❌ Failed to save configuration:', error);
    }
  };

  // Handlers for config mode
  const handleEdit = (id: number): void => {
    const item = findItemById(nav, id);
    if (item) setModalState({ isVisible: true, mode: 'edit', editingItem: item });
  };
  const handleDelete = (id: number): void => {
    const itemToDelete = findItemById(nav, id);
    if (!itemToDelete) return;

    const itemTitle = itemToDelete.title;
    const hasChildren = nav.some(item => item.parentId === id);
    
    let confirmMessage = `Are you sure you want to delete "${itemTitle}"?`;
    if (hasChildren) {
      confirmMessage += `\n\nThis will also delete all child items.`;
    }

    if (window.confirm(confirmMessage)) {
      setNav(prevNav => {
        // Remove item and its children from flat array
        const updatedNav = prevNav.filter(item => item.id !== id && item.parentId !== id);
        // Auto-save with the latest nav array
        saveConfigurationWithNav(updatedNav).catch(error => {
          console.error('Failed to save configuration:', error);
        });
        return updatedNav;
      });
    }
  };
  const handleAddChild = (parentId: number): void => {
    const parentItem = findItemById(nav, parentId);
    setModalState({ 
      isVisible: true, 
      mode: 'add', 
      parentId,
      parentTitle: parentItem?.title 
    });
  };
  const handleAddRoot = (): void => setModalState({ isVisible: true, mode: 'add' });

  // Modal save/cancel
  const handleModalSave = (item: NavItem, parentId?: number): void => {
    if (!item.order) item.order = 1;
    if (!item.url) item.url = '';
    setNav(prevNav => {
      let updatedNav: NavItem[];
      if (modalState.mode === 'edit' && item.id) {
        // monarchNav pattern: replace the entire item by id in flat array
        const itemIndex = prevNav.findIndex(it => it.id === item.id);
        if (itemIndex !== -1) {
          updatedNav = [...prevNav];
          updatedNav[itemIndex] = { ...item };
        } else {
          updatedNav = prevNav;
        }
      } else {
        // Add new item to flat array
        const newItem = { ...item, order: item.order || 1, url: item.url || '', parentId: parentId || 0 };
        if (!newItem.id) {
          // Generate new ID
          const maxId = prevNav.length > 0 ? Math.max(...prevNav.map(it => it.id)) : 0;
          newItem.id = maxId + 1;
        }
        updatedNav = [...prevNav, newItem];
      }
      setModalState({ ...modalState, isVisible: false });
      // Auto-save with the latest nav array
      saveConfigurationWithNav(updatedNav).catch(error => {
        console.error('Failed to save configuration:', error);
      });
      return updatedNav;
    });
  };
  const handleModalCancel = (): void => setModalState({ ...modalState, isVisible: false });

  // Theme handlers
  const handleThemeSave = (theme: IThemeConfig): void => {
    setCurrentTheme(theme);
    setThemeModalVisible(false);
    // Save theme to configuration
    saveConfiguration().catch(error => {
      console.error('Failed to save theme configuration:', error);
    });
  };

  const handleThemeChange = (theme: IThemeConfig): void => {
    // Reactive updates without saving
    setCurrentTheme(theme);
  };

  const handleThemeReset = (): void => {
    setCurrentTheme(DefaultTheme);
  };

  // Show loading state inside sidebar
  const renderLoadingContent = (): JSX.Element => (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      padding: '40px 20px',
      color: currentTheme.textColor
    }}>
      <Icon iconName="Sync" style={{ 
        fontSize: '32px', 
        animation: 'spin 1s linear infinite',
        color: currentTheme.textColor,
        marginBottom: '16px'
      }} />
      <div style={{ 
        fontSize: '14px', 
        color: currentTheme.textColor,
        textAlign: 'center',
        lineHeight: '1.4'
      }}>
        Loading navigation...
      </div>
    </div>
  );

  return (
    <>
      <SidebarToggleButton
        isOpen={isOpen}
        top={toggleTop}
        onToggle={() => {
          setIsOpen(open => {
            const newOpen = !open;
            setTimeout(() => {
              saveConfiguration().catch(error => {
                console.error('Failed to save configuration:', error);
              });
            }, 100);
            return newOpen;
          });
        }}
        onDrag={(newTop) => {
          setToggleTop(newTop);
          configService.setTogglerPosition(String(newTop)); // Store in localStorage only
        }}
        sidebarWidth={sidebarWidth}
      />
      <div
        className={styles.sidebarContainer}
        style={{
          left: isOpen ? 0 : sidebarHiddenLeft,
          position: 'fixed',
          top: 0,
          height: '100vh',
          zIndex: 2000,
          width: sidebarWidth,
          background: currentTheme.backgroundColor,
          boxShadow: '2px 0 8px rgba(0,0,0,0.1)',
          transition: 'left 0.3s'
        }}
      >
        <div className={styles.sidebar}>
          <div className={styles.sidebarHeader}>
            {(currentTheme.logoUrl || currentTheme.siteName) && (
              <a 
                href={currentTheme.siteUrl || '#'} 
                target="_blank" 
                rel="noopener noreferrer"
                className={styles.siteLink}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px',
                  textDecoration: 'none',
                  color: currentTheme.textColor
                }}
              >
                {currentTheme.logoUrl && (
                  <img 
                    src={currentTheme.logoUrl} 
                    alt="Site logo" 
                    style={{ 
                      width: currentTheme.logoSize || '40px',
                      height: 'auto',
                      maxHeight: '40px'
                    }} 
                  />
                )}
                {currentTheme.siteName && (
                  <span className={styles.siteName}>
                    {currentTheme.siteName}
                  </span>
                )}
              </a>
            )}
          </div>
          <div className={styles.searchContainer}>
            <Icon iconName="Search" className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search navigation..."
              className={styles.searchInput}
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className={styles.navigationContent}>
            {isLoading ? (
              renderLoadingContent()
            ) : (
              <SidebarNavigation
                items={nav}
                isConfigMode={isConfig}
                searchQuery={search}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onAddChild={handleAddChild}
                onAddRoot={handleAddRoot}
                theme={currentTheme}
              />
            )}
          </div>
          <div className={styles.sidebarFooter}>
            <h2 className={styles.sidebarTitle}>Navigation</h2>
            <div className={styles.headerButtons}>
              <button
                className={styles.headerButton}
                aria-label={isPinned ? 'Unpin sidebar' : 'Pin sidebar'}
                title={isPinned ? 'Unpin sidebar' : 'Pin sidebar'}
                onClick={async () => {
                  const newPinned = !isPinned;
                  setIsPinned(newPinned);
                  // Save configuration immediately with the new pin state
                  try {
                    await saveConfigurationWithPinState(newPinned);
                    console.log('✅ Pin state saved successfully:', newPinned);
                  } catch (error) {
                    console.error('❌ Failed to save pin state:', error);
                    // Revert state if save failed
                    setIsPinned(!newPinned);
                  }
                }}
                style={{ marginRight: 8 }}
              >
                <Icon iconName={isPinned ? 'Unpin' : 'Pin'} />
              </button>
              {isConfig && (
                <>
                  <button className={styles.addButton} style={{marginRight: 8}} onClick={handleAddRoot}>
                    <Icon iconName="Add" />
                  </button>
                  <button className={styles.headerButton} aria-label="Theme Settings" title="Theme Settings" onClick={() => setThemeModalVisible(true)} style={{marginRight: 8}}>
                    <Icon iconName="Settings" />
                  </button>
                </>
              )}
              <button className={styles.headerButton} aria-label="Edit Mode" title="Edit Navigation" onClick={() => setIsConfig(c => !c)}>
                <Icon iconName="Edit" />
              </button>
            </div>
          </div>
        </div>
      </div>
      {modalState.isVisible && (
        <NavigationConfigModal
          isVisible={modalState.isVisible}
          mode={modalState.mode}
          item={modalState.editingItem}
          parentId={modalState.parentId}
          parentTitle={modalState.parentTitle}
          parentOptions={getParentOptions()}
          onSave={handleModalSave}
          onCancel={handleModalCancel}
        />
      )}
      {themeModalVisible && (
        <ThemeSettingsModal
          isVisible={themeModalVisible}
          theme={currentTheme}
          onSave={handleThemeSave}
          onCancel={() => setThemeModalVisible(false)}
          onReset={handleThemeReset}
          onThemeChange={handleThemeChange}
        />
      )}
    </>
  );
}
