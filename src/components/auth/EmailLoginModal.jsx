import React, { useState } from "react";
import { motion } from "framer-motion";
import { Youtube, Wand2, CheckCircle, Tag, Image as ImageIcon, Edit3 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Link as RouterLink } from "react-router-dom";
import Cropper from 'react-easy-crop';

export default function CreatorVideoTools({ user, profile }) {
  const [tab, setTab] = useState("share");
  const [ytUrl, setYtUrl] = useState("");
  const [ytTitle, setYtTitle] = useState("");
  const [tags, setTags] = useState("");
  const [checklist, setChecklist] = useState({ thumbnail: false, seo: false, pinned: false });
  const [imageSrc, setImageSrc] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);

  const generateTags = async () => {
    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `Generate 10 trending gaming YouTube tags for: "${ytTitle}".`
    });
    setTags(res);
  };

  return (
    <div className="bg-gray-950/80 backdrop-blur-xl rounded-3xl border border-white/10 p-6 shadow-2xl">
      {/* Navigation */}
      <div className="flex gap-2 overflow-x-auto pb-4 mb-4">
        {[ {id: "share", label: "📹 Post"}, {id: "ai", label: "🤖 AI"}, {id: "seo", label: "🏷️ Tags"}, {id: "editor", label: "🎨 Editor"}, {id: "checklist", label: "✅ Checklist"} ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} className={`px-4 py-2 rounded-xl text-xs font-bold ${tab === t.id ? "bg-purple-600 text-white" : "bg-gray-800 text-gray-400"}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Editor Tab Logic */}
      {tab === "editor" && (
        <div className="space-y-4">
          {!imageSrc ? (
            <input type="file" onChange={(e) => setImageSrc(URL.createObjectURL(e.target.files[0]))} className="w-full p-4 border border-dashed border-gray-700 rounded-xl text-gray-400" />
          ) : (
            <div className="relative h-64 bg-gray-800 rounded-xl overflow-hidden">
              <Cropper image={imageSrc} crop={crop} zoom={zoom} onCropChange={setCrop} onZoomChange={setZoom} />
            </div>
          )}
        </div>
      )}
      {/* Add your existing Share/AI/Checklist components here */}
    </div>
  );
}
