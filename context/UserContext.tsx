import React, { createContext, useContext, useState, ReactNode } from 'react';

type UserRole = 'ADMIN' | 'CLIENT';

interface UserContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  toggleRole: () => void;
  user: {
    name: string;
    avatar: string;
  };
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<UserRole>('ADMIN');

  const user = {
    name: role === 'ADMIN' ? 'Admin User' : 'James Robinson',
    avatar: role === 'ADMIN' ? 'AU' : 'JR'
  };

  const toggleRole = () => {
    setRole(prev => prev === 'ADMIN' ? 'CLIENT' : 'ADMIN');
  };

  return (
    <UserContext.Provider value={{ role, setRole, toggleRole, user }}>
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