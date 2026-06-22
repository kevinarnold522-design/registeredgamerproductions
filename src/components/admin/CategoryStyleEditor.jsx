import React, { useEffect, useState } from "react";
import { Palette, Save } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { CATEGORIES } from "@/lib/constants";

const defaultStyle = { color: "#a855f7", glow: "#a855f7", design: "radiant" };

export default function CategoryStyleEditor() {
  const [items, setItems] = useState([]);
  const [styles, setStyles] = useState({});
  const [records, setRecords] = useState({});
  const [saved, setSaved] = useState("");

  useEffect(() => {
    const load = async () => {
      const [listings, content] = await Promise.all([
        base44.entities.Listing.list("-created_date", 200),
        base44.entities.SiteContent.filter({ section: "category_design" }),
      ]);
      const dynamic = CATEGORIES.flatMap(c => [
        { id: c.id, label: c.label, type: "category" },
        ...(c.subcategories || []).map(s => ({ id: `${c.id}_${s}`, label: `${c.label} › ${s}`, type: "subcategory" }))
      ]);
      listings.forEach(l => {
        if (l.category) dynamic.push({ id: l.category, label: l.category.replace(/_/g, " "), type: "category" });
        [...(l.subcategories || []), l.modding_subcategory].filter(Boolean).forEach(s => dynamic.push({ id: `${l.category}_${s}`, label: `${l.category} › ${s}`, type: "subcategory" }));
      });
      const unique = Array.from(new Map(dynamic.map(i => [i.id, i])).values());
      const nextStyles = {};
      const nextRecords = {};
      content.forEach(row => {
        nextRecords[row.key] = row;
        try { nextStyles[row.key.replace("category_style_", "")] = JSON.parse(row.value); } catch {}
      });
      setItems(unique);
      setStyles(nextStyles);
      setRecords(nextRecords);
    };
    load();
  }, []);

  const updateStyle = (id, patch) => setStyles(prev => ({ ...prev, [id]: { ...defaultStyle, ...(prev[id] || {}), ...patch } }));

  const saveStyle = async (item) => {
    const key = `category_style_${item.id}`;
    const data = {
      key,
      value: JSON.stringify({ ...defaultStyle, ...(styles[item.id] || {}) }),
      section: "category_design",
      label: item.label,
      description: `Card color, glow, and design for ${item.label}`,
    };
    if (records[key]) await base44.entities.SiteContent.update(records[key].id, data);
    else {
      const created = await base44.entities.SiteContent.create(data);
      setRecords(prev => ({ ...prev, [key]: created }));
    }
    setSaved(item.id);
    setTimeout(() => setSaved(""), 1600);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-pink-500/20 border border-pink-500/40 flex items-center justify-center"><Palette className="w-5 h-5 text-pink-300" /></div>
        <div>
          <h2 className="text-white font-black text-xl">Category Card Design</h2>
          <p className="text-gray-500 text-xs">Edit color, glow, and card design for every category and subcategory.</p>
        </div>
      </div>
      <div className="grid md:grid-cols-2 gap-3">
        {items.map(item => {
          const style = { ...defaultStyle, ...(styles[item.id] || {}) };
          return (
            <div key={item.id} className="rounded-2xl border border-gray-800 bg-gray-900 p-4" style={{ boxShadow: `0 0 22px ${style.glow}33` }}>
              <div className="flex items-center justify-between gap-3 mb-3">
                <div>
                  <p className="text-white font-bold text-sm capitalize">{item.label}</p>
                  <p className="text-gray-600 text-[10px] uppercase tracking-wider">{item.type}</p>
                </div>
                <span className="w-8 h-8 rounded-xl border border-white/10" style={{ background: style.color }} />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <label className="text-gray-500 text-[10px] font-bold">Color<input type="color" value={style.color} onChange={e => updateStyle(item.id, { color: e.target.value })} className="mt-1 w-full h-9 rounded bg-gray-800" /></label>
                <label className="text-gray-500 text-[10px] font-bold">Glow<input type="color" value={style.glow} onChange={e => updateStyle(item.id, { glow: e.target.value })} className="mt-1 w-full h-9 rounded bg-gray-800" /></label>
                <label className="text-gray-500 text-[10px] font-bold">Design<select value={style.design} onChange={e => updateStyle(item.id, { design: e.target.value })} className="mt-1 w-full h-9 rounded bg-gray-800 border border-gray-700 text-white text-xs"><option value="radiant">Radiant</option><option value="lines">Lines</option><option value="solid">Solid</option></select></label>
              </div>
              <button onClick={() => saveStyle(item)} className="mt-3 flex items-center justify-center gap-2 w-full py-2 rounded-xl bg-purple-900/40 border border-purple-600/40 text-purple-200 text-xs font-black">
                <Save className="w-3.5 h-3.5" /> {saved === item.id ? "Saved" : "Save Design"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}