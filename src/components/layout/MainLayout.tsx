import React, { useState } from 'react';
import { Header } from './Header/Header';
import Sidebar from '../sidebar/Sidebar';
import { Menu, X } from 'lucide-react';
import { useThemeStore } from '../../state/themeStore';
import styles from './MainLayout.module.css';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { getResolvedTheme } = useThemeStore();

  const isDarkMode = getResolvedTheme() === 'dark';

  return (
    <div className={styles.layout} data-theme={isDarkMode ? 'dark' : 'light'}>
      <aside 
        className={`${styles.sidebar} ${isSidebarOpen ? styles.open : styles.closed}`}
        aria-label="Sidebar navigation"
      >
        <Sidebar onClose={() => setIsSidebarOpen(false)} />
      </aside>

      <main className={styles.main}>
        <div className={styles.headerContainer}>
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className={styles.sidebarToggle}
            aria-label={isSidebarOpen ? 'Close sidebar' : 'Open sidebar'}
            aria-expanded={isSidebarOpen}
          >
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <Header />
        </div>

        <div className={styles.content}>
          {children}
        </div>
      </main>
    </div>
  );
};

export default MainLayout;