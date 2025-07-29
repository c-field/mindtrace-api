import { useState, useEffect } from 'react';
import { authService } from '../services';
import { logError } from '../utils';
import type { AuthResponse } from '../types';

interface UseAuthReturn {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<AuthResponse>;
  register: (email: string, password: string) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  userEmail: string | null;
}

export const useAuth = (): UseAuthReturn => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = await authService.getStoredToken();
      if (token) {
        const isValid = await authService.verifyToken();
        setIsAuthenticated(isValid);
        
        if (isValid) {
          const email = await authService.getCurrentUser();
          setUserEmail(email);
        }
      }
    } catch (error) {
      logError(error, 'Auth status check');
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<AuthResponse> => {
    const result = await authService.login(email, password);
    
    if (result.success) {
      setIsAuthenticated(true);
      setUserEmail(email);
    }
    
    return result;
  };

  const register = async (email: string, password: string): Promise<AuthResponse> => {
    const result = await authService.register(email, password);
    
    if (result.success) {
      setIsAuthenticated(true);
      setUserEmail(email);
    }
    
    return result;
  };

  const logout = async (): Promise<void> => {
    await authService.logout();
    setIsAuthenticated(false);
    setUserEmail(null);
  };

  return {
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    userEmail,
  };
};