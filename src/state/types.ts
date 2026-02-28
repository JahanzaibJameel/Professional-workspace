export interface Card {
  id: string;
  title: string;
  description: string;
  columnId: string;
}

export interface Column {
  id: string;
  title: string;
  cards: Card[];
}

export interface Board {
  columns: Column[];
}

export interface Page {
  id: string;
  title: string;
  icon: string;
  board: Board;
}

export interface Workspace {
  title: string;
  pages: Page[];
  activePageId: string | null;
  darkMode: boolean;
}