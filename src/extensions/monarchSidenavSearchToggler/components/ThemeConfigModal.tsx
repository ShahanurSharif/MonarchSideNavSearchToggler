import * as React from 'react';
import { Modal } from '@fluentui/react/lib/Modal';
import { DefaultButton, PrimaryButton } from '@fluentui/react/lib/Button';
import { TextField } from '@fluentui/react/lib/TextField';
import { ColorPicker } from '@fluentui/react/lib/ColorPicker';
import { Dropdown, IDropdownOption } from '@fluentui/react/lib/Dropdown';
import { Separator } from '@fluentui/react/lib/Separator';
import { MessageBar, MessageBarType } from '@fluentui/react/lib/MessageBar';
import { IThemeConfig, DefaultTheme } from '../interfaces/INavigationInterfaces';
import styles from '../MonarchSidenavSearchToggler.module.scss';

export interface IThemeConfigModalProps {
  isVisible: boolean;
  theme: IThemeConfig;
  onSave: (theme: IThemeConfig) => void;
  onCancel: () => void;
  onReset: () => void;
}

export interface IThemeConfigModalState {
  formData: IThemeConfig;
  hasChanges: boolean;
  previewMode: boolean;
}

export class ThemeConfigModal extends React.Component<IThemeConfigModalProps, IThemeConfigModalState> {
  private readonly fontFamilyOptions: IDropdownOption[] = [
    { key: 'Segoe UI, system-ui, sans-serif', text: 'Segoe UI (Default)' },
    { key: 'Arial, sans-serif', text: 'Arial' },
    { key: 'Helvetica, sans-serif', text: 'Helvetica' },
    { key: 'Georgia, serif', text: 'Georgia' },
    { key: 'Times New Roman, serif', text: 'Times New Roman' },
    { key: 'Courier New, monospace', text: 'Courier New' },
    { key: 'Trebuchet MS, sans-serif', text: 'Trebuchet MS' },
    { key: 'Verdana, sans-serif', text: 'Verdana' }
  ];

  private readonly fontSizeOptions: IDropdownOption[] = [
    { key: '12px', text: '12px (Small)' },
    { key: '13px', text: '13px' },
    { key: '14px', text: '14px (Default)' },
    { key: '15px', text: '15px' },
    { key: '16px', text: '16px (Large)' },
    { key: '18px', text: '18px (Extra Large)' }
  ];

  private readonly borderRadiusOptions: IDropdownOption[] = [
    { key: '0px', text: '0px (Square)' },
    { key: '2px', text: '2px (Slight)' },
    { key: '4px', text: '4px (Default)' },
    { key: '6px', text: '6px (Rounded)' },
    { key: '8px', text: '8px (Very Rounded)' }
  ];

  private readonly sidebarWidthOptions: IDropdownOption[] = [
    { key: '250px', text: '250px (Narrow)' },
    { key: '300px', text: '300px (Default)' },
    { key: '350px', text: '350px (Wide)' },
    { key: '400px', text: '400px (Extra Wide)' }
  ];

  constructor(props: IThemeConfigModalProps) {
    super(props);

    this.state = {
      formData: { ...props.theme },
      hasChanges: false,
      previewMode: false
    };
  }

  public componentDidUpdate(prevProps: IThemeConfigModalProps): void {
    if (prevProps.isVisible !== this.props.isVisible) {
      this.setState({
        formData: { ...this.props.theme },
        hasChanges: false,
        previewMode: false
      });
    }
  }

  public render(): React.ReactElement<IThemeConfigModalProps> {
    const { isVisible, onCancel } = this.props;
    const { formData, hasChanges } = this.state;

    return (
      <Modal
        isOpen={isVisible}
        onDismiss={onCancel}
        isModeless={false}
        containerClassName="theme-config-modal"
        dragOptions={undefined}
      >
        <div className={styles.modalHeader}>
          <h2>Theme Configuration</h2>
          <DefaultButton 
            iconProps={{ iconName: 'Cancel' }}
            onClick={onCancel}
            className={styles.modalCloseBtn}
            ariaLabel="Close modal"
          />
        </div>

        <div className={styles.modalContent}>
          {hasChanges && (
            <MessageBar messageBarType={MessageBarType.info} className={styles.infoMessage}>
              Theme changes will be applied to the sidebar navigation.
            </MessageBar>
          )}



          <div className={`${styles.formSection} ${styles.themeFormSection}`}>
            <h3>Colors</h3>
            
            <div className={styles.colorSection}>
              <label>Primary Color</label>
              <ColorPicker
                color={formData.primaryColor}
                onChange={this.onPrimaryColorChange}
                alphaType="none"
                showPreview={true}
              />
              <TextField
                value={formData.primaryColor}
                onChange={this.onPrimaryColorTextChange}
                placeholder="#0078d4"
                styles={{ root: { width: '100px', marginTop: '8px' } }}
              />
            </div>

            <div className={styles.colorSection}>
              <label>Secondary Color</label>
              <ColorPicker
                color={formData.secondaryColor}
                onChange={this.onSecondaryColorChange}
                alphaType="none"
                showPreview={true}
              />
              <TextField
                value={formData.secondaryColor}
                onChange={this.onSecondaryColorTextChange}
                placeholder="#106ebe"
                styles={{ root: { width: '100px', marginTop: '8px' } }}
              />
            </div>

            <div className={styles.colorSection}>
              <label>Background Color</label>
              <ColorPicker
                color={formData.backgroundColor}
                onChange={this.onBackgroundColorChange}
                alphaType="none"
                showPreview={true}
              />
              <TextField
                value={formData.backgroundColor}
                onChange={this.onBackgroundColorTextChange}
                placeholder="#ffffff"
                styles={{ root: { width: '100px', marginTop: '8px' } }}
              />
            </div>

            <div className={styles.colorSection}>
              <label>Text Color</label>
              <ColorPicker
                color={formData.textColor}
                onChange={this.onTextColorChange}
                alphaType="none"
                showPreview={true}
              />
              <TextField
                value={formData.textColor}
                onChange={this.onTextColorTextChange}
                placeholder="#323130"
                styles={{ root: { width: '100px', marginTop: '8px' } }}
              />
            </div>

            <div className={styles.colorSection}>
              <label>Hover Color</label>
              <ColorPicker
                color={formData.hoverColor}
                onChange={this.onHoverColorChange}
                alphaType="none"
                showPreview={true}
              />
              <TextField
                value={formData.hoverColor}
                onChange={this.onHoverColorTextChange}
                placeholder="#f3f2f1"
                styles={{ root: { width: '100px', marginTop: '8px' } }}
              />
            </div>
          </div>

          <Separator />

          <div className={`${styles.formSection} ${styles.themeFormSection}`}>
            <h3>Typography</h3>
            
            <Dropdown
              label="Font Family"
              selectedKey={formData.fontFamily}
              onChange={this.onFontFamilyChange}
              options={this.fontFamilyOptions}
            />

            <Dropdown
              label="Font Size"
              selectedKey={formData.fontSize}
              onChange={this.onFontSizeChange}
              options={this.fontSizeOptions}
            />
          </div>

          <Separator />

          <div className={`${styles.formSection} ${styles.themeFormSection}`}>
            <h3>Layout</h3>
            
            <Dropdown
              label="Border Radius"
              selectedKey={formData.borderRadius}
              onChange={this.onBorderRadiusChange}
              options={this.borderRadiusOptions}
            />

            <Dropdown
              label="Sidebar Width"
              selectedKey={formData.sidebarWidth}
              onChange={this.onSidebarWidthChange}
              options={this.sidebarWidthOptions}
            />
          </div>
        </div>

        <div className={styles.modalFooter}>
          <PrimaryButton
            text="Save Theme"
            onClick={this.onSave}
            disabled={!hasChanges}
          />
          <DefaultButton
            text="Reset to Default"
            onClick={this.onResetToDefault}
            styles={{ root: { marginLeft: '8px' } }}
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



  private onPrimaryColorChange = (ev: React.SyntheticEvent<HTMLElement>, color: { str: string }): void => {
    this.updateThemeProperty('primaryColor', color.str);
  };

  private onPrimaryColorTextChange = (event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newValue?: string): void => {
    if (newValue && this.isValidColor(newValue)) {
      this.updateThemeProperty('primaryColor', newValue);
    }
  };

  private onSecondaryColorChange = (ev: React.SyntheticEvent<HTMLElement>, color: { str: string }): void => {
    this.updateThemeProperty('secondaryColor', color.str);
  };

  private onSecondaryColorTextChange = (event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newValue?: string): void => {
    if (newValue && this.isValidColor(newValue)) {
      this.updateThemeProperty('secondaryColor', newValue);
    }
  };

  private onBackgroundColorChange = (ev: React.SyntheticEvent<HTMLElement>, color: { str: string }): void => {
    this.updateThemeProperty('backgroundColor', color.str);
  };

  private onBackgroundColorTextChange = (event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newValue?: string): void => {
    if (newValue && this.isValidColor(newValue)) {
      this.updateThemeProperty('backgroundColor', newValue);
    }
  };

  private onTextColorChange = (ev: React.SyntheticEvent<HTMLElement>, color: { str: string }): void => {
    this.updateThemeProperty('textColor', color.str);
  };

  private onTextColorTextChange = (event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newValue?: string): void => {
    if (newValue && this.isValidColor(newValue)) {
      this.updateThemeProperty('textColor', newValue);
    }
  };

  private onHoverColorChange = (ev: React.SyntheticEvent<HTMLElement>, color: { str: string }): void => {
    this.updateThemeProperty('hoverColor', color.str);
  };

  private onHoverColorTextChange = (event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newValue?: string): void => {
    if (newValue && this.isValidColor(newValue)) {
      this.updateThemeProperty('hoverColor', newValue);
    }
  };

  private onFontFamilyChange = (event: React.FormEvent<HTMLDivElement>, option?: IDropdownOption): void => {
    if (option) {
      this.updateThemeProperty('fontFamily', option.key as string);
    }
  };

  private onFontSizeChange = (event: React.FormEvent<HTMLDivElement>, option?: IDropdownOption): void => {
    if (option) {
      this.updateThemeProperty('fontSize', option.key as string);
    }
  };

  private onBorderRadiusChange = (event: React.FormEvent<HTMLDivElement>, option?: IDropdownOption): void => {
    if (option) {
      this.updateThemeProperty('borderRadius', option.key as string);
    }
  };

  private onSidebarWidthChange = (event: React.FormEvent<HTMLDivElement>, option?: IDropdownOption): void => {
    if (option) {
      this.updateThemeProperty('sidebarWidth', option.key as string);
    }
  };

  private updateThemeProperty(property: keyof IThemeConfig, value: string): void {
    this.setState(prevState => ({
      formData: {
        ...prevState.formData,
        [property]: value
      },
      hasChanges: true
    }));
  }

  private isValidColor(color: string): boolean {
    return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
  }

  private onSave = (): void => {
    this.props.onSave(this.state.formData);
  };

  private onResetToDefault = (): void => {
    this.setState({
      formData: { ...DefaultTheme },
      hasChanges: true
    });
  };
} 