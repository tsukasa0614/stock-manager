import { createContext, useContext, useState, useEffect } from 'react';
import { AuthResponse, TokenPayload } from '../types/auth';


interface AuthContextType {
  isAuthenticated: boolean;
  user: TokenPayload | null;
  login: (response: AuthResponse) => void;
  logout: () => Promise<void>;
  getAccessToken: () => string | null;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<TokenPayload | null>(null);


  const login = (response: AuthResponse) => {
   //todo
  };

  const handleLogout = async () => {
    //todo
  };

  const getAccessToken = () => {
    //todo
    return null;
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        login,
        logout: handleLogout,
        getAccessToken,
      }}
    >
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