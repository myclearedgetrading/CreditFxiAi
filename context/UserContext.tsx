
import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { User } from '../types';
import {
  subscribeToAuth,
  getUserFromFirestore,
  buildUserProfileFromAuthUser,
  saveUserToFirestore,
  isFirebaseAuthAvailable,
} from '../services/firebaseService';

interface UserContextType {
  user: User;
  updateUser: (data: Partial<User>) => void;
  login: (userData: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const DEFAULT_USER: User = {
  id: '',
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  role: 'USER',
  creditScore: {
    equifax: 0,
    experian: 0,
    transunion: 0
  },
  negativeItems: []
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User>(DEFAULT_USER);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const persistSessionUser = useCallback((next: User) => {
    setUser(next);
    setIsAuthenticated(true);
    localStorage.setItem('creditfix_user', JSON.stringify(next));
  }, []);

  const login = useCallback((userData: User) => {
    persistSessionUser(userData);
  }, [persistSessionUser]);

  const logout = useCallback(() => {
    setUser(DEFAULT_USER);
    setIsAuthenticated(false);
    localStorage.removeItem('creditfix_user');
    localStorage.removeItem('creditfix_onboarding_state');
  }, []);

  // Firebase Auth is source of truth when configured; otherwise demo/localStorage only.
  useEffect(() => {
    if (!isFirebaseAuthAvailable()) {
      const savedUser = localStorage.getItem('creditfix_user');
      if (savedUser) {
        try {
          const parsed = JSON.parse(savedUser) as User;
          if (parsed.email) {
            setUser(parsed);
            setIsAuthenticated(true);
          }
        } catch (e) {
          console.error('Failed to load user', e);
          localStorage.removeItem('creditfix_user');
        }
      }
      setIsLoading(false);
      return;
    }

    const unsubscribe = subscribeToAuth((fbUser) => {
      void (async () => {
        if (!fbUser) {
          logout();
          setIsLoading(false);
          return;
        }

        try {
          const profile = await getUserFromFirestore(fbUser.uid);
          const next = profile ?? buildUserProfileFromAuthUser(fbUser);
          if (!profile) {
            try {
              await saveUserToFirestore(next);
            } catch (e) {
              console.warn('Could not persist new user profile to Firestore:', e);
            }
          }
          persistSessionUser(next);
        } catch (e) {
          console.error('Failed to load user profile', e);
          persistSessionUser(buildUserProfileFromAuthUser(fbUser));
        } finally {
          setIsLoading(false);
        }
      })();
    });

    return () => unsubscribe();
  }, [logout, persistSessionUser]);

  const updateUser = (data: Partial<User>) => {
    setUser(prev => {
      const updated = { ...prev, ...data };
      localStorage.setItem('creditfix_user', JSON.stringify(updated));
      if (updated.email) {
        localStorage.setItem(`creditfix_db_${updated.email}`, JSON.stringify(updated));
      }
      return updated;
    });
  };

  return (
    <UserContext.Provider value={{ 
      user, 
      updateUser, 
      login, 
      logout, 
      isAuthenticated 
    }}>
      {!isLoading && children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
