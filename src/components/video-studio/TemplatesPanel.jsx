import React, { useState } from "react";
import { LayoutGrid, Film, Smartphone, MonitorPlay, Presentation } from "lucide-react";

export default function TemplatesPanel({ onSelect }) {
  const [category, setCategory] = useState("all");

  const categories = [
    { id: "all", label: "All", icon: LayoutGrid },
    { id: "social", label: "Social", icon: Smartphone },
    { id: "youtube", label: "YouTube", icon: Film },
    { id: "business", label: "Business", icon: Presentation },
    { id: "promo", label: "Promo", icon: MonitorPlay },
  ];

  const templates = [
    {
      id: 1,
      name: "Instagram Reel",
      category: "social",
      size: "1080x1920",
      duration: "30s",
      thumbnail: "📱",
    },
    {
      id: 2,
      name: "YouTube Intro",
      category: "youtube",
      size: "1920x1080",
      duration: "10s",
      thumbnail: "🎬",
    },
    {
      id: 3,
      name: "Product Promo",
      category: "promo",
      size: "1920x1080",
      duration: "60s",
      thumbnail: "✨",
    },
    {
      id: 4,
      name: "TikTok Video",
      category: "social",
      size: "1080x1920",
      duration: "15s",
      thumbnail: "🎵",
    },
    {
      id: 5,
      name: "Business Presentation",
      category: "business",
      size: "1920x1080",
      duration: "120s",
      thumbnail: "📊",
    },
    {
      id: 6,
      name: "YouTube Shorts",
      category: "youtube",
      size: "1080x1920",
      duration: "60s",
      thumbnail: "⚡",
    },
    {
      id: 7,
      name: "Facebook Ad",
      category: "social",
      size: "1080x1080",
      duration: "30s",
      thumbnail: "📢",
    },
    {
      id: 8,
      name: "Explainer Video",
      category: "business",
      size: "1920x1080",
      duration: "90s",
      thumbnail: "💡",
    },
  ];

  const filteredTemplates = category === "all" ? templates : templates.filter(t => t.category === category);

  return (
    <div className="p-3">
      {/* Categories */}
      <div className="flex gap-1 mb-4 overflow-x-auto">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setCategory(cat.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
              category === cat.id
                ? "bg-purple-600/20 text-purple-400"
                : "text-gray-400 hover:text-white hover:bg-gray-800"
            }`}
          >
            <cat.icon className="w-3.5 h-3.5" />
            {cat.label}
          </button>
        ))}
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-2 gap-3">
        {filteredTemplates.map((template) => (
          <button
            key={template.id}
            onClick={() => onSelect(template)}
            className="bg-gray-800 hover:bg-gray-700 rounded-xl overflow-hidden transition-all group text-left"
          >
            <div className="aspect-video bg-gradient-to-br from-purple-900/30 to-pink-900/30 flex items-center justify-center text-4xl">
              {template.thumbnail}
            </div>
            <div className="p-3">
              <h4 className="text-sm text-white font-semibold group-hover:text-purple-400 transition-colors">
                {template.name}
              </h4>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] text-gray-500">{template.size}</span>
                <span className="text-[10px] text-gray-500">•</span>
                <span className="text-[10px] text-gray-500">{template.duration}</span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}