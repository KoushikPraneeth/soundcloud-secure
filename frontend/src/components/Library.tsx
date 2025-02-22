import React, { useEffect, useRef, useCallback, useState } from "react";
import { Music, Lock } from "lucide-react";
import { usePlayerStore } from "../store/playerStore";
import { useAuthStore } from "../store/authStore";
import { createDropboxClient, fetchFiles } from "../utils/dropbox";
import { DropboxError } from "../types";
import { TrackSkeleton } from "./TrackSkeleton";

const LOAD_TIMEOUT = 30000; // 30 seconds timeout
const SCROLL_THRESHOLD = 0.8; // 80% of the height

export const Library: React.FC = () => {
  const {
    playlist,
    currentTrack,
    setCurrentTrack,
    setPlaylist,
    appendToPlaylist,
    isLoadingMore,
    setIsLoadingMore,
    hasMore,
    setHasMore,
    cursor,
    setCursor,
  } = usePlayerStore();
  const { isAuthenticated } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [timeoutSeconds, setTimeoutSeconds] = useState(LOAD_TIMEOUT / 1000);
  const [error, setError] = useState<string | null>(null);
  const observerTarget = useRef<HTMLDivElement>(null);

  const loadMoreTracks = useCallback(async () => {
    if (!cursor || !hasMore || isLoadingMore || loading) return;

    const client = createDropboxClient();
    if (!client) {
      setError("Not authenticated with Dropbox");
      return;
    }

    try {
      setIsLoadingMore(true);
      const tracks = await fetchFiles(client, cursor);
      appendToPlaylist(tracks);
    } catch (err) {
      console.error("Failed to load more tracks:", err);
      let errorMessage = "Failed to load more tracks. Please try again.";

      if (err instanceof DropboxError) {
        switch (err.code) {
          case "path/not_found":
            errorMessage =
              "Could not access Dropbox root directory. Please check your permissions.";
            break;
          case "invalid_access_token":
          case "expired_access_token":
            errorMessage =
              "Your Dropbox session has expired. Please reconnect your account.";
            break;
          default:
            errorMessage = err.description || err.message;
        }
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }

      setError(errorMessage);
    } finally {
      setIsLoadingMore(false);
    }
  }, [
    cursor,
    hasMore,
    isLoadingMore,
    loading,
    appendToPlaylist,
    setIsLoadingMore,
  ]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMoreTracks();
        }
      },
      {
        root: null,
        rootMargin: "20px",
        threshold: SCROLL_THRESHOLD,
      }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current);
      }
    };
  }, [loadMoreTracks]);

  const loadInitialTracks = async (): Promise<{ cleanup: () => void }> => {
    const client = createDropboxClient();
    if (!client) {
      setError("Not authenticated with Dropbox");
      return { cleanup: () => {} };
    }

    try {
      setLoading(true);
      setError(null);
      setTimeoutSeconds(LOAD_TIMEOUT / 1000);
      setCursor(null);
      setHasMore(true);

      let cleanupFn: () => void = () => {};

      const timeoutPromise = new Promise<never>((_, reject) => {
        const startTime = Date.now();
        const intervalId = setInterval(() => {
          const elapsed = Date.now() - startTime;
          const remaining = Math.max(
            0,
            Math.ceil((LOAD_TIMEOUT - elapsed) / 1000)
          );
          setTimeoutSeconds(remaining);
        }, 1000);

        const timeoutId = setTimeout(() => {
          clearInterval(intervalId);
          reject(new Error("Loading tracks timed out. Please try again."));
        }, LOAD_TIMEOUT);

        cleanupFn = () => {
          clearInterval(intervalId);
          clearTimeout(timeoutId);
        };
      });

      const tracks = await Promise.race([fetchFiles(client), timeoutPromise]);

      setPlaylist(tracks);
      return { cleanup: cleanupFn };
    } catch (err) {
      console.error("Failed to load tracks:", err);
      let errorMessage = "Failed to load tracks. Please try again.";

      if (err instanceof DropboxError) {
        switch (err.code) {
          case "path/not_found":
            errorMessage =
              "Could not access Dropbox root directory. Please check your permissions.";
            break;
          case "invalid_access_token":
          case "expired_access_token":
            errorMessage =
              "Your Dropbox session has expired. Please reconnect your account.";
            break;
          default:
            errorMessage = err.description || err.message;
        }
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }

      setError(errorMessage);
      return { cleanup: () => {} };
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cleanup: (() => void) | undefined;

    if (isAuthenticated) {
      const loadTracksWithCleanup = async () => {
        try {
          const { cleanup: trackCleanup } = await loadInitialTracks();
          cleanup = trackCleanup;
        } catch (error) {
          console.error("Failed to start loading tracks:", error);
        }
      };

      loadTracksWithCleanup();
    }

    return () => {
      if (cleanup) {
        cleanup();
      }
    };
  }, [isAuthenticated]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Your Library
        </h2>
        <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
          <Lock size={16} />
          <span>End-to-End Encrypted</span>
        </div>
      </div>

      <div className="grid gap-4">
        {loading ? (
          Array.from({ length: 3 }).map((_, index) => (
            <TrackSkeleton key={index} />
          ))
        ) : error ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg">
            <div className="text-red-500 dark:text-red-400 mb-4 max-w-md mx-auto">
              {error}
            </div>
            <button
              onClick={() => loadInitialTracks()}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
            >
              Retry
            </button>
          </div>
        ) : playlist.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg">
            <Music
              className="mx-auto mb-4 text-gray-400 dark:text-gray-500"
              size={48}
            />
            <div className="text-center">
              <p className="text-gray-600 dark:text-gray-400 mb-2">
                {isAuthenticated
                  ? "No music files found in your Dropbox root directory"
                  : "Connect your Dropbox to start playing music"}
              </p>
              {isAuthenticated && (
                <>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    To get started:
                  </p>
                  <ol className="text-sm text-gray-500 dark:text-gray-400 text-left list-decimal list-inside space-y-2">
                    <li>
                      Go to{" "}
                      <a
                        href="https://www.dropbox.com/home"
                        target="_blank"
                        rel="noopener"
                        className="text-blue-500 dark:text-blue-400 hover:underline transition-colors duration-200"
                      >
                        dropbox.com/home
                      </a>
                    </li>
                    <li>
                      Upload your music files (.mp3, .m4a, .wav, .ogg, or .flac)
                    </li>
                    <li>Wait a moment and click the retry button below</li>
                  </ol>
                  <button
                    onClick={() => loadInitialTracks()}
                    className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
                  >
                    Retry Loading Tracks
                  </button>
                </>
              )}
            </div>
          </div>
        ) : (
          <>
            {playlist.map((track) => (
              <div
                key={track.id}
                onClick={() => setCurrentTrack(track)}
                className={`p-4 rounded-lg cursor-pointer transition-all duration-200 transform hover:scale-[1.02] ${
                  currentTrack?.id === track.id
                    ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 shadow-md"
                    : "bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border-gray-100 dark:border-gray-700 hover:shadow-md"
                } border`}
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-md flex items-center justify-center overflow-hidden">
                    {track.metadata?.picture ? (
                      <img
                        src={track.metadata.picture.data}
                        alt={track.metadata.picture.description}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Music
                        size={20}
                        className="text-gray-500 dark:text-gray-400"
                      />
                    )}
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      {track.metadata?.title || track.name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {track.metadata?.artist || "Unknown Artist"}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            {isLoadingMore && (
              <div className="mt-4">
                <TrackSkeleton />
              </div>
            )}
            {hasMore && !error && <div ref={observerTarget} className="h-4" />}
          </>
        )}
      </div>
    </div>
  );
};
