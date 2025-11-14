import React, { useState, useEffect } from 'react';
import { Lock } from 'lucide-react';

interface AdminProtectedProps {
  children: React.ReactNode;
}

const ADMIN_PASSWORD = 'walkingchallengeadmin';
const STORAGE_KEY = 'stepChallenge_adminAuth';
const AUTH_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

export const AdminProtected: React.FC<AdminProtectedProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if already authenticated
    const authData = localStorage.getItem(STORAGE_KEY);
    if (authData) {
      try {
        const { timestamp } = JSON.parse(authData);
        const now = Date.now();

        // Check if auth hasn't expired
        if (now - timestamp < AUTH_EXPIRY) {
          setIsAuthenticated(true);
        } else {
          localStorage.removeItem(STORAGE_KEY);
        }
      } catch (error) {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
    setIsLoading(false);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      setError('');
      // Store auth with timestamp
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          timestamp: Date.now(),
        })
      );
    } else {
      setError('Incorrect password. Please try again.');
      setPassword('');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem(STORAGE_KEY);
    setPassword('');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-[calc(100vh-200px)] flex items-center justify-center">
        <div className="glass-card p-8 max-w-md w-full">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-accent/20 rounded-full mb-4">
              <Lock className="w-8 h-8 text-accent" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Admin Access Required</h2>
            <p className="text-sm text-gray-400">
              Enter the admin password to access the control panel
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                className="w-full px-4 py-3 bg-primary-light rounded-lg border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent"
                autoFocus
              />
            </div>

            {error && (
              <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm">
                {error}
              </div>
            )}

            <button type="submit" className="w-full btn-primary">
              Unlock Admin Panel
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-gray-500">
            Access will remain active for 24 hours
          </div>
        </div>
      </div>
    );
  }

  // Show logout button when authenticated
  return (
    <div>
      <div className="flex justify-end mb-4">
        <button
          onClick={handleLogout}
          className="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-2"
        >
          <Lock className="w-4 h-4" />
          Logout from Admin
        </button>
      </div>
      {children}
    </div>
  );
};
