import * as React from 'react';
import { ApplicationCustomizerContext } from '@microsoft/sp-application-base';
import { SidebarNavigation } from './components/SidebarNavigation';
import { SidebarToggleButton } from './components/SidebarToggleButton';
import { NavigationConfigModal } from './components/NavigationConfigModal';
import styles from './MonarchSidenavSearchToggler.module.scss';
import { IDropdownOption } from '@fluentui/react/lib/Dropdown';
import { Icon } from '@fluentui/react/lib/Icon';
import { ConfigurationService, SidebarConfig } from './services/ConfigurationService';

// Extend NavItem to include 'order' and require 'url'
export interface NavItem {
  id: string;
  title: string;
  url: string;
  order: number;
  children?: NavItem[];
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
    const configService = new ConfigurationService(context);
    return configService.getTogglerPosition();
  });
  const [modalState, setModalState] = React.useState<{
    isVisible: boolean;
    mode: 'add' | 'edit';
    editingItem?: NavItem;
    parentId?: string;
  }>({ isVisible: false, mode: 'add' });
  const [sidebarWidth, setSidebarWidth] = React.useState(300);
  const [isPinned, setIsPinned] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);

  const sidebarHiddenLeft = -1 * (sidebarWidth + 20);

  // Create ConfigurationService instance
  const configService = React.useMemo((): ConfigurationService => new ConfigurationService(context), [context]);

  const loadConfiguration = async (): Promise<void> => {
    try {
      setIsLoading(true);
      const config = await configService.loadConfiguration();
      setNav(config.items);
      setIsOpen(config.sidebar.isOpen);
      setIsPinned(config.sidebar.isPinned);
      setSidebarWidth(config.sidebar.width);
      // Do NOT set toggleTop from config.sidebar.togglePosition
    } catch (error) {
      console.error('Failed to load configuration:', error);
      // Use default values if loading fails
      setNav([
        {
          id: 'documents',
          title: 'Documents',
          url: '/documents',
          order: 1,
          children: [
            { id: 'policies', title: 'Policies', url: '/documents/policies', order: 1 },
            { id: 'procedures', title: 'Procedures', url: '/documents/procedures', order: 2 }
          ]
        },
        { id: 'resources', title: 'Resources', url: '/resources', order: 2 }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Load configuration on component mount
  React.useEffect((): void => {
    loadConfiguration().catch(error => {
      console.error('Failed to load configuration:', error);
    });
  }, []);

  const saveConfiguration = async (): Promise<void> => {
    try {
      console.log('🔄 saveConfiguration called with current state:', {
        nav,
        sidebarWidth,
        isPinned,
        isOpen
      });
      const config: Partial<SidebarConfig> = {
        items: nav,
        sidebar: {
          width: sidebarWidth,
          isPinned,
          isOpen,
          togglePosition: { top: configService.getTogglerPosition() }
        }
      };
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

  // Push effect for pinned sidebar
  React.useEffect((): (() => void) => {
    const spPageChrome = document.getElementById('SPPageChrome');
    if (spPageChrome) {
      if (isOpen && isPinned) {
        spPageChrome.style.marginLeft = `${sidebarWidth}px`;
        spPageChrome.style.width = `calc(100% - ${sidebarWidth}px)`;
        spPageChrome.style.transition = 'margin-left 0.3s, width 0.3s';
      } else {
        spPageChrome.style.marginLeft = '0px';
        spPageChrome.style.width = '100%';
        spPageChrome.style.transition = 'margin-left 0.3s, width 0.3s';
      }
    }
    return (): void => {
      if (spPageChrome) {
        spPageChrome.style.marginLeft = '';
        spPageChrome.style.width = '';
        spPageChrome.style.transition = '';
      }
    };
  }, [isOpen, isPinned, sidebarWidth]);

  // Utility to find an item by id
  const findItemById = (items: NavItem[], id: string): NavItem | undefined => {
    for (const item of items) {
      if (item.id === id) return item;
      if (item.children) {
        const found = findItemById(item.children, id);
        if (found) return found;
      }
    }
    return undefined;
  };

  // Utility to get parent options for modal
  const getParentOptions = (): IDropdownOption[] => {
    const options: IDropdownOption[] = [];
    const addOptions = (items: NavItem[], prefix = ''): void => {
      for (const item of items) {
        options.push({ key: item.id, text: prefix + item.title });
        if (item.children) addOptions(item.children, prefix + item.title + ' > ');
      }
    };
    addOptions(nav);
    return options;
  };

  // Move saveConfigurationWithNav above all usages
  const saveConfigurationWithNav = async (navArray: NavItem[]): Promise<void> => {
    try {
      const config: Partial<SidebarConfig> = {
        items: navArray,
        sidebar: {
          width: sidebarWidth,
          isPinned,
          isOpen,
          togglePosition: { top: configService.getTogglerPosition() }
        }
      };
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
  const handleEdit = (id: string): void => {
    const item = findItemById(nav, id);
    if (item) setModalState({ isVisible: true, mode: 'edit', editingItem: item });
  };
  const handleDelete = (id: string): void => {
    setNav(prevNav => {
      const removeRecursive = (items: NavItem[]): NavItem[] =>
        items.filter(item => {
          if (item.id === id) return false;
          if (item.children) item.children = removeRecursive(item.children);
          return true;
        });
      const updatedNav = removeRecursive(prevNav);
      // Auto-save with the latest nav array
      saveConfigurationWithNav(updatedNav).catch(error => {
        console.error('Failed to save configuration:', error);
      });
      return updatedNav;
    });
  };
  const handleAddChild = (parentId: string): void => setModalState({ isVisible: true, mode: 'add', parentId });
  const handleAddRoot = (): void => setModalState({ isVisible: true, mode: 'add' });

  // Modal save/cancel
  const handleModalSave = (item: NavItem, parentId?: string): void => {
    if (!item.order) item.order = 1;
    if (!item.url) item.url = '';
    setNav(prevNav => {
      let updatedNav: NavItem[];
      if (modalState.mode === 'edit' && item.id) {
        const updateRecursive = (items: NavItem[]): NavItem[] =>
          items.map(it =>
            it.id === item.id
              ? { ...item, children: it.children, url: item.url || '' }
              : { ...it, children: it.children ? updateRecursive(it.children) : undefined }
          );
        updatedNav = updateRecursive(prevNav);
      } else {
        const newItem = { ...item, children: [], order: item.order || 1, url: item.url || '' };
        if (parentId) {
          const addChildRecursive = (items: NavItem[]): NavItem[] =>
            items.map(it =>
              it.id === parentId
                ? { ...it, children: [...(it.children || []), { ...newItem, order: (it.children?.length || 0) + 1 }] }
                : { ...it, children: it.children ? addChildRecursive(it.children) : undefined }
            );
          updatedNav = addChildRecursive(prevNav);
        } else {
          updatedNav = [...prevNav, { ...newItem, order: prevNav.length + 1 }];
        }
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

  // Show loading state
  if (isLoading) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: 'rgba(255, 255, 255, 0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2000
      }}>
        <div style={{ textAlign: 'center' }}>
          <Icon iconName="Sync" style={{ fontSize: '24px', animation: 'spin 1s linear infinite' }} />
          <div style={{ marginTop: '8px', fontSize: '14px', color: '#666' }}>Loading navigation...</div>
        </div>
      </div>
    );
  }

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
          configService.setTogglerPosition(newTop); // Store in localStorage only
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
          background: '#fff',
          boxShadow: '2px 0 8px rgba(0,0,0,0.1)',
          transition: 'left 0.3s'
        }}
      >
        <div className={styles.sidebar}>
          <div className={styles.sidebarHeader}>
            <h2 className={styles.sidebarTitle}>Navigation</h2>
            <div className={styles.headerButtons}>
              <button
                className={styles.headerButton}
                aria-label={isPinned ? 'Unpin sidebar' : 'Pin sidebar'}
                title={isPinned ? 'Unpin sidebar' : 'Pin sidebar'}
                onClick={() => {
                  setIsPinned(pin => {
                    const newPinned = !pin;
                    // Auto-save pin state
                    setTimeout(() => {
                      saveConfiguration().catch(error => {
                        console.error('Failed to save configuration:', error);
                      });
                    }, 100);
                    return newPinned;
                  });
                }}
                style={{ marginRight: 8 }}
              >
                <Icon iconName={isPinned ? 'Unpin' : 'Pin'} />
              </button>
              {isConfig && (
                <button className={styles.addButton} style={{marginRight: 8}} onClick={handleAddRoot}>
                  <Icon iconName="Add" />
                </button>
              )}
              <button className={styles.headerButton} aria-label="Edit Mode" title="Edit Navigation" onClick={() => setIsConfig(c => !c)}>
                <Icon iconName="Edit" />
              </button>
            </div>
          </div>
          <div className={styles.searchContainer}>
            <input
              type="text"
              placeholder="Search navigation..."
              className={styles.searchInput}
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className={styles.navigationContent}>
            <SidebarNavigation
              items={nav}
              isConfigMode={isConfig}
              searchQuery={search}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onAddChild={handleAddChild}
              onAddRoot={handleAddRoot}
            />
          </div>
        </div>
      </div>
      {modalState.isVisible && (
        <NavigationConfigModal
          isVisible={modalState.isVisible}
          mode={modalState.mode}
          item={modalState.editingItem}
          parentOptions={getParentOptions()}
          onSave={handleModalSave}
          onCancel={handleModalCancel}
        />
      )}
    </>
  );
}
