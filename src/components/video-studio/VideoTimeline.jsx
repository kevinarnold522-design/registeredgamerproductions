import React, { useRef, useState } from "react";
import { motion } from "framer-motion";
import { Play, Pause, Plus, Trash2, Scissors, Copy, Lock, Unlock, Eye, EyeOff, Volume2, VolumeX } from "lucide-react";

export default function VideoTimeline({
  tracks,
  setTracks,
  playheadPosition,
  setPlayheadPosition,
  duration,
  selectedTrack,
  setSelectedTrack,
  currentTime,
  setCurrentTime,
  isPlaying,
  setIsPlaying,
  selectedElement,
}) {
  const timelineRef = useRef(null);
  const [zoom, setZoom] = useState(1);
  const pixelsPerSecond = 20 * zoom;

  const handleTimelineClick = (e) => {
    if (!timelineRef.current) return;
    const rect = timelineRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const newTime = x / pixelsPerSecond;
    setCurrentTime(Math.max(0, Math.min(newTime, duration)));
    setPlayheadPosition(x);
  };

  const handleAddTrack = (type = "video") => {
    const newTrack = {
      id: `track-${Date.now()}`,
      type,
      name: `${type.charAt(0).toUpperCase() + type.slice(1)} Track ${tracks.length + 1}`,
      elements: [],
      isMuted: false,
      isLocked: false,
      isVisible: true,
      volume: 1,
    };
    setTracks([...tracks, newTrack]);
  };

  const handleDeleteTrack = (trackId) => {
    setTracks(tracks.filter(t => t.id !== trackId));
  };

  const handleToggleMute = (trackId) => {
    setTracks(tracks.map(t =>
      t.id === trackId ? { ...t, isMuted: !t.isMuted } : t
    ));
  };

  const handleToggleLock = (trackId) => {
    setTracks(tracks.map(t =>
      t.id === trackId ? { ...t, isLocked: !t.isLocked } : t
    ));
  };

  const handleToggleVisibility = (trackId) => {
    setTracks(tracks.map(t =>
      t.id === trackId ? { ...t, isVisible: !t.isVisible } : t
    ));
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Generate time markers
  const timeMarkers = [];
  for (let i = 0; i <= duration; i += 5) {
    timeMarkers.push(
      <div
        key={i}
        className="absolute top-0 text-xs text-gray-500"
        style={{ left: i * pixelsPerSecond }}
      >
        {formatTime(i)}
      </div>
    );
  }

  return (
    <div className="h-64 bg-gray-900 border-t border-gray-800 flex flex-col">
      {/* Timeline Controls */}
      <div className="h-10 border-b border-gray-800 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-1.5 rounded hover:bg-gray-800 text-gray-400 hover:text-white"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
          <span className="text-xs text-gray-400 font-mono">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setZoom(Math.max(0.5, zoom - 0.25))}
            className="px-2 py-1 text-xs text-gray-400 hover:text-white"
          >
            −
          </button>
          <span className="text-xs text-gray-500">{Math.round(zoom * 100)}%</span>
          <button
            onClick={() => setZoom(Math.min(3, zoom + 0.25))}
            className="px-2 py-1 text-xs text-gray-400 hover:text-white"
          >
            +
          </button>
          <button
            onClick={() => handleAddTrack("video")}
            className="flex items-center gap-1 px-2 py-1 text-xs bg-purple-600 hover:bg-purple-700 text-white rounded"
          >
            <Plus className="w-3 h-3" />
            Video
          </button>
          <button
            onClick={() => handleAddTrack("audio")}
            className="flex items-center gap-1 px-2 py-1 text-xs bg-green-600 hover:bg-green-700 text-white rounded"
          >
            <Plus className="w-3 h-3" />
            Audio
          </button>
          <button
            onClick={() => handleAddTrack("text")}
            className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded"
          >
            <Plus className="w-3 h-3" />
            Text
          </button>
        </div>
      </div>

      {/* Timeline Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Track Headers */}
        <div className="w-48 border-r border-gray-800 overflow-y-auto">
          {tracks.map((track) => (
            <div
              key={track.id}
              className={`h-16 border-b border-gray-800 p-2 flex flex-col justify-center gap-1 ${
                selectedTrack?.id === track.id ? "bg-purple-900/20" : ""
              }`}
              onClick={() => setSelectedTrack(track)}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs text-white font-medium truncate">{track.name}</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={(e) => { e.stopPropagation(); handleToggleVisibility(track.id); }}
                    className={`p-1 rounded ${track.isVisible ? "text-gray-400 hover:text-white" : "text-red-400"}`}
                  >
                    {track.isVisible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleToggleMute(track.id); }}
                    className={`p-1 rounded ${track.isMuted ? "text-red-400" : "text-gray-400 hover:text-white"}`}
                  >
                    {track.isMuted ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleToggleLock(track.id); }}
                    className={`p-1 rounded ${track.isLocked ? "text-yellow-400" : "text-gray-400 hover:text-white"}`}
                  >
                    {track.isLocked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDeleteTrack(track.id); }}
                    className="p-1 rounded text-gray-400 hover:text-red-400"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
              <span className="text-[10px] text-gray-500 capitalize">{track.type}</span>
            </div>
          ))}
        </div>

        {/* Track Lanes */}
        <div
          ref={timelineRef}
          className="flex-1 overflow-x-auto overflow-y-auto relative"
          onClick={handleTimelineClick}
        >
          {/* Time Ruler */}
          <div className="h-6 border-b border-gray-800 relative bg-gray-800/50">
            {timeMarkers}
            
            {/* Playhead */}
            <div
              className="absolute top-0 w-0.5 bg-red-500 h-full z-50 pointer-events-none"
              style={{ left: currentTime * pixelsPerSecond }}
            >
              <div className="absolute -top-1 -left-1.5 w-3 h-3 bg-red-500 rotate-45" />
            </div>
          </div>

          {/* Track Lanes */}
          <div className="relative">
            {/* Grid lines */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                backgroundImage: `linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)`,
                backgroundSize: `${pixelsPerSecond}px 100%`,
              }}
            />

            {/* Track Content */}
            {tracks.map((track, index) => (
              <div
                key={track.id}
                className={`h-16 border-b border-gray-800 relative ${
                  selectedTrack?.id === track.id ? "bg-purple-900/10" : ""
                }`}
                style={{ opacity: track.isVisible ? 1 : 0.3 }}
              >
                {track.elements?.map((element) => (
                  <motion.div
                    key={element.id}
                    className={`absolute h-12 top-2 rounded cursor-pointer ${
                      element.type === "video" ? "bg-purple-600/60" :
                      element.type === "audio" ? "bg-green-600/60" :
                      element.type === "text" ? "bg-blue-600/60" :
                      "bg-gray-600/60"
                    } ${selectedElement?.id === element.id ? "ring-2 ring-white" : ""}`}
                    style={{
                      left: (element.start_time || 0) * pixelsPerSecond,
                      width: (element.duration || 5) * pixelsPerSecond,
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="px-2 py-1 text-xs text-white truncate">{element.name || element.type}</div>
                  </motion.div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}