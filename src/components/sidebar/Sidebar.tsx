import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWorkspaceStore } from '../../state/workspaceStore';
import { useThemeStore } from '../../state/themeStore';
import { EMOJI_ICONS } from '../../constants/config';
import { Plus, Trash2, Moon, Sun, Monitor, X } from 'lucide-react';
import { slideInVariants, itemVariants } from '../../utils/animations';

interface SidebarProps {
  onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onClose }) => {
  const [editingPageId, setEditingPageId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState<string>(EMOJI_ICONS[0]);

  const workspace = useWorkspaceStore((state) => state.workspace);
  const addPage = useWorkspaceStore((state) => state.addPage);
  const removePage = useWorkspaceStore((state) => state.removePage);
  const renamePage = useWorkspaceStore((state) => state.renamePage);
  const setActivePage = useWorkspaceStore((state) => state.setActivePage);
  
  const { theme, setTheme, getResolvedTheme } = useThemeStore();
  const darkMode = getResolvedTheme() === 'dark';

  const handleAddPage = () => {
    addPage(`New Page ${workspace.pages.length + 1}`, selectedEmoji);
    setSelectedEmoji(EMOJI_ICONS[Math.floor(Math.random() * EMOJI_ICONS.length)]);
  };

  const handleRenamePage = (pageId: string, currentTitle: string) => {
    setEditingPageId(pageId);
    setEditingTitle(currentTitle);
  };

  const handleSavePage = () => {
    if (editingPageId && editingTitle.trim()) {
      renamePage(editingPageId, editingTitle);
    }
    setEditingPageId(null);
  };

  const getThemeIcon = () => {
    if (theme === 'system') return <Monitor size={16} />;
    return darkMode ? <Sun size={16} /> : <Moon size={16} />;
  };

  const getThemeLabel = () => {
    if (theme === 'system') return 'System';
    return theme === 'dark' ? 'Dark' : 'Light';
  };

  const handleThemeToggle = () => {
    const themes: Array<'light' | 'dark' | 'system'> = ['light', 'dark', 'system'];
    const currentIndex = themes.indexOf(theme);
    const nextTheme = themes[(currentIndex + 1) % themes.length];
    setTheme(nextTheme);
  };

  return (
    <motion.div
      className={`sidebar ${darkMode ? 'sidebar-dark' : 'sidebar-light'}`}
      variants={slideInVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <div className="sidebar-header">
        <h2 className="sidebar-title">✨ Workspace</h2>
        <div className="sidebar-header-actions">
          <button
            onClick={handleThemeToggle}
            className="theme-toggle-button"
            aria-label={`Toggle theme, current: ${getThemeLabel()}`}
          >
            {getThemeIcon()}
          </button>
          <button
            onClick={onClose}
            className="sidebar-close-button"
            aria-label="Close sidebar"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Pages List */}
      <div className="pages-list">
        <div className="pages-label">
          📄 Pages
        </div>

        <AnimatePresence mode="popLayout">
          {workspace.pages.map((page, idx) => (
            <motion.div
              key={page.id}
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, x: -100 }}
              transition={{ delay: idx * 0.05 }}
              className={`page-item ${workspace.activePageId === page.id ? 'active' : ''}`}
              onClick={() => setActivePage(page.id)}
            >
              {editingPageId === page.id ? (
                <input
                  type="text"
                  value={editingTitle}
                  onChange={(e) => setEditingTitle(e.target.value)}
                  onBlur={handleSavePage}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSavePage();
                    if (e.key === 'Escape') setEditingPageId(null);
                  }}
                  className="page-edit-input"
                  autoFocus
                />
              ) : (
                <>
                  <span className="page-icon">{page.icon}</span>
                  <span className="page-title">{page.title}</span>
                  <div className="page-actions">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRenamePage(page.id, page.title);
                      }}
                      className="page-action-button"
                      aria-label="Rename page"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removePage(page.id);
                      }}
                      className="page-action-button"
                      aria-label="Delete page"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Add Page Section */}
      <div className="add-page-section">
        <div className="emoji-selection">
          <label className="emoji-label">
            🎨 Page Icon
          </label>
          <div className="emoji-grid">
            {EMOJI_ICONS.map((emoji) => (
              <button
                key={emoji}
                onClick={() => setSelectedEmoji(emoji)}
                className={`emoji-button ${selectedEmoji === emoji ? 'selected' : ''}`}
                aria-label={`Select ${emoji} as page icon`}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleAddPage}
          className="add-page-button"
          aria-label="Add new page"
        >
          <Plus size={18} />
          Add Page
        </button>
      </div>
    </motion.div>
  );
};

export default Sidebar;