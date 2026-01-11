
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { User } from '../types';

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

  // Load user from local storage (Session Persistence)
  useEffect(() => {
    const savedUser = localStorage.getItem('creditfix_user');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        if (parsed.email) {
            setUser(parsed);
            setIsAuthenticated(true);
        }
      } catch (e) {
        console.error("Failed to load user", e);
        localStorage.removeItem('creditfix_user');
      }
    }
    setIsLoading(false);
  }, []);

  const updateUser = (data: Partial<User>) => {
    setUser(prev => {
      const updated = { ...prev, ...data };
      
      // 1. Update Session Storage (Current Login)
      localStorage.setItem('creditfix_user', JSON.stringify(updated));
      
      // 2. Update Persistent "Database" Storage (Survives Logout)
      if (updated.email) {
        localStorage.setItem(`creditfix_db_${updated.email}`, JSON.stringify(updated));
      }
      
      return updated;
    });
  };

  const login = (userData: User) => {
    setUser(userData);
    setIsAuthenticated(true);
    localStorage.setItem('creditfix_user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(DEFAULT_USER);
    setIsAuthenticated(false);
    // Only clear session data, not the "database" data
    localStorage.removeItem('creditfix_user');
    localStorage.removeItem('creditfix_onboarding_state');
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
