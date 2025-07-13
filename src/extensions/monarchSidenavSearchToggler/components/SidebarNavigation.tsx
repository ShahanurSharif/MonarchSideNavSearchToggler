import * as React from 'react';
import { Icon } from '@fluentui/react/lib/Icon';
import styles from '../MonarchSidenavSearchToggler.module.scss';
import { IThemeConfig } from '../interfaces/INavigationInterfaces';

export interface NavItem {
  id: number;
  title: string;
  url: string;
  target?: '_blank' | '_self';
  order: number;
  parentId: number; // 0 for root items, number for child items
}

interface SidebarNavigationProps {
  items: NavItem[];
  isConfigMode: boolean;
  searchQuery: string;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  onAddChild: (id: number) => void;
  onAddRoot: () => void;
  theme: IThemeConfig;
}

export const SidebarNavigation: React.FC<SidebarNavigationProps> = ({
  items,
  isConfigMode,
  searchQuery,
  onEdit,
  onDelete,
  onAddChild,
  onAddRoot,
  theme
}) => {
  const [expanded, setExpanded] = React.useState<{ [id: number]: boolean }>({});

  // Get current URL for active state detection
  const currentUrl = typeof window !== 'undefined' ? window.location.pathname : '';

  // Helper function to check if an item is active
  const isItemActive = (itemUrl: string): boolean => {
    if (!itemUrl || !currentUrl) return false;
    
    // Normalize URLs for comparison
    const normalizedItemUrl = itemUrl.replace(/\/$/, ''); // Remove trailing slash
    const normalizedCurrentUrl = currentUrl.replace(/\/$/, ''); // Remove trailing slash
    
    // Exact match
    if (normalizedItemUrl === normalizedCurrentUrl) return true;
    
    // Handle SharePoint redirects and variations
    const itemUrlWithoutForms = normalizedItemUrl.replace(/\/Forms\/.*$/, ''); // Remove /Forms/AllItems.aspx
    const currentUrlWithoutForms = normalizedCurrentUrl.replace(/\/Forms\/.*$/, ''); // Remove /Forms/AllItems.aspx
    
    // Match without Forms suffix
    if (itemUrlWithoutForms === currentUrlWithoutForms) return true;
    
    // Check if current URL starts with item URL (for parent items)
    if (normalizedItemUrl !== '/' && normalizedCurrentUrl.startsWith(normalizedItemUrl)) return true;
    
    // Check if current URL starts with item URL without Forms (for parent items)
    if (itemUrlWithoutForms !== '/' && normalizedCurrentUrl.startsWith(itemUrlWithoutForms)) return true;
    
    return false;
  };

  // Helper function to get children of a parent item
  const getChildren = (parentId: number): NavItem[] => {
    return items
      .filter(item => item.parentId === parentId)
      .sort((a, b) => a.order - b.order);
  };

  // Helper function to get root items (parentId = 0)
  const getRootItems = (): NavItem[] => {
    return items
      .filter(item => item.parentId === 0)
      .sort((a, b) => a.order - b.order);
  };

  // Enhanced search logic that handles parent-child relationships
  const getSearchResults = React.useMemo((): { rootItems: NavItem[], childItems: { [parentId: number]: NavItem[] } } => {
    if (!searchQuery.trim()) {
      // No search: return normal hierarchy
      const rootItems = getRootItems();
      const childItems: { [parentId: number]: NavItem[] } = {};
      rootItems.forEach(item => {
        const children = getChildren(item.id);
        if (children.length > 0) {
          childItems[item.id] = children;
        }
      });
      return { rootItems, childItems };
    }

    // Search mode: find all matching items and their parents
    const q = searchQuery.toLowerCase();
    const matchingItems = items.filter(item => 
      item.title.toLowerCase().includes(q) || 
      (item.url?.toLowerCase().includes(q) ?? false)
    );

    // Get all parent IDs that have matching children
    const parentIdsWithMatchingChildren = new Set<number>();
    matchingItems.forEach(item => {
      if (item.parentId > 0) {
        parentIdsWithMatchingChildren.add(item.parentId);
      }
    });

    // Get root items that either match the search or have matching children
    const rootItems = getRootItems().filter(item => 
      matchingItems.some(match => match.id === item.id) || 
      parentIdsWithMatchingChildren.has(item.id)
    );

    // Get children for parents that have matching children
    const childItems: { [parentId: number]: NavItem[] } = {};
    rootItems.forEach(item => {
      const allChildren = getChildren(item.id);
      const matchingChildren = allChildren.filter(child => 
        matchingItems.some(match => match.id === child.id)
      );
      if (matchingChildren.length > 0) {
        childItems[item.id] = matchingChildren;
      }
    });

    return { rootItems, childItems };
  }, [searchQuery, items]);

  const { rootItems, childItems } = getSearchResults;

  // Auto-expand parents that have matching children during search
  React.useEffect(() => {
    if (searchQuery.trim()) {
      const newExpanded: { [id: number]: boolean } = {};
      Object.keys(childItems).forEach(parentId => {
        newExpanded[parseInt(parentId)] = true;
      });
      setExpanded(newExpanded);
    }
  }, [searchQuery]);

  const handleToggle = (id: number): void => {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <ul className={styles.navigationList} style={{
      backgroundColor: theme.backgroundColor,
      color: theme.textColor,
      fontFamily: theme.fontFamily
    }}>
      {rootItems.map(item => {
        const children = childItems[item.id] || [];
        const hasChildren = children.length > 0;
        
        const isActive = isItemActive(item.url);
        return (
          <li className={`${styles.navItem} ${isActive ? styles.navItemActive : ''}`} key={item.id} style={{
            borderBottom: theme.borderEnabled ? `1px solid ${theme.borderColor}` : 'none',
            padding: `${theme.paddingTopBottom} 0`,
            margin: '0 6px'
          }}>
            <div className={`${styles.navItemContent} ${isActive ? styles.navItemContentActive : ''}`} style={{ color: theme.textColor }}>
              {hasChildren ? (
                <button
                  className={styles.expandButton}
                  aria-label="Expand/collapse"
                  onClick={() => handleToggle(item.id)}
                  style={{ color: theme.textColor }}
                >
                  {expanded[item.id] ? (
                    <Icon iconName="ChevronDown" style={{ color: theme.textColor }} />
                  ) : (
                    <Icon iconName="ChevronRight" style={{ color: theme.textColor }} />
                  )}
                </button>
              ) : (
                <span className="nav-spacer" style={{ width: 5, display: 'inline-block' }}></span>
              )}
              {/* Only the title is inside the link */}
              {item.url ? (
                <a href={item.url} className={styles.navLink} target={item.target || '_self'} style={{ fontSize: theme.fontSize, color: theme.textColor }}>
                  <span className={styles.navTitle} style={{ color: theme.textColor }}>{item.title}</span>
                </a>
              ) : (
                <span className={styles.navTitle} style={{ fontSize: theme.fontSize, color: theme.textColor }}>{item.title}</span>
              )}
              {isConfigMode && (
                <span style={{ display: 'flex', gap: 4, marginLeft: 8 }}>
                  <button className={`${styles.configButton} ${styles.edit}`} title="Edit Item" aria-label="Edit" onClick={() => onEdit(item.id)}>
                    <Icon iconName="Edit" />
                  </button>
                  <button className={`${styles.configButton} ${styles.delete}`} title="Delete Item" aria-label="Delete" onClick={() => onDelete(item.id)}>
                    <Icon iconName="Delete" />
                  </button>
                  <button className={styles.configButton} title="Add Child Item" aria-label="Add Child" onClick={() => onAddChild(item.id)}>
                    <Icon iconName="Add" />
                  </button>
                </span>
              )}
            </div>
            {hasChildren && expanded[item.id] && (
              <ul className={styles.navChildren}>
                {children.map(child => {
                  const isChildActive = isItemActive(child.url);
                  return (
                    <li className={`${styles.navItem} ${isChildActive ? styles.navItemActive : ''}`} key={child.id} style={{
                      padding: `${theme.paddingTopBottom} 0`,
                      margin: '0 0'
                    }}>
                      <div className={`${styles.navItemContent} ${isChildActive ? styles.navItemContentActive : ''}`} style={{ color: theme.textColor }}>
                      <span className="nav-spacer" style={{ width: 5, display: 'inline-block' }}></span>
                      {child.url ? (
                        <a href={child.url} className={styles.navLink} target={child.target || '_self'} style={{ fontSize: theme.fontSize, color: theme.textColor }}>
                          <span className={styles.navTitle} style={{ color: theme.textColor }}>{child.title}</span>
                        </a>
                      ) : (
                        <span className={styles.navTitle} style={{ fontSize: theme.fontSize, color: theme.textColor }}>{child.title}</span>
                      )}
                      {isConfigMode && (
                        <span style={{ display: 'flex', gap: 4, marginLeft: 8 }}>
                          <button className={`${styles.configButton} ${styles.edit}`} title="Edit Item" aria-label="Edit" onClick={() => onEdit(child.id)}>
                            <Icon iconName="Edit" />
                          </button>
                          <button className={`${styles.configButton} ${styles.delete}`} title="Delete Item" aria-label="Delete" onClick={() => onDelete(child.id)}>
                            <Icon iconName="Delete" />
                          </button>
                        </span>
                      )}
                    </div>
                  </li>
                );
                })}
              </ul>
            )}
          </li>
        );
      })}
      {isConfigMode && (
        <li className={styles.configActions}>
          <button className={styles.addButton} onClick={onAddRoot}>
            <Icon iconName="Add" /> Add Navigation Item
          </button>
        </li>
      )}
    </ul>
  );
}; 