import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

export interface Card {
  id: string;
  title: string;
  description: string;
  columnId: string;
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
  status: 'todo' | 'in-progress' | 'done';
  metadata: Record<string, unknown>;
}

export interface Column {
  id: string;
  title: string;
  cards: Card[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Board {
  columns: Column[];
}

export interface Page {
  id: string;
  title: string;
  icon: string;
  board: Board;
  createdAt: Date;
  updatedAt: Date;
}

export interface Workspace {
  title: string;
  pages: Page[];
  activePageId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface WorkspaceState {
  workspace: Workspace;
  selectedCardId: string | null;
  
  // Actions
  setWorkspaceTitle: (title: string) => void;
  
  // Page Actions
  addPage: (title: string, icon: string) => void;
  removePage: (pageId: string) => void;
  renamePage: (pageId: string, title: string) => void;
  setActivePage: (pageId: string) => void;
  updatePageIcon: (pageId: string, icon: string) => void;
  
  // Column Actions
  addColumn: (pageId: string, title: string) => void;
  removeColumn: (pageId: string, columnId: string) => void;
  renameColumn: (pageId: string, columnId: string, title: string) => void;
  moveColumn: (pageId: string, columnId: string, targetIndex: number) => void;
  
  // Card Actions
  addCard: (pageId: string, columnId: string, title: string, description?: string) => void;
  removeCard: (pageId: string, columnId: string, cardId: string) => void;
  updateCard: (pageId: string, columnId: string, cardId: string, updates: Partial<Card>) => void;
  moveCard: (source: { pageId: string; columnId: string; cardId: string }, target: { pageId: string; columnId: string; index?: number }) => void;
  setSelectedCardId: (cardId: string | null) => void;
  
  // Utility
  findCard: (cardId: string) => { card: Card; pageId: string; columnId: string } | null;
  findColumn: (columnId: string) => { column: Column; pageId: string } | null;
}

const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

const createDefaultWorkspace = (): Workspace => {
  const pageId = `page-${generateId()}`;
  const columnId = `col-${generateId()}`;
  const cardId = `card-${generateId()}`;
  
  return {
    title: 'My Workspace',
    pages: [
      {
        id: pageId,
        title: 'Welcome',
        icon: '👋',
        board: {
          columns: [
            {
              id: columnId,
              title: 'To Do',
              cards: [
                {
                  id: cardId,
                  title: 'Welcome to your workspace',
                  description: 'This is your first card. You can edit it, move it, or delete it.',
                  columnId: columnId,
                  createdAt: new Date(),
                  updatedAt: new Date(),
                  tags: ['welcome', 'getting-started'],
                  status: 'todo',
                  metadata: {},
                },
              ],
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          ],
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ],
    activePageId: pageId,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
};

export const useWorkspaceStore = create<WorkspaceState>()(
  persist(
    immer((set, get) => ({
      workspace: createDefaultWorkspace(),
      selectedCardId: null,

      setWorkspaceTitle: (title) => {
        set((state) => {
          state.workspace.title = title;
          state.workspace.updatedAt = new Date();
        });
      },

      addPage: (title, icon) => {
        set((state) => {
          const newPage: Page = {
            id: `page-${generateId()}`,
            title,
            icon,
            board: { columns: [] },
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          
          state.workspace.pages.push(newPage);
          state.workspace.activePageId = newPage.id;
          state.workspace.updatedAt = new Date();
        });
      },

      removePage: (pageId) => {
        set((state) => {
          state.workspace.pages = state.workspace.pages.filter(page => page.id !== pageId);
          
          if (state.workspace.activePageId === pageId) {
            state.workspace.activePageId = state.workspace.pages[0]?.id || null;
          }
          
          state.workspace.updatedAt = new Date();
        });
      },

      renamePage: (pageId, title) => {
        set((state) => {
          const page = state.workspace.pages.find(p => p.id === pageId);
          if (page) {
            page.title = title;
            page.updatedAt = new Date();
            state.workspace.updatedAt = new Date();
          }
        });
      },

      setActivePage: (pageId) => {
        set((state) => {
          state.workspace.activePageId = pageId;
          state.workspace.updatedAt = new Date();
        });
      },

      updatePageIcon: (pageId, icon) => {
        set((state) => {
          const page = state.workspace.pages.find(p => p.id === pageId);
          if (page) {
            page.icon = icon;
            page.updatedAt = new Date();
            state.workspace.updatedAt = new Date();
          }
        });
      },

      addColumn: (pageId, title) => {
        set((state) => {
          const page = state.workspace.pages.find(p => p.id === pageId);
          if (page) {
            const newColumn: Column = {
              id: `col-${generateId()}`,
              title,
              cards: [],
              createdAt: new Date(),
              updatedAt: new Date(),
            };
            
            page.board.columns.push(newColumn);
            page.updatedAt = new Date();
            state.workspace.updatedAt = new Date();
          }
        });
      },

      removeColumn: (pageId, columnId) => {
        set((state) => {
          const page = state.workspace.pages.find(p => p.id === pageId);
          if (page) {
            page.board.columns = page.board.columns.filter(col => col.id !== columnId);
            page.updatedAt = new Date();
            state.workspace.updatedAt = new Date();
          }
        });
      },

      renameColumn: (pageId, columnId, title) => {
        set((state) => {
          const page = state.workspace.pages.find(p => p.id === pageId);
          if (page) {
            const column = page.board.columns.find(col => col.id === columnId);
            if (column) {
              column.title = title;
              column.updatedAt = new Date();
              page.updatedAt = new Date();
              state.workspace.updatedAt = new Date();
            }
          }
        });
      },

      moveColumn: (pageId, columnId, targetIndex) => {
        set((state) => {
          const page = state.workspace.pages.find(p => p.id === pageId);
          if (page) {
            const currentIndex = page.board.columns.findIndex(col => col.id === columnId);
            if (currentIndex !== -1) {
              const [column] = page.board.columns.splice(currentIndex, 1);
              page.board.columns.splice(targetIndex, 0, column);
              page.updatedAt = new Date();
              state.workspace.updatedAt = new Date();
            }
          }
        });
      },

      addCard: (pageId, columnId, title, description = '') => {
        set((state) => {
          const page = state.workspace.pages.find(p => p.id === pageId);
          if (page) {
            const column = page.board.columns.find(col => col.id === columnId);
            if (column) {
              const newCard: Card = {
                id: `card-${generateId()}`,
                title,
                description,
                columnId,
                createdAt: new Date(),
                updatedAt: new Date(),
                tags: [],
                status: 'todo',
                metadata: {},
              };
              
              column.cards.push(newCard);
              column.updatedAt = new Date();
              page.updatedAt = new Date();
              state.workspace.updatedAt = new Date();
            }
          }
        });
      },

      removeCard: (pageId, columnId, cardId) => {
        set((state) => {
          const page = state.workspace.pages.find(p => p.id === pageId);
          if (page) {
            const column = page.board.columns.find(col => col.id === columnId);
            if (column) {
              column.cards = column.cards.filter(card => card.id !== cardId);
              column.updatedAt = new Date();
              page.updatedAt = new Date();
              state.workspace.updatedAt = new Date();
              
              if (state.selectedCardId === cardId) {
                state.selectedCardId = null;
              }
            }
          }
        });
      },

      updateCard: (pageId, columnId, cardId, updates) => {
        set((state) => {
          const page = state.workspace.pages.find(p => p.id === pageId);
          if (page) {
            const column = page.board.columns.find(col => col.id === columnId);
            if (column) {
              const card = column.cards.find(c => c.id === cardId);
              if (card) {
                Object.assign(card, updates, { updatedAt: new Date() });
                column.updatedAt = new Date();
                page.updatedAt = new Date();
                state.workspace.updatedAt = new Date();
              }
            }
          }
        });
      },

      moveCard: (source, target) => {
        set((state) => {
          // Find and remove card from source
          let movedCard: Card | null = null;
          
          const sourcePage = state.workspace.pages.find(p => p.id === source.pageId);
          if (sourcePage) {
            const sourceColumn = sourcePage.board.columns.find(col => col.id === source.columnId);
            if (sourceColumn) {
              const cardIndex = sourceColumn.cards.findIndex(card => card.id === source.cardId);
              if (cardIndex !== -1) {
                movedCard = sourceColumn.cards[cardIndex];
                sourceColumn.cards.splice(cardIndex, 1);
                sourceColumn.updatedAt = new Date();
                sourcePage.updatedAt = new Date();
              }
            }
          }

          // Add card to target
          if (movedCard) {
            const targetPage = state.workspace.pages.find(p => p.id === target.pageId);
            if (targetPage) {
              const targetColumn = targetPage.board.columns.find(col => col.id === target.columnId);
              if (targetColumn) {
                movedCard.columnId = target.columnId;
                movedCard.updatedAt = new Date();
                
                const insertIndex = target.index ?? targetColumn.cards.length;
                targetColumn.cards.splice(insertIndex, 0, movedCard);
                targetColumn.updatedAt = new Date();
                targetPage.updatedAt = new Date();
              }
            }
          }
          
          state.workspace.updatedAt = new Date();
        });
      },

      setSelectedCardId: (cardId) => {
        set((state) => {
          state.selectedCardId = cardId;
        });
      },

      findCard: (cardId) => {
        const { workspace } = get();
        
        for (const page of workspace.pages) {
          for (const column of page.board.columns) {
            const card = column.cards.find(c => c.id === cardId);
            if (card) {
              return { card, pageId: page.id, columnId: column.id };
            }
          }
        }
        
        return null;
      },

      findColumn: (columnId) => {
        const { workspace } = get();
        
        for (const page of workspace.pages) {
          const column = page.board.columns.find(col => col.id === columnId);
          if (column) {
            return { column, pageId: page.id };
          }
        }
        
        return null;
      },
    })),
    {
      name: 'workspace-storage',
      storage: createJSONStorage(() => localStorage),
      version: 1,
    }
  )
);