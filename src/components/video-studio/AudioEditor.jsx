import React, { useState } from "react";
import { Music, Mic, Upload } from "lucide-react";

export default function AudioEditor() {
  const [activeTab, setActiveTab] = useState("library");

  const audioCategories = [
    { id: "library", label: "Music Library" },
    { id: "sfx", label: "Sound Effects" },
    { id: "voiceover", label: "Voiceover" },
    { id: "upload", label: "Upload" },
  ];

  const musicTracks = [
    { name: "Upbeat Pop", duration: "2:30", genre: "Pop" },
    { name: "Cinematic Epic", duration: "3:15", genre: "Cinematic" },
    { name: "Lo-Fi Chill", duration: "2:45", genre: "Lo-Fi" },
    { name: "Electronic Dance", duration: "3:00", genre: "EDM" },
    { name: "Acoustic Guitar", duration: "2:20", genre: "Acoustic" },
    { name: "Hip Hop Beat", duration: "2:55", genre: "Hip Hop" },
  ];

  const sfxList = [
    "Whoosh", "Impact", "Rise", "Fall", "Click", "Pop", "Swell", "Transition",
  ];

  return (
    <div className="p-3">
      {/* Tabs */}
      <div className="flex gap-1 mb-4 overflow-x-auto">
        {audioCategories.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
              activeTab === tab.id
                ? "bg-green-600/20 text-green-400"
                : "text-gray-400 hover:text-white hover:bg-gray-800"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Music Library */}
      {activeTab === "library" && (
        <div className="space-y-2">
          {musicTracks.map((track, i) => (
            <div
              key={i}
              className="p-3 bg-gray-800 hover:bg-gray-700 rounded-lg cursor-pointer transition-colors group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white font-medium">{track.name}</p>
                  <p className="text-xs text-gray-500">{track.genre} • {track.duration}</p>
                </div>
                <button className="opacity-0 group-hover:opacity-100 px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded transition-all">
                  Add
                </button>
              </div>
              {/* Waveform visualization */}
              <div className="mt-2 h-8 flex items-center gap-0.5">
                {[...Array(40)].map((_, j) => (
                  <div
                    key={j}
                    className="w-1 bg-green-500/30 rounded-full"
                    style={{
                      height: `${Math.random() * 100}%`,
                    }}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Sound Effects */}
      {activeTab === "sfx" && (
        <div className="grid grid-cols-2 gap-2">
          {sfxList.map((sfx, i) => (
            <button
              key={i}
              className="p-3 bg-gray-800 hover:bg-gray-700 rounded-lg text-left transition-colors"
            >
              <p className="text-sm text-white">{sfx}</p>
              <p className="text-xs text-gray-500">0:02</p>
            </button>
          ))}
        </div>
      )}

      {/* Voiceover Recording */}
      {activeTab === "voiceover" && (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mic className="w-8 h-8 text-green-400" />
          </div>
          <h4 className="text-white font-semibold mb-2">Record Voiceover</h4>
          <p className="text-xs text-gray-500 mb-4">Click to start recording your voice</p>
          <button className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-semibold">
            Start Recording
          </button>
        </div>
      )}

      {/* Upload */}
      {activeTab === "upload" && (
        <div className="border-2 border-dashed border-gray-700 rounded-lg p-6 text-center hover:border-green-500 transition-colors cursor-pointer">
          <Upload className="w-8 h-8 text-gray-600 mx-auto mb-2" />
          <p className="text-sm text-gray-400">Drag & drop audio files</p>
          <p className="text-xs text-gray-500 mt-1">MP3, WAV, AAC, OGG</p>
        </div>
      )}
    </div>
  );
}