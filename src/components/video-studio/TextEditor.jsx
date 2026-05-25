import React, { useState } from "react";
import { Type, Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, Palette, Sparkles } from "lucide-react";

export default function TextEditor() {
  const [selectedFont, setSelectedFont] = useState("Arial");
  const [selectedStyle, setSelectedStyle] = useState("normal");

  const fonts = ["Arial", "Helvetica", "Times New Roman", "Georgia", "Verdana", "Courier New", "Impact", "Comic Sans MS"];
  
  const textPresets = [
    { name: "Title", text: "Your Title Here", size: 48, weight: "bold" },
    { name: "Subtitle", text: "Subtitle text", size: 32, weight: "semibold" },
    { name: "Body", text: "Body text goes here", size: 24, weight: "normal" },
    { name: "Caption", text: "Caption text", size: 16, weight: "normal" },
  ];

  const animatedTexts = [
    "Fade In", "Slide In", "Typewriter", "Bounce", "Zoom", "Flip", "Rotate", "Glitch"
  ];

  return (
    <div className="p-3 space-y-4">
      {/* Add Text Button */}
      <button className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold text-sm flex items-center justify-center gap-2">
        <Type className="w-4 h-4" />
        Add Text
      </button>

      {/* Font Selection */}
      <div>
        <h4 className="text-xs text-gray-400 font-semibold mb-2">Font Family</h4>
        <select
          value={selectedFont}
          onChange={(e) => setSelectedFont(e.target.value)}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
        >
          {fonts.map((font) => (
            <option key={font} value={font}>{font}</option>
          ))}
        </select>
      </div>

      {/* Text Presets */}
      <div>
        <h4 className="text-xs text-gray-400 font-semibold mb-2">Text Presets</h4>
        <div className="grid grid-cols-2 gap-2">
          {textPresets.map((preset) => (
            <button
              key={preset.name}
              className="p-3 bg-gray-800 hover:bg-gray-700 rounded-lg text-left transition-colors"
            >
              <p className="text-white font-medium" style={{ fontSize: preset.size / 2 }}>{preset.text}</p>
              <p className="text-[10px] text-gray-500 mt-1">{preset.name}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Animated Text */}
      <div>
        <h4 className="text-xs text-gray-400 font-semibold mb-2 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-purple-400" />
          Animated Text
        </h4>
        <div className="flex flex-wrap gap-1">
          {animatedTexts.map((anim) => (
            <button
              key={anim}
              className="px-2 py-1 bg-gray-800 hover:bg-purple-900/30 text-gray-400 hover:text-purple-400 rounded text-xs transition-colors"
            >
              {anim}
            </button>
          ))}
        </div>
      </div>

      {/* Color Picker */}
      <div>
        <h4 className="text-xs text-gray-400 font-semibold mb-2 flex items-center gap-1">
          <Palette className="w-3 h-3" />
          Text Color
        </h4>
        <div className="grid grid-cols-5 gap-2">
          {["#ffffff", "#000000", "#ff0000", "#00ff00", "#0000ff", "#ffff00", "#ff00ff", "#00ffff", "#ff8800", "#8800ff"].map((color) => (
            <button
              key={color}
              className="w-8 h-8 rounded-lg border-2 border-gray-700 hover:border-white transition-colors"
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}