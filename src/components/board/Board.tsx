import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DndContext, closestCorners } from '@dnd-kit/core';
import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import Column from '../column/Column';
import Button from '../button/Button';
import { Plus } from 'lucide-react';
import { useWorkspaceStore } from '../../state/workspaceStore';
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';

interface BoardProps {
  pageId: string;
}

const Board: React.FC<BoardProps> = ({ pageId }) => {
  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  
  const workspace = useWorkspaceStore((state) => state.workspace);
  const addColumn = useWorkspaceStore((state) => state.addColumn);
  const moveColumn = useWorkspaceStore((state) => state.moveColumn);
  
  const page = workspace.pages.find((p) => p.id === pageId);

  if (!page) {
    return (
      <div className="empty-state">
        <div className="empty-illustration">📄</div>
        <h2 className="empty-title">Page not found</h2>
        <p className="empty-description">
          The page you're looking for doesn't exist or has been deleted.
        </p>
      </div>
    );
  }

  const columns = page.board.columns;

  const handleDragStart = (event: DragStartEvent) => {
    setActiveDragId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveDragId(null);
    const { active, over } = event;

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Handle column movement
    if (activeId.startsWith('col-')) {
      const currentIndex = columns.findIndex((c) => c.id === activeId);
      const overIndex = columns.findIndex((c) => c.id === overId);
      
      if (currentIndex !== -1 && overIndex !== -1 && currentIndex !== overIndex) {
        moveColumn(pageId, activeId, overIndex);
      }
    }
  };

  const handleAddColumn = () => {
    addColumn(pageId, 'New Column');
  };

  return (
    <div className="board-container">
      <DndContext
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="columns-wrapper">
          <SortableContext items={columns.map((c) => c.id)} strategy={horizontalListSortingStrategy}>
            <AnimatePresence mode="popLayout">
              {columns.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="empty-board"
                >
                  <div className="empty-illustration">📋</div>
                  <h2 className="empty-title">Start adding columns</h2>
                  <p className="empty-description">
                    Create your first column to organize your cards and tasks.
                  </p>
                  <Button
                    variant="primary"
                    icon={<Plus size={16} />}
                    onClick={handleAddColumn}
                    className="empty-action"
                  >
                    Add first column
                  </Button>
                </motion.div>
              ) : (
                columns.map((column, index) => (
                  <motion.div
                    key={column.id}
                    layout
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Column
                      id={column.id}
                      title={column.title}
                      pageId={pageId}
                      cards={column.cards}
                      isDragging={activeDragId === column.id}
                    />
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </SortableContext>

          {columns.length > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="add-column-wrapper"
            >
              <Button
                variant="ghost"
                icon={<Plus size={16} />}
                onClick={handleAddColumn}
                className="add-column-button"
              >
                Add column
              </Button>
            </motion.div>
          )}
        </div>
      </DndContext>
    </div>
  );
};

export default Board;