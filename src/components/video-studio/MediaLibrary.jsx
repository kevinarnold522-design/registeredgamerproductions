import React, { useState } from "react";
import { Image, Video, Music, Upload, Search, Folder, Grid3X3, List } from "lucide-react";

export default function MediaLibrary() {
  const [activeTab, setActiveTab] = useState("all");
  const [viewMode, setViewMode] = useState("grid");

  const tabs = [
    { id: "all", label: "All Media", icon: Grid3X3 },
    { id: "videos", label: "Videos", icon: Video },
    { id: "images", label: "Images", icon: Image },
    { id: "audio", label: "Audio", icon: Music },
    { id: "upload", label: "Upload", icon: Upload },
  ];

  return (
    <div className="p-3">
      {/* Search */}
      <div className="mb-3">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search media..."
            className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-8 pr-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-3 overflow-x-auto">
        {tabs.map((tab) => (
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

      {/* View Toggle */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-gray-500">24 items</span>
        <div className="flex gap-1">
          <button
            onClick={() => setViewMode("grid")}
            className={`p-1 rounded ${viewMode === "grid" ? "text-purple-400" : "text-gray-500"}`}
          >
            <Grid3X3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`p-1 rounded ${viewMode === "list" ? "text-purple-400" : "text-gray-500"}`}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Media Grid */}
      <div className="grid grid-cols-2 gap-2">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="aspect-video bg-gray-800 rounded-lg overflow-hidden hover:ring-2 hover:ring-purple-500 cursor-pointer transition-all group relative"
          >
            <div className="w-full h-full bg-gradient-to-br from-purple-900/20 to-pink-900/20 flex items-center justify-center">
              <Video className="w-8 h-8 text-gray-600 group-hover:text-purple-400 transition-colors" />
            </div>
            <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-2 py-1">
              <p className="text-[10px] text-white truncate">Sample Video {i + 1}</p>
              <p className="text-[9px] text-gray-400">0:30</p>
            </div>
          </div>
        ))}
      </div>

      {/* Upload Area */}
      {activeTab === "upload" && (
        <div className="mt-4 border-2 border-dashed border-gray-700 rounded-lg p-6 text-center hover:border-purple-500 transition-colors cursor-pointer">
          <Upload className="w-8 h-8 text-gray-600 mx-auto mb-2" />
          <p className="text-sm text-gray-400">Drag & drop files here</p>
          <p className="text-xs text-gray-500 mt-1">or click to browse</p>
          <p className="text-[10px] text-gray-600 mt-2">Supports: MP4, MOV, MP3, WAV, PNG, JPG</p>
        </div>
      )}
    </div>
  );
}