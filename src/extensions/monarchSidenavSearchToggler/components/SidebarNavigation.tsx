import * as React from 'react';
import { Icon } from '@fluentui/react/lib/Icon';
import styles from '../MonarchSidenavSearchToggler.module.scss';

export interface NavItem {
  id: number;
  title: string;
  url: string;
  order: number;
  children?: NavItem[];
}

interface SidebarNavigationProps {
  items: NavItem[];
  isConfigMode: boolean;
  searchQuery: string;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  onAddChild: (id: number) => void;
  onAddRoot: () => void;
}

export const SidebarNavigation: React.FC<SidebarNavigationProps> = ({
  items,
  isConfigMode,
  searchQuery,
  onEdit,
  onDelete,
  onAddChild,
  onAddRoot
}) => {
  const [expanded, setExpanded] = React.useState<{ [id: number]: boolean }>({});

  const filterItems = (items: NavItem[]): NavItem[] => {
    if (!searchQuery.trim()) {
      // Sort by order when not searching
      return items.sort((a, b) => a.order - b.order);
    }
    
    const q = searchQuery.toLowerCase();
    const filtered = items
      .map(item => {
        const match = item.title.toLowerCase().includes(q) || (item.url?.toLowerCase().includes(q) ?? false);
        const children = item.children ? filterItems(item.children) : undefined;
        if (match || (children && children.length > 0)) {
          return { ...item, children };
        }
        return null;
      })
      .filter(Boolean) as NavItem[];
    
    // Sort filtered results by order
    return filtered.sort((a, b) => a.order - b.order);
  };

  const filteredItems = filterItems(items);

  const handleToggle = (id: number): void => {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <ul className={styles.navigationList}>
      {filteredItems.map(item => (
        <li className={styles.navItem} key={item.id}>
          <div className={styles.navItemContent}>
            {item.children && item.children.length > 0 ? (
              <button
                className={styles.expandButton}
                aria-label="Expand/collapse"
                onClick={() => handleToggle(item.id)}
              >
                {expanded[item.id] ? (
                  <Icon iconName="ChevronDown" />
                ) : (
                  <Icon iconName="ChevronRight" />
                )}
              </button>
            ) : (
              <span className="nav-spacer" style={{ width: 16, display: 'inline-block' }}></span>
            )}
            {/* Only the title is inside the link */}
            {item.url ? (
              <a href={item.url} className={styles.navLink} target="_self">
                <span className={styles.navTitle}>{item.title}</span>
              </a>
            ) : (
              <span className={styles.navTitle}>{item.title}</span>
            )}
            {isConfigMode && (
              <span style={{ display: 'flex', gap: 4, marginLeft: 8 }}>
                <button className={`${styles.configButton} ${styles.edit}`} title="Edit Item" aria-label="Edit" onClick={() => onEdit(item.id)}>
                  <Icon iconName="Edit" />
                </button>
                <button className={`${styles.configButton} ${styles.delete}`} title="Delete Item" aria-label="Delete" onClick={() => onDelete(item.id)}>
                  <Icon iconName="Delete" />
                </button>
                {item.children && item.children.length === 0 && (
                  <button className={styles.configButton} title="Add Child Item" aria-label="Add Child" onClick={() => onAddChild(item.id)}>
                    <Icon iconName="Add" />
                  </button>
                )}
              </span>
            )}
          </div>
          {item.children && item.children.length > 0 && expanded[item.id] && (
            <ul className={styles.navChildren}>
              {item.children.map(child => (
                <li className={styles.navItem} key={child.id}>
                  <div className={styles.navItemContent}>
                    <span className="nav-spacer" style={{ width: 16, display: 'inline-block' }}></span>
                    {child.url ? (
                      <a href={child.url} className={styles.navLink} target="_self">
                        <span className={styles.navTitle}>{child.title}</span>
                      </a>
                    ) : (
                      <span className={styles.navTitle}>{child.title}</span>
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
              ))}
            </ul>
          )}
        </li>
      ))}
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