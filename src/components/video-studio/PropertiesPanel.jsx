import React, { useState } from "react";
import { Type, Image, Video, Music, Palette, Move, RotateCw, Maximize, Sun, Contrast, Aperture } from "lucide-react";

export default function PropertiesPanel({ element, onUpdate, onDelete }) {
  const [activeTab, setActiveTab] = useState("transform");

  if (!element) return null;

  const tabs = [
    { id: "transform", label: "Transform" },
    { id: "style", label: "Style" },
    { id: "animation", label: "Animation" },
    { id: "timing", label: "Timing" },
  ];

  return (
    <div className="p-3">
      {/* Element Info */}
      <div className="mb-4 p-3 bg-gray-800 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          {element.type === "video" && <Video className="w-4 h-4 text-purple-400" />}
          {element.type === "image" && <Image className="w-4 h-4 text-blue-400" />}
          {element.type === "text" && <Type className="w-4 h-4 text-green-400" />}
          {element.type === "audio" && <Music className="w-4 h-4 text-yellow-400" />}
          <span className="text-sm text-white font-semibold capitalize">{element.type}</span>
        </div>
        <p className="text-xs text-gray-500 truncate">{element.name || "Untitled"}</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              activeTab === tab.id
                ? "bg-purple-600/20 text-purple-400"
                : "text-gray-400 hover:text-white hover:bg-gray-800"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Transform Panel */}
      {activeTab === "transform" && (
        <div className="space-y-4">
          {/* Position */}
          <div>
            <h4 className="text-xs text-gray-400 font-semibold mb-2 flex items-center gap-1">
              <Move className="w-3 h-3" />
              Position
            </h4>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-gray-500">X</label>
                <input
                  type="number"
                  value={element.x || 0}
                  onChange={(e) => onUpdate({ x: parseInt(e.target.value) })}
                  className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1.5 text-sm text-white"
                />
              </div>
              <div>
                <label className="text-[10px] text-gray-500">Y</label>
                <input
                  type="number"
                  value={element.y || 0}
                  onChange={(e) => onUpdate({ y: parseInt(e.target.value) })}
                  className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1.5 text-sm text-white"
                />
              </div>
            </div>
          </div>

          {/* Size */}
          <div>
            <h4 className="text-xs text-gray-400 font-semibold mb-2 flex items-center gap-1">
              <Maximize className="w-3 h-3" />
              Size
            </h4>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-gray-500">Width</label>
                <input
                  type="number"
                  value={element.width || 200}
                  onChange={(e) => onUpdate({ width: parseInt(e.target.value) })}
                  className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1.5 text-sm text-white"
                />
              </div>
              <div>
                <label className="text-[10px] text-gray-500">Height</label>
                <input
                  type="number"
                  value={element.height || 100}
                  onChange={(e) => onUpdate({ height: parseInt(e.target.value) })}
                  className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1.5 text-sm text-white"
                />
              </div>
            </div>
          </div>

          {/* Rotation */}
          <div>
            <h4 className="text-xs text-gray-400 font-semibold mb-2 flex items-center gap-1">
              <RotateCw className="w-3 h-3" />
              Rotation
            </h4>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="0"
                max="360"
                value={element.rotation || 0}
                onChange={(e) => onUpdate({ rotation: parseInt(e.target.value) })}
                className="flex-1 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
              <span className="text-xs text-gray-400 w-12 text-right">{element.rotation || 0}°</span>
            </div>
          </div>

          {/* Opacity */}
          <div>
            <h4 className="text-xs text-gray-400 font-semibold mb-2">Opacity</h4>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="0"
                max="100"
                value={(element.opacity || 1) * 100}
                onChange={(e) => onUpdate({ opacity: parseInt(e.target.value) / 100 })}
                className="flex-1 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
              <span className="text-xs text-gray-400 w-12 text-right">{Math.round((element.opacity || 1) * 100)}%</span>
            </div>
          </div>
        </div>
      )}

      {/* Style Panel */}
      {activeTab === "style" && (
        <div className="space-y-4">
          {element.type === "text" && (
            <>
              <div>
                <h4 className="text-xs text-gray-400 font-semibold mb-2">Font Size</h4>
                <input
                  type="number"
                  value={element.fontSize || 24}
                  onChange={(e) => onUpdate({ fontSize: parseInt(e.target.value) })}
                  className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1.5 text-sm text-white"
                />
              </div>
              <div>
                <h4 className="text-xs text-gray-400 font-semibold mb-2">Color</h4>
                <div className="grid grid-cols-5 gap-2">
                  {["#ffffff", "#000000", "#ff0000", "#00ff00", "#0000ff", "#ffff00", "#ff00ff", "#00ffff", "#ff8800", "#8800ff"].map((color) => (
                    <button
                      key={color}
                      onClick={() => onUpdate({ color })}
                      className="w-8 h-8 rounded border-2 border-gray-700 hover:border-white transition-colors"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            </>
          )}

          {element.type === "video" && (
            <>
              <div>
                <h4 className="text-xs text-gray-400 font-semibold mb-2 flex items-center gap-1">
                  <Sun className="w-3 h-3" />
                  Brightness
                </h4>
                <input
                  type="range"
                  min="0"
                  max="200"
                  value={element.brightness || 100}
                  onChange={(e) => onUpdate({ brightness: parseInt(e.target.value) })}
                  className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                />
              </div>
              <div>
                <h4 className="text-xs text-gray-400 font-semibold mb-2 flex items-center gap-1">
                  <Contrast className="w-3 h-3" />
                  Contrast
                </h4>
                <input
                  type="range"
                  min="0"
                  max="200"
                  value={element.contrast || 100}
                  onChange={(e) => onUpdate({ contrast: parseInt(e.target.value) })}
                  className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                />
              </div>
              <div>
                <h4 className="text-xs text-gray-400 font-semibold mb-2 flex items-center gap-1">
                  <Aperture className="w-3 h-3" />
                  Saturation
                </h4>
                <input
                  type="range"
                  min="0"
                  max="200"
                  value={element.saturation || 100}
                  onChange={(e) => onUpdate({ saturation: parseInt(e.target.value) })}
                  className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </>
          )}
        </div>
      )}

      {/* Animation Panel */}
      {activeTab === "animation" && (
        <div className="space-y-3">
          <div>
            <h4 className="text-xs text-gray-400 font-semibold mb-2">Entrance Animation</h4>
            <select
              value={element.entranceAnimation || "none"}
              onChange={(e) => onUpdate({ entranceAnimation: e.target.value })}
              className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1.5 text-sm text-white"
            >
              <option value="none">None</option>
              <option value="fade">Fade In</option>
              <option value="slide">Slide In</option>
              <option value="zoom">Zoom</option>
              <option value="bounce">Bounce</option>
              <option value="rotate">Rotate</option>
            </select>
          </div>
          <div>
            <h4 className="text-xs text-gray-400 font-semibold mb-2">Exit Animation</h4>
            <select
              value={element.exitAnimation || "none"}
              onChange={(e) => onUpdate({ exitAnimation: e.target.value })}
              className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1.5 text-sm text-white"
            >
              <option value="none">None</option>
              <option value="fade">Fade Out</option>
              <option value="slide">Slide Out</option>
              <option value="zoom">Zoom Out</option>
            </select>
          </div>
          <div>
            <h4 className="text-xs text-gray-400 font-semibold mb-2">Duration</h4>
            <input
              type="number"
              value={element.animationDuration || 0.5}
              onChange={(e) => onUpdate({ animationDuration: parseFloat(e.target.value) })}
              step="0.1"
              min="0.1"
              max="3"
              className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1.5 text-sm text-white"
            />
          </div>
        </div>
      )}

      {/* Timing Panel */}
      {activeTab === "timing" && (
        <div className="space-y-4">
          <div>
            <h4 className="text-xs text-gray-400 font-semibold mb-2">Start Time</h4>
            <input
              type="number"
              value={element.start_time || 0}
              onChange={(e) => onUpdate({ start_time: parseFloat(e.target.value) })}
              step="0.1"
              min="0"
              className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1.5 text-sm text-white"
            />
          </div>
          <div>
            <h4 className="text-xs text-gray-400 font-semibold mb-2">Duration</h4>
            <input
              type="number"
              value={element.duration || 5}
              onChange={(e) => onUpdate({ duration: parseFloat(e.target.value) })}
              step="0.1"
              min="0.1"
              className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1.5 text-sm text-white"
            />
          </div>
          <div>
            <h4 className="text-xs text-gray-400 font-semibold mb-2">End Time</h4>
            <input
              type="text"
              value={`${(element.start_time || 0) + (element.duration || 5)}s`}
              disabled
              className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1.5 text-sm text-gray-500"
            />
          </div>
        </div>
      )}

      {/* Delete Button */}
      <button
        onClick={onDelete}
        className="w-full mt-4 py-2 bg-red-900/20 border border-red-700/40 hover:bg-red-900/40 text-red-400 rounded-lg text-sm font-medium transition-colors"
      >
        Delete Element
      </button>
    </div>
  );
}