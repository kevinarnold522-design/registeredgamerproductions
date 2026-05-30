npm install react-easy-crop
import React, { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Youtube, Wand2, CheckCircle, Zap, Tag, Edit3, Crop, Image as ImageIcon } from "lucide-react";
import Cropper from 'react-easy-crop'; // Install via npm
import { base44 } from "@/api/base44Client";
import { Link as RouterLink } from "react-router-dom";

export default function CreatorVideoTools({ user, profile }) {
  const [tab, setTab] = useState("share");
  // ... (Keep existing states: ytUrl, ytTitle, scriptTopic, etc.)
  
  // Image Editor State
  const [imageSrc, setImageSrc] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);

  const tabs = [
    { id: "share", label: "📹 Post" },
    { id: "ai", label: "🤖 AI" },
    { id: "seo", label: "🏷️ SEO" },
    { id: "editor", label: "🎨 Image Editor" },
  ];

  return (
    <div className="bg-gray-950/80 backdrop-blur-xl rounded-3xl border border-white/10 p-6 shadow-2xl">
      {/* ... (Header and Tabs code remains the same) ... */}

      {/* Image Editor Tab */}
      {tab === "editor" && (
        <div className="space-y-4">
          {!imageSrc ? (
            <label className="block w-full h-32 border-2 border-dashed border-gray-700 rounded-xl flex items-center justify-center cursor-pointer hover:border-purple-500">
              <input type="file" className="hidden" onChange={(e) => setImageSrc(URL.createObjectURL(e.target.files[0]))} />
              <span className="text-gray-400 text-sm flex items-center gap-2"><ImageIcon size={16}/> Upload Image to Edit</span>
            </label>
          ) : (
            <div className="relative h-64 w-full bg-gray-800 rounded-xl overflow-hidden">
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                onCropChange={setCrop}
                onZoomChange={setZoom}
              />
            </div>
          )}
          <button className="w-full py-2 bg-purple-600 rounded-lg text-white font-bold text-sm">
            Apply Edits
          </button>
        </div>
      )}
      
      {/* ... (Include other tab logic from previous step) ... */}
    </div>
  );
}
// Add this to your image list items:
<button onClick={() => setTab("editor")} className="p-2 bg-gray-700 rounded-full hover:bg-purple-600">
  <Edit3 size={14} />
</button>
