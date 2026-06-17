import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Trash2, Megaphone } from "lucide-react";

const initialForm = {
  name: "",
  page_type: "global",
  listing_id: "",
  category: "",
  title: "",
  body: "",
  image_url: "",
  cta_label: "Learn More",
  cta_url: "",
  start_delay_seconds: 30,
  duration_seconds: 10,
  interval_seconds: 120,
  is_active: true,
};

export default function AdminAdManager({ listings = [] }) {
  const [ads, setAds] = useState([]);
  const [form, setForm] = useState(initialForm);

  const loadAds = async () => {
    const rows = await base44.entities.AdPlacement.list("-created_date", 100);
    setAds(rows);
  };

  useEffect(() => { loadAds(); }, []);

  const saveAd = async () => {
    if (!form.name.trim() || !form.title.trim()) return;
    await base44.entities.AdPlacement.create({
      ...form,
      start_delay_seconds: Number(form.start_delay_seconds) || 0,
      duration_seconds: Number(form.duration_seconds) || 10,
      interval_seconds: Number(form.interval_seconds) || 120,
    });
    setForm(initialForm);
    loadAds();
  };

  const deleteAd = async (id) => {
    await base44.entities.AdPlacement.delete(id);
    setAds(prev => prev.filter(ad => ad.id !== id));
  };

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-pink-700/30 bg-gray-900 p-5">
        <div className="flex items-center gap-3 mb-4">
          <Megaphone className="w-5 h-5 text-pink-300" />
          <div>
            <h3 className="text-white font-black">Ad Placement Scheduler</h3>
            <p className="text-gray-500 text-xs">Choose where ads appear, when they start, how long they stay, and repeat interval.</p>
          </div>
        </div>
        <div className="grid md:grid-cols-3 gap-3">
          <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Ad name" className="bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-white text-sm" />
          <select value={form.page_type} onChange={e => setForm(f => ({ ...f, page_type: e.target.value }))} className="bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-white text-sm">
            <option value="global">All landing pages</option>
            <option value="listing">Specific listing</option>
            <option value="category">Specific category</option>
          </select>
          {form.page_type === "listing" ? (
            <select value={form.listing_id} onChange={e => setForm(f => ({ ...f, listing_id: e.target.value }))} className="bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-white text-sm">
              <option value="">Select listing</option>
              {listings.map(l => <option key={l.id} value={l.id}>{l.title}</option>)}
            </select>
          ) : (
            <input value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} placeholder="Category, optional" className="bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-white text-sm" />
          )}
          <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Ad headline" className="bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-white text-sm" />
          <input value={form.body} onChange={e => setForm(f => ({ ...f, body: e.target.value }))} placeholder="Ad message" className="bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-white text-sm" />
          <input value={form.image_url} onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))} placeholder="Image URL" className="bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-white text-sm" />
          <input value={form.cta_label} onChange={e => setForm(f => ({ ...f, cta_label: e.target.value }))} placeholder="CTA label" className="bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-white text-sm" />
          <input value={form.cta_url} onChange={e => setForm(f => ({ ...f, cta_url: e.target.value }))} placeholder="CTA URL" className="bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-white text-sm" />
          <div className="grid grid-cols-3 gap-2">
            <input type="number" value={form.start_delay_seconds} onChange={e => setForm(f => ({ ...f, start_delay_seconds: e.target.value }))} title="Start delay" className="bg-gray-950 border border-gray-800 rounded-xl px-2 py-2 text-white text-sm" />
            <input type="number" value={form.duration_seconds} onChange={e => setForm(f => ({ ...f, duration_seconds: e.target.value }))} title="Duration" className="bg-gray-950 border border-gray-800 rounded-xl px-2 py-2 text-white text-sm" />
            <input type="number" value={form.interval_seconds} onChange={e => setForm(f => ({ ...f, interval_seconds: e.target.value }))} title="Interval" className="bg-gray-950 border border-gray-800 rounded-xl px-2 py-2 text-white text-sm" />
          </div>
        </div>
        <p className="text-gray-600 text-[10px] mt-2">Timing fields are seconds: start delay / stay duration / repeat interval.</p>
        <button onClick={saveAd} className="mt-4 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-black">Create Ad Placement</button>
      </div>

      <div className="grid md:grid-cols-2 gap-3">
        {ads.map(ad => (
          <div key={ad.id} className="rounded-2xl border border-gray-800 bg-gray-900 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-white font-black text-sm">{ad.name}</p>
                <p className="text-pink-300 text-xs font-bold">{ad.page_type} · starts {ad.start_delay_seconds || 0}s · stays {ad.duration_seconds || 10}s · repeats {ad.interval_seconds || 120}s</p>
                <p className="text-gray-400 text-xs mt-2">{ad.title}</p>
              </div>
              <button onClick={() => deleteAd(ad.id)} className="text-red-400 hover:text-red-300"><Trash2 className="w-4 h-4" /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}