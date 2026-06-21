import React, { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from 'react';
import { LoginResponse, getCurrentUser, logout as apiLogout } from '../services/authService';
import { clearBuyerInfoStorage, setBuyerStorageContext } from '../services/checkoutService';

interface AuthContextType {
  user: LoginResponse | null;
  loading: boolean;
  isAuthenticated: boolean;
  refreshUser: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

// Storage key constant
const STORAGE_KEY = 'user';

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<LoginResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const refreshInProgressRef = useRef(false);

  // Helper to safely get user from localStorage
  const getUserFromStorage = useCallback((): LoginResponse | null => {
    try {
      const storedUser = localStorage.getItem(STORAGE_KEY);
      if (storedUser) {
        return JSON.parse(storedUser) as LoginResponse;
      }
    } catch (error) {
      console.warn('Failed to parse user from localStorage:', error);
      localStorage.removeItem(STORAGE_KEY);
    }
    return null;
  }, []);

  // Helper to safely save user to localStorage
  const saveUserToStorage = useCallback((userData: LoginResponse | null) => {
    try {
      if (userData) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch (error) {
      console.warn('Failed to save user to localStorage:', error);
    }
  }, []);

  // Fetch user from backend
  const fetchUserFromBackend = useCallback(async (): Promise<LoginResponse | null> => {
    try {
      const currentUser = await getCurrentUser();
      return currentUser;
    } catch (error) {
      console.warn('Failed to fetch user from backend:', error);
      return null;
    }
  }, []);

  // Refresh user data from backend (with race condition protection)
  const refreshUser = useCallback(async () => {
    // Prevent multiple simultaneous refresh calls
    if (refreshInProgressRef.current) {
      return;
    }

    refreshInProgressRef.current = true;
    try {
      const currentUser = await fetchUserFromBackend();
      setUser(currentUser);
      saveUserToStorage(currentUser);
    } catch (error) {
      console.error('Error refreshing user:', error);
      setUser(null);
      saveUserToStorage(null);
    } finally {
      refreshInProgressRef.current = false;
    }
  }, [fetchUserFromBackend, saveUserToStorage]);

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      // First, load from localStorage for instant UI update
      const storedUser = getUserFromStorage();
      if (storedUser) {
        setUser(storedUser);
      }

      // Then verify with backend
      try {
        const backendUser = await fetchUserFromBackend();
        if (backendUser) {
          setUser(backendUser);
          saveUserToStorage(backendUser);
        } else {
          // Backend says not authenticated, clear local state
          setUser(null);
          saveUserToStorage(null);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        // On error, keep local user but mark as unauthenticated if backend fails
        // This allows offline functionality
        if (!storedUser) {
          setUser(null);
        }
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, [getUserFromStorage, fetchUserFromBackend, saveUserToStorage]);

  // Forced logout (e.g., admin suspends user while logged in)
  useEffect(() => {
    const handler = (_evt: Event) => {
      setBuyerStorageContext(undefined);
      setUser(null);
      saveUserToStorage(null);
      clearBuyerInfoStorage();
    };
    window.addEventListener('carriya:auth:forced-logout', handler);
    return () => window.removeEventListener('carriya:auth:forced-logout', handler);
  }, [saveUserToStorage]);

  useEffect(() => {
    // Use email as identifier for storage (since raw ID is removed for security)
    setBuyerStorageContext(user?.email || undefined);
  }, [user?.email]);

  // Logout handler
  const logout = useCallback(async () => {
    const currentUserEmail = user?.email;
    try {
      await apiLogout();
    } catch (error) {
      console.error('Logout error:', error);
      // Continue with logout even if API call fails
    } finally {
      if (currentUserEmail) {
        setBuyerStorageContext(currentUserEmail);
        clearBuyerInfoStorage();
      }
      setBuyerStorageContext(undefined);
      setUser(null);
      saveUserToStorage(null);
      clearBuyerInfoStorage();
    }
  }, [saveUserToStorage, user?.email]);

  const value: AuthContextType = {
    user,
    loading,
    isAuthenticated: !!user,
    refreshUser,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
