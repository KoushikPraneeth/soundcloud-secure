import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Music, List, Settings, Moon, Sun } from "lucide-react";
import { useThemeStore } from "../store/themeStore";

export const Layout: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isDarkMode, toggleTheme } = useThemeStore();

  const navItems = [
    { path: "/", label: "Library", icon: Music },
    { path: "/playlists", label: "Playlists", icon: List },
    { path: "/settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className={`min-h-screen flex ${isDarkMode ? "dark" : ""}`}>
      {/* Sidebar */}
      <div className="w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex-shrink-0">
        <div className="p-4">
          <h1 className="text-xl font-bold text-gray-800 dark:text-white">
            SoundVaultPro
          </h1>
        </div>

        <nav className="mt-8">
          {navItems.map(({ path, label, icon: Icon }) => (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={`w-full flex items-center px-6 py-3 text-sm font-medium transition-colors
                ${
                  location.pathname === path
                    ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20"
                    : "text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                }`}
            >
              <Icon size={18} className="mr-3" />
              {label}
            </button>
          ))}
        </nav>

        <div className="absolute bottom-0 w-64 p-4 border-t border-gray-200 dark:border-gray-800">
          <button
            onClick={toggleTheme}
            className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors w-full"
          >
            {isDarkMode ? (
              <>
                <Sun size={18} className="mr-3" />
                Light Mode
              </>
            ) : (
              <>
                <Moon size={18} className="mr-3" />
                Dark Mode
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 bg-gray-50 dark:bg-gray-900">
        <main className="h-full">{children}</main>
      </div>
    </div>
  );
};
