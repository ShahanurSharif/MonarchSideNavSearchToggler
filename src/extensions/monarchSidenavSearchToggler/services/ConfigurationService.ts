import { ApplicationCustomizerContext } from '@microsoft/sp-application-base';
import { SPHttpClient, SPHttpClientResponse } from '@microsoft/sp-http';

export interface NavItem {
  id: string;
  title: string;
  url: string;
  order: number;
  children?: NavItem[];
}

export interface SidebarConfig {
  theme: {
    primaryColor: string;
    secondaryColor: string;
    backgroundColor: string;
    textColor: string;
    borderColor: string;
    hoverColor: string;
    activeColor: string;
    shadowColor: string;
    fontFamily: string;
    fontSize: string;
    borderRadius: string;
    transitionDuration: string;
  };
  items: NavItem[];
  sidebar: {
    width: number;
    isPinned: boolean;
    isOpen: boolean;
    togglePosition: {
      top: number;
    };
  };
  lastModified?: string;
  modifiedBy?: string;
}

const FALLBACK_CONFIG: SidebarConfig = {
  theme: {
    primaryColor: "#0078d4",
    secondaryColor: "#106ebe",
    backgroundColor: "#ffffff",
    textColor: "#323130",
    borderColor: "#edebe9",
    hoverColor: "#f3f2f1",
    activeColor: "#deecf9",
    shadowColor: "rgba(0,0,0,0.1)",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    fontSize: "14px",
    borderRadius: "4px",
    transitionDuration: "0.2s"
  },
  items: [
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
  ],
  sidebar: {
    width: 300,
    isPinned: false,
    isOpen: true,
    togglePosition: {
      top: 20
    }
  }
};

export class ConfigurationService {
  private context: ApplicationCustomizerContext;
  private static readonly CONFIG_FILE_NAME = 'monarchSidebarNavConfig.json';

  constructor(context: ApplicationCustomizerContext) {
    this.context = context;
  }

  /**
   * Load configuration from SharePoint Site Assets
   */
  public async loadConfiguration(): Promise<SidebarConfig> {
    try {
      const siteUrl = this.context.pageContext.web.absoluteUrl;
      const serverRelativeUrl = `${this.context.pageContext.web.serverRelativeUrl.replace(/\/$/, '')}/SiteAssets`;
      const fileUrl = `${serverRelativeUrl}/${ConfigurationService.CONFIG_FILE_NAME}`;
      const getUrl = `${siteUrl}/_api/web/GetFileByServerRelativeUrl('${fileUrl}')/$value`;
      
      console.info('[ConfigurationService] Loading configuration from:', getUrl);
      const response: SPHttpClientResponse = await this.context.spHttpClient.get(
        getUrl,
        SPHttpClient.configurations.v1
      );
      if (response.ok) {
        const configText = await response.text();
        const config: SidebarConfig = JSON.parse(configText);
        console.info('[ConfigurationService] Configuration loaded successfully from deployed file');
        return config;
      } else {
        console.warn(`[ConfigurationService] Deployed config file not found: ${response.status}. Using fallback configuration.`);
        return FALLBACK_CONFIG;
      }
    } catch (error) {
      console.error('[ConfigurationService] Error loading configuration, using fallback', error);
      return FALLBACK_CONFIG;
    }
  }

  /**
   * Save configuration to SharePoint Site Assets
   */
  public async saveConfiguration(config: Partial<SidebarConfig>): Promise<boolean> {
    try {
      const siteUrl = this.context.pageContext.web.absoluteUrl;
      const serverRelativeUrl = `${this.context.pageContext.web.serverRelativeUrl.replace(/\/$/, '')}/SiteAssets`;
      const uploadUrl = `${siteUrl}/_api/web/GetFolderByServerRelativeUrl('${serverRelativeUrl}')/Files/add(overwrite=true,url='${ConfigurationService.CONFIG_FILE_NAME}')`;
      const configToSave: SidebarConfig = {
        ...FALLBACK_CONFIG,
        ...config,
        lastModified: new Date().toISOString(),
        modifiedBy: this.context.pageContext.user.displayName || 'Unknown'
      };
      const configJson = JSON.stringify(configToSave, null, 2);
      const blob = new Blob([configJson], { type: 'application/json' });
      
      console.info('[ConfigurationService] Saving configuration to:', uploadUrl);
      const response: SPHttpClientResponse = await this.context.spHttpClient.post(
        uploadUrl,
        SPHttpClient.configurations.v1,
        {
          body: blob
        }
      );
      if (response.ok) {
        console.info('[ConfigurationService] Configuration saved successfully to deployed file');
        return true;
      } else {
        let errorData: unknown = null;
        try {
          errorData = await response.clone().json();
        } catch {
          errorData = await response.text();
        }
        console.error('[ConfigurationService] Failed to save config:', errorData);
        return false;
      }
    } catch (error) {
      console.error('[ConfigurationService] Error saving configuration:', error);
      return false;
    }
  }
} 