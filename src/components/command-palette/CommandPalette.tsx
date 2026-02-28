import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Command, Plus, FileText, Users, Settings, LogOut, Moon, Sun } from 'lucide-react';
import { useWorkspaceStore } from '../../state/workspaceStore';
import { useThemeStore } from '../../state/themeStore';
import './CommandPalette.css';

interface Command {
  id: string;
  title: string;
  description?: string;
  icon: React.ReactNode;
  shortcut?: string[];
  action: () => void;
  category: 'navigation' | 'creation' | 'settings' | 'workspace';
}

const CommandPalette: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const workspace = useWorkspaceStore((state) => state.workspace);
  const addPage = useWorkspaceStore((state) => state.addPage);
  const setActivePage = useWorkspaceStore((state) => state.setActivePage);
  const { theme, setTheme } = useThemeStore();

  const commands: Command[] = [
    // Navigation
    {
      id: 'new-page',
      title: 'New Page',
      description: 'Create a new page in your workspace',
      icon: <Plus size={16} />,
      shortcut: ['⌘', 'P'],
      action: () => {
        addPage(`New Page ${workspace.pages.length + 1}`, '📄');
        setIsOpen(false);
      },
      category: 'creation'
    },
    {
      id: 'search-cards',
      title: 'Search Cards',
      description: 'Search through all cards in your workspace',
      icon: <Search size={16} />,
      shortcut: ['⌘', 'K'],
      action: () => {
        setIsOpen(false);
        // Focus search input
      },
      category: 'navigation'
    },
    {
      id: 'analytics',
      title: 'View Analytics',
      description: 'Open the analytics dashboard',
      icon: <FileText size={16} />,
      shortcut: ['⌘', 'A'],
      action: () => {
        setIsOpen(false);
        // Navigate to analytics
      },
      category: 'navigation'
    },
    // Settings
    {
      id: 'toggle-theme',
      title: 'Toggle Theme',
      description: 'Switch between light and dark mode',
      icon: theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />,
      shortcut: ['⌘', 'T'],
      action: () => {
        setTheme(theme === 'dark' ? 'light' : 'dark');
        setIsOpen(false);
      },
      category: 'settings'
    },
    {
      id: 'settings',
      title: 'Settings',
      description: 'Open application settings',
      icon: <Settings size={16} />,
      shortcut: ['⌘', ','],
      action: () => {
        setIsOpen(false);
        // Open settings modal
      },
      category: 'settings'
    }
  ];

  // Add page-specific commands
  workspace.pages.forEach((page, index) => {
    if (index < 5) { // Limit to first 5 pages to avoid clutter
      commands.push({
        id: `goto-page-${page.id}`,
        title: `Go to ${page.title}`,
        description: `Navigate to ${page.title} page`,
        icon: <span>{page.icon}</span>,
        shortcut: index < 9 ? [`⌘`, `${index + 1}`] : undefined,
        action: () => {
          setActivePage(page.id);
          setIsOpen(false);
        },
        category: 'navigation'
      });
    }
  });

  const filteredCommands = commands.filter(command =>
    command.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    command.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const groupedCommands = filteredCommands.reduce((groups, command) => {
    if (!groups[command.category]) {
      groups[command.category] = [];
    }
    groups[command.category].push(command);
    return groups;
  }, {} as Record<string, Command[]>);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Command/Ctrl + K to open
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }
      
      // Escape to close
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }

      // Handle shortcuts when palette is closed
      if (!isOpen && (e.metaKey || e.ctrlKey)) {
        const key = e.key.toLowerCase();
        const command = commands.find(cmd => 
          cmd.shortcut && 
          cmd.shortcut.length === 2 && 
          cmd.shortcut[1].toLowerCase() === key
        );
        
        if (command) {
          e.preventDefault();
          command.action();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, commands]);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      setSelectedIndex(0);
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [searchQuery]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => 
        prev < filteredCommands.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => 
        prev > 0 ? prev - 1 : filteredCommands.length - 1
      );
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const selectedCommand = filteredCommands[selectedIndex];
      if (selectedCommand) {
        selectedCommand.action();
      }
    }
  }, [filteredCommands, selectedIndex]);

  const executeCommand = (command: Command) => {
    command.action();
  };

  const getCategoryTitle = (category: string) => {
    switch (category) {
      case 'navigation': return 'Navigation';
      case 'creation': return 'Creation';
      case 'settings': return 'Settings';
      case 'workspace': return 'Workspace';
      default: return category;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="command-palette-overlay"
          onClick={() => setIsOpen(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="command-palette"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Search Input */}
            <div className="command-search">
              <Search size={20} className="search-icon" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Type a command or search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                className="search-input"
              />
              <div className="command-key">
                <Command size={12} />
                <span>K</span>
              </div>
            </div>

            {/* Commands List */}
            <div className="commands-list" ref={listRef}>
              {Object.entries(groupedCommands).map(([category, categoryCommands]) => (
                <div key={category} className="command-category">
                  <div className="category-header">
                    {getCategoryTitle(category)}
                  </div>
                  {categoryCommands.map((command, index) => {
                    const globalIndex = filteredCommands.indexOf(command);
                    const isSelected = globalIndex === selectedIndex;
                    
                    return (
                      <motion.button
                        key={command.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`command-item ${isSelected ? 'selected' : ''}`}
                        onClick={() => executeCommand(command)}
                        onMouseEnter={() => setSelectedIndex(globalIndex)}
                      >
                        <div className="command-icon">
                          {command.icon}
                        </div>
                        <div className="command-content">
                          <div className="command-title">
                            {command.title}
                          </div>
                          {command.description && (
                            <div className="command-description">
                              {command.description}
                            </div>
                          )}
                        </div>
                        {command.shortcut && (
                          <div className="command-shortcut">
                            {command.shortcut.map((key, i) => (
                              <kbd key={i}>{key}</kbd>
                            ))}
                          </div>
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              ))}

              {filteredCommands.length === 0 && (
                <div className="no-results">
                  <Search size={24} />
                  <span>No commands found</span>
                  <small>Try searching with different keywords</small>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="command-footer">
              <div className="footer-hints">
                <div className="hint">
                  <kbd>↑↓</kbd>
                  <span>Navigate</span>
                </div>
                <div className="hint">
                  <kbd>↵</kbd>
                  <span>Select</span>
                </div>
                <div className="hint">
                  <kbd>ESC</kbd>
                  <span>Close</span>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CommandPalette;
