import React, { useState } from 'react';
import { useWorkspaceStore } from '../../../state/workspaceStore';
import { useThemeStore } from '../../../state/themeStore';
import Button from '../../button/Button';
import { Sparkles, ChevronDown, Sun, Moon, Monitor } from 'lucide-react';
import styles from './Header.module.css';

export const Header: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [editingTitle, setEditingTitle] = useState('');

  const workspace = useWorkspaceStore((state) => state.workspace);
  const setWorkspaceTitle = useWorkspaceStore((state) => state.setWorkspaceTitle);
  const { theme, setTheme, getResolvedTheme } = useThemeStore();

  const activePage = workspace.pages.find((p) => p.id === workspace.activePageId);

  const handleTitleSave = () => {
    if (editingTitle.trim()) {
      setWorkspaceTitle(editingTitle);
    }
    setIsEditing(false);
  };

  const handleThemeToggle = () => {
    const themes: Array<'light' | 'dark' | 'system'> = ['light', 'dark', 'system'];
    const currentIndex = themes.indexOf(theme);
    const nextTheme = themes[(currentIndex + 1) % themes.length];
    setTheme(nextTheme);
  };

  const getThemeIcon = () => {
    if (theme === 'system') return <Monitor size={16} />;
    return getResolvedTheme() === 'dark' ? <Sun size={16} /> : <Moon size={16} />;
  };

  const getThemeLabel = () => {
    if (theme === 'system') return 'System';
    return theme === 'dark' ? 'Dark' : 'Light';
  };

  return (
    <header className={styles.header}>
      <div className={styles.leftSection}>
        <div className={styles.workspaceTitle}>
          {isEditing ? (
            <input
              type="text"
              value={editingTitle}
              onChange={(e) => setEditingTitle(e.target.value)}
              onBlur={handleTitleSave}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleTitleSave();
                if (e.key === 'Escape') setIsEditing(false);
              }}
              className={styles.titleInput}
              autoFocus
            />
          ) : (
            <button
              onClick={() => {
                setIsEditing(true);
                setEditingTitle(workspace.title);
              }}
              className={styles.titleButton}
              aria-label={`Edit workspace title: ${workspace.title}`}
            >
              <Sparkles size={20} className={styles.sparkleIcon} />
              <h1 className={styles.title}>{workspace.title}</h1>
            </button>
          )}
        </div>

        {activePage && (
          <div className={styles.activePage}>
            <ChevronDown size={16} className={styles.pageChevron} />
            <span className={styles.pageIcon}>{activePage.icon}</span>
            <span className={styles.pageTitle}>{activePage.title}</span>
          </div>
        )}
      </div>

      <div className={styles.rightSection}>
        <Button
          variant="ghost"
          size="small"
          icon={getThemeIcon()}
          onClick={handleThemeToggle}
          aria-label={`Switch theme, current: ${getThemeLabel()}`}
          className={styles.themeButton}
        >
          <span className={styles.themeLabel}>{getThemeLabel()}</span>
        </Button>
      </div>
    </header>
  );
};