import * as React from 'react';
import { Modal } from '@fluentui/react/lib/Modal';
import { DefaultButton, PrimaryButton } from '@fluentui/react/lib/Button';
import { TextField } from '@fluentui/react/lib/TextField';
import { IDropdownOption } from '@fluentui/react/lib/Dropdown';
import styles from '../MonarchSidenavSearchToggler.module.scss';

// Use the same NavItem interface as the main component
export interface NavItem {
  id: string;
  title: string;
  url: string;
  order: number;
  children?: NavItem[];
  openIn?: string;
}

export interface INavigationConfigModalProps {
  isVisible: boolean;
  mode: 'add' | 'edit';
  item?: NavItem;
  parentOptions: IDropdownOption[];
  onSave: (item: NavItem, parentId?: string) => void;
  onCancel: () => void;
}

export interface INavigationConfigModalState {
  formData: NavItem;
  parentId?: string;
  errors: { [key: string]: string };
  isValid: boolean;
}

export class NavigationConfigModal extends React.Component<INavigationConfigModalProps, INavigationConfigModalState> {


  constructor(props: INavigationConfigModalProps) {
    super(props);

    this.state = {
      formData: this.initializeFormData(),
      parentId: undefined,
      errors: {},
      isValid: false
    };
  }

  public componentDidUpdate(prevProps: INavigationConfigModalProps): void {
    if (prevProps.isVisible !== this.props.isVisible || 
        prevProps.item !== this.props.item || 
        prevProps.mode !== this.props.mode) {
      
      this.setState({
        formData: this.initializeFormData(),
        parentId: undefined,
        errors: {},
        isValid: false
      }, () => {
        this.validateForm();
      });
    }
  }

  // Returns true if the modal is in "add child" mode
  private isChildForm(): boolean {
    return this.props.mode === 'add' && !!this.state.parentId;
  }

  // Returns true if the current item is a root-level parent and can have children added
  private canAddChild(): boolean {
    const { mode, item, parentOptions } = this.props;
    // Only show for root-level items (item.id in parentOptions) and not for children
    return (
      mode === 'edit' &&
      !!item &&
      parentOptions.some(opt => String(opt.key) === String(item.id)) &&
      (!item.children || Array.isArray(item.children)) &&
      !this.state.parentId // Don't show if already in child add mode
    );
  }

  // Switches the modal to "add child" mode for the current parent
  private onAddChild = (): void => {
    const parentId = this.props.item?.id;
    if (parentId) {
      this.setState({
        formData: {
          id: '',
          title: '',
          url: '',
          order: 1,
          openIn: 'same' // Ensure openIn is set for new child
        },
        parentId,
        errors: {},
        isValid: false
      }, this.validateForm); // Validate form after switching to child mode
    }
  };

  public render(): React.ReactElement<INavigationConfigModalProps> {
    const { isVisible, mode, onCancel } = this.props;
    const { formData, errors, isValid } = this.state;
    const title = mode === 'add' ? 'Add Navigation' : 'Edit Navigation';
    const showAddChild = this.canAddChild() && !this.isChildForm();
    const openInOptions = [
      { key: 'same', text: 'Same tab (default)' },
      { key: 'new', text: 'New tab' }
    ];
    const openIn = this.state.formData.openIn || 'same';

    return (
      <Modal
        isOpen={isVisible}
        onDismiss={onCancel}
        isModeless={false}
        containerClassName="nav-config-modal"
        dragOptions={undefined}
      >
        <div className={styles.modalHeader}>
          <h2>{title}</h2>
          {/* Remove the close button icon and replace with Add Child button if applicable */}
          {showAddChild && (
            <button
              style={{
                backgroundColor: '#f3f2f1',
                color: '#323130',
                border: '1px solid #d2d0ce',
                borderRadius: 2,
                padding: '4px 12px',
                fontSize: 12,
                cursor: 'pointer',
                fontWeight: 400
              }}
              onClick={this.onAddChild}
              title="Add a child item to this navigation"
            >
              📁 Add Child
            </button>
          )}
        </div>
        <div className={styles.modalContent}>
          <div className={styles.formSection}>
            <TextField
              label="Title"
              value={formData.title}
              onChange={this.onTitleChange}
              required
              placeholder="Enter navigation item title"
              errorMessage={errors.title}
            />
            <TextField
              label="URL"
              value={formData.url}
              onChange={this.onUrlChange}
              required
              placeholder="https://example.com or /relative/path"
              errorMessage={errors.url}
            />
            {/* Open In Dropdown */}
            <div style={{ marginTop: 12 }}>
              <label style={{ fontWeight: 500, marginBottom: 4, display: 'block' }}>Open in:</label>
              <select
                value={openIn}
                onChange={e => this.setState(prev => ({
                  formData: { ...prev.formData, openIn: e.target.value }
                }), this.validateForm)}
                style={{ width: '100%', padding: 6, borderRadius: 2, border: '1px solid #d2d0ce' }}
              >
                {openInOptions.map(opt => (
                  <option key={opt.key} value={opt.key}>{opt.text}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
        <div className={styles.modalFooter}>
          <PrimaryButton
            text={mode === 'add' ? 'Add Item' : 'Save Changes'}
            onClick={this.onSave}
            disabled={!isValid}
          />
          <DefaultButton
            text="Cancel"
            onClick={onCancel}
            styles={{ root: { marginLeft: '8px' } }}
          />
        </div>
      </Modal>
    );
  }

  private initializeFormData(): NavItem {
    if (this.props.mode === 'edit' && this.props.item) {
      return { ...this.props.item };
    }
    return {
      id: '',
      title: '',
      url: '',
      order: 1,
      openIn: 'same'
    };
  }

  private onTitleChange = (event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newValue?: string): void => {
    this.setState(prevState => ({
      formData: {
        ...prevState.formData,
        title: newValue || ''
      }
    }), this.validateForm);
  };

  private onUrlChange = (event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newValue?: string): void => {
    this.setState(prevState => ({
      formData: {
        ...prevState.formData,
        url: newValue || ''
      }
    }), this.validateForm);
  };

  private validateForm = (): void => {
    const { formData } = this.state;
    const errors: { [key: string]: string } = {};

    // Validate title
    if (!formData.title.trim()) {
      errors.title = 'Title is required';
    } else if (formData.title.length > 50) {
      errors.title = 'Title must be 50 characters or less';
    }

    // Validate URL
    if (!formData.url.trim()) {
      errors.url = 'URL is required';
    } else {
      const url = formData.url.trim();
      // Check if it's a valid URL or relative path
      if (!this.isValidUrl(url) && !this.isValidRelativePath(url)) {
        errors.url = 'Please enter a valid URL (https://...) or relative path (/path)';
      }
    }

    const isValid = Object.keys(errors).length === 0;

    this.setState({
      errors,
      isValid
    });
  };

  private isValidUrl(url: string): boolean {
    try {
      const urlObj = new URL(url);
      return !!urlObj;
    } catch {
      return false;
    }
  }

  private isValidRelativePath(path: string): boolean {
    return path.startsWith('/') && path.length > 1;
  }

  private onSave = (): void => {
    if (this.state.isValid) {
      const { formData, parentId } = this.state;
      
      // Generate ID for new items
      if (this.props.mode === 'add' && !formData.id) {
        formData.id = `nav-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      }

      this.props.onSave(formData, parentId || undefined);
    }
  };
}