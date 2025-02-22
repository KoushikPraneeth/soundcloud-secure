import React, { useRef, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX } from 'lucide-react';
import { usePlayerStore } from '../store/playerStore';

export const Player: React.FC = () => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const { 
    currentTrack, 
    isPlaying, 
    volume,
    setIsPlaying,
    setVolume,
  } = usePlayerStore();

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  useEffect(() => {
    if (currentTrack?.temporaryLink) {
      setIsPlaying(true);
    }
  }, [currentTrack, setIsPlaying]);

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(() => setIsPlaying(false));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, setIsPlaying]);

  if (!currentTrack) {
    return null;
  }

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    setVolume(volume === 0 ? 1 : 0);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 p-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-4 flex-1">
          <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-md flex items-center justify-center">
            <img
              src={`https://api.dicebear.com/7.x/identicon/svg?seed=${currentTrack.name}`}
              alt="Album Art"
              className="w-full h-full rounded-md"
            />
          </div>
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white">{currentTrack.name}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">From Dropbox</p>
          </div>
        </div>

        <div className="flex items-center justify-center space-x-4 flex-1">
          <button
            className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition disabled:opacity-50"
            disabled={true}
          >
            <SkipBack size={20} />
          </button>
          
          <button
            onClick={togglePlay}
            className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition"
          >
            {isPlaying ? <Pause size={20} /> : <Play size={20} />}
          </button>

          <button
            className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition disabled:opacity-50"
            disabled={true}
          >
            <SkipForward size={20} />
          </button>
        </div>

        <div className="flex items-center space-x-2 flex-1 justify-end">
          <button
            onClick={toggleMute}
            className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition"
          >
            {volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </button>
          
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={handleVolumeChange}
            className="w-24 accent-blue-600"
          />
        </div>
      </div>

      <audio
        ref={audioRef}
        src={currentTrack.temporaryLink}
        onEnded={() => setIsPlaying(false)}
      />
    </div>
  );
};
