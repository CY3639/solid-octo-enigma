import { createContext, useState, useEffect, useContext, useMemo } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);       // decoded JWT payload
  const [isLoading, setIsLoading] = useState(true); // splash screen stays until this resolves

  // on app launch, check if a token already exists (persistent login)
  useEffect(() => {
    async function restoreSession() {
      try {
        const token = await authService.getToken();
        if (token) {
          const decoded = authService.decodeToken(token);
          // check if token is expired
          if (decoded && decoded.exp * 1000 > Date.now()) {
            setUser(decoded);
          } else {
            await authService.logout(); // clean up expired token
          }
        }
      } catch (e) {
        console.error('Session restore failed:', e);
      } finally {
        setIsLoading(false);
      }
    }
    restoreSession();
  }, []);

  const login = async (username, password) => {
    const result = await authService.login(username, password);
    const decoded = authService.decodeToken(result.token);
    setUser(decoded);
    return result;
  };

  const register = async (username, password, isPharmacist) => {
    return await authService.register(username, password, isPharmacist);
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  // useMemo prevents unnecessary re-renders of every child component
  const value = useMemo(() => ({
    user,
    isLoading,
    isLoggedIn: !!user,
    isPharmacist: user?.isPharmacist || false,
    isAdmin: user?.isAdmin || false,
    login,
    register,
    logout,
  }), [user, isLoading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}