import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ThemeState {
  theme: 'light' | 'dark' | 'system';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  getResolvedTheme: () => 'light' | 'dark';
  initializeTheme: () => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: 'system',
      
      setTheme: (theme) => {
        set({ theme });
        
        // Apply theme to document
        const resolvedTheme = get().getResolvedTheme();
        document.documentElement.setAttribute('data-theme', resolvedTheme);
        document.documentElement.classList.toggle('dark', resolvedTheme === 'dark');
      },
      
      getResolvedTheme: () => {
        const { theme } = get();
        
        if (theme === 'system') {
          return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }
        
        return theme;
      },
      
      initializeTheme: () => {
        // Apply initial theme
        const resolvedTheme = get().getResolvedTheme();
        document.documentElement.setAttribute('data-theme', resolvedTheme);
        document.documentElement.classList.toggle('dark', resolvedTheme === 'dark');
        
        // Listen for system theme changes
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = () => {
          if (get().theme === 'system') {
            const newResolvedTheme = mediaQuery.matches ? 'dark' : 'light';
            document.documentElement.setAttribute('data-theme', newResolvedTheme);
            document.documentElement.classList.toggle('dark', newResolvedTheme === 'dark');
          }
        };
        
        mediaQuery.addEventListener('change', handleChange);
        
        // Return cleanup function
        return () => mediaQuery.removeEventListener('change', handleChange);
      }
    }),
    {
      name: 'theme-storage',
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Apply theme after rehydration
          const resolvedTheme = state.getResolvedTheme();
          document.documentElement.setAttribute('data-theme', resolvedTheme);
          document.documentElement.classList.toggle('dark', resolvedTheme === 'dark');
          
          // Initialize system theme detection
          state.initializeTheme();
        }
      }
    }
  )
);