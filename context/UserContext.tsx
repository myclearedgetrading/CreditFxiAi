
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { User } from '../types';

interface UserContextType {
  user: User;
  updateUser: (data: Partial<User>) => void;
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

  // Load user from local storage if available (simple persistence for MVP)
  useEffect(() => {
    const savedUser = localStorage.getItem('creditfix_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error("Failed to load user", e);
      }
    }
  }, []);

  const updateUser = (data: Partial<User>) => {
    setUser(prev => {
      const updated = { ...prev, ...data };
      localStorage.setItem('creditfix_user', JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <UserContext.Provider value={{ user, updateUser }}>
      {children}
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
