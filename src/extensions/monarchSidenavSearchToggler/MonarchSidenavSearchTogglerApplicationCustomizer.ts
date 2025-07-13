import { Log } from '@microsoft/sp-core-library';
import {
  BaseApplicationCustomizer
} from '@microsoft/sp-application-base';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import MonarchSidenavSearchToggler from './MonarchSidenavSearchToggler';

import * as strings from 'MonarchSidenavSearchTogglerApplicationCustomizerStrings';

const LOG_SOURCE: string = 'MonarchSideNavSearchTogglerApplicationCustomizer';

/**
 * If your command set uses the ClientSideComponentProperties JSON input,
 * it will be deserialized into the BaseExtension.properties object.
 * You can define an interface to describe it.
 */
export interface IMonarchSideNavSearchTogglerApplicationCustomizerProperties {
  // Configuration properties for Monarch SideNav Search Toggler
  description: string;
}

/** 
 * Monarch SideNav Search Toggler Application Customizer
 * Provides hierarchical sidebar navigation with search functionality and theme customization
 */
export default class MonarchSideNavSearchTogglerApplicationCustomizer
  extends BaseApplicationCustomizer<IMonarchSideNavSearchTogglerApplicationCustomizerProperties> {

  public onInit(): Promise<void> {
    Log.info(LOG_SOURCE, `Initialized ${strings.Title}`);
    console.log('🚀 MonarchSideNavSearchToggler: Application Customizer initialized');

    // Create a container div for the React component
    const customNavId = 'monarch-sidebar-navigation-root';
    let container = document.getElementById(customNavId);
    if (!container) {
      container = document.createElement('div');
      container.id = customNavId;
      document.body.appendChild(container);
      console.log('✅ MonarchSideNavSearchToggler: Created container element');
    } else {
      console.log('✅ MonarchSideNavSearchToggler: Found existing container element');
    }

    console.log('🔄 MonarchSideNavSearchToggler: Rendering React component...');
    ReactDOM.render(
      React.createElement(MonarchSidenavSearchToggler, { 
        description: this.properties.description || 'Monarch Sidebar Navigation',
        context: this.context
      }),
      container
    );
    console.log('✅ MonarchSideNavSearchToggler: React component rendered');

    return Promise.resolve();
  }

  public onDispose(): void {
    const customNavId = 'monarch-sidebar-navigation-root';
    const container = document.getElementById(customNavId);
    if (container) {
      ReactDOM.unmountComponentAtNode(container);
      container.remove();
    }
  }
}

// Legacy interface exports for compatibility
export interface IMonarchSidenavSearchTogglerApplicationCustomizerProperties extends IMonarchSideNavSearchTogglerApplicationCustomizerProperties {}
export { MonarchSideNavSearchTogglerApplicationCustomizer as MonarchSidenavSearchTogglerApplicationCustomizer };
