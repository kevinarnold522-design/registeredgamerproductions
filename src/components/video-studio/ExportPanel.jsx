import React, { useState } from "react";
import { Download, Film, Image as ImageIcon, FileVideo, Settings, CheckCircle2 } from "lucide-react";

export default function ExportPanel({ onExport, project }) {
  const [format, setFormat] = useState("mp4");
  const [quality, setQuality] = useState("1080p");
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportComplete, setExportComplete] = useState(false);

  const formats = [
    { id: "mp4", label: "MP4 Video", icon: FileVideo, desc: "Most compatible" },
    { id: "gif", label: "GIF", icon: ImageIcon, desc: "Animated images" },
    { id: "mov", label: "MOV", icon: Film, desc: "High quality" },
    { id: "webm", label: "WebM", icon: FileVideo, desc: "Web optimized" },
  ];

  const qualities = [
    { id: "4k", label: "4K (2160p)", desc: "3840x2160" },
    { id: "1080p", label: "Full HD (1080p)", desc: "1920x1080" },
    { id: "720p", label: "HD (720p)", desc: "1280x720" },
    { id: "480p", label: "SD (480p)", desc: "854x480" },
  ];

  const aspectRatios = [
    { id: "16:9", label: "16:9", desc: "YouTube, Widescreen" },
    { id: "9:16", label: "9:16", desc: "TikTok, Reels, Shorts" },
    { id: "1:1", label: "1:1", desc: "Instagram Square" },
    { id: "4:5", label: "4:5", desc: "Instagram Portrait" },
  ];

  const handleExport = async () => {
    setIsExporting(true);
    setExportProgress(0);
    
    // Simulate export progress
    for (let i = 0; i <= 100; i += 10) {
      setExportProgress(i);
      await new Promise(resolve => setTimeout(resolve, 300));
    }
    
    setExportComplete(true);
    setIsExporting(false);
    
    if (onExport) {
      onExport(format, quality);
    }
  };

  return (
    <div className="p-3 space-y-4">
      {/* Export Status */}
      {exportComplete ? (
        <div className="p-4 bg-green-900/20 border border-green-700/40 rounded-lg text-center">
          <CheckCircle2 className="w-12 h-12 text-green-400 mx-auto mb-2" />
          <h4 className="text-white font-semibold mb-1">Export Complete!</h4>
          <p className="text-xs text-gray-400">Your video is ready to download</p>
          <button className="mt-3 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-semibold">
            Download
          </button>
        </div>
      ) : (
        <>
          {/* Format Selection */}
          <div>
            <h4 className="text-xs text-gray-400 font-semibold mb-2 flex items-center gap-1">
              <FileVideo className="w-3 h-3" />
              Export Format
            </h4>
            <div className="space-y-2">
              {formats.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFormat(f.id)}
                  className={`w-full p-3 rounded-lg border transition-all text-left ${
                    format === f.id
                      ? "bg-purple-900/20 border-purple-500/50"
                      : "bg-gray-800 border-gray-700 hover:border-purple-500/30"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <f.icon className={`w-5 h-5 ${format === f.id ? "text-purple-400" : "text-gray-500"}`} />
                    <div>
                      <p className={`text-sm font-medium ${format === f.id ? "text-white" : "text-gray-400"}`}>
                        {f.label}
                      </p>
                      <p className="text-[10px] text-gray-500">{f.desc}</p>
                    </div>
                    {format === f.id && (
                      <CheckCircle2 className="w-4 h-4 text-purple-400 ml-auto" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Quality Selection */}
          <div>
            <h4 className="text-xs text-gray-400 font-semibold mb-2 flex items-center gap-1">
              <Settings className="w-3 h-3" />
              Quality
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {qualities.map((q) => (
                <button
                  key={q.id}
                  onClick={() => setQuality(q.id)}
                  className={`p-3 rounded-lg border transition-all text-left ${
                    quality === q.id
                      ? "bg-purple-900/20 border-purple-500/50"
                      : "bg-gray-800 border-gray-700 hover:border-purple-500/30"
                  }`}
                >
                  <p className={`text-sm font-medium ${quality === q.id ? "text-white" : "text-gray-400"}`}>
                    {q.label}
                  </p>
                  <p className="text-[10px] text-gray-500">{q.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Aspect Ratio */}
          <div>
            <h4 className="text-xs text-gray-400 font-semibold mb-2">Aspect Ratio</h4>
            <div className="grid grid-cols-4 gap-2">
              {aspectRatios.map((ar) => (
                <button
                  key={ar.id}
                  className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-center transition-colors"
                >
                  <p className="text-xs text-white font-medium">{ar.id}</p>
                  <p className="text-[9px] text-gray-500">{ar.desc.split(",")[0]}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Export Button */}
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-semibold flex items-center justify-center gap-2 transition-all"
          >
            <Download className="w-4 h-4" />
            {isExporting ? "Exporting..." : "Export Video"}
          </button>

          {/* Progress Bar */}
          {isExporting && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-gray-400">
                <span>Exporting...</span>
                <span>{exportProgress}%</span>
              </div>
              <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-600 to-pink-600 transition-all"
                  style={{ width: `${exportProgress}%` }}
                />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}