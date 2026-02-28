import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Brain, TrendingUp, Lightbulb } from 'lucide-react';
import { aiService, type AISuggestion } from '../../services/aiService';
import { useWorkspaceStore } from '../../state/workspaceStore';
import './SmartSuggestions.css';

interface SmartSuggestionsProps {
  pageId: string;
  columnId: string;
  onSuggestionApply: (suggestion: AISuggestion) => void;
  className?: string;
}

const SmartSuggestions: React.FC<SmartSuggestionsProps> = ({
  pageId,
  columnId,
  onSuggestionApply,
  className = ''
}) => {
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  
  const workspace = useWorkspaceStore((state) => state.workspace);
  const page = workspace.pages.find(p => p.id === pageId);
  const column = page?.board.columns.find(c => c.id === columnId);

  useEffect(() => {
    if (isVisible && page && column) {
      loadSuggestions();
    }
  }, [isVisible, page, column]);

  const loadSuggestions = async () => {
    if (!page || !column) return;

    setIsLoading(true);
    try {
      const aiSuggestions = await aiService.generateSuggestions({
        pageTitle: page.title,
        columnTitle: column.title,
        existingCards: column.cards
      });
      setSuggestions(aiSuggestions);
    } catch (error) {
      console.error('Failed to load AI suggestions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getSuggestionIcon = (type: AISuggestion['type']) => {
    switch (type) {
      case 'title':
        return <Lightbulb size={16} />;
      case 'tags':
        return <TrendingUp size={16} />;
      case 'priority':
        return <Brain size={16} />;
      default:
        return <Sparkles size={16} />;
    }
  };

  const getSuggestionColor = (confidence: number) => {
    if (confidence >= 0.8) return 'high-confidence';
    if (confidence >= 0.6) return 'medium-confidence';
    return 'low-confidence';
  };

  return (
    <div className={`smart-suggestions ${className}`}>
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="suggestions-toggle"
        aria-label="Toggle AI suggestions"
      >
        <Sparkles size={16} />
        <span>AI Suggestions</span>
        <motion.div
          animate={{ rotate: isVisible ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          ▼
        </motion.div>
      </button>

      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="suggestions-panel"
          >
            {isLoading ? (
              <div className="suggestions-loading">
                <div className="loading-spinner" />
                <span>Generating smart suggestions...</span>
              </div>
            ) : suggestions.length > 0 ? (
              <div className="suggestions-list">
                <div className="suggestions-header">
                  <Brain size={16} />
                  <span>AI-Powered Suggestions</span>
                </div>
                {suggestions.map((suggestion, index) => (
                  <motion.div
                    key={`${suggestion.type}-${index}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`suggestion-item ${getSuggestionColor(suggestion.confidence)}`}
                  >
                    <div className="suggestion-content">
                      <div className="suggestion-header">
                        {getSuggestionIcon(suggestion.type)}
                        <span className="suggestion-type">{suggestion.type}</span>
                        <span className="confidence-badge">
                          {Math.round(suggestion.confidence * 100)}%
                        </span>
                      </div>
                      <div className="suggestion-text">
                        {suggestion.suggestion}
                      </div>
                      {suggestion.reasoning && (
                        <div className="suggestion-reasoning">
                          {suggestion.reasoning}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => onSuggestionApply(suggestion)}
                      className="apply-suggestion-btn"
                      aria-label={`Apply suggestion: ${suggestion.suggestion}`}
                    >
                      Apply
                    </button>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="no-suggestions">
                <Sparkles size={24} />
                <span>No suggestions available</span>
                <small>Try adding more content to get better recommendations</small>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SmartSuggestions;
