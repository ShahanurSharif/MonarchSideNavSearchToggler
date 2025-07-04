# Implementation Guide

## Overview

This guide covers the implementation of the SharePoint Framework sidebar search extension, including the Application Customizer, React components, and TypeScript interfaces.

## Project Structure

```
src/
├── extensions/
│   └── yourProjectName/
│       ├── YourProjectNameApplicationCustomizer.ts       # Extension entry point
│       ├── YourProjectNameApplicationCustomizer.manifest.json  # Extension manifest
│       ├── YourProjectNameComponent.tsx                  # Main React component
│       ├── YourProjectNameComponent.module.scss          # Component styles
│       └── loc/                                         # Localization files
│           ├── myStrings.d.ts                          # TypeScript definitions
│           └── en-us.js                                # English strings
└── index.ts                                            # Module exports
```

## 1. Application Customizer Implementation

### YourProjectNameApplicationCustomizer.ts

```typescript
import { Log } from '@microsoft/sp-core-library';
import { BaseApplicationCustomizer } from '@microsoft/sp-application-base';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import YourProjectNameComponent from './YourProjectNameComponent';
import * as strings from 'YourProjectNameApplicationCustomizerStrings';

const LOG_SOURCE: string = 'YourProjectNameApplicationCustomizer';

export interface IYourProjectNameApplicationCustomizerProperties {
  testMessage: string;
}

export default class YourProjectNameApplicationCustomizer
  extends BaseApplicationCustomizer<IYourProjectNameApplicationCustomizerProperties> {

  public onInit(): Promise<void> {
    Log.info(LOG_SOURCE, `Initialized ${strings.Title}`);

    // Create container for React component
    const customNavId = 'your-project-name-root';
    let container = document.getElementById(customNavId);
    if (!container) {
      container = document.createElement('div');
      container.id = customNavId;
      document.body.appendChild(container);
    }

    // Render React component
    ReactDOM.render(
      React.createElement(YourProjectNameComponent, { 
        description: 'Your Project Description',
        context: this.context
      }),
      container
    );

    return Promise.resolve();
  }

  public onDispose(): void {
    const customNavId = 'your-project-name-root';
    const container = document.getElementById(customNavId);
    if (container) {
      ReactDOM.unmountComponentAtNode(container);
      container.remove();
    }
  }
}
```

**Key Points:**
- Extends `BaseApplicationCustomizer` for SPFx integration
- Creates DOM container for React component
- Passes SPFx context to React component
- Properly cleans up on disposal

## 2. TypeScript Interfaces

### Core Interfaces

```typescript
// Component Props Interface
export interface IYourProjectNameComponentProps {
  description: string;
  context: ApplicationCustomizerContext;
}

// Component State Interface
export interface IComponentState {
  isOpen: boolean;
  searchQuery: string;
  searchResults: ISearchResult[];
  isSearching: boolean;
  hasSearched: boolean;
}

// Search Result Interface
export interface ISearchResult {
  Title: string;
  Path: string;
  FileType: string;
  LastModifiedTime: string;
  Author: string;
  HitHighlightedSummary: string;
}

// SharePoint Search API Interfaces
export interface ISearchCell {
  Key: string;
  Value: string;
  ValueType: string;
}

export interface ISearchRow {
  Cells: ISearchCell[];
}

export interface ISearchResponse {
  PrimaryQueryResult: {
    RelevantResults: {
      Table: {
        Rows: ISearchRow[];
      };
    };
  };
}
```

## 3. React Component Implementation

### Main Component Structure

```typescript
import * as React from 'react';
import { DefaultButton } from '@fluentui/react/lib/Button';
import { SPHttpClientResponse, SPHttpClientConfiguration, ODataVersion } from '@microsoft/sp-http';
import { ApplicationCustomizerContext } from '@microsoft/sp-application-base';
import styles from './YourProjectNameComponent.module.scss';

export default class YourProjectNameComponent extends React.Component<IYourProjectNameComponentProps, IComponentState> {
  private readonly CACHE_KEY = 'your-project-name-toggle-state';
  private readonly CACHE_EXPIRY_HOURS = 365 * 24; // 1 year cache
  private searchTimeout: number | null = null;

  constructor(props: IYourProjectNameComponentProps) {
    super(props);
    
    const cachedState = this.loadToggleState();
    this.state = { 
      isOpen: cachedState,
      searchQuery: '',
      searchResults: [],
      isSearching: false,
      hasSearched: false
    };
  }

  public componentDidMount(): void {
    this.injectToggleButton();
    this.injectSidebar();
    
    // Apply cached state if needed
    if (this.state.isOpen) {
      setTimeout(() => {
        this.applyToggleState(true);
        setTimeout(() => this.ensureContentAdjustment(true), 200);
      }, 300);
    }
  }

  public componentWillUnmount(): void {
    this.cleanup();
  }

  // ... Additional methods (see below)
}
```

### Toggle Button Implementation

```typescript
private injectToggleButton(): void {
  const buttonContainer = document.createElement('div');
  buttonContainer.id = 'your-project-name-button-container';
  buttonContainer.className = styles.buttonContainer;
  
  const toggleButton = React.createElement(DefaultButton, {
    id: 'your-project-name-toggle',
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

  import(/* webpackChunkName: 'react-dom' */ 'react-dom').then((ReactDOM) => {
    ReactDOM.render(toggleButton, buttonContainer);
  }).catch((error) => {
    console.error('Failed to load ReactDOM:', error);
  });

  document.body.appendChild(buttonContainer);
}
```

### Sidebar Implementation

```typescript
private injectSidebar(): void {
  const sidebarContainer = document.createElement('div');
  sidebarContainer.id = 'your-project-name-sidebar-container';
  sidebarContainer.className = styles.sidebarContainer;
  
  sidebarContainer.innerHTML = `
    <div class="${styles.sidebar}">
      <div class="${styles.sidebarHeader}">
        <h2 class="${styles.sidebarTitle}">Document Search</h2>
        <div class="${styles.headerButtons}">
          <button id="sidebar-settings" class="${styles.headerButton}" aria-label="Settings">
            <span style="font-size: 16px;">⚙</span>
          </button>
          <button id="sidebar-close" class="${styles.headerButton}" aria-label="Close">
            <span style="font-size: 16px;">&times;</span>
          </button>
        </div>
      </div>
      <div class="${styles.searchContainer}">
        <input type="text" id="document-search-input" placeholder="Search documents..." class="${styles.searchInput}" />
      </div>
      <div class="${styles.searchResults}" id="search-results-container">
        <div class="${styles.defaultMessage}">
          <p>Type to search for documents...</p>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(sidebarContainer);

  // Add event listeners
  this.addEventListeners();
}
```

### Event Handlers

```typescript
private addEventListeners(): void {
  const closeButton = document.getElementById('sidebar-close');
  const settingsButton = document.getElementById('sidebar-settings');
  const searchInput = document.getElementById('document-search-input') as HTMLInputElement;

  if (closeButton) {
    closeButton.addEventListener('click', this.handleToggle);
  }

  if (settingsButton) {
    settingsButton.addEventListener('click', this.handleSettings);
  }

  if (searchInput) {
    searchInput.addEventListener('input', this.handleSearchInput);
  }
}

private handleToggle = (): void => {
  const newIsOpen = !this.state.isOpen;
  this.setState({ isOpen: newIsOpen }, () => {
    this.saveToggleState(newIsOpen);
    this.applyToggleState(newIsOpen);
  });
};

private handleSettings = (): void => {
  console.log('Settings clicked');
  // Implement settings functionality
};

private handleSearchInput = (event: Event): void => {
  const target = event.target as HTMLInputElement;
  const query = target.value.trim();
  
  if (this.searchTimeout) {
    clearTimeout(this.searchTimeout);
  }

  this.setState({ searchQuery: query });

  if (query === '') {
    this.setState({ 
      searchResults: [], 
      isSearching: false, 
      hasSearched: false 
    });
    this.renderDefaultMessage();
    return;
  }

  // Debounce search
  this.searchTimeout = setTimeout(() => {
    this.performSearch(query).catch((error) => {
      console.error('Search timeout error:', error);
    });
  }, 300);
};
```

### Search Implementation

```typescript
private async performSearch(query: string): Promise<void> {
  if (!query || query.length < 2) {
    return;
  }

  console.log('Performing search for:', query);
  this.setState({ isSearching: true, hasSearched: true });
  this.renderLoadingIndicator();

  try {
    // Configure for SharePoint Search API
    const config = new SPHttpClientConfiguration({
      defaultODataVersion: ODataVersion.v3
    });
    
    const searchValue = `'${query}*'`;
    const searchUrl = `${this.props.context.pageContext.web.absoluteUrl}/_api/search/query?querytext=${encodeURIComponent(searchValue)}&selectproperties='Title,Path,FileType,LastModifiedTime,Author,HitHighlightedSummary'&rowlimit=20`;

    const response: SPHttpClientResponse = await this.props.context.spHttpClient.get(
      searchUrl,
      config,
      {
        headers: {
          'Accept': 'application/json;odata=minimalmetadata;charset=utf-8'
        }
      }
    );

    if (response && response.ok) {
      const data = await response.json();
      const searchData = data.PrimaryQueryResult || data.d?.query?.PrimaryQueryResult;
      
      const allResults: ISearchResult[] = searchData?.RelevantResults?.Table?.Rows?.map((row: ISearchRow) => {
        const cells = row.Cells;
        return {
          Title: this.getCellValue(cells, 'Title') || 'Untitled Document',
          Path: this.getCellValue(cells, 'Path') || '',
          FileType: this.getCellValue(cells, 'FileType') || '',
          LastModifiedTime: this.getCellValue(cells, 'LastModifiedTime') || '',
          Author: this.getCellValue(cells, 'Author') || '',
          HitHighlightedSummary: this.getCellValue(cells, 'HitHighlightedSummary') || ''
        };
      }) || [];

      // Filter for document types
      const supportedFileTypes = ['doc', 'docx', 'pdf', 'ppt', 'pptx', 'xls', 'xlsx', 'txt', 'csv'];
      const searchResults = allResults.filter(result => 
        result.FileType && supportedFileTypes.includes(result.FileType.toLowerCase())
      );

      this.setState({ searchResults, isSearching: false });
      this.renderSearchResults(searchResults);
    } else {
      throw new Error(`Search request failed with status ${response.status}`);
    }
  } catch (error) {
    console.error('Search error:', error);
    this.setState({ searchResults: [], isSearching: false });
    this.renderErrorMessage();
  }
}

private getCellValue(cells: ISearchCell[], key: string): string {
  for (let i = 0; i < cells.length; i++) {
    if (cells[i].Key === key) {
      return cells[i].Value || '';
    }
  }
  return '';
}
```

### UI State Management

```typescript
private applyToggleState(isOpen: boolean): void {
  const buttonContainer = document.getElementById('your-project-name-button-container');
  const sidebarContainer = document.getElementById('your-project-name-sidebar-container');
  const spPageChrome = document.getElementById('SPPageChrome');
  
  const sidebarWidth = this.getSidebarWidth();
  const contentWidth = this.getContentWidth();

  if (isOpen) {
    // Open sidebar
    if (sidebarContainer) {
      sidebarContainer.style.left = '0%';
    }
    
    // Adjust main content
    if (spPageChrome) {
      spPageChrome.style.marginLeft = sidebarWidth;
      spPageChrome.style.width = contentWidth;
      spPageChrome.style.transition = 'margin-left 0.3s ease, width 0.3s ease';
    }
    
    // Move button
    if (buttonContainer) {
      buttonContainer.style.left = sidebarWidth;
    }
  } else {
    // Close sidebar
    if (sidebarContainer) {
      sidebarContainer.style.left = `-${sidebarWidth}`;
    }
    
    // Reset main content
    if (spPageChrome) {
      spPageChrome.style.marginLeft = '0px';
      spPageChrome.style.width = '100%';
      spPageChrome.style.transition = 'margin-left 0.3s ease, width 0.3s ease';
    }
    
    // Reset button
    if (buttonContainer) {
      buttonContainer.style.left = '0px';
    }
  }

  this.updateToggleIcon();
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
```

### LocalStorage Caching

```typescript
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
    console.warn('Failed to save toggle state:', error);
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
      return false;
    }

    return parsedData.value;
  } catch (error) {
    console.warn('Failed to load toggle state:', error);
    return false;
  }
}
```

### Cleanup Implementation

```typescript
private cleanup(): void {
  // Clear search timeout
  if (this.searchTimeout) {
    clearTimeout(this.searchTimeout);
  }

  // Remove event listeners
  const toggleButton = document.getElementById('your-project-name-toggle');
  const closeButton = document.getElementById('sidebar-close');
  const settingsButton = document.getElementById('sidebar-settings');
  const searchInput = document.getElementById('document-search-input');
  
  [toggleButton, closeButton, settingsButton, searchInput].forEach(element => {
    if (element) {
      element.removeEventListener('click', this.handleToggle);
      element.removeEventListener('click', this.handleSettings);
      element.removeEventListener('input', this.handleSearchInput);
    }
  });

  // Remove DOM elements
  const buttonContainer = document.getElementById('your-project-name-button-container');
  const sidebarContainer = document.getElementById('your-project-name-sidebar-container');
  
  [buttonContainer, sidebarContainer].forEach(element => {
    if (element) {
      element.remove();
    }
  });
  
  // Reset page styles
  const spPageChrome = document.getElementById('SPPageChrome');
  if (spPageChrome) {
    spPageChrome.style.marginLeft = '';
    spPageChrome.style.width = '';
  }
}

public render(): React.ReactElement<IYourProjectNameComponentProps> {
  return <div style={{ display: 'none' }} />;
}
```

## 4. Result Rendering Methods

### Search Results Display

```typescript
private renderSearchResults(results: ISearchResult[]): void {
  const container = document.getElementById('search-results-container');
  if (!container) return;

  if (results.length === 0) {
    container.innerHTML = `
      <div class="${styles.noResultsMessage}">
        <p>No documents found</p>
      </div>
    `;
    return;
  }

  const resultsHtml = results.map(result => {
    const fileIcon = this.getFileIcon(result.FileType);
    const truncatedTitle = result.Title.length > 40 ? result.Title.substring(0, 40) + '...' : result.Title;
    
    return `
      <div class="${styles.searchResultItem}">
        <a href="${result.Path}" class="${styles.searchResultLink}" target="_blank" rel="noopener noreferrer">
          <div class="${styles.resultIcon}">${fileIcon}</div>
          <div class="${styles.resultContent}">
            <div class="${styles.resultTitle}">${truncatedTitle}</div>
            <div class="${styles.resultMeta}">
              <span class="${styles.fileType}">${result.FileType.toUpperCase()}</span>
              ${result.Author ? `<span class="${styles.author}">by ${result.Author}</span>` : ''}
            </div>
          </div>
        </a>
      </div>
    `;
  }).join('');

  container.innerHTML = `
    <div class="${styles.searchResultsList}">
      <div class="${styles.resultsHeader}">
        <p>${results.length} document${results.length !== 1 ? 's' : ''} found</p>
      </div>
      ${resultsHtml}
    </div>
  `;
}

private getFileIcon(fileType: string): string {
  const type = fileType.toLowerCase();
  switch (type) {
    case 'pdf': return '📄';
    case 'doc':
    case 'docx': return '📝';
    case 'xls':
    case 'xlsx': return '📊';
    case 'ppt':
    case 'pptx': return '📈';
    case 'txt': return '📋';
    case 'csv': return '📄';
    default: return '📁';
  }
}
```

## 5. Best Practices Implemented

### Error Handling
- Comprehensive try-catch blocks
- Graceful degradation for API failures
- User-friendly error messages

### Performance Optimization
- Debounced search input (300ms delay)
- Efficient DOM manipulation
- Proper cleanup on unmount

### Accessibility
- ARIA labels for screen readers
- Keyboard navigation support
- Semantic HTML structure

### Security
- XSS prevention through proper encoding
- Content Security Policy compliance
- Secure external link handling

## 6. Testing Considerations

### Unit Testing
```typescript
// Example Jest test
describe('YourProjectNameComponent', () => {
  it('should render without crashing', () => {
    const mockContext = {} as ApplicationCustomizerContext;
    const props = {
      description: 'Test',
      context: mockContext
    };
    
    const wrapper = shallow(<YourProjectNameComponent {...props} />);
    expect(wrapper).toBeDefined();
  });
});
```

### Integration Testing
- Test SharePoint API integration
- Verify DOM manipulation
- Test responsive behavior

## Next Steps

1. Follow the [Search API Guide](./search-api.md) for detailed API integration
2. Review [Styling Guide](./styling.md) for UI implementation
3. Check [Deployment Guide](./deployment.md) for publishing to SharePoint 