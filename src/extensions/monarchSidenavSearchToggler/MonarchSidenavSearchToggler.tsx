import * as React from 'react';
import { SidebarNavigation } from './components/SidebarNavigation';
import { SidebarToggleButton } from './components/SidebarToggleButton';
import { NavigationConfigModal } from './components/NavigationConfigModal';
import styles from './MonarchSidenavSearchToggler.module.scss';
import { IDropdownOption } from '@fluentui/react/lib/Dropdown';
import { Icon } from '@fluentui/react/lib/Icon';

// Extend NavItem to include 'order' and require 'url'
export interface NavItem {
  id: string;
  title: string;
  url: string;
  order: number;
  children?: NavItem[];
}

export default function MonarchSidenavSearchToggler() {
  const initialNav: NavItem[] = [
    {
      id: 'documents',
      title: 'Documents',
      url: '/documents', // Now a real link
      order: 1,
      children: [
        { id: 'policies', title: 'Policies', url: '/documents/policies', order: 1 },
        { id: 'procedures', title: 'Procedures', url: '/documents/procedures', order: 2 }
      ]
    },
    { id: 'resources', title: 'Resources', url: '/resources', order: 2 }
  ];

  const [nav, setNav] = React.useState<NavItem[]>(initialNav);
  const [search, setSearch] = React.useState('');
  const [isConfig, setIsConfig] = React.useState(false);
  const [isOpen, setIsOpen] = React.useState(true);
  const [toggleTop, setToggleTop] = React.useState(20);
  const [modalState, setModalState] = React.useState<{
    isVisible: boolean;
    mode: 'add' | 'edit';
    editingItem?: NavItem;
    parentId?: string;
  }>({ isVisible: false, mode: 'add' });

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
    const addOptions = (items: NavItem[], prefix = '') => {
      for (const item of items) {
        options.push({ key: item.id, text: prefix + item.title });
        if (item.children) addOptions(item.children, prefix + item.title + ' > ');
      }
    };
    addOptions(nav);
    return options;
  };

  // Handlers for config mode
  const handleEdit = (id: string) => {
    const item = findItemById(nav, id);
    if (item) setModalState({ isVisible: true, mode: 'edit', editingItem: item });
  };
  const handleDelete = (id: string) => {
    // Remove item by id
    const removeRecursive = (items: NavItem[]): NavItem[] =>
      items.filter(item => {
        if (item.id === id) return false;
        if (item.children) item.children = removeRecursive(item.children);
        return true;
      });
    setNav(removeRecursive(nav));
  };
  const handleAddChild = (parentId: string) => setModalState({ isVisible: true, mode: 'add', parentId });
  const handleAddRoot = () => setModalState({ isVisible: true, mode: 'add' });

  // Modal save/cancel
  const handleModalSave = (item: NavItem, parentId?: string) => {
    // Always ensure order and url are set
    if (!item.order) item.order = 1;
    if (!item.url) item.url = '';
    if (modalState.mode === 'edit' && item.id) {
      // Update existing item
      const updateRecursive = (items: NavItem[]): NavItem[] =>
        items.map(it =>
          it.id === item.id
            ? { ...item, children: it.children, url: item.url || '' }
            : { ...it, children: it.children ? updateRecursive(it.children) : undefined }
        );
      setNav(updateRecursive(nav));
    } else {
      // Add new item
      const newItem = { ...item, children: [], order: item.order || 1, url: item.url || '' };
      if (parentId) {
        const addChildRecursive = (items: NavItem[]): NavItem[] =>
          items.map(it =>
            it.id === parentId
              ? { ...it, children: [...(it.children || []), { ...newItem, order: (it.children?.length || 0) + 1 }] }
              : { ...it, children: it.children ? addChildRecursive(it.children) : undefined }
          );
        setNav(addChildRecursive(nav));
      } else {
        setNav([...nav, { ...newItem, order: nav.length + 1 }]);
      }
    }
    setModalState({ ...modalState, isVisible: false });
  };
  const handleModalCancel = () => setModalState({ ...modalState, isVisible: false });

  const sidebarWidth = 300;
  const sidebarHiddenLeft = -1 * (sidebarWidth + 20);

  return (
    <>
      <SidebarToggleButton
        isOpen={isOpen}
        top={toggleTop}
        onToggle={() => setIsOpen(open => !open)}
        onDrag={setToggleTop}
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
            <div className={styles.headerButtons}>
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
