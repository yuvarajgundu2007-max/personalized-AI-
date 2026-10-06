import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [onboardingRequired, setOnboardingRequired] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('adaptiveai_token');
    const storedUser = localStorage.getItem('adaptiveai_user');
    if (token && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
        // Verify token is still valid
        authAPI.me().then(res => {
          setUser(res.data.user);
          setOnboardingRequired(!res.data.user.profile?.onboardingComplete);
        }).catch(() => {
          localStorage.removeItem('adaptiveai_token');
          localStorage.removeItem('adaptiveai_user');
          setUser(null);
        }).finally(() => setLoading(false));
      } catch {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await authAPI.login({ email, password });
    const { token, user: userData, onboardingRequired: needsOnboarding } = res.data;
    localStorage.setItem('adaptiveai_token', token);
    localStorage.setItem('adaptiveai_user', JSON.stringify(userData));
    setUser(userData);
    setOnboardingRequired(needsOnboarding);
    return { user: userData, onboardingRequired: needsOnboarding };
  }, []);

  const register = useCallback(async (name, email, password) => {
    const res = await authAPI.register({ name, email, password });
    const { token, user: userData } = res.data;
    localStorage.setItem('adaptiveai_token', token);
    localStorage.setItem('adaptiveai_user', JSON.stringify(userData));
    setUser(userData);
    setOnboardingRequired(true);
    return { user: userData };
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('adaptiveai_token');
    localStorage.removeItem('adaptiveai_user');
    setUser(null);
    setOnboardingRequired(false);
  }, []);

  const completeOnboarding = useCallback(() => {
    setOnboardingRequired(false);
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      onboardingRequired,
      login,
      register,
      logout,
      completeOnboarding,
      isAuthenticated: !!user,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
