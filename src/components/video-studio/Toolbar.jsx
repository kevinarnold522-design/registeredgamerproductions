import React from "react";
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, ZoomIn, ZoomOut, Undo2, Redo, Scissors, Copy, Trash2, Grid3X3 } from "lucide-react";

export default function Toolbar({
  activeTool,
  setActiveTool,
  zoom,
  setZoom,
  isPlaying,
  setIsPlaying,
  currentTime,
  duration,
  volume,
  setVolume,
  isMuted,
  setIsMuted,
}) {
  const tools = [
    { id: "select", label: "Select" },
    { id: "trim", label: "Trim" },
    { id: "split", label: "Split" },
    { id: "crop", label: "Crop" },
    { id: "text", label: "Text" },
    { id: "shape", label: "Shape" },
  ];

  return (
    <div className="h-12 bg-gray-900 border-b border-gray-800 flex items-center justify-between px-4">
      {/* Left: Tools */}
      <div className="flex items-center gap-2">
        {tools.map((tool) => (
          <button
            key={tool.id}
            onClick={() => setActiveTool(tool.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              activeTool === tool.id
                ? "bg-purple-600/20 text-purple-400"
                : "text-gray-400 hover:text-white hover:bg-gray-800"
            }`}
          >
            {tool.label}
          </button>
        ))}
      </div>

      {/* Center: Playback Controls */}
      <div className="flex items-center gap-3">
        <button className="p-1.5 text-gray-400 hover:text-white">
          <SkipBack className="w-4 h-4" />
        </button>
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="p-2 bg-purple-600 hover:bg-purple-700 text-white rounded-full"
        >
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        </button>
        <button className="p-1.5 text-gray-400 hover:text-white">
          <SkipForward className="w-4 h-4" />
        </button>
      </div>

      {/* Right: Zoom & Volume */}
      <div className="flex items-center gap-3">
        {/* Undo/Redo */}
        <div className="flex items-center gap-1">
          <button className="p-1.5 text-gray-400 hover:text-white">
            <Undo2 className="w-4 h-4" />
          </button>
          <button className="p-1.5 text-gray-400 hover:text-white">
            <Redo className="w-4 h-4" />
          </button>
        </div>

        {/* Zoom */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setZoom(Math.max(0.5, zoom - 0.25))}
            className="p-1.5 text-gray-400 hover:text-white"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-xs text-gray-500 w-12 text-center">{Math.round(zoom * 100)}%</span>
          <button
            onClick={() => setZoom(Math.min(2, zoom + 0.25))}
            className="p-1.5 text-gray-400 hover:text-white"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
        </div>

        {/* Volume */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="p-1.5 text-gray-400 hover:text-white"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={isMuted ? 0 : volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="w-20 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-1 border-l border-gray-800 pl-3">
          <button className="p-1.5 text-gray-400 hover:text-white">
            <Scissors className="w-4 h-4" />
          </button>
          <button className="p-1.5 text-gray-400 hover:text-white">
            <Copy className="w-4 h-4" />
          </button>
          <button className="p-1.5 text-gray-400 hover:text-red-400">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}