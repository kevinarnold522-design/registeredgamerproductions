import React, { useState } from "react";
import { motion } from "framer-motion";
import { Youtube, Wand2, CheckCircle, Tag, Edit3, Crop, Image as ImageIcon, Zap, Link, Database } from "lucide-react";
import Cropper from 'react-easy-crop'; 

export default function CreatorVideoTools({ user, profile }) {
  const [tab, setTab] = useState("share");
  const [imageSrc, setImageSrc] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);

  const tabs = [
    { id: "share", label: "📹 Post" },
    { id: "ai", label: "🤖 AI Assist" },
    { id: "editor", label: "🎨 Image Editor" },
    { id: "seo", label: "🏷️ SEO Tags" },
    { id: "links", label: "🔗 Resources" }
  ];

  return (
    <div className="bg-gray-950/80 backdrop-blur-xl rounded-3xl border border-white/10 p-6 shadow-2xl">
      {/* Navigation Header */}
      <div className="flex gap-2 mb-6 overflow-x-auto">
        {tabs.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)} 
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${tab === t.id ? "bg-purple-600 text-white" : "bg-gray-800 text-gray-400 hover:bg-gray-700"}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Dynamic Studio Content */}
      <div className="min-h-[400px]">
        {tab === "share" && <div className="text-gray-400">Share your content link...</div>}
        
        {tab === "editor" && (
          <div className="space-y-4">
            {!imageSrc ? (
              <label className="border-2 border-dashed border-gray-700 rounded-xl h-48 flex items-center justify-center cursor-pointer">
                <input type="file" className="hidden" onChange={(e) => setImageSrc(URL.createObjectURL(e.target.files[0]))} />
                <span className="text-sm text-gray-500 flex items-center gap-2"><ImageIcon size={16}/> Upload Thumbnail</span>
              </label>
            ) : (
              <div className="relative h-64 w-full bg-gray-900 rounded-xl overflow-hidden">
                <Cropper image={imageSrc} crop={crop} zoom={zoom} onCropChange={setCrop} onZoomChange={setZoom} />
              </div>
            )}
          </div>
        )}

        {tab === "seo" && <div className="text-gray-400">AI Tag generator interface...</div>}
        {tab === "links" && <div className="text-gray-400">Cloud Storage & Shortener links...</div>}
      </div>
    </div>
  );
}
