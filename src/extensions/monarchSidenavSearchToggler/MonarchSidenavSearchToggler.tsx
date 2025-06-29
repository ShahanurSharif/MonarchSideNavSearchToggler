import * as React from 'react';
import styles from './MonarchSidenavSearchToggler.module.scss';

export interface IMonarchSidenavSearchTogglerProps {
  description: string;
}

export default class MonarchSidenavSearchToggler extends React.Component<IMonarchSidenavSearchTogglerProps, { isOpen: boolean }> {
  constructor(props: IMonarchSidenavSearchTogglerProps) {
    super(props);
    this.state = { isOpen: false };
  }

  public componentDidMount(): void {
    this.injectToggleButton();
    this.injectSidebar();
  }

  public componentWillUnmount(): void {
    this.cleanup();
  }

  private injectToggleButton(): void {
    const buttonContainer = document.createElement('div');
    buttonContainer.id = 'monarch-sidenav-button-container';
    buttonContainer.className = styles.buttonContainer;
    
    buttonContainer.innerHTML = `
      <button id="monarch-sidenav-toggle" class="${styles.toggleButton}" aria-label="Toggle Navigation">
        <span class="${styles.hamburger}">
          <span></span>
          <span></span>
          <span></span>
        </span>
      </button>
    `;

    document.body.appendChild(buttonContainer);

    const toggleButton = document.getElementById('monarch-sidenav-toggle');
    if (toggleButton) {
      toggleButton.addEventListener('click', this.handleToggle);
    }
  }

  private injectSidebar(): void {
    const sidebarContainer = document.createElement('div');
    sidebarContainer.id = 'monarch-sidenav-sidebar-container';
    sidebarContainer.className = styles.sidebarContainer;
    
    sidebarContainer.innerHTML = `
      <div class="${styles.sidebar}">
        <div class="${styles.sidebarHeader}">
          <h2>Browse all articles</h2>
          <button id="monarch-sidenav-close" class="${styles.closeButton}" aria-label="Close Navigation">✖</button>
        </div>
        <div class="${styles.searchContainer}">
          <input type="text" placeholder="Search articles..." class="${styles.searchInput}" />
        </div>
        <nav class="${styles.navigation}">
          <ul class="${styles.navList}">
            <li class="${styles.navItem}">
              <a href="#" class="${styles.navLink}">Home</a>
            </li>
            <li class="${styles.navItem}">
              <div class="${styles.navCategory}">
                <span class="${styles.categoryTitle}">IT Support</span>
                <ul class="${styles.subNavList}">
                  <li class="${styles.subNavItem}">
                    <a href="#" class="${styles.subNavLink}">Printer Connection</a>
                  </li>
                  <li class="${styles.subNavItem}">
                    <a href="#" class="${styles.subNavLink}">Password Reset</a>
                  </li>
                  <li class="${styles.subNavItem}">
                    <a href="#" class="${styles.subNavLink}">VPN Access</a>
                  </li>
                  <li class="${styles.subNavItem}">
                    <a href="#" class="${styles.subNavLink}">MFA Setup</a>
                  </li>
                </ul>
              </div>
            </li>
            <li class="${styles.navItem}">
              <div class="${styles.navCategory}">
                <span class="${styles.categoryTitle}">Human Resources</span>
                <ul class="${styles.subNavList}">
                  <li class="${styles.subNavItem}">
                    <a href="#" class="${styles.subNavLink}">Expense Reimbursement</a>
                  </li>
                  <li class="${styles.subNavItem}">
                    <a href="#" class="${styles.subNavLink}">Time Off Requests</a>
                  </li>
                </ul>
              </div>
            </li>
          </ul>
        </nav>
      </div>
    `;

    document.body.appendChild(sidebarContainer);

    const closeButton = document.getElementById('monarch-sidenav-close');
    if (closeButton) {
      closeButton.addEventListener('click', this.handleToggle);
    }
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

  private handleToggle = (): void => {
    const newIsOpen = !this.state.isOpen;
    this.setState({ isOpen: newIsOpen });

    const buttonContainer = document.getElementById('monarch-sidenav-button-container');
    const sidebarContainer = document.getElementById('monarch-sidenav-sidebar-container');
    
    // Target SPPageChrome specifically
    const spPageChrome = document.getElementById('SPPageChrome');
    
    const sidebarWidth = this.getSidebarWidth();
    const contentWidth = this.getContentWidth();

    if (newIsOpen) {
      // Open sidebar
      if (sidebarContainer) {
        sidebarContainer.style.left = '0%';
      }
      
      // Push SPPageChrome to the right
      if (spPageChrome) {
        spPageChrome.style.marginLeft = sidebarWidth;
        spPageChrome.style.width = contentWidth;
        spPageChrome.style.transition = 'margin-left 0.3s ease, width 0.3s ease';
      }
      
      // Move toggle button
      if (buttonContainer) {
        buttonContainer.style.left = `calc(${sidebarWidth} + 20px)`;
      }
    } else {
      // Close sidebar
      if (sidebarContainer) {
        sidebarContainer.style.left = `-${sidebarWidth}`;
      }
      
      // Reset SPPageChrome position
      if (spPageChrome) {
        spPageChrome.style.marginLeft = '0px';
        spPageChrome.style.width = '100%';
        spPageChrome.style.transition = 'margin-left 0.3s ease, width 0.3s ease';
      }
      
      // Reset toggle button position
      if (buttonContainer) {
        buttonContainer.style.left = '20px';
      }
    }
  };

  private cleanup(): void {
    const buttonContainer = document.getElementById('monarch-sidenav-button-container');
    const sidebarContainer = document.getElementById('monarch-sidenav-sidebar-container');
    
    if (buttonContainer) {
      buttonContainer.remove();
    }
    
    if (sidebarContainer) {
      sidebarContainer.remove();
    }

    // Reset SPPageChrome if it was modified
    const spPageChrome = document.getElementById('SPPageChrome');
    if (spPageChrome) {
      spPageChrome.style.marginLeft = '';
      spPageChrome.style.width = '';
      spPageChrome.style.transition = '';
    }
  }

  public render(): React.ReactElement<IMonarchSidenavSearchTogglerProps> {
    return <div style={{ display: 'none' }} />;
  }
}
