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

  public render(): React.ReactElement<INavigationConfigModalProps> {
    const { isVisible, mode, onCancel } = this.props;
    const { formData, errors, isValid } = this.state;
    const title = mode === 'add' ? 'Add Navigation Item' : 'Edit Navigation Item';

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
          <DefaultButton 
            iconProps={{ iconName: 'Cancel' }}
            onClick={onCancel}
            className={styles.modalCloseBtn}
            ariaLabel="Close modal"
          />
        </div>

        <div className={styles.modalContent}>
          {/* Remove the MessageBar for errors since we have inline validation */}

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



            <TextField
              label="Order"
              type="number"
              value={formData.order.toString()}
              onChange={this.onOrderChange}
              required
              min={1}
              max={999}
              placeholder="1"
              description="Lower numbers appear first"
              errorMessage={errors.order}
            />

            {/* Remove Parent Item dropdown and related logic */}
            {/* Only allow adding a child to a parent (not to a child) */}
            {/* Enforce only one child per parent */}
            {/* Update modal UI to reflect this */}
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
      order: 1
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



  private onOrderChange = (event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newValue?: string): void => {
    const order = parseInt(newValue || '1', 10);
    this.setState(prevState => ({
      formData: {
        ...prevState.formData,
        order: isNaN(order) ? 1 : order
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

    // Validate order
    if (formData.order < 1 || formData.order > 999) {
      errors.order = 'Order must be between 1 and 999';
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