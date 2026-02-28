import type { Page, Column, Card } from '../state/workspaceStore';

export const generateId = (prefix: string): string => {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const cn = (...classes: (string | undefined | false)[]): string => {
  return classes.filter(Boolean).join(' ');
};

export const getPageById = (pages: Page[], pageId: string): Page | undefined => {
  return pages.find((p) => p.id === pageId);
};

export const getColumnById = (columns: Column[], columnId: string): Column | undefined => {
  return columns.find((c) => c.id === columnId);
};

export const getCardById = (cards: Card[], cardId: string): Card | undefined => {
  return cards.find((c) => c.id === cardId);
};
