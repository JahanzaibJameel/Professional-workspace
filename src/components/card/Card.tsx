import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, FileText, MoreVertical } from 'lucide-react';
import { useWorkspaceStore } from '../../state/workspaceStore';
import { magneticCardVariants } from '../../utils/animations';

interface CardProps {
  id: string;
  columnId: string;
  pageId: string;
  title: string;
  description?: string;
  isDarkMode: boolean;
  onCardClick?: () => void;
}

const Card: React.FC<CardProps> = ({ id, columnId, pageId, title, description, isDarkMode, onCardClick }) => {
  const [isFavorited, setIsFavorited] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const removeCard = useWorkspaceStore((state) => state.removeCard);

  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFavorited(!isFavorited);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    removeCard(pageId, columnId, id);
  };

  const textColorClass = isDarkMode ? 'text-gray-100' : 'text-gray-900';
  const secondaryTextClass = isDarkMode ? 'text-gray-400' : 'text-gray-600';

  return (
    <motion.div
      layout
      variants={magneticCardVariants}
      initial="initial"
      whileHover="hover"
      whileTap="tap"
      onClick={onCardClick}
      className={`card ${isDarkMode ? 'card-dark' : 'card-light'}`}
    >
      <div className="card-content">
        {/* Header with Title and Star */}
        <div className="card-header">
          <div className="card-title-wrapper">
            <h3 className={`card-title ${textColorClass}`}>
              {title}
            </h3>
          </div>
          <div className="card-actions">
            <button
              onClick={handleFavorite}
              className={`favorite-button ${isFavorited ? 'favorited' : ''}`}
              aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Star size={16} fill={isFavorited ? 'currentColor' : 'none'} />
            </button>
            
            <div className="menu-container">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsMenuOpen(!isMenuOpen);
                }}
                className="menu-button"
                aria-label="More options"
              >
                <MoreVertical size={16} />
              </button>
              
              {isMenuOpen && (
                <div className="menu-dropdown">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsMenuOpen(false);
                    }}
                    className="menu-item"
                  >
                    Edit
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(e);
                      setIsMenuOpen(false);
                    }}
                    className="menu-item"
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Description */}
        {description && (
          <p className={`card-description ${secondaryTextClass}`}>
            {description}
          </p>
        )}

        {/* Footer with Indicators */}
        <div className="card-footer">
          <div className="card-tags">
            <span className="card-tag">
              <FileText size={12} />
              Note
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Card;