import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User } from '../types';

interface UserContextType {
  user: User;
  updateUser: (data: Partial<User>) => void;
}

const DEFAULT_USER: User = {
  id: 'user_1',
  firstName: 'James',
  lastName: 'Robinson',
  email: 'james@example.com',
  phone: '555-0100',
  role: 'USER',
  creditScore: {
    equifax: 630,
    experian: 635,
    transunion: 640
  },
  negativeItems: []
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User>(DEFAULT_USER);

  const updateUser = (data: Partial<User>) => {
    setUser(prev => ({ ...prev, ...data }));
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
