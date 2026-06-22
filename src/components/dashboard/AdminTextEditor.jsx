import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Edit3, Save, RotateCcw, Check, Plus, Trash2 } from "lucide-react";
import { base44 } from "@/api/base44Client";

const DEFAULT_CONTENT = [
  { key: "hero_title", value: "Welcome to GAMER Productions", section: "hero", label: "Hero Main Title" },
  { key: "hero_subtitle", value: "Stream Live · Share Mods · Build Community · Sell & Earn — worldwide.", section: "hero", label: "Hero Subtitle" },
  { key: "hero_badge", value: "Streaming · Mods · Social · Community · Est. 2026", section: "hero", label: "Hero Badge Text" },
  { key: "hero_founded", value: "Founded by Kevin Roberto in 2026 · The #1 Gaming Community Platform", section: "hero", label: "Hero Founded Text" },
  { key: "footer_tagline", value: "1 Community · 1 Mindset · 1 Goal", section: "footer", label: "Footer Tagline" },
  { key: "footer_desc", value: "GAMER Productions — your streaming, modding, social & gaming marketplace platform.", section: "footer", label: "Footer Description" },
  { key: "business_model_title", value: "More Than a Website — An Ecosystem", section: "business", label: "Business Model Title" },
  { key: "business_model_sub", value: "A Streaming Platform, Mods Sharing Community, Social Platform, and full Gaming Marketplace — all in one.", section: "business", label: "Business Model Subtitle" },
  { key: "category_title", value: "Browse by Category", section: "categories", label: "Categories Section Title" },
  { key: "livestream_title", value: "Go Live on GAMER", section: "livestream", label: "Live Stream Section Title" },
];

export default function AdminTextEditor() {
  const [items, setItems] = useState([]);
  const [saving, setSaving] = useState({});
  const [saved, setSaved] = useState({});
  const [loading, setLoading] = useState(true);
  const [editingKey, setEditingKey] = useState(null);

  useEffect(() => {
    const load = async () => {
      const existing = await base44.entities.SiteContent.list();
      const merged = DEFAULT_CONTENT.map(def => {
        const found = existing.find(e => e.key === def.key);
        return found ? { ...def, ...found, id: found.id } : def;
      });
      // Add any extra custom ones from DB
      const customOnes = existing.filter(e => !DEFAULT_CONTENT.find(d => d.key === e.key));
      setItems([...merged, ...customOnes]);
      setLoading(false);
    };
    load();
  }, []);

  const saveItem = async (item) => {
    setSaving(prev => ({ ...prev, [item.key]: true }));
    if (item.id) {
      await base44.entities.SiteContent.update(item.id, { key: item.key, value: item.value, section: item.section, label: item.label });
    } else {
      const created = await base44.entities.SiteContent.create({ key: item.key, value: item.value, section: item.section || "custom", label: item.label || item.key });
      setItems(prev => prev.map(i => i.key === item.key ? { ...i, id: created.id } : i));
    }
    setSaving(prev => ({ ...prev, [item.key]: false }));
    setSaved(prev => ({ ...prev, [item.key]: true }));
    setTimeout(() => setSaved(prev => ({ ...prev, [item.key]: false })), 2000);
    setEditingKey(null);
  };

  const updateLocal = (key, value) => {
    setItems(prev => prev.map(i => i.key === key ? { ...i, value } : i));
  };

  const deleteItem = async (item) => {
    if (item.id) await base44.entities.SiteContent.delete(item.id);
    setItems(prev => prev.filter(i => i.key !== item.key));
  };

  const sections = [...new Set(items.map(i => i.section || "custom"))];

  if (loading) return <div className="flex justify-center py-10"><div className="w-6 h-6 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center">
          <Edit3 className="w-5 h-5 text-purple-400" />
        </div>
        <div>
          <h2 className="text-white font-black text-xl">Website Text Editor</h2>
          <p className="text-gray-500 text-xs">Edit any text across the site — changes go live instantly</p>
        </div>
      </div>

      {sections.map(section => (
        <div key={section} className="mb-8">
          <h3 className="text-purple-300 font-bold text-sm uppercase tracking-wider mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-purple-500" />
            {section.replace(/_/g, " ")} Section
          </h3>
          <div className="space-y-3">
            {items.filter(i => (i.section || "custom") === section).map(item => (
              <motion.div key={item.key} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                className="bg-gray-900/80 rounded-2xl border border-gray-800 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-gray-400 text-xs font-semibold">{item.label || item.key}</span>
                      <span className="text-gray-600 font-mono text-[10px]">[{item.key}]</span>
                    </div>
                    {editingKey === item.key ? (
                      <textarea
                        value={item.value}
                        onChange={e => updateLocal(item.key, e.target.value)}
                        className="w-full bg-gray-800 border border-purple-600/60 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none resize-none"
                        rows={item.value.length > 80 ? 3 : 2}
                        autoFocus
                      />
                    ) : (
                      <p className="text-white text-sm leading-relaxed bg-gray-800/50 rounded-xl px-3 py-2.5 cursor-text border border-gray-700"
                        onClick={() => setEditingKey(item.key)}>
                        {item.value}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-1.5 flex-shrink-0">
                    {editingKey === item.key ? (
                      <>
                        <button onClick={() => saveItem(item)} disabled={saving[item.key]}
                          className="p-2 rounded-xl bg-green-900/40 border border-green-700/50 text-green-400 hover:bg-green-900/60 transition-colors">
                          {saved[item.key] ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                        </button>
                        <button onClick={() => setEditingKey(null)}
                          className="p-2 rounded-xl bg-gray-800 border border-gray-700 text-gray-400 hover:text-white transition-colors">
                          <RotateCcw className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => setEditingKey(item.key)}
                          className="p-2 rounded-xl bg-purple-900/30 border border-purple-700/40 text-purple-400 hover:bg-purple-900/50 transition-colors">
                          <Edit3 className="w-4 h-4" />
                        </button>
                        {item.id && !DEFAULT_CONTENT.find(d => d.key === item.key) && (
                          <button onClick={() => deleteItem(item)}
                            className="p-2 rounded-xl bg-red-900/30 border border-red-700/40 text-red-400 hover:bg-red-900/50 transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      ))}

      <div className="mt-4 p-4 bg-blue-900/20 border border-blue-700/30 rounded-2xl">
        <p className="text-blue-300 text-sm font-semibold">
          How to use: Click any text to edit it, then press Save. Changes are stored in the database and will reflect across the site. Some sections require a page refresh to see updates.
        </p>
      </div>
    </div>
  );
}