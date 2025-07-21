import { ApplicationCustomizerContext } from '@microsoft/sp-application-base';

export interface INavigationItem {
  id: number;
  title: string;
  url: string;
  icon?: string;
  target?: '_blank' | '_self';
  parentId: number; // 0 for root items, number for child items
  isExpanded?: boolean;
  order: number;
}

export interface IThemeConfig {
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
  hoverColor: string;
  fontFamily: string;
  fontSize: string;
  borderRadius: string;
  sidebarWidth: string;
  borderEnabled: boolean;
  borderColor: string;
  paddingTopBottom: string;
  logoUrl: string;
  logoSize: string;
  siteName: string;
  siteUrl: string;
  position?: 'left' | 'right';
}

export interface ISidebarConfig {
  isOpen: boolean;
  isPinned: boolean;
  position: 'left' | 'right';
}

export interface ISidebarNavConfig {
  version: string;
  items: INavigationItem[];
  theme: IThemeConfig;
  sidebar: ISidebarConfig;
  searchEnabled: boolean;
  autoSave: boolean;
  lastModified: string;
  createdBy: string;
  modifiedBy: string;
}

export interface IModalState {
  isVisible: boolean;
  mode: 'add' | 'edit' | 'theme' | 'settings';
  editingItem?: INavigationItem;
  parentId?: number;
}

export interface INavigationSearchResult {
  item: INavigationItem;
  matchType: 'title' | 'url';
  highlightedTitle: string;
  path: string[];
}

export interface IComponentState {
  isOpen: boolean;
  searchQuery: string;
  searchResults: INavigationSearchResult[];
  isSearching: boolean;
  hasSearched: boolean;
  navigationConfig: ISidebarNavConfig;
  modalState: IModalState;
  isConfigMode: boolean;
  hasUnsavedChanges: boolean;
}

export interface INavigationProps {
  description: string;
  context: ApplicationCustomizerContext;
}

export const DefaultTheme: IThemeConfig = {
  primaryColor: '#0078d4',
  secondaryColor: '#106ebe',
  backgroundColor: '#ffffff',
  textColor: '#323130',
  hoverColor: '#f3f2f1',
  fontFamily: 'Segoe UI, system-ui, sans-serif',
  fontSize: '14px',
  borderRadius: '4px',
  sidebarWidth: '300px',
  borderEnabled: false,
  borderColor: '#d2d0ce',
  paddingTopBottom: '2px',
  logoUrl: '',
  logoSize: '40px',
  siteName: '',
  siteUrl: '',
  position: 'left'
};

export const DefaultNavigationConfig: ISidebarNavConfig = {
  version: '2.1.9.0',
  items: [
    {
      id: 1,
      title: 'Home',
      url: '/',
      target: '_self',
      order: 1,
      parentId: 0
    },
    {
      id: 2,
      title: 'Documents',
      url: '/documents',
      target: '_self',
      order: 2,
      parentId: 0
    },
    {
      id: 3,
      title: 'Resources',
      url: '/resources',
      target: '_self',
      order: 3,
      parentId: 0
    },
    {
      id: 4,
      title: 'Support',
      url: '/support',
      target: '_self',
      order: 4,
      parentId: 0
    },
    {
      id: 5,
      title: 'Policies',
      url: '/documents/policies',
      target: '_self',
      order: 1,
      parentId: 2
    },
    {
      id: 6,
      title: 'Procedures',
      url: '/documents/procedures',
      target: '_self',
      order: 2,
      parentId: 2
    },
    {
      id: 7,
      title: 'Help Desk',
      url: '/support/helpdesk',
      target: '_self',
      order: 1,
      parentId: 4
    },
    {
      id: 8,
      title: 'FAQ',
      url: '/support/faq',
      target: '_self',
      order: 2,
      parentId: 4
    },
    {
      id: 9,
      title: 'Contact Us',
      url: '/support/contact',
      target: '_self',
      order: 3,
      parentId: 4
    }
  ],
  theme: DefaultTheme,
  sidebar: {
    isOpen: true,
    isPinned: false,
    position: DefaultTheme.position || 'left'
  },
  searchEnabled: true,
  autoSave: true,
  lastModified: new Date().toISOString(),
  createdBy: 'System',
  modifiedBy: 'System'
}; 