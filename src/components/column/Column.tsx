import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWorkspaceStore } from '../../state/workspaceStore';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import Card from '../card/Card';
import { Plus, Trash2, GripVertical, MoreVertical } from 'lucide-react';

interface ColumnProps {
  id: string;
  title: string;
  pageId: string;
  cards: Array<{
    id: string;
    title: string;
    description: string;
    columnId: string;
  }>;
  isDragging?: boolean;
}

const Column: React.FC<ColumnProps> = ({ id, title, pageId, cards, isDragging }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editingTitle, setEditingTitle] = useState(title);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const addCard = useWorkspaceStore((state) => state.addCard);
  const removeColumn = useWorkspaceStore((state) => state.removeColumn);
  const renameColumn = useWorkspaceStore((state) => state.renameColumn);
  const setSelectedCardId = useWorkspaceStore((state) => state.setSelectedCardId);

  const darkMode = false; // Will be replaced with theme store

  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id,
    data: { columnId: id },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleSaveTitle = () => {
    if (editingTitle.trim()) {
      renameColumn(pageId, id, editingTitle);
    } else {
      setEditingTitle(title);
    }
    setIsEditing(false);
  };

  const handleAddCard = () => {
    addCard(pageId, id, 'New Card');
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      className={`column ${isDragging ? 'dragging' : ''} ${darkMode ? 'column-dark' : 'column-light'}`}
    >
      {/* Header */}
      <div className="column-header" {...attributes} {...listeners}>
        <div className="drag-handle">
          <GripVertical size={16} />
        </div>

        <div className="column-title-section">
          {isEditing ? (
            <input
              type="text"
              value={editingTitle}
              onChange={(e) => setEditingTitle(e.target.value)}
              onBlur={handleSaveTitle}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSaveTitle();
                if (e.key === 'Escape') {
                  setEditingTitle(title);
                  setIsEditing(false);
                }
              }}
              className="column-title-input"
              autoFocus
            />
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="column-title-button"
            >
              <h3 className="column-title">{title}</h3>
            </button>
          )}

          <span className="column-card-count">
            {cards.length}
          </span>
        </div>

        <div className="column-actions">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="column-menu-button"
            aria-label="Column options"
          >
            <MoreVertical size={16} />
          </button>

          {isMenuOpen && (
            <div className="column-menu-dropdown">
              <button
                onClick={() => {
                  removeColumn(pageId, id);
                  setIsMenuOpen(false);
                }}
                className="column-menu-item"
              >
                <Trash2 size={14} />
                Delete column
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Cards Container */}
      <div className="column-content">
        <SortableContext items={cards.map(card => card.id)} strategy={verticalListSortingStrategy}>
          <AnimatePresence mode="popLayout">
            {cards.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 0.3, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="column-empty-state"
              >
                <div className="empty-icon">📭</div>
                <p className="empty-text">No cards yet</p>
              </motion.div>
            ) : (
              cards.map((card, index) => (
                <motion.div
                  key={card.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card 
                    id={card.id}
                    columnId={id}
                    pageId={pageId}
                    title={card.title} 
                    description={card.description}
                    isDarkMode={darkMode}
                    onCardClick={() => setSelectedCardId(card.id)}
                  />
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </SortableContext>
      </div>

      {/* Add Card Button */}
      <div className="column-footer">
        <button
          onClick={handleAddCard}
          className="add-card-button"
        >
          <Plus size={16} />
          Add Card
        </button>
      </div>
    </motion.div>
  );
};

export default Column;