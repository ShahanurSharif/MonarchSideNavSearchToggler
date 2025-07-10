import * as React from 'react';
import { Modal } from '@fluentui/react/lib/Modal';
import { DefaultButton, PrimaryButton } from '@fluentui/react/lib/Button';
import { TextField } from '@fluentui/react/lib/TextField';
import { Toggle } from '@fluentui/react/lib/Toggle';
import { Slider } from '@fluentui/react/lib/Slider';
import { IThemeConfig } from '../interfaces/INavigationInterfaces';
import styles from '../MonarchSidenavSearchToggler.module.scss';

export interface IThemeSettingsModalProps {
  isVisible: boolean;
  theme: IThemeConfig;
  onSave: (theme: IThemeConfig) => void;
  onCancel: () => void;
  onReset: () => void;
  onThemeChange?: (theme: IThemeConfig) => void; // For reactive updates without saving
}

export interface IThemeSettingsModalState {
  formData: IThemeConfig;
  hasChanges: boolean;
}

export class ThemeSettingsModal extends React.Component<IThemeSettingsModalProps, IThemeSettingsModalState> {
  constructor(props: IThemeSettingsModalProps) {
    super(props);
    this.state = {
      formData: { ...props.theme },
      hasChanges: false
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
    const { formData, hasChanges } = this.state;

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

    // Call onThemeChange for reactive updates without saving
    if (this.props.onThemeChange) {
      this.props.onThemeChange(updatedTheme);
    }
  };

  private onSave = (): void => {
    this.props.onSave(this.state.formData);
  };
} 