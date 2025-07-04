# SharePoint Search API Guide

## Overview

This guide covers the integration with SharePoint Search API for document search functionality. The implementation uses the SharePoint REST API with proper OData configuration for reliable search results.

## Search API Configuration

### 1. SPHttpClient Configuration

The key to successful SharePoint Search API integration is proper configuration of the SPHttpClient with OData v3 settings.

```typescript
import { SPHttpClientResponse, SPHttpClientConfiguration, ODataVersion } from '@microsoft/sp-http';

// Configure SPHttpClient for SharePoint Search API
const config = new SPHttpClientConfiguration({
  defaultODataVersion: ODataVersion.v3
});

const response: SPHttpClientResponse = await this.props.context.spHttpClient.get(
  searchUrl,
  config,
  {
    headers: {
      'Accept': 'application/json;odata=minimalmetadata;charset=utf-8'
    }
  }
);
```

**Critical Configuration Points:**
- **OData Version**: Must use `ODataVersion.v3` for SharePoint Search API
- **Accept Header**: Must include `application/json;odata=minimalmetadata;charset=utf-8`
- **Character Encoding**: UTF-8 encoding is required for proper results

### 2. Search Query Construction

```typescript
private buildSearchQuery(query: string): string {
  const baseUrl = this.props.context.pageContext.web.absoluteUrl;
  const searchValue = `'${query}*'`;  // Single quotes with wildcard
  
  const searchUrl = `${baseUrl}/_api/search/query?` +
    `querytext=${encodeURIComponent(searchValue)}&` +
    `selectproperties='Title,Path,FileType,LastModifiedTime,Author,HitHighlightedSummary'&` +
    `rowlimit=20`;
  
  return searchUrl;
}
```

**Query Parameters:**
- `querytext`: Search query with single quotes and wildcard (*)
- `selectproperties`: Comma-separated list of properties to retrieve
- `rowlimit`: Maximum number of results to return

### 3. Complete Search Implementation

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

    console.log('Search URL:', searchUrl);

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
      await this.processSearchResults(data);
    } else {
      throw new Error(`Search request failed with status ${response.status} ${response.statusText}`);
    }
  } catch (error) {
    console.error('Search error:', error);
    this.setState({ searchResults: [], isSearching: false });
    this.renderErrorMessage();
  }
}
```

## Response Processing

### 1. Search Response Structure

SharePoint Search API returns results in a specific structure:

```typescript
interface ISearchResponse {
  PrimaryQueryResult: {
    RelevantResults: {
      Table: {
        Rows: ISearchRow[];
      };
    };
  };
}

interface ISearchRow {
  Cells: ISearchCell[];
}

interface ISearchCell {
  Key: string;
  Value: string;
  ValueType: string;
}
```

### 2. Result Processing Implementation

```typescript
private async processSearchResults(data: any): Promise<void> {
  // Handle different response formats
  const searchData = data.PrimaryQueryResult || data.d?.query?.PrimaryQueryResult;
  
  if (!searchData?.RelevantResults?.Table?.Rows) {
    console.warn('No search results found in response');
    this.setState({ searchResults: [], isSearching: false });
    this.renderSearchResults([]);
    return;
  }

  const allResults: ISearchResult[] = searchData.RelevantResults.Table.Rows.map((row: ISearchRow) => {
    const cells = row.Cells;
    return {
      Title: this.getCellValue(cells, 'Title') || 'Untitled Document',
      Path: this.getCellValue(cells, 'Path') || '',
      FileType: this.getCellValue(cells, 'FileType') || '',
      LastModifiedTime: this.getCellValue(cells, 'LastModifiedTime') || '',
      Author: this.getCellValue(cells, 'Author') || '',
      HitHighlightedSummary: this.getCellValue(cells, 'HitHighlightedSummary') || ''
    };
  });

  // Filter for supported document types
  const supportedFileTypes = ['doc', 'docx', 'pdf', 'ppt', 'pptx', 'xls', 'xlsx', 'txt', 'csv'];
  const searchResults = allResults.filter(result => 
    result.FileType && supportedFileTypes.includes(result.FileType.toLowerCase())
  );

  console.log('All results:', allResults.length);
  console.log('Filtered document results:', searchResults.length);
  
  this.setState({ searchResults, isSearching: false });
  this.renderSearchResults(searchResults);
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

## Advanced Search Features

### 1. Query Refinement

```typescript
private buildAdvancedQuery(query: string, fileType?: string, author?: string): string {
  let searchValue = `'${query}*'`;
  
  // Add file type filter
  if (fileType) {
    searchValue += ` AND FileType:${fileType}`;
  }
  
  // Add author filter
  if (author) {
    searchValue += ` AND Author:"${author}"`;
  }
  
  return searchValue;
}
```

### 2. Search Scoping

```typescript
private buildScopedQuery(query: string, scope: 'site' | 'library' | 'folder'): string {
  const baseUrl = this.props.context.pageContext.web.absoluteUrl;
  let searchValue = `'${query}*'`;
  
  switch (scope) {
    case 'site':
      searchValue += ` AND site:${baseUrl}`;
      break;
    case 'library':
      searchValue += ` AND contentclass:STS_ListItem_DocumentLibrary`;
      break;
    case 'folder':
      searchValue += ` AND Path:${baseUrl}/*`;
      break;
  }
  
  return searchValue;
}
```

### 3. Result Sorting

```typescript
private buildSortedQuery(query: string, sortBy: 'relevance' | 'modified' | 'title'): string {
  const baseUrl = this.props.context.pageContext.web.absoluteUrl;
  const searchValue = `'${query}*'`;
  
  let sortList = '';
  switch (sortBy) {
    case 'modified':
      sortList = 'LastModifiedTime:descending';
      break;
    case 'title':
      sortList = 'Title:ascending';
      break;
    case 'relevance':
    default:
      sortList = 'Rank:descending';
      break;
  }
  
  const searchUrl = `${baseUrl}/_api/search/query?` +
    `querytext=${encodeURIComponent(searchValue)}&` +
    `selectproperties='Title,Path,FileType,LastModifiedTime,Author,HitHighlightedSummary'&` +
    `sortlist='${sortList}'&` +
    `rowlimit=20`;
  
  return searchUrl;
}
```

## Error Handling and Debugging

### 1. Comprehensive Error Handling

```typescript
private async performSearchWithErrorHandling(query: string): Promise<void> {
  try {
    const config = new SPHttpClientConfiguration({
      defaultODataVersion: ODataVersion.v3
    });
    
    const searchUrl = this.buildSearchQuery(query);
    console.log('Search URL:', searchUrl);

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
      await this.processSearchResults(data);
    } else {
      // Handle different error types
      const status = response ? response.status : 'Unknown';
      const statusText = response ? response.statusText : 'Unknown';
      
      let errorText = '';
      try {
        errorText = await response.text();
      } catch {
        errorText = '[Could not read response text]';
      }
      
      console.error('Search failed:', { status, statusText, errorText });
      console.error('Search query was:', query);
      console.error('Site URL:', this.props.context.pageContext.web.absoluteUrl);
      
      this.handleSearchError(status, statusText, errorText);
    }
  } catch (error) {
    console.error('Search error:', error);
    this.handleSearchError('Network Error', '', error.message);
  }
}

private handleSearchError(status: any, statusText: string, errorText: string): void {
  let errorMessage = 'Unable to search documents at this time.';
  
  switch (status) {
    case 401:
      errorMessage = 'You do not have permission to search this site.';
      break;
    case 403:
      errorMessage = 'Search access is forbidden. Please check your permissions.';
      break;
    case 404:
      errorMessage = 'Search service is not available.';
      break;
    case 500:
      errorMessage = 'Internal server error. Please try again later.';
      break;
    default:
      errorMessage = `Search failed with error: ${status} ${statusText}`;
  }
  
  this.setState({ 
    searchResults: [], 
    isSearching: false,
    errorMessage: errorMessage
  });
  
  this.renderErrorMessage(errorMessage);
}
```

### 2. Debug Information

```typescript
private logSearchDebugInfo(query: string, response: SPHttpClientResponse): void {
  const debugInfo = {
    query: query,
    searchUrl: this.buildSearchQuery(query),
    responseStatus: response.status,
    responseStatusText: response.statusText,
    userContext: {
      userDisplayName: this.props.context.pageContext.user.displayName,
      userEmail: this.props.context.pageContext.user.email,
      siteUrl: this.props.context.pageContext.web.absoluteUrl,
      tenantUrl: this.props.context.pageContext.site.absoluteUrl
    }
  };
  
  console.log('Search Debug Info:', debugInfo);
}
```

## Performance Optimization

### 1. Search Debouncing

```typescript
private handleSearchInput = (event: Event): void => {
  const target = event.target as HTMLInputElement;
  const query = target.value.trim();
  
  // Clear existing timeout
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

  // Debounce search - wait 300ms after user stops typing
  this.searchTimeout = setTimeout(() => {
    this.performSearch(query).catch((error) => {
      console.error('Search timeout error:', error);
    });
  }, 300);
};
```

### 2. Result Caching

```typescript
private searchCache: Map<string, { results: ISearchResult[]; timestamp: number }> = new Map();
private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

private async performSearchWithCache(query: string): Promise<void> {
  const cacheKey = query.toLowerCase();
  const cached = this.searchCache.get(cacheKey);
  
  // Check cache first
  if (cached && (Date.now() - cached.timestamp) < this.CACHE_DURATION) {
    console.log('Using cached results for:', query);
    this.setState({ searchResults: cached.results, isSearching: false });
    this.renderSearchResults(cached.results);
    return;
  }
  
  // Perform search
  await this.performSearch(query);
  
  // Cache results
  if (this.state.searchResults.length > 0) {
    this.searchCache.set(cacheKey, {
      results: this.state.searchResults,
      timestamp: Date.now()
    });
  }
}
```

## Testing SharePoint Search API

### 1. Development Environment Limitations

**Important Note:** SharePoint Search API calls from `localhost` (during `gulp serve`) will fail due to CORS restrictions. This is normal behavior and not an error in your implementation.

### 2. Testing Strategy

```typescript
// Test search functionality
private async testSearchAPI(): Promise<void> {
  const testQueries = ['test', 'document', 'pdf'];
  
  for (const query of testQueries) {
    console.log(`Testing query: ${query}`);
    try {
      await this.performSearch(query);
      console.log(`✓ Query "${query}" succeeded`);
    } catch (error) {
      console.error(`✗ Query "${query}" failed:`, error);
    }
  }
}
```

### 3. Browser Testing

Test search API directly in browser console when logged into SharePoint:

```javascript
// Test in browser console
fetch("https://yourtenant.sharepoint.com/sites/yoursite/_api/search/query?querytext='test*'&selectproperties='Title,Path,FileType'&rowlimit=10", {
  method: "GET",
  headers: {
    "Accept": "application/json;odata=minimalmetadata;charset=utf-8"
  }
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error(error));
```

## Common Issues and Solutions

### 1. "Unknown Error" (500 Status)

**Cause:** Incorrect OData configuration or missing Accept header
**Solution:** Ensure OData v3 configuration and proper Accept header

### 2. "The HTTP header ACCEPT is missing"

**Cause:** Missing or incorrect Accept header
**Solution:** Use `application/json;odata=minimalmetadata;charset=utf-8`

### 3. "Access Denied" (403 Status)

**Cause:** Insufficient permissions
**Solution:** Verify user has Read permissions on the site

### 4. No Results Returned

**Cause:** Search index not crawled or incorrect query format
**Solution:** Check search settings and verify query syntax

### 5. CORS Errors in Development

**Cause:** SharePoint security restrictions for localhost
**Solution:** Test in deployed SharePoint environment

## Best Practices

1. **Always use OData v3** for SharePoint Search API
2. **Include proper Accept headers** for consistent results
3. **Implement comprehensive error handling** for all scenarios
4. **Use debouncing** to prevent excessive API calls
5. **Cache results** for better performance
6. **Test in deployed environment** not localhost
7. **Log debug information** for troubleshooting
8. **Filter results** based on your requirements
9. **Handle empty results** gracefully
10. **Implement retry logic** for transient failures

## Next Steps

1. Review [Styling Guide](./styling.md) for UI implementation
2. Follow [Deployment Guide](./deployment.md) for production deployment
3. Check [Troubleshooting Guide](./troubleshooting.md) for additional issue resolution 