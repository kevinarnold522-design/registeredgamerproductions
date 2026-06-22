import React, { useState } from "react";
import { Plus, Trash2, Save, FolderPlus } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { CATEGORIES } from "@/lib/constants";

const STORAGE_KEY = "gamer_custom_subcategories";

function loadCustomSubs() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

function saveCustomSubs(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export default function AdminSubcategoryManager() {
  const [selectedCat, setSelectedCat] = useState(CATEGORIES[0].id);
  const [customSubs, setCustomSubs] = useState(loadCustomSubs);
  const [newSub, setNewSub] = useState("");
  const [saved, setSaved] = useState(false);

  const cat = CATEGORIES.find(c => c.id === selectedCat);
  const baseSubs = cat?.subcategories || [];
  const extra = customSubs[selectedCat] || [];
  const allSubs = [...baseSubs, ...extra];

  const addSub = () => {
    const trimmed = newSub.trim();
    if (!trimmed || allSubs.includes(trimmed)) return;
    const updated = { ...customSubs, [selectedCat]: [...(customSubs[selectedCat] || []), trimmed] };
    setCustomSubs(updated);
    saveCustomSubs(updated);
    setNewSub("");
    flashSaved();
  };

  const removeCustomSub = (sub) => {
    const updated = { ...customSubs, [selectedCat]: (customSubs[selectedCat] || []).filter(s => s !== sub) };
    setCustomSubs(updated);
    saveCustomSubs(updated);
    flashSaved();
  };

  const flashSaved = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center">
          <FolderPlus className="w-5 h-5 text-purple-400" />
        </div>
        <div>
          <h3 className="text-white font-black text-lg">Subcategory Manager</h3>
          <p className="text-gray-500 text-xs">Add or remove subcategories for each category</p>
        </div>
        {saved && (
          <span className="ml-auto text-green-400 text-xs font-bold flex items-center gap-1">
            <Save className="w-3 h-3" /> Saved!
          </span>
        )}
      </div>

      {/* Category Picker */}
      <div className="flex flex-wrap gap-2 mb-5">
        {CATEGORIES.map(c => (
          <button
            key={c.id}
            onClick={() => setSelectedCat(c.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${selectedCat === c.id ? "bg-purple-600/30 border border-purple-500/60 text-purple-300" : "bg-gray-800 border border-gray-700 text-gray-400 hover:text-white"}`}
          >
            {c.icon} {c.label.replace(/^[^ ]+ /, "")}
          </button>
        ))}
      </div>

      {/* Subcategory List */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 space-y-2 mb-4">
        <p className="text-gray-500 text-[10px] uppercase font-bold tracking-wider mb-3">
          Subcategories for {cat?.label} ({allSubs.length})
        </p>
        {allSubs.map(sub => {
          const isCustom = extra.includes(sub);
          return (
            <div key={sub} className={`flex items-center justify-between px-3 py-2 rounded-xl border ${isCustom ? "bg-purple-900/20 border-purple-700/40" : "bg-gray-800/60 border-gray-700/50"}`}>
              <span className="text-white text-sm">{sub}</span>
              {isCustom ? (
                <button
                  onClick={() => removeCustomSub(sub)}
                  className="text-red-400 hover:text-red-300 transition-colors p-1 rounded"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              ) : (
                <span className="text-gray-600 text-[10px]">default</span>
              )}
            </div>
          );
        })}
        {allSubs.length === 0 && (
          <p className="text-gray-600 text-sm text-center py-4">No subcategories yet</p>
        )}
      </div>

      {/* Add New */}
      <div className="flex gap-2">
        <input
          value={newSub}
          onChange={e => setNewSub(e.target.value)}
          onKeyDown={e => e.key === "Enter" && addSub()}
          placeholder="New subcategory name..."
          className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 text-sm"
        />
        <button
          onClick={addSub}
          disabled={!newSub.trim()}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-purple-600/20 border border-purple-500/50 text-purple-300 text-sm font-bold hover:bg-purple-600/30 transition-colors disabled:opacity-40"
        >
          <Plus className="w-4 h-4" /> Add
        </button>
      </div>

      <p className="text-gray-600 text-xs mt-3">
        💡 Custom subcategories are stored locally and will be available platform-wide for listing creation.
      </p>
    </div>
  );
}