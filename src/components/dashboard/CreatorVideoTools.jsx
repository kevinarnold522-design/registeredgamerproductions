import React, { useState } from "react";
import { motion } from "framer-motion";
import { Youtube, Wand2, CheckCircle, Tag, Image as ImageIcon, Edit3, Zap, Link } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Link as RouterLink } from "react-router-dom";
import Cropper from 'react-easy-crop';

const CreatorVideoTools = ({ user, profile }) => {
  const [activeTab, setActiveTab] = useState("share");
  const [videoDetails, setVideoDetails] = useState({ url: "", title: "" });
  const [selectedImage, setSelectedImage] = useState(null);
  const [cropArea, setCropArea] = useState({ x: 0, y: 0 });
  const [zoomLevel, setZoomLevel] = useState(1);

  const navigationTabs = [
    { id: "share", label: "📹 Post" },
    { id: "editor", label: "🎨 Editor" },
    { id: "seo", label: "🏷️ Tags" },
  ];

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(URL.createObjectURL(file));
    }
  };

  return (
    <div className="bg-gray-950/80 backdrop-blur-xl rounded-3xl border border-white/10 p-6 shadow-2xl">
      <h2 className="text-white font-black text-xl mb-6">Creator Studio</h2>

      <div className="flex gap-2 overflow-x-auto pb-4 mb-4">
        {navigationTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === tab.id 
                ? "bg-purple-600 text-white" 
                : "bg-gray-800 text-gray-400 hover:text-white"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="min-h-[300px]">
        {activeTab === "editor" && (
          <div className="space-y-4">
            {!selectedImage ? (
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="w-full p-4 border border-dashed border-gray-700 rounded-xl text-gray-400 cursor-pointer"
              />
            ) : (
              <div className="relative h-64 bg-gray-800 rounded-xl overflow-hidden">
                <Cropper
                  image={selectedImage}
                  crop={cropArea}
                  zoom={zoomLevel}
                  onCropChange={setCropArea}
                  onZoomChange={setZoomLevel}
                />
              </div>
            )}
          </div>
        )}
        
        {activeTab === "share" && (
          <div className="text-gray-400">Ready to share your latest content?</div>
        )}
      </div>
    </div>
  );
};

export default CreatorVideoTools;

/**
 * git add src/components/dashboard/CreatorVideoTools.jsx
 * git commit -m "Refactor CreatorVideoTools component and clean up imports"
 * git push
 */
