import React from 'react';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';
import { LogOut, Moon, Sun } from 'lucide-react';
import { revokeAccess } from '../utils/dropbox';

export const Settings: React.FC = () => {
  const { isAuthenticated } = useAuthStore();
  const { isDarkMode, toggleTheme } = useThemeStore();

  const handleDisconnect = async () => {
    try {
      await revokeAccess();
    } catch (error) {
      console.error('Failed to disconnect:', error);
    }
  };

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">Settings</h2>
        
        {/* Theme Settings */}
        <div className="mb-8 bg-white dark:bg-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Appearance</h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-700 dark:text-gray-300">Dark Mode</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Toggle between light and dark themes
              </p>
            </div>
            <button
              onClick={toggleTheme}
              className="inline-flex items-center px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition"
            >
              {isDarkMode ? (
                <>
                  <Sun size={18} className="mr-2" />
                  Light Mode
                </>
              ) : (
                <>
                  <Moon size={18} className="mr-2" />
                  Dark Mode
                </>
              )}
            </button>
          </div>
        </div>

        {/* Dropbox Connection */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Dropbox Connection</h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-700 dark:text-gray-300">
                {isAuthenticated ? 'Connected to Dropbox' : 'Not connected'}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {isAuthenticated 
                  ? 'Your music files are synced from Apps/SoundVaultPro folder'
                  : 'Connect to access your music files'
                }
              </p>
            </div>
            {isAuthenticated ? (
              <button
                onClick={handleDisconnect}
                className="inline-flex items-center px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
              >
                <LogOut size={18} className="mr-2" />
                Disconnect
              </button>
            ) : (
              <a
                href={`https://www.dropbox.com/oauth2/authorize?client_id=${import.meta.env.VITE_DROPBOX_APP_KEY}&redirect_uri=${encodeURIComponent(window.location.origin + '/auth/dropbox/callback')}&response_type=code`}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Connect Dropbox
              </a>
            )}
          </div>
        </div>

        {/* Version Info */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            SoundVaultPro v1.0.0
          </p>
        </div>
      </div>
    </div>
  );
};
