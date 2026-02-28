import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Wifi, WifiOff, Circle } from 'lucide-react';
import { collaborationService, type User } from '../../services/collaborationService';
import './CollaborationPresence.css';

interface CollaborationPresenceProps {
  roomId: string;
  currentUser: Omit<User, 'id'>;
  className?: string;
}

const CollaborationPresence: React.FC<CollaborationPresenceProps> = ({
  roomId,
  currentUser,
  className = ''
}) => {
  const [users, setUsers] = useState<User[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [showUserList, setShowUserList] = useState(false);

  useEffect(() => {
    const handleEvent = (event: any) => {
      setUsers(collaborationService.getUsers());
      setIsConnected(collaborationService.isConnected());
    };

    // Join the collaboration room
    collaborationService.joinRoom(roomId, currentUser).catch(console.error);

    // Listen for events
    collaborationService.addEventListener('*', handleEvent);
    collaborationService.addEventListener('user_joined', handleEvent);
    collaborationService.addEventListener('user_left', handleEvent);

    // Initial state
    setUsers(collaborationService.getUsers());
    setIsConnected(collaborationService.isConnected());

    return () => {
      collaborationService.removeEventListener('*', handleEvent);
      collaborationService.removeEventListener('user_joined', handleEvent);
      collaborationService.removeEventListener('user_left', handleEvent);
      collaborationService.leaveRoom();
    };
  }, [roomId, currentUser]);

  const activeUsers = users.filter(user => 
    collaborationService.getUserPresence(user.id) === 'online'
  );

  const getUserStatusColor = (userId: string) => {
    const presence = collaborationService.getUserPresence(userId);
    switch (presence) {
      case 'online': return '#10b981';
      case 'away': return '#f59e0b';
      case 'offline': return '#6b7280';
      default: return '#6b7280';
    }
  };

  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className={`collaboration-presence ${className}`}>
      {/* Connection Status */}
      <div className="connection-status">
        {isConnected ? (
          <Wifi size={16} className="connected" />
        ) : (
          <WifiOff size={16} className="disconnected" />
        )}
        <span className="status-text">
          {isConnected ? 'Connected' : 'Disconnected'}
        </span>
      </div>

      {/* Active Users */}
      <div className="active-users">
        <button
          onClick={() => setShowUserList(!showUserList)}
          className="users-toggle"
          aria-label="Toggle user list"
        >
          <Users size={16} />
          <span className="user-count">{activeUsers.length}</span>
        </button>

        {/* User Avatars */}
        <div className="user-avatars">
          {activeUsers.slice(0, 3).map(user => (
            <div
              key={user.id}
              className="user-avatar"
              style={{ backgroundColor: user.color }}
              title={user.name}
            >
              {getUserInitials(user.name)}
            </div>
          ))}
          
          {activeUsers.length > 3 && (
            <div className="more-users">
              +{activeUsers.length - 3}
            </div>
          )}
        </div>
      </div>

      {/* User List Dropdown */}
      <AnimatePresence>
        {showUserList && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="user-list-dropdown"
          >
            <div className="dropdown-header">
              <h3>Active Collaborators</h3>
              <button
                onClick={() => setShowUserList(false)}
                className="close-dropdown"
                aria-label="Close user list"
              >
                ×
              </button>
            </div>

            <div className="user-list">
              {users.map(user => {
                const presence = collaborationService.getUserPresence(user.id);
                const isCurrentUser = collaborationService.getCurrentUser()?.id === user.id;
                
                return (
                  <div key={user.id} className="user-item">
                    <div className="user-info">
                      <div
                        className="user-avatar large"
                        style={{ backgroundColor: user.color }}
                      >
                        {getUserInitials(user.name)}
                      </div>
                      <div className="user-details">
                        <div className="user-name">
                          {user.name}
                          {isCurrentUser && <span className="current-user-badge">You</span>}
                        </div>
                        <div className="user-email">{user.email}</div>
                      </div>
                    </div>
                    
                    <div className="user-status">
                      <Circle
                        size={8}
                        fill={getUserStatusColor(user.id)}
                        color={getUserStatusColor(user.id)}
                      />
                      <span className="status-label">{presence}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {users.length === 0 && (
              <div className="no-users">
                <Users size={24} />
                <span>No other users in this workspace</span>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Live Cursors */}
      {activeUsers.map(user => {
        if (!user.cursor || !user.cursor.visible) return null;
        
        return (
          <div
            key={`cursor-${user.id}`}
            className="live-cursor"
            style={{
              left: `${user.cursor.x}px`,
              top: `${user.cursor.y}px`,
              borderColor: user.color
            }}
          >
            <div className="cursor-label" style={{ backgroundColor: user.color }}>
              {user.name}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default CollaborationPresence;
