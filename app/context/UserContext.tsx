'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { sdk } from '@farcaster/miniapp-sdk';

type UserContextType = {
  fid: number | null;
  username: string | null;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [fid, setFid] = useState<number | null>(null);
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    async function getFarcasterUser() {
      try {
        const { user } = await sdk.context;
        if (user) {
          setFid(user.fid);
          setUsername(user.username);
        }
      } catch (error) {
        console.error("Failed to get Farcaster user:", error);
      }
    }
    getFarcasterUser();
  }, []);

  const value = { fid, username };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}