import React, { useEffect } from 'react';
import { ErrorBoundary } from './components/error-boundary/ErrorBoundary';
import MainLayout from './components/layout/MainLayout';
import Board from './components/board/Board'; 
import { LoadingScreen } from './components/loading-screen/LoadingScreen';
import { useWorkspaceStore } from './state/workspaceStore';
import { useThemeStore } from './state/themeStore';
import './styles/design-system.css';

function AppContent() {
  const workspace = useWorkspaceStore((state) => state.workspace);
  const { getResolvedTheme } = useThemeStore();
  const [isHydrated, setIsHydrated] = React.useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsHydrated(true);
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isHydrated) {
      const resolvedTheme = getResolvedTheme();
      document.documentElement.setAttribute('data-theme', resolvedTheme);
      document.documentElement.classList.toggle('dark', resolvedTheme === 'dark');
    }
  }, [isHydrated, getResolvedTheme]);

  if (!isHydrated) {
    return <LoadingScreen />;
  }

  const activePageId = workspace.activePageId;

  return (
    <MainLayout>
      {activePageId ? (
        <Board pageId={activePageId} />
      ) : (
        <div className="empty-state">
          <div className="empty-illustration">📄</div>
          <h2 className="empty-title">No active page</h2>
          <p className="empty-description">
            Select a page from the sidebar or create a new one to get started.
          </p>
        </div>
      )}
    </MainLayout>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  );
}