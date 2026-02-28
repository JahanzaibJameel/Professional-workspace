import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Filter, 
  X, 
  Calendar, 
  Tag, 
  User, 
  FileText,
  ChevronDown,
  ChevronUp,
  Clock,
  Star
} from 'lucide-react';
import { useWorkspaceStore } from '../../state/workspaceStore';
import type { Card, Page, Column } from '../../state/workspaceStore';
import './AdvancedSearch.css';

interface SearchFilters {
  query: string;
  status: 'all' | 'todo' | 'in-progress' | 'done';
  tags: string[];
  dateRange: {
    from: string;
    to: string;
  } | null;
  page: string;
  column: string;
  author: string;
  priority: 'all' | 'high' | 'medium' | 'low';
  hasAttachments: boolean;
  isFavorited: boolean;
}

interface SearchResult {
  card: Card;
  page: Page;
  column: Column;
  score: number;
  matches: {
    title: boolean;
    description: boolean;
    tags: boolean;
  };
}

const AdvancedSearch: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    status: 'all',
    tags: [],
    dateRange: null,
    page: 'all',
    column: 'all',
    author: 'all',
    priority: 'all',
    hasAttachments: false,
    isFavorited: false
  });
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [selectedResult, setSelectedResult] = useState<string | null>(null);

  const workspace = useWorkspaceStore((state) => state.workspace);
  const setActivePage = useWorkspaceStore((state) => state.setActivePage);
  const setSelectedCardId = useWorkspaceStore((state) => state.setSelectedCardId);

  // Get all available tags
  const availableTags = useMemo(() => {
    const tags = new Set<string>();
    workspace.pages.forEach(page => {
      page.board.columns.forEach(column => {
        column.cards.forEach(card => {
          card.tags.forEach(tag => tags.add(tag));
        });
      });
    });
    return Array.from(tags).sort();
  }, [workspace]);

  // Search results
  const searchResults = useMemo(() => {
    if (!filters.query.trim()) return [];

    const results: SearchResult[] = [];

    workspace.pages.forEach(page => {
      if (filters.page !== 'all' && page.id !== filters.page) return;

      page.board.columns.forEach(column => {
        if (filters.column !== 'all' && column.id !== filters.column) return;

        column.cards.forEach(card => {
          const score = calculateSearchScore(card, filters);
          if (score > 0) {
            results.push({
              card,
              page,
              column,
              score,
              matches: getMatchFields(card, filters.query)
            });
          }
        });
      });
    });

    return results.sort((a, b) => b.score - a.score);
  }, [workspace, filters]);

  const calculateSearchScore = (card: Card, filters: SearchFilters): number => {
    let score = 0;
    const query = filters.query.toLowerCase();

    // Text matching
    if (card.title.toLowerCase().includes(query)) {
      score += 100;
    }
    if (card.description.toLowerCase().includes(query)) {
      score += 50;
    }

    // Tag matching
    const tagMatches = card.tags.filter(tag => 
      tag.toLowerCase().includes(query) || filters.tags.includes(tag)
    );
    score += tagMatches.length * 25;

    // Status filter
    if (filters.status !== 'all' && card.status !== filters.status) {
      return 0;
    }

    // Priority filter (simulated)
    if (filters.priority !== 'all') {
      const hasPriorityKeyword = 
        card.title.toLowerCase().includes(filters.priority) ||
        card.description.toLowerCase().includes(filters.priority);
      if (!hasPriorityKeyword) return 0;
    }

    // Date range filter
    if (filters.dateRange) {
      const cardDate = new Date(card.createdAt);
      const fromDate = new Date(filters.dateRange.from);
      const toDate = new Date(filters.dateRange.to);
      
      if (cardDate < fromDate || cardDate > toDate) {
        return 0;
      }
    }

    // Favorites filter
    if (filters.isFavorited && !card.metadata.favorited) {
      return 0;
    }

    return score;
  };

  const getMatchFields = (card: Card, query: string) => {
    const lowerQuery = query.toLowerCase();
    return {
      title: card.title.toLowerCase().includes(lowerQuery),
      description: card.description.toLowerCase().includes(lowerQuery),
      tags: card.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    };
  };

  const handleResultClick = (result: SearchResult) => {
    setActivePage(result.page.id);
    setSelectedCardId(result.card.id);
    setIsOpen(false);
  };

  const updateFilter = (key: keyof SearchFilters, value: unknown) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const toggleTag = (tag: string) => {
    setFilters(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }));
  };

  const clearFilters = () => {
    setFilters({
      query: '',
      status: 'all',
      tags: [],
      dateRange: null,
      page: 'all',
      column: 'all',
      author: 'all',
      priority: 'all',
      hasAttachments: false,
      isFavorited: false
    });
  };

  const highlightText = (text: string, query: string) => {
    if (!query) return text;
    
    const regex = new RegExp(`(${query})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="search-highlight">{part}</mark>
      ) : (
        part
      )
    );
  };

  return (
    <div className="advanced-search">
      {/* Search Trigger */}
      <button
        onClick={() => setIsOpen(true)}
        className="search-trigger"
        aria-label="Open advanced search"
      >
        <Search size={20} />
        <span>Search workspace...</span>
        <kbd>⌘K</kbd>
      </button>

      {/* Search Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="search-overlay"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              className="search-modal"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Search Input */}
              <div className="search-input-container">
                <Search size={20} className="search-icon" />
                <input
                  type="text"
                  placeholder="Search cards, descriptions, tags..."
                  value={filters.query}
                  onChange={(e) => updateFilter('query', e.target.value)}
                  className="search-input"
                  autoFocus
                />
                <button
                  onClick={() => setIsOpen(false)}
                  className="close-search"
                  aria-label="Close search"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Advanced Filters Toggle */}
              <div className="filters-header">
                <button
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="advanced-toggle"
                >
                  <Filter size={16} />
                  <span>Advanced Filters</span>
                  {showAdvanced ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
                
                {(filters.tags.length > 0 || filters.status !== 'all' || filters.dateRange) && (
                  <button onClick={clearFilters} className="clear-filters">
                    Clear all
                  </button>
                )}
              </div>

              {/* Advanced Filters */}
              <AnimatePresence>
                {showAdvanced && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="advanced-filters"
                  >
                    <div className="filter-grid">
                      {/* Status Filter */}
                      <div className="filter-group">
                        <label className="filter-label">
                          <FileText size={14} />
                          Status
                        </label>
                        <select
                          value={filters.status}
                          onChange={(e) => updateFilter('status', e.target.value)}
                          className="filter-select"
                        >
                          <option value="all">All Status</option>
                          <option value="todo">To Do</option>
                          <option value="in-progress">In Progress</option>
                          <option value="done">Done</option>
                        </select>
                      </div>

                      {/* Page Filter */}
                      <div className="filter-group">
                        <label className="filter-label">
                          <FileText size={14} />
                          Page
                        </label>
                        <select
                          value={filters.page}
                          onChange={(e) => updateFilter('page', e.target.value)}
                          className="filter-select"
                        >
                          <option value="all">All Pages</option>
                          {workspace.pages.map(page => (
                            <option key={page.id} value={page.id}>
                              {page.icon} {page.title}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Priority Filter */}
                      <div className="filter-group">
                        <label className="filter-label">
                          <Star size={14} />
                          Priority
                        </label>
                        <select
                          value={filters.priority}
                          onChange={(e) => updateFilter('priority', e.target.value)}
                          className="filter-select"
                        >
                          <option value="all">All Priority</option>
                          <option value="high">High</option>
                          <option value="medium">Medium</option>
                          <option value="low">Low</option>
                        </select>
                      </div>

                      {/* Date Range */}
                      <div className="filter-group">
                        <label className="filter-label">
                          <Calendar size={14} />
                          Date Range
                        </label>
                        <div className="date-range">
                          <input
                            type="date"
                            value={filters.dateRange?.from || ''}
                            onChange={(e) => updateFilter('dateRange', {
                              from: e.target.value,
                              to: filters.dateRange?.to || ''
                            })}
                            className="date-input"
                          />
                          <span>to</span>
                          <input
                            type="date"
                            value={filters.dateRange?.to || ''}
                            onChange={(e) => updateFilter('dateRange', {
                              from: filters.dateRange?.from || '',
                              to: e.target.value
                            })}
                            className="date-input"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Tags Filter */}
                    {availableTags.length > 0 && (
                      <div className="tags-filter">
                        <label className="filter-label">
                          <Tag size={14} />
                          Tags
                        </label>
                        <div className="tags-grid">
                          {availableTags.map(tag => (
                            <button
                              key={tag}
                              onClick={() => toggleTag(tag)}
                              className={`tag-filter ${filters.tags.includes(tag) ? 'active' : ''}`}
                            >
                              {tag}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Search Results */}
              <div className="search-results">
                {searchResults.length > 0 ? (
                  <div className="results-list">
                    <div className="results-header">
                      <span>{searchResults.length} results found</span>
                    </div>
                    {searchResults.map((result, index) => (
                      <motion.div
                        key={result.card.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`result-item ${selectedResult === result.card.id ? 'selected' : ''}`}
                        onClick={() => handleResultClick(result)}
                        onMouseEnter={() => setSelectedResult(result.card.id)}
                      >
                        <div className="result-content">
                          <div className="result-title">
                            {highlightText(result.card.title, filters.query)}
                          </div>
                          <div className="result-description">
                            {highlightText(result.card.description, filters.query)}
                          </div>
                          <div className="result-meta">
                            <span className="page-info">
                              {result.page.icon} {result.page.title} • {result.column.title}
                            </span>
                            <div className="result-tags">
                              {result.card.tags.map(tag => (
                                <span key={tag} className="result-tag">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="result-score">
                          {Math.round(result.score)}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : filters.query ? (
                  <div className="no-results">
                    <Search size={48} />
                    <h3>No results found</h3>
                    <p>Try adjusting your search terms or filters</p>
                  </div>
                ) : (
                  <div className="search-placeholder">
                    <Search size={48} />
                    <h3>Start typing to search</h3>
                    <p>Search through cards, descriptions, and tags</p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdvancedSearch;
