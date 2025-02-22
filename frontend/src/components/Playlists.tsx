import React from 'react';
import { PlusCircle, Music } from 'lucide-react';

export const Playlists: React.FC = () => {
  // This is a placeholder UI until we implement playlist functionality with Supabase
  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Your Playlists</h2>
          <button
            onClick={() => alert('Coming soon!')}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <PlusCircle size={18} className="mr-2" />
            New Playlist
          </button>
        </div>

        {/* Empty state */}
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg">
          <Music className="mx-auto mb-4 text-gray-400 dark:text-gray-500" size={48} />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Create Your First Playlist
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Organize your music into custom playlists
          </p>
          <div className="space-y-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">Coming soon:</p>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
              <li>• Create and manage multiple playlists</li>
              <li>• Add tracks from your library</li>
              <li>• Organize and reorder tracks</li>
              <li>• Share playlists with others</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
