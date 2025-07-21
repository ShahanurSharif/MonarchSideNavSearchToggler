import * as React from 'react';
import { Modal } from '@fluentui/react/lib/Modal';
import { DefaultButton, PrimaryButton } from '@fluentui/react/lib/Button';
import { TextField } from '@fluentui/react/lib/TextField';
import { Toggle } from '@fluentui/react/lib/Toggle';
import { Slider } from '@fluentui/react/lib/Slider';
import { Dropdown } from '@fluentui/react/lib/Dropdown';
import { IThemeConfig } from '../interfaces/INavigationInterfaces';
import styles from '../MonarchSidenavSearchToggler.module.scss';

export interface IThemeSettingsModalProps {
  isVisible: boolean;
  theme: IThemeConfig;
  sidebarPosition: 'left' | 'right';
  onSave: (theme: IThemeConfig, sidebarPosition: 'left' | 'right') => void;
  onCancel: () => void;
  onReset: () => void;
  onThemeChange?: (theme: IThemeConfig, sidebarPosition: 'left' | 'right') => void; // For reactive updates without saving
}

export interface IThemeSettingsModalState {
  formData: IThemeConfig;
  hasChanges: boolean;
  sidebarPosition: 'left' | 'right';
}

export class ThemeSettingsModal extends React.Component<IThemeSettingsModalProps, IThemeSettingsModalState> {
  constructor(props: IThemeSettingsModalProps) {
    super(props);
    this.state = {
      formData: { ...props.theme },
      hasChanges: false,
      sidebarPosition: props.sidebarPosition
    };
  }

  public componentDidUpdate(prevProps: IThemeSettingsModalProps): void {
    if (prevProps.isVisible !== this.props.isVisible && this.props.isVisible) {
      // Modal is opening, reset form data and changes
      this.setState({
        formData: { ...this.props.theme },
        hasChanges: false
      });
    } else if (prevProps.theme !== this.props.theme && !this.state.hasChanges) {
      // Theme changed externally and we don't have local changes, update form data
      this.setState({
        formData: { ...this.props.theme }
      });
    }
  }

  public render(): React.ReactElement<IThemeSettingsModalProps> {
    const { isVisible, onCancel } = this.props;
    const { formData, hasChanges, sidebarPosition } = this.state;

    return (
      <Modal
        isOpen={isVisible}
        onDismiss={onCancel}
        isModeless={false}
        containerClassName="theme-settings-modal"
        dragOptions={undefined}
      >
        <div className={styles.modalHeader}>
          <h2>Theme Settings</h2>
          <DefaultButton 
            iconProps={{ iconName: 'Cancel' }}
            onClick={onCancel}
            className={styles.modalCloseBtn}
            ariaLabel="Close modal"
          />
        </div>

        <div className={styles.modalContent}>
          <div className={styles.formSection}>
            <div className={styles.colorSection}>
              <label>Background Color</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                <input
                  type="color"
                  value={formData.backgroundColor}
                  onChange={e => this.updateTheme('backgroundColor', e.target.value)}
                  style={{ width: '40px', height: '32px', border: '1px solid #d2d0ce', borderRadius: '4px' }}
                />
                <TextField
                  value={formData.backgroundColor}
                  onChange={(e, newValue) => this.updateTheme('backgroundColor', newValue || '')}
                  styles={{ root: { flex: 1 } }}
                />
              </div>
            </div>

            <div className={styles.colorSection}>
              <label>Text Color</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                <input
                  type="color"
                  value={formData.textColor}
                  onChange={e => this.updateTheme('textColor', e.target.value)}
                  style={{ width: '40px', height: '32px', border: '1px solid #d2d0ce', borderRadius: '4px' }}
                />
                <TextField
                  value={formData.textColor}
                  onChange={(e, newValue) => this.updateTheme('textColor', newValue || '')}
                  styles={{ root: { flex: 1 } }}
                />
              </div>
            </div>

            <div className={styles.colorSection}>
              <label>Text Size ({formData.fontSize})</label>
              <Slider
                min={10}
                max={20}
                step={1}
                value={parseInt((formData.fontSize || '14px').replace('px', ''), 10)}
                onChange={(value) => this.updateTheme('fontSize', `${value}px`)}
                showValue={false}
                styles={{ root: { marginTop: '8px' } }}
              />
            </div>

            <div className={styles.colorSection}>
              <label>Padding (Top/Bottom) ({formData.paddingTopBottom})</label>
              <Slider
                min={2}
                max={10}
                step={1}
                value={parseInt((formData.paddingTopBottom || '8px').replace('px', ''), 10)}
                onChange={(value) => this.updateTheme('paddingTopBottom', `${value}px`)}
                showValue={false}
                styles={{ root: { marginTop: '8px' } }}
              />
            </div>

            <div className={styles.colorSection}>
              <Toggle
                label="Enable Border"
                checked={formData.borderEnabled}
                onText="On"
                offText="Off"
                onChange={(e, checked) => this.updateTheme('borderEnabled', checked || false)}
              />
            </div>

            {formData.borderEnabled && (
              <div className={styles.colorSection}>
                <label>Border Color</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                  <input
                    type="color"
                    value={formData.borderColor}
                    onChange={e => this.updateTheme('borderColor', e.target.value)}
                    style={{ width: '40px', height: '32px', border: '1px solid #d2d0ce', borderRadius: '4px' }}
                  />
                  <TextField
                    value={formData.borderColor}
                    onChange={(e, newValue) => this.updateTheme('borderColor', newValue || '')}
                    styles={{ root: { flex: 1 } }}
                  />
                </div>
              </div>
            )}

            <div className={styles.colorSection}>
              <label>Sidebar Position</label>
              <Dropdown
                options={[
                  { key: 'left', text: 'Left' },
                  { key: 'right', text: 'Right' }
                ]}
                selectedKey={sidebarPosition}
                onChange={(_, option) => this.handleSidebarPositionChange(option?.key as 'left' | 'right')}
                styles={{ root: { width: 180, marginTop: 4 } }}
              />
            </div>

            <div className={styles.colorSection}>
              <h3>Logo & Site Settings</h3>
            </div>

            <div className={styles.colorSection}>
              <label>Logo Upload</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                <input
                  type="file"
                  accept="image/*"
                  onChange={this.handleLogoUpload}
                  style={{ flex: 1 }}
                />
                {formData.logoUrl && (
                  <DefaultButton
                    text="Delete"
                    onClick={() => this.updateTheme('logoUrl', '')}
                    styles={{ root: { minWidth: 'auto' } }}
                  />
                )}
              </div>
              {formData.logoUrl && (
                <div style={{ marginTop: '8px', textAlign: 'center' }}>
                  <img 
                    src={formData.logoUrl} 
                    alt="Logo preview" 
                    style={{ 
                      maxWidth: '100px', 
                      maxHeight: '60px', 
                      border: '1px solid #d2d0ce',
                      borderRadius: '4px'
                    }} 
                  />
                </div>
              )}
            </div>

            <div className={styles.colorSection}>
              <label>Logo Size ({formData.logoSize})</label>
              <Slider
                min={30}
                max={100}
                step={5}
                value={parseInt((formData.logoSize || '40px').replace('px', ''), 10)}
                onChange={(value) => this.updateTheme('logoSize', `${value}px`)}
                showValue={false}
                styles={{ root: { marginTop: '8px' } }}
              />
            </div>

            <div className={styles.colorSection}>
              <label>Site Name</label>
              <TextField
                value={formData.siteName}
                onChange={(e, newValue) => this.updateTheme('siteName', newValue || '')}
                placeholder="Enter site name"
                styles={{ root: { marginTop: '4px' } }}
              />
            </div>

            <div className={styles.colorSection}>
              <label>Site URL</label>
              <TextField
                value={formData.siteUrl}
                onChange={(e, newValue) => this.updateTheme('siteUrl', newValue || '')}
                placeholder="https://example.com"
                styles={{ root: { marginTop: '4px' } }}
              />
            </div>
          </div>
        </div>

        <div className={styles.modalFooter}>
          <div style={{ marginRight: 'auto' }}>
            <DefaultButton
              text="Reset to Default"
              onClick={this.props.onReset}
            />
          </div>
          <PrimaryButton
            text="Save Changes"
            onClick={this.onSave}
            disabled={!hasChanges}
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

  private updateTheme = (key: keyof IThemeConfig, value: string | boolean): void => {
    const updatedTheme = {
      ...this.state.formData,
      [key]: value
    };
    this.setState({
      formData: updatedTheme,
      hasChanges: true
    });
    if (this.props.onThemeChange) {
      this.props.onThemeChange(updatedTheme, this.state.sidebarPosition);
    }
  };

  private handleSidebarPositionChange = (position: 'left' | 'right') => {
    this.setState({ sidebarPosition: position, hasChanges: true });
    if (this.props.onThemeChange) {
      this.props.onThemeChange(this.state.formData, position);
    }
  };

  private handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        this.updateTheme('logoUrl', result);
      };
      reader.readAsDataURL(file);
    }
  };

  private onSave = (): void => {
    this.props.onSave(this.state.formData, this.state.sidebarPosition);
  };
} 