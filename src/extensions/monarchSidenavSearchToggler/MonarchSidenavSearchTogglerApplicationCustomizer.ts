import { Log } from '@microsoft/sp-core-library';
import {
  BaseApplicationCustomizer
} from '@microsoft/sp-application-base';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import MonarchSidenavSearchToggler from './MonarchSidenavSearchToggler';

import * as strings from 'MonarchSidenavSearchTogglerApplicationCustomizerStrings';

const LOG_SOURCE: string = 'MonarchSidenavSearchTogglerApplicationCustomizer';

/**
 * If your command set uses the ClientSideComponentProperties JSON input,
 * it will be deserialized into the BaseExtension.properties object.
 * You can define an interface to describe it.
 */
export interface IMonarchSidenavSearchTogglerApplicationCustomizerProperties {
  // This is an example; replace with your own property
  testMessage: string;
}

/** A Custom Action which can be run during execution of a Client Side Application */
export default class MonarchSidenavSearchTogglerApplicationCustomizer
  extends BaseApplicationCustomizer<IMonarchSidenavSearchTogglerApplicationCustomizerProperties> {

  public onInit(): Promise<void> {
    Log.info(LOG_SOURCE, `Initialized ${strings.Title}`);

    // Create a container div for the React component
    const customNavId = 'monarch-sidenav-search-toggler-root';
    let container = document.getElementById(customNavId);
    if (!container) {
      container = document.createElement('div');
      container.id = customNavId;
      document.body.appendChild(container);
    }

    ReactDOM.render(
      React.createElement(MonarchSidenavSearchToggler, { onToggle: () => {} }),
      container
    );

    return Promise.resolve();
  }

  public onDispose(): void {
    const customNavId = 'monarch-sidenav-search-toggler-root';
    const container = document.getElementById(customNavId);
    if (container) {
      ReactDOM.unmountComponentAtNode(container);
      container.remove();
    }
  }
}
