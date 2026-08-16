import React, { useState, useRef, useEffect } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Maximize2,
  ListMusic,
  Film,
  Music,
  Repeat,
  Upload
} from 'lucide-react';
import { vfs } from '../../services/vfs';
import { VFSItem } from '../../types/os';

interface MediaPlayerProps {
  filePath?: string;
}

export const MediaPlayer: React.FC<MediaPlayerProps> = ({ filePath }) => {
  const [mediaList, setMediaList] = useState<VFSItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isLooping, setIsLooping] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Collect videos & audio from VFS
    const all = vfs.getAllItems().filter((item) => {
      if (item.type !== 'file') return false;
      const lower = item.name.toLowerCase();
      return (
        lower.endsWith('.mp4') ||
        lower.endsWith('.webm') ||
        lower.endsWith('.mp3') ||
        lower.endsWith('.wav') ||
        lower.endsWith('.ogg') ||
        item.content.includes('gtv-videos-bucket')
      );
    });

    setMediaList(all);

    if (filePath) {
      const idx = all.findIndex((i) => i.path === filePath);
      if (idx !== -1) {
        setCurrentIndex(idx);
      }
    }
  }, [filePath]);

  const currentMedia = mediaList[currentIndex];

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (videoRef.current) {
      videoRef.current.volume = val;
      setIsMuted(val === 0);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    if (isMuted) {
      videoRef.current.muted = false;
      setIsMuted(false);
    } else {
      videoRef.current.muted = true;
      setIsMuted(true);
    }
  };

  const cycleSpeed = () => {
    const speeds = [0.75, 1, 1.25, 1.5, 2];
    const nextIdx = (speeds.indexOf(playbackRate) + 1) % speeds.length;
    const nextRate = speeds[nextIdx];
    setPlaybackRate(nextRate);
    if (videoRef.current) {
      videoRef.current.playbackRate = nextRate;
    }
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs)) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const isAudioOnly = currentMedia?.name.toLowerCase().endsWith('.mp3') || currentMedia?.name.toLowerCase().endsWith('.wav');

  return (
    <div id="media-player-container" className="h-full flex flex-col bg-slate-950 text-slate-100 overflow-hidden">
      {/* Video Viewport / Audio Visualizer */}
      <div className="flex-1 bg-black flex items-center justify-center relative overflow-hidden">
        {currentMedia ? (
          isAudioOnly ? (
            <div className="flex flex-col items-center justify-center gap-4">
              <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-2xl shadow-blue-500/30 animate-pulse">
                <Music className="w-10 h-10 text-white" />
              </div>
              <p className="text-sm font-semibold text-slate-200">{currentMedia.name}</p>
              {/* Simulated equalizer bars */}
              <div className="flex items-center gap-1.5 h-12">
                {[40, 70, 90, 60, 100, 45, 80, 65, 30].map((h, i) => (
                  <div
                    key={i}
                    style={{ height: isPlaying ? `${h}%` : '15%' }}
                    className="w-1.5 bg-blue-500 rounded-full transition-all duration-150"
                  />
                ))}
              </div>
            </div>
          ) : (
            <video
              ref={videoRef}
              src={currentMedia.content}
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onEnded={() => {
                if (!isLooping) setIsPlaying(false);
              }}
              loop={isLooping}
              className="max-h-full max-w-full object-contain"
              onClick={togglePlay}
            />
          )
        ) : (
          <div className="text-xs text-slate-500 flex flex-col items-center gap-2">
            <Film className="w-10 h-10 stroke-1 text-slate-600" />
            <span>No media selected</span>
          </div>
        )}
      </div>

      {/* Media Controller Bar */}
      <div className="p-3 border-t border-slate-800 bg-slate-900/95 space-y-2 flex-shrink-0">
        {/* Scrubber timeline */}
        <div className="flex items-center gap-3">
          <span className="text-[11px] font-mono text-slate-400 w-10 text-right">
            {formatTime(currentTime)}
          </span>
          <input
            type="range"
            min={0}
            max={duration || 100}
            step={0.1}
            value={currentTime}
            onChange={handleSeek}
            className="flex-1 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
          <span className="text-[11px] font-mono text-slate-400 w-10">
            {formatTime(duration)}
          </span>
        </div>

        {/* Buttons Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              id="btn-play-pause"
              onClick={togglePlay}
              className="p-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white shadow transition-colors"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
            </button>

            <button
              onClick={() => {
                if (videoRef.current) videoRef.current.currentTime = 0;
              }}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              title="Restart"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              onClick={() => setIsLooping(!isLooping)}
              className={`p-1.5 rounded-lg transition-colors ${
                isLooping ? 'bg-blue-500/20 text-blue-400' : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
              title="Toggle Loop"
            >
              <Repeat className="w-4 h-4" />
            </button>

            <button
              onClick={cycleSpeed}
              className="px-2 py-1 bg-slate-800 hover:bg-slate-700 rounded-lg text-[11px] font-mono text-slate-300"
              title="Playback Speed"
            >
              {playbackRate}x
            </button>
          </div>

          <div className="truncate text-xs text-slate-300 font-medium max-w-[150px] sm:max-w-xs text-center">
            {currentMedia ? currentMedia.name : 'Ready'}
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <button
                onClick={toggleMute}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                {isMuted || volume === 0 ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-16 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500 hidden sm:block"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
