import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause, SkipForward, Music, Volume2, ListMusic } from 'lucide-react';
import { useCafeStore } from '../store/useCafeStore';
import { useThemeStore } from '../store/useThemeStore';
import { useSocket } from '../context/SocketContext';

export const VinylPlayer = ({ isHost = false }) => {
  const socket = useSocket();
  const audioRef = useRef(null);

  // Load Zustand stores
  const {
    musicQueue,
    currentTrackIndex,
    currentTrackElapsed,
    musicPlaying,
    setMusicState,
    nextTrack
  } = useCafeStore();
  
  const { soundVolume, setSoundVolume } = useThemeStore();
  
  const [showQueue, setShowQueue] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);

  const currentTrack = musicQueue[currentTrackIndex] || null;

  // 1. Sync Audio Element playback state
  useEffect(() => {
    if (!audioRef.current || !currentTrack) return;

    // Load track URL
    if (audioRef.current.src !== currentTrack.url) {
      audioRef.current.src = currentTrack.url;
      audioRef.current.load();
    }

    // Adjust playback location
    const timeDifference = Math.abs(audioRef.current.currentTime - currentTrackElapsed);
    if (timeDifference > 2) {
      audioRef.current.currentTime = currentTrackElapsed;
    }

    // Trigger Play/Pause
    if (musicPlaying) {
      audioRef.current.play().catch((err) => {
        console.warn('🔇 [Audio Autoplay] Blocked by browser gesture restrictions. Clicking play is required.');
      });
    } else {
      audioRef.current.pause();
    }
  }, [currentTrackIndex, musicPlaying, currentTrack]);

  // Sync elapsed seconds when modified externally
  useEffect(() => {
    if (audioRef.current) {
      const timeDifference = Math.abs(audioRef.current.currentTime - currentTrackElapsed);
      if (timeDifference > 3) {
        audioRef.current.currentTime = currentTrackElapsed;
      }
    }
    setElapsedTime(currentTrackElapsed);
  }, [currentTrackElapsed]);

  // Adjust volume levels
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = soundVolume;
    }
  }, [soundVolume]);

  // 2. Track time updates
  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setElapsedTime(audioRef.current.currentTime);
      
      // If Host, occasionally broadcast elapsed sync heartbeat (every 8s)
      if (isHost && socket && Math.floor(audioRef.current.currentTime) % 8 === 0) {
        socket.emit('music:sync', {
          action: 'heartbeat',
          queue: musicQueue,
          trackIndex: currentTrackIndex,
          elapsed: audioRef.current.currentTime,
          isPlaying: musicPlaying
        });
      }
    }
  };

  const handleTrackEnded = () => {
    if (isHost) {
      const nextIdx = (currentTrackIndex + 1) % musicQueue.length;
      triggerSync('skip', nextIdx, 0, true);
    } else {
      nextTrack();
    }
  };

  // 3. Emit sync socket triggers
  const triggerSync = (action, trackIdx = currentTrackIndex, elapsed = elapsedTime, isPlaying = musicPlaying) => {
    setMusicState({ trackIndex: trackIdx, elapsed, isPlaying });
    
    if (socket) {
      socket.emit('music:sync', {
        action,
        queue: musicQueue,
        trackIndex: trackIdx,
        elapsed,
        isPlaying
      });
    }
  };

  const handlePlayToggle = () => {
    if (!isHost) {
      // Local play/pause fallback toggle for guests if they want to mute locally
      if (audioRef.current) {
        if (musicPlaying) {
          audioRef.current.pause();
          setMusicState({ isPlaying: false });
        } else {
          audioRef.current.play().catch(e => {});
          setMusicState({ isPlaying: true });
        }
      }
      return;
    }
    triggerSync(musicPlaying ? 'pause' : 'play', currentTrackIndex, elapsedTime, !musicPlaying);
  };

  const handleSkip = () => {
    const nextIdx = (currentTrackIndex + 1) % musicQueue.length;
    if (!isHost) {
      // Direct local skip
      setMusicState({ trackIndex: nextIdx, elapsed: 0, isPlaying: true });
      return;
    }
    triggerSync('skip', nextIdx, 0, true);
  };

  // Format MM:SS helper
  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const trackDuration = currentTrack ? currentTrack.duration : 1;
  const progressPercent = (elapsedTime / trackDuration) * 100;

  return (
    <div className="glass-panel p-5 rounded-cozy shadow-cozy border border-white/50 w-full max-w-sm flex flex-col gap-4 relative overflow-hidden">
      
      {/* Dynamic Background steam waves */}
      <div className="absolute inset-0 bg-gradient-to-r from-cozy-sand/5 to-cozy-terracotta/5 pointer-events-none" />

      {/* Internal Audio node */}
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleTrackEnded}
      />

      <div className="flex items-center gap-4 relative">
        {/* LEFT: Spinning Vinyl Record */}
        <div className="relative w-20 h-20 rounded-full bg-neutral-900 border-4 border-cozy-brown shadow-md flex items-center justify-center select-none shrink-0 group">
          {/* Vinyl Grooves */}
          <div className="absolute inset-2 border border-neutral-700/60 rounded-full" />
          <div className="absolute inset-4 border border-neutral-700/60 rounded-full" />
          
          {/* Animated Vinyl body */}
          <div
            className={`w-full h-full rounded-full flex items-center justify-center ${
              musicPlaying ? 'animate-vinyl-spin' : ''
            }`}
          >
            {/* Center Label (Cozy artwork style) */}
            <div className="w-7 h-7 rounded-full bg-cozy-terracotta border-2 border-white flex items-center justify-center overflow-hidden">
              <div className="w-1.5 h-1.5 rounded-full bg-neutral-900" />
            </div>
          </div>

          {/* Turntable Stylus needle */}
          <div
            className="absolute -top-1 -right-1 w-6 h-10 origin-top-left transition-transform duration-500 pointer-events-none"
            style={{
              transform: musicPlaying ? 'rotate(18deg)' : 'rotate(0deg)'
            }}
          >
            {/* Tone-arm needle */}
            <svg viewBox="0 0 24 48" className="w-full h-full drop-shadow">
              <path d="M 4,4 L 16,4 L 12,28 L 8,42" fill="none" stroke="#BDC3C7" strokeWidth="2.5" strokeLinecap="round" />
              <rect x="5" y="40" width="6" height="5" fill="#7F8C8D" rx="1" />
            </svg>
          </div>
        </div>

        {/* RIGHT: Text Track Info */}
        <div className="flex-1 min-w-0">
          <div className="text-[10px] text-cozy-terracotta font-bold uppercase tracking-wider flex items-center gap-1">
            <Music className="w-3 h-3 animate-bounce" />
            <span>Lo-Fi Radio {isHost && '(DJ)'}</span>
          </div>
          <h4 className="text-sm font-bold text-cozy-darkWood truncate mt-0.5" title={currentTrack?.title}>
            {currentTrack ? currentTrack.title : 'Silent Lounge'}
          </h4>
          <p className="text-xs text-cozy-brown/80 mt-0.5 truncate">
            Relax and chill in Mochill
          </p>
          
          {/* Duration Counter */}
          <div className="flex justify-between items-center text-[10px] text-cozy-brown/70 font-semibold mt-2">
            <span>{formatTime(elapsedTime)}</span>
            <span>{formatTime(trackDuration)}</span>
          </div>
        </div>
      </div>

      {/* TRACK TIMELINE PROGRESS BAR */}
      <div className="w-full bg-cream-300/40 rounded-full h-1.5 overflow-hidden shadow-inner cursor-pointer relative">
        <div
          className="bg-cozy-terracotta h-full rounded-full transition-all duration-100"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* PLAYER HUD CONTROLS */}
      <div className="flex items-center justify-between gap-3 relative">
        
        {/* Playlists Button */}
        <button
          onClick={() => setShowQueue(!showQueue)}
          className={`p-2 rounded-lg border transition-all btn-bounce ${
            showQueue ? 'bg-cozy-beige text-cozy-terracotta border-cozy-terracotta' : 'bg-white/80 text-cozy-brown border-cream-300 hover:bg-cream-50'
          }`}
          title="Show Playlist"
        >
          <ListMusic className="w-4 h-4" />
        </button>

        {/* Main controls: Play/Pause/Skip */}
        <div className="flex items-center gap-2">
          <button
            onClick={handlePlayToggle}
            className="w-10 h-10 rounded-full bg-cozy-terracotta hover:bg-cozy-terracotta/90 text-white flex items-center justify-center shadow transition-all btn-bounce"
            title={musicPlaying ? 'Pause' : 'Play'}
          >
            {musicPlaying ? <Pause className="w-5 h-5 fill-white" /> : <Play className="w-5 h-5 fill-white translate-x-0.5" />}
          </button>
          
          <button
            onClick={handleSkip}
            className="w-8 h-8 rounded-full bg-white/80 border border-cream-300 text-cozy-darkWood flex items-center justify-center hover:bg-cream-50 transition-all btn-bounce"
            title="Next Beat"
          >
            <SkipForward className="w-4 h-4" />
          </button>
        </div>

        {/* Volume Slider HUD */}
        <div className="flex items-center gap-1 bg-white/80 border border-cream-300 py-1.5 px-2.5 rounded-lg">
          <Volume2 className="w-3.5 h-3.5 text-cozy-brown" />
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={soundVolume}
            onChange={(e) => setSoundVolume(parseFloat(e.target.value))}
            className="w-12 h-1 bg-cream-300 rounded-lg appearance-none cursor-pointer accent-cozy-terracotta"
          />
        </div>
      </div>

      {/* SLIDE-UP PLAYLIST DRAWER */}
      {showQueue && (
        <div className="mt-2 pt-2 border-t border-cream-300/40 flex flex-col gap-1 max-h-28 overflow-y-auto">
          {musicQueue.map((track, index) => (
            <button
              key={index}
              disabled={!isHost}
              onClick={() => triggerSync('skip', index, 0, true)}
              className={`w-full py-1.5 px-2.5 rounded-md text-left text-xs font-medium flex items-center justify-between transition-colors ${
                index === currentTrackIndex
                  ? 'bg-cozy-terracotta/10 text-cozy-terracotta'
                  : 'text-cozy-darkWood hover:bg-cream-50'
              } ${!isHost ? 'cursor-default' : 'cursor-pointer'}`}
            >
              <span className="truncate max-w-[200px]">
                {index + 1}. {track.title}
              </span>
              <span className="text-[10px] text-cozy-brown/70 shrink-0">
                {formatTime(track.duration)}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
export default VinylPlayer;
