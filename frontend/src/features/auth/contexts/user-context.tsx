"use client";

import React, { createContext, useContext } from 'react';
import { UserProfile } from '@/features/auth/types';

interface UserContextType {
  currentUser: UserProfile | null;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

interface UserProviderProps {
  children: React.ReactNode;
  currentUser: UserProfile | null;
}

export function UserProvider({ children, currentUser }: UserProviderProps) {
  return (
    <UserContext.Provider value={{ currentUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}

export function useCurrentUser() {
  const { currentUser } = useUser();
  return currentUser;
}