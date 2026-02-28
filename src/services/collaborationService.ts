import type { Card, Column, Page, Workspace } from '../state/workspaceStore';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  color: string;
  cursor?: {
    x: number;
    y: number;
    visible: boolean;
  };
  selection?: {
    cardId?: string;
    columnId?: string;
    pageId?: string;
  };
}

export interface CollaborationEvent {
  id: string;
  type: 'user_joined' | 'user_left' | 'cursor_moved' | 'card_updated' | 'card_added' | 'card_moved' | 'card_deleted' | 'selection_changed';
  userId: string;
  timestamp: number;
  data: unknown;
}

export interface CollaborationRoom {
  id: string;
  name: string;
  users: User[];
  events: CollaborationEvent[];
}

export class CollaborationService {
  private static instance: CollaborationService;
  private ws: WebSocket | null = null;
  private roomId: string | null = null;
  private currentUser: User | null = null;
  private users = new Map<string, User>();
  private eventListeners = new Map<string, Set<(event: CollaborationEvent) => void>>();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  static getInstance(): CollaborationService {
    if (!CollaborationService.instance) {
      CollaborationService.instance = new CollaborationService();
    }
    return CollaborationService.instance;
  }

  async joinRoom(roomId: string, user: Omit<User, 'id'>): Promise<void> {
    this.roomId = roomId;
    this.currentUser = { ...user, id: this.generateId() };
    
    try {
      await this.connectWebSocket();
      this.sendEvent({
        id: this.generateId(),
        type: 'user_joined',
        userId: this.currentUser.id,
        timestamp: Date.now(),
        data: this.currentUser
      });
    } catch (error) {
      console.error('Failed to join collaboration room:', error);
      throw error;
    }
  }

  leaveRoom(): void {
    if (this.currentUser && this.ws) {
      this.sendEvent({
        id: this.generateId(),
        type: 'user_left',
        userId: this.currentUser.id,
        timestamp: Date.now(),
        data: this.currentUser
      });
    }
    
    this.disconnect();
    this.roomId = null;
    this.currentUser = null;
    this.users.clear();
  }

  private async connectWebSocket(): Promise<void> {
    // In a real implementation, this would connect to your WebSocket server
    // For demo purposes, we'll simulate the connection
    const wsUrl = `wss://your-collaboration-server.com/room/${this.roomId}`;
    
    return new Promise((resolve, reject) => {
      try {
        // Simulate WebSocket connection
        this.simulateWebSocketConnection();
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }

  private simulateWebSocketConnection(): void {
    // Simulate WebSocket for demo purposes
    // In production, this would be a real WebSocket connection
    console.log('Simulating WebSocket connection for room:', this.roomId);
    
    // Simulate receiving events
    setTimeout(() => {
      this.simulateOtherUsers();
    }, 1000);
  }

  private simulateOtherUsers(): void {
    // Simulate other users joining
    const mockUsers: User[] = [
      {
        id: 'user-1',
        name: 'Alice Johnson',
        email: 'alice@example.com',
        color: '#3b82f6',
        cursor: { x: 100, y: 200, visible: true }
      },
      {
        id: 'user-2',
        name: 'Bob Smith',
        email: 'bob@example.com',
        color: '#10b981',
        cursor: { x: 300, y: 400, visible: false }
      }
    ];

    mockUsers.forEach(user => {
      this.users.set(user.id, user);
      this.handleEvent({
        id: this.generateId(),
        type: 'user_joined',
        userId: user.id,
        timestamp: Date.now(),
        data: user
      });
    });
  }

  private disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  private sendEvent(event: CollaborationEvent): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(event));
    } else {
      // Simulate sending event
      console.log('Sending event:', event);
      this.handleEvent(event); // Echo back for demo
    }
  }

  private handleEvent(event: CollaborationEvent): void {
    switch (event.type) {
      case 'user_joined': {
        const joinedUser = event.data as User;
        this.users.set(joinedUser.id, joinedUser);
        break;
      }
      
      case 'user_left':
        this.users.delete(event.userId);
        break;
      
      case 'cursor_moved': {
        const cursorData = event.data as User['cursor'];
        const userWithCursor = this.users.get(event.userId);
        if (userWithCursor && cursorData) {
          userWithCursor.cursor = cursorData;
          this.users.set(event.userId, userWithCursor);
        }
        break;
      }
      
      case 'selection_changed': {
        const selectionData = event.data as User['selection'];
        const userWithSelection = this.users.get(event.userId);
        if (userWithSelection && selectionData) {
          userWithSelection.selection = selectionData;
          this.users.set(event.userId, userWithSelection);
        }
        break;
      }
    }

    // Notify listeners
    const listeners = this.eventListeners.get(event.type);
    if (listeners) {
      listeners.forEach(listener => listener(event));
    }

    // Notify all event listeners
    const allListeners = this.eventListeners.get('*');
    if (allListeners) {
      allListeners.forEach(listener => listener(event));
    }
  }

  // Public API methods
  updateCursor(x: number, y: number): void {
    if (!this.currentUser) return;

    this.currentUser.cursor = { x, y, visible: true };
    this.sendEvent({
      id: this.generateId(),
      type: 'cursor_moved',
      userId: this.currentUser.id,
      timestamp: Date.now(),
      data: this.currentUser.cursor
    });
  }

  updateSelection(selection: User['selection']): void {
    if (!this.currentUser) return;

    this.currentUser.selection = selection;
    this.sendEvent({
      id: this.generateId(),
      type: 'selection_changed',
      userId: this.currentUser.id,
      timestamp: Date.now(),
      data: selection
    });
  }

  broadcastCardUpdate(cardId: string, updates: Partial<Card>): void {
    if (!this.currentUser) return;

    this.sendEvent({
      id: this.generateId(),
      type: 'card_updated',
      userId: this.currentUser.id,
      timestamp: Date.now(),
      data: { cardId, updates }
    });
  }

  broadcastCardMove(cardId: string, fromColumn: string, toColumn: string, index?: number): void {
    if (!this.currentUser) return;

    this.sendEvent({
      id: this.generateId(),
      type: 'card_moved',
      userId: this.currentUser.id,
      timestamp: Date.now(),
      data: { cardId, fromColumn, toColumn, index }
    });
  }

  // Event listeners
  addEventListener(eventType: string, listener: (event: CollaborationEvent) => void): void {
    if (!this.eventListeners.has(eventType)) {
      this.eventListeners.set(eventType, new Set());
    }
    this.eventListeners.get(eventType)!.add(listener);
  }

  removeEventListener(eventType: string, listener: (event: CollaborationEvent) => void): void {
    const listeners = this.eventListeners.get(eventType);
    if (listeners) {
      listeners.delete(listener);
      if (listeners.size === 0) {
        this.eventListeners.delete(eventType);
      }
    }
  }

  // Getters
  getCurrentUser(): User | null {
    return this.currentUser;
  }

  getUsers(): User[] {
    return Array.from(this.users.values());
  }

  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // Utility methods
  getUserColor(userId: string): string {
    const user = this.users.get(userId);
    return user?.color || '#6b7280';
  }

  getActiveUsers(): User[] {
    return this.getUsers().filter(user => user.id !== this.currentUser?.id);
  }

  // Presence indicators
  isUserActive(userId: string): boolean {
    const user = this.users.get(userId);
    if (!user) return false;

    // Consider user active if they've had recent activity
    const lastActivity = user.cursor?.visible || user.selection;
    return Boolean(lastActivity);
  }

  getUserPresence(userId: string): 'online' | 'away' | 'offline' {
    const user = this.users.get(userId);
    if (!user) return 'offline';

    if (this.isUserActive(userId)) return 'online';
    return 'away';
  }
}

export const collaborationService = CollaborationService.getInstance();
