import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWorkspaceStore } from '../../state/workspaceStore';
import { useThemeStore } from '../../state/themeStore';
import { X, Save, CheckCircle } from 'lucide-react';
import { glassPop } from '../../utils/animations';
import type { Card } from '../../state/workspaceStore';

interface CardModalProps {
  card: Card & { pageId: string; columnId: string };
  pageId: string;
  columnId: string;
  onClose: () => void;
}

const CardModal: React.FC<CardModalProps> = ({ card, pageId, columnId, onClose }) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [title, setTitle] = useState(card.title);
  const [description, setDescription] = useState(card.description);
  const [showSaved, setShowSaved] = useState(false);
  
  const updateCard = useWorkspaceStore((state) => state.updateCard);
  const { getResolvedTheme } = useThemeStore();
  
  const darkMode = getResolvedTheme() === 'dark';

  const handleSaveTitle = () => {
    if (title.trim()) {
      updateCard(pageId, columnId, card.id, { title });
      setShowSaved(true);
      setTimeout(() => setShowSaved(false), 2000);
    }
    setIsEditingTitle(false);
  };

  const handleSaveDescription = () => {
    updateCard(pageId, columnId, card.id, { description });
    setShowSaved(true);
    setTimeout(() => setShowSaved(false), 2000);
  };

  return (
    <AnimatePresence>
      <motion.div
        className="modal-backdrop"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className={`modal-content ${darkMode ? 'modal-dark' : 'modal-light'}`}
          onClick={(e) => e.stopPropagation()}
          variants={glassPop}
          initial="initial"
          animate="animate"
          exit="exit"
        >
          {/* Header */}
          <div className="modal-header">
            <h2 className="modal-title">✨ Card Details</h2>
            <button
              onClick={onClose}
              className="modal-close-button"
            >
              <X size={22} />
            </button>
          </div>

          {/* Saved indicator */}
          <AnimatePresence>
            {showSaved && (
              <motion.div
                className="saved-indicator"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <CheckCircle size={18} />
                <span>Changes saved successfully!</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Content */}
          <div className="modal-body">
            {/* Title */}
            <div className="form-field">
              <label className="field-label">✏️ Title</label>
              {isEditingTitle ? (
                <motion.input
                  autoFocus
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onBlur={handleSaveTitle}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveTitle();
                    if (e.key === 'Escape') {
                      setTitle(card.title);
                      setIsEditingTitle(false);
                    }
                  }}
                  initial={{ scale: 0.95 }}
                  animate={{ scale: 1 }}
                  className="title-input"
                />
              ) : (
                <motion.div
                  onClick={() => setIsEditingTitle(true)}
                  className="title-display"
                  whileHover={{ scale: 1.02 }}
                >
                  {title || 'Click to add title...'}
                </motion.div>
              )}
            </div>

            {/* Description */}
            <div className="form-field">
              <label className="field-label">📝 Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                onBlur={handleSaveDescription}
                placeholder="Add a detailed description..."
                rows={6}
                className="description-input"
              />
            </div>

            {/* Metadata Grid */}
            <div className="metadata-grid">
              <div className="metadata-field">
                <label className="field-label">📊 Status</label>
                <div className="status-display">
                  In Progress
                </div>
              </div>

              <div className="metadata-field">
                <label className="field-label">📅 Due Date</label>
                <input
                  type="date"
                  className="date-input"
                />
              </div>
            </div>

            {/* Labels/Tags */}
            <div className="form-field">
              <label className="field-label">🏷️ Labels</label>
              <div className="tags-container">
                {['Feature', 'Bug', 'Documentation', 'Enhancement'].map((label) => (
                  <button
                    key={label}
                    className="tag-button"
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="modal-footer">
            <button
              onClick={onClose}
              className="footer-button secondary"
            >
              Close
            </button>

            <button
              onClick={handleSaveDescription}
              className="footer-button primary"
            >
              <Save size={18} />
              Save Changes
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CardModal;