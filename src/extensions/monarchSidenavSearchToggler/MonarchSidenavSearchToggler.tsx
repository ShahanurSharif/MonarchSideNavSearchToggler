import * as React from 'react';
import styles from './MonarchSidenavSearchToggler.module.scss';

interface MonarchSidenavSearchTogglerProps {
  onToggle: () => void;
}

const MonarchSidenavSearchToggler: React.FC<MonarchSidenavSearchTogglerProps> = ({ onToggle }): JSX.Element => {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState('');

  const handleToggle = () => {
    setOpen(!open);
    onToggle();
  };

  return (
    <div className={styles.sidenavContainer}>
      <button className={styles.toggler} onClick={handleToggle} aria-label={open ? 'Close navigation' : 'Open navigation'}>
        {open ? '✖' : '☰'}
      </button>
      {open && (
        <nav className={styles.sidenav} aria-label="Side navigation">
          <input
            className={styles.search}
            type="text"
            placeholder="Search..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            aria-label="Search navigation"
          />
          {/* Add nav items here */}
          <ul className={styles.navList}>
            <li>Home</li>
            <li>About</li>
            <li>Contact</li>
          </ul>
        </nav>
      )}
    </div>
  );
};

export default MonarchSidenavSearchToggler;
