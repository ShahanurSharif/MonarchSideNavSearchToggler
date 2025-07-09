import * as React from 'react';
import styles from '../MonarchSidenavSearchToggler.module.scss';

interface SidebarToggleButtonProps {
  isOpen: boolean;
  top: number;
  onToggle: () => void;
  onDrag: (newTop: number) => void;
  sidebarWidth?: number;
}

export const SidebarToggleButton: React.FC<SidebarToggleButtonProps> = ({
  isOpen,
  top,
  onToggle,
  onDrag,
  sidebarWidth = 300
}) => {
  const btnRef = React.useRef<HTMLButtonElement>(null);
  const dragState = React.useRef({ isDragging: false, dragMoved: false });

  React.useEffect((): (() => void) => {
    let startY = 0;
    let startTop = 0;

    const onMouseDown = (e: MouseEvent): void => {
      dragState.current.isDragging = true;
      dragState.current.dragMoved = false;
      startY = e.clientY;
      startTop = top;
      document.body.style.userSelect = 'none';
    };

    const onMouseMove = (e: MouseEvent): void => {
      if (!dragState.current.isDragging) return;
      const deltaY = e.clientY - startY;
      let newTop = startTop + deltaY;
      newTop = Math.max(0, Math.min(window.innerHeight - 48, newTop));
      onDrag(newTop);
      dragState.current.dragMoved = true;
    };

    const onMouseUp = (): void => {
      dragState.current.isDragging = false;
      document.body.style.userSelect = '';
    };

    const btn = btnRef.current;
    if (btn) {
      btn.addEventListener('mousedown', onMouseDown);
    }
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    return (): void => {
      if (btn) btn.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [top, onDrag]);

  // Prevent click after drag
  const handleClick = (e: React.MouseEvent): void => {
    if (dragState.current.dragMoved) {
      e.preventDefault();
      e.stopPropagation();
      dragState.current.dragMoved = false;
      return;
    }
    onToggle();
  };

  return (
    <button
      ref={btnRef}
      className={styles.sidebarToggleButton}
      style={{
        position: 'fixed',
        top,
        left: isOpen ? sidebarWidth : 0,
        zIndex: 2001,
        background: 'rgba(243, 242, 241, 0.5)',
        border: 0,
        borderRadius: 2,
        minWidth: 21,
        minHeight: 48,
        width: 23,
        height: 48,
        padding: '0 2px',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'flex-start',
        boxSizing: 'border-box',
        color: '#323130',
        userSelect: 'none',
        cursor: 'grab',
        transition: 'left 0.3s',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
      }}
      aria-label={isOpen ? 'Close sidebar' : 'Open sidebar'}
      onClick={handleClick}
      type="button"
    >
      {isOpen ? '←' : '☰'}
    </button>
  );
}; 