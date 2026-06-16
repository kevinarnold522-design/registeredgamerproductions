import React, { useRef, useState } from "react";
import { Bot, Upload, Sparkles, X, Image as ImageIcon } from "lucide-react";
import { base44 } from "@/api/base44Client";

const MAX_UPLOAD_BYTES = 25 * 1024 * 1024;
const MAX_UPLOAD_LABEL = "25MB";

export default function AIListingAssistant({ form, setForm, images, setImages }) {
  const [prompt, setPrompt] = useState("");
  const [files, setFiles] = useState([]);
  const [busy, setBusy] = useState(false);
  const inputRef = useRef(null);

  const generate = async () => {
    if (!prompt.trim() && files.length === 0) return;
    setBusy(true);
    const uploaded = [];
    for (const file of files) {
      if (file.size > MAX_UPLOAD_BYTES) {
        alert(`AI image uploads must be ${MAX_UPLOAD_LABEL} or smaller.`);
        setBusy(false);
        return;
      }
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      uploaded.push(file_url);
    }
    const result = await base44.integrations.Core.InvokeLLM({
      file_urls: uploaded,
      prompt: `You are an expert gaming marketplace listing assistant. Create a high-converting, accurate listing from the seller notes and images. Keep it safe, honest, SEO-friendly, and gaming-specific. Current category is ${form.category}. Seller notes: ${prompt}`,
      response_json_schema: {
        type: "object",
        properties: {
          title: { type: "string" },
          description: { type: "string" },
          price: { type: "number" },
          product_type: { type: "string", enum: ["digital", "physical"] },
          game_name: { type: "string" },
          tags: { type: "array", items: { type: "string" } },
          keywords: { type: "array", items: { type: "string" } },
          condition: { type: "string" },
          digital_subcategory: { type: "string" },
          modding_subcategory: { type: "string" },
          tool_target_game: { type: "string" }
        }
      }
    });
    setForm((f) => ({
      ...f,
      title: result.title || f.title,
      description: result.description || f.description,
      price: result.price != null ? String(result.price) : f.price,
      product_type: result.product_type || f.product_type,
      condition: result.condition || f.condition,
      game_name: result.game_name || f.game_name,
      digital_subcategory: result.digital_subcategory || f.digital_subcategory,
      modding_subcategory: result.modding_subcategory || f.modding_subcategory,
      tool_target_game: result.tool_target_game || f.tool_target_game,
      tags: Array.isArray(result.tags) ? result.tags.join(", ") : f.tags,
      keywords: Array.isArray(result.keywords) ? result.keywords.join(", ") : f.keywords,
    }));
    if (uploaded.length) setImages([...(images || []), ...uploaded]);
    setBusy(false);
  };

  return (
    <div className="mb-6 rounded-2xl border border-purple-700/50 bg-gradient-to-br from-purple-950/40 to-gray-900 p-5">
      <div className="flex items-center gap-2 mb-3">
        <Bot className="w-5 h-5 text-purple-300" />
        <div>
          <p className="text-white text-sm font-black">AI Listing Assistant</p>
          <p className="text-gray-500 text-xs">Upload images up to {MAX_UPLOAD_LABEL} and describe the item — AI fills the listing details for you.</p>
        </div>
      </div>
      <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} rows={4}
        placeholder="Example: Premium GTA 5 graphics mod, includes install guide, works on latest PC version..."
        className="w-full resize-none rounded-xl border border-gray-700 bg-gray-800 px-4 py-3 text-sm text-white placeholder-gray-600 outline-none focus:border-purple-500" />
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button type="button" onClick={() => inputRef.current?.click()} className="flex items-center gap-2 rounded-xl border border-gray-700 bg-gray-800 px-3 py-2 text-xs font-bold text-gray-300 hover:border-purple-500">
          <Upload className="w-4 h-4" /> Add AI Images
        </button>
        <input ref={inputRef} type="file" multiple accept="image/*" className="hidden" onChange={(e) => {
          const selected = Array.from(e.target.files || []);
          if (selected.some(file => file.size > MAX_UPLOAD_BYTES)) {
            alert(`Each AI image must be ${MAX_UPLOAD_LABEL} or smaller.`);
            e.target.value = "";
            return;
          }
          setFiles(selected);
        }} />
        {files.map((file, i) => <span key={i} className="inline-flex items-center gap-1 rounded-lg bg-gray-800 px-2 py-1 text-[10px] text-gray-300"><ImageIcon className="w-3 h-3" />{file.name}<button type="button" onClick={() => setFiles(fs => fs.filter((_, idx) => idx !== i))}><X className="w-3 h-3" /></button></span>)}
        <button type="button" disabled={busy || (!prompt.trim() && files.length === 0)} onClick={generate} className="ml-auto flex items-center gap-2 rounded-xl bg-purple-600 px-4 py-2 text-xs font-black text-white disabled:opacity-50">
          <Sparkles className="w-4 h-4" /> {busy ? "AI is building..." : "Build Listing"}
        </button>
      </div>
    </div>
  );
}