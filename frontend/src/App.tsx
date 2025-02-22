import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
import { Library } from "./components/Library";
import { Settings } from "./components/Settings";
import { Playlists } from "./components/Playlists";
import { AuthCallback } from "./components/AuthCallback";
import { useAuthStore } from "./store/authStore";
import { Player } from "./components/Player";
import { usePlayerStore } from "./store/playerStore";
import { RefreshCw } from "lucide-react";

// Protected route wrapper
const ProtectedLayout = () => {
  const { isAuthenticated, isAuthenticating } = useAuthStore();
  const { currentTrack } = usePlayerStore();

  if (isAuthenticating) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center p-8">
          <RefreshCw
            className="mx-auto mb-4 text-blue-600 dark:text-blue-400 animate-spin"
            size={48}
          />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Authenticating...
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Please wait while we verify your session
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center p-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Welcome to SoundVaultPro
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Connect your Dropbox to start playing music
          </p>
          <a
            href={`https://www.dropbox.com/oauth2/authorize?client_id=${
              import.meta.env.VITE_DROPBOX_APP_KEY
            }&redirect_uri=${encodeURIComponent(
              window.location.origin + "/auth/dropbox/callback"
            )}&response_type=code`}
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
          >
            Connect Dropbox
          </a>
        </div>
      </div>
    );
  }

  return (
    <Layout>
      <Routes>
        <Route index element={<Library />} />
        <Route path="playlists" element={<Playlists />} />
        <Route path="settings" element={<Settings />} />
      </Routes>
      {currentTrack && <Player />}
    </Layout>
  );
};

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/auth/dropbox/callback" element={<AuthCallback />} />
        <Route path="/*" element={<ProtectedLayout />} />
      </Routes>
    </Router>
  );
}
