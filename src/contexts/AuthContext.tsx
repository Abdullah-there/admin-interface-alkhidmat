import { createContext, useContext, useState, useEffect} from 'react';
import type { ReactNode } from 'react';
import type { User } from '@/lib/constants';
import { getSession, setSession, clearSession, findUser, initializeStorage } from '@/lib/storage';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, role: string) => boolean;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProviderLess = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    initializeStorage();
    const session = getSession();
    if (session) {
      setUser(session);
    }
  }, []);

  const login = (email: string, password: string, role: string): boolean => {
    const foundUser = findUser(email, password, role);
    if (foundUser) {
      setSession(foundUser);
      setUser(foundUser);
      return true;
    }
    return false;
  };

  const logout = () => {
    clearSession();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
