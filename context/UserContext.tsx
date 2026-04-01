
import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { User } from '../types';
import {
  subscribeToAuth,
  getUserFromFirestore,
  buildUserProfileFromAuthUser,
  saveUserToFirestore,
  isFirebaseAuthAvailable,
} from '../services/firebaseService';

const SESSION_STORAGE_KEY = 'creditfix_session';

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

type SessionSnapshot = Pick<
  User,
  | 'id'
  | 'email'
  | 'role'
  | 'companyId'
  | 'firstName'
  | 'lastName'
  | 'lastReportAnalysisAt'
  | 'lastReportFileName'
  | 'lastReportSource'
  | 'lastEstimatedScoreImprovement'
  | 'lastNegativeItemCount'
>;

const toSessionSnapshot = (user: User): SessionSnapshot => ({
  id: user.id,
  email: user.email,
  role: user.role,
  companyId: user.companyId,
  firstName: user.firstName,
  lastName: user.lastName,
  lastReportAnalysisAt: user.lastReportAnalysisAt,
  lastReportFileName: user.lastReportFileName,
  lastReportSource: user.lastReportSource,
  lastEstimatedScoreImprovement: user.lastEstimatedScoreImprovement,
  lastNegativeItemCount: user.lastNegativeItemCount,
});

const fromSessionSnapshot = (snapshot: SessionSnapshot): User => ({
  ...DEFAULT_USER,
  ...snapshot,
});

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User>(DEFAULT_USER);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const persistSessionUser = useCallback((next: User) => {
    setUser(next);
    setIsAuthenticated(true);
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(toSessionSnapshot(next)));
  }, []);

  const login = useCallback((userData: User) => {
    persistSessionUser(userData);
  }, [persistSessionUser]);

  const logout = useCallback(() => {
    setUser(DEFAULT_USER);
    setIsAuthenticated(false);
    localStorage.removeItem(SESSION_STORAGE_KEY);
    localStorage.removeItem('creditfix_user');
    localStorage.removeItem('creditfix_onboarding_state');
  }, []);

  // Firebase Auth is source of truth when configured; otherwise demo/localStorage only.
  useEffect(() => {
    if (!isFirebaseAuthAvailable()) {
      const savedUser = localStorage.getItem(SESSION_STORAGE_KEY)
        || localStorage.getItem('creditfix_user');
      if (savedUser) {
        try {
          const parsed = JSON.parse(savedUser) as Partial<User>;
          if (parsed.email) {
            const hydrated = fromSessionSnapshot({
              id: parsed.id || '',
              email: parsed.email,
              role: parsed.role || 'USER',
              companyId: parsed.companyId || parsed.id || '',
              firstName: parsed.firstName || '',
              lastName: parsed.lastName || '',
            });
            setUser(hydrated);
            setIsAuthenticated(true);
          }
        } catch (e) {
          console.error('Failed to load user', e);
          localStorage.removeItem(SESSION_STORAGE_KEY);
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
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(toSessionSnapshot(updated)));
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
