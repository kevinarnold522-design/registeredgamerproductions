import React, { useState } from "react";
import { Sparkles, Wand2, Image as ImageIcon, Video, Type, Mic, Eraser, Wand, Globe } from "lucide-react";

export default function AIAssistant({ prompt, setPrompt, isGenerating, onGenerate }) {
  const [activeTab, setActiveTab] = useState("video");

  const aiFeatures = [
    { id: "video", label: "AI Video", icon: Video },
    { id: "image", label: "AI Image", icon: ImageIcon },
    { id: "text", label: "AI Writing", icon: Type },
    { id: "voice", label: "AI Voice", icon: Mic },
    { id: "tools", label: "AI Tools", icon: Wand2 },
  ];

  const quickActions = [
    { icon: Sparkles, label: "Generate Video", desc: "Text to video" },
    { icon: Wand2, label: "Magic Write", desc: "Script generation" },
    { icon: ImageIcon, label: "Generate Image", desc: "AI image creation" },
    { icon: Eraser, label: "Background Remove", desc: "Remove backgrounds" },
    { icon: Wand, label: "Magic Eraser", desc: "Remove objects" },
    { icon: Globe, label: "Auto Subtitles", desc: "Generate captions" },
    { icon: Mic, label: "AI Voiceover", desc: "Text to speech" },
    { icon: Sparkles, label: "Scene Suggestions", desc: "AI recommendations" },
  ];

  return (
    <div className="p-3">
      {/* AI Tabs */}
      <div className="flex gap-1 mb-4 overflow-x-auto">
        {aiFeatures.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
              activeTab === tab.id
                ? "bg-purple-600/20 text-purple-400"
                : "text-gray-400 hover:text-white hover:bg-gray-800"
            }`}
          >
            <tab.icon className="w-3.5 h-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Prompt Input */}
      <div className="mb-4">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe what you want to create..."
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 resize-none h-24"
        />
        <button
          onClick={onGenerate}
          disabled={isGenerating || !prompt.trim()}
          className="w-full mt-2 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-all"
        >
          <Sparkles className="w-4 h-4" />
          {isGenerating ? "Generating..." : "Generate"}
        </button>
      </div>

      {/* Quick Actions */}
      <div>
        <h4 className="text-xs text-gray-400 font-semibold mb-2">Quick Actions</h4>
        <div className="grid grid-cols-2 gap-2">
          {quickActions.map((action, i) => (
            <button
              key={i}
              className="p-3 bg-gray-800 hover:bg-purple-900/20 border border-gray-700 hover:border-purple-500/50 rounded-lg text-left transition-all group"
            >
              <action.icon className="w-5 h-5 text-purple-400 mb-2 group-hover:scale-110 transition-transform" />
              <p className="text-sm text-white font-medium">{action.label}</p>
              <p className="text-[10px] text-gray-500">{action.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Tips */}
      <div className="mt-4 p-3 bg-purple-900/20 border border-purple-700/40 rounded-lg">
        <p className="text-xs text-purple-300 font-semibold mb-1">💡 AI Tips</p>
        <ul className="text-[10px] text-gray-400 space-y-1">
          <li>• Be specific and detailed</li>
          <li>• Mention style and mood</li>
          <li>• Include duration for videos</li>
          <li>• Specify aspect ratio</li>
        </ul>
      </div>
    </div>
  );
}