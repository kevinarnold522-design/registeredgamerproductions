import React, { useRef, useState } from "react";
import { Bot, Upload, Sparkles, X, Image as ImageIcon, CheckCircle2, MessageCircle } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { MAX_UPLOAD_BYTES, MAX_UPLOAD_LABEL, uploadFileToR2 } from "@/lib/uploadToR2";

const CATEGORY_OPTIONS = [
  { id: "games", label: "Games" },
  { id: "modding", label: "Modding Community" },
  { id: "premium_mods", label: "Premium Mods" },
  { id: "store", label: "Store" },
  { id: "buy_sell", label: "Buy & Sell" },
  { id: "paid_tools", label: "Tools" },
  { id: "content_streaming", label: "Content / Streaming" },
];

// Smart follow-up questions the assistant can ask before building
const SMART_QUESTIONS = [
  { key: "category", q: "What category does this belong to? (e.g. Games, Modding, Premium Mods, Store, Tools)" },
  { key: "product_type", q: "Is this a digital download or a physical product?" },
  { key: "game", q: "Which game is this for? (leave blank if not game-specific)" },
  { key: "price", q: "What's the price? Type 0 if it's free." },
];

export default function AIListingAssistant({ form, setForm, images, setImages }) {
  const [prompt, setPrompt] = useState("");
  const [files, setFiles] = useState([]);
  const [busy, setBusy] = useState(false);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [done, setDone] = useState(false);
  const inputRef = useRef(null);

  const fieldLabels = {
    title: "Title",
    description: "Description",
    price: "Price",
    product_type: "Product Type",
    category: "Category",
    digital_subcategory: "Digital Subcategory",
    physical_subcategory: "Physical Subcategory",
    modding_subcategory: "Modding Subcategory",
    game_name: "Game",
    tool_target_game: "Tool Target Game",
    condition: "Condition",
    tags: "Tags",
    keywords: "SEO Keywords",
  };

  const generate = async () => {
    if (!prompt.trim() && files.length === 0) return;
    setBusy(true);
    setDone(false);
    setResult(null);

    try {
      const uploaded = [];
      for (const file of files) {
        if (file.size > MAX_UPLOAD_BYTES) {
          alert(`AI image uploads must be ${MAX_UPLOAD_LABEL} or smaller.`);
          return;
        }
        const { file_url } = await uploadFileToR2(file, "ai-listing-images");
        uploaded.push(file_url);
      }

      // Build context from any answered follow-up questions + multi-line prompts
      const answerContext = Object.entries(answers)
        .filter(([, v]) => v && String(v).trim())
        .map(([k, v]) => `${k}: ${v}`)
        .join("\n");

      const res = await base44.integrations.Core.InvokeLLM({
        file_urls: uploaded,
        prompt: `You are an expert gaming marketplace listing assistant. The seller may give you MULTIPLE separate notes or prompts at once — read ALL of them and combine into ONE accurate, high-converting, SEO-friendly, honest, gaming-specific listing.

Decide the BEST main category from this exact list of ids: games, modding, premium_mods, store, buy_sell, paid_tools, content_streaming. Recommend the most fitting subcategory too.

Seller notes (may contain multiple prompts):
"""
${prompt}
"""

Extra answers from the seller:
${answerContext || "(none)"}

Current selected category: ${form.category}. Only override it if a different category clearly fits better.`,
        response_json_schema: {
          type: "object",
          properties: {
            title: { type: "string" },
            description: { type: "string" },
            price: { type: "number" },
            product_type: { type: "string", enum: ["digital", "physical"] },
            category: { type: "string", enum: ["games", "modding", "premium_mods", "store", "buy_sell", "paid_tools", "content_streaming"] },
            game_name: { type: "string" },
            tags: { type: "array", items: { type: "string" } },
            keywords: { type: "array", items: { type: "string" } },
            condition: { type: "string" },
            digital_subcategory: { type: "string" },
            physical_subcategory: { type: "string" },
            modding_subcategory: { type: "string" },
            tool_target_game: { type: "string" },
            recommendation_note: { type: "string", description: "A short friendly note recommending what to review before publishing" },
          },
        },
      });

      if (uploaded.length) setImages([...(images || []), ...uploaded]);
      setResult(res);
    } catch (error) {
      alert(error?.message || "Could not upload your AI listing image. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  // Apply all recommended fields into the listing form
  const applyAll = () => {
    if (!result) return;
    setForm((f) => ({
      ...f,
      title: result.title || f.title,
      description: result.description || f.description,
      price: result.price != null ? String(result.price) : f.price,
      product_type: result.product_type || f.product_type,
      category: result.category || f.category,
      condition: result.condition || f.condition,
      game_name: result.game_name || f.game_name,
      digital_subcategory: result.digital_subcategory || f.digital_subcategory,
      physical_subcategory: result.physical_subcategory || f.physical_subcategory,
      modding_subcategory: result.modding_subcategory || f.modding_subcategory,
      tool_target_game: result.tool_target_game || f.tool_target_game,
      tags: Array.isArray(result.tags) ? result.tags.join(", ") : f.tags,
      keywords: Array.isArray(result.keywords) ? result.keywords.join(", ") : f.keywords,
    }));
    setDone(true);
  };

  const renderValue = (key, val) => {
    if (val == null || val === "") return null;
    if (Array.isArray(val)) return val.join(", ");
    if (key === "category") return CATEGORY_OPTIONS.find(c => c.id === val)?.label || val;
    return String(val);
  };

  return (
    <div className="mb-6 rounded-2xl border border-purple-700/50 bg-gradient-to-br from-purple-950/40 to-gray-900 p-5">
      <div className="flex items-center gap-2 mb-3">
        <Bot className="w-5 h-5 text-purple-300" />
        <div>
          <p className="text-white text-sm font-black">AI Listing Assistant</p>
          <p className="text-gray-500 text-xs">Paste one or more descriptions, add images, answer a couple of quick questions, and the AI recommends every field — category, subcategory, price &amp; more — before you publish.</p>
        </div>
      </div>

      {/* Guided questions — always shown, combined with the prompt box */}
      <div className="mb-3 grid gap-2 sm:grid-cols-2 rounded-xl border border-purple-800/40 bg-gray-900/60 p-3">
        <div className="sm:col-span-2 flex items-center gap-1.5 text-purple-200 text-[11px] font-black uppercase tracking-wider">
          <MessageCircle className="w-3.5 h-3.5" /> Quick Questions
        </div>
        {SMART_QUESTIONS.map(({ key, q }) => (
          <div key={key}>
            <label className="text-purple-200/80 text-[11px] font-semibold block mb-1">{q}</label>
            <input value={answers[key] || ""} onChange={e => setAnswers(a => ({ ...a, [key]: e.target.value }))}
              className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-xs text-white placeholder-gray-600 outline-none focus:border-purple-500" />
          </div>
        ))}
        <p className="sm:col-span-2 text-gray-500 text-[10px]">These help the AI pick the right category &amp; subcategory automatically.</p>
      </div>

      <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} rows={4}
        placeholder={"You can paste multiple prompts at once, e.g.:\n- Premium GTA 5 graphics mod, install guide included, latest PC version\n- Also works on Steam, ₱250"}
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
          <Sparkles className="w-4 h-4" /> {busy ? "AI is thinking..." : "Build Listing"}
        </button>
      </div>

      {/* Recommendations panel — every field reviewed before publish */}
      {result && (
        <div className="mt-4 rounded-xl border border-cyan-700/50 bg-cyan-950/20 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-cyan-300" />
            <p className="text-cyan-200 text-sm font-black">AI Recommendations — review before publishing</p>
          </div>
          {result.recommendation_note && (
            <p className="text-cyan-300/80 text-xs mb-3 italic">{result.recommendation_note}</p>
          )}
          <div className="grid sm:grid-cols-2 gap-2 mb-3">
            {Object.keys(fieldLabels).map((key) => {
              const v = renderValue(key, result[key]);
              if (!v) return null;
              return (
                <div key={key} className="rounded-lg bg-gray-900/70 border border-gray-800 px-3 py-2">
                  <p className="text-gray-500 text-[10px] font-bold uppercase tracking-wider">{fieldLabels[key]}</p>
                  <p className="text-white text-xs mt-0.5 line-clamp-3">{v}</p>
                </div>
              );
            })}
          </div>
          <button type="button" onClick={applyAll}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 to-purple-600 px-4 py-2.5 text-xs font-black text-white hover:opacity-90">
            <CheckCircle2 className="w-4 h-4" /> Apply all recommendations
          </button>
        </div>
      )}

      {/* Done autofilling confirmation */}
      {done && (
        <div className="mt-3 flex items-center gap-2 rounded-xl border border-green-600/50 bg-green-900/20 px-4 py-3">
          <CheckCircle2 className="w-5 h-5 text-green-400" />
          <p className="text-green-300 text-sm font-bold">Done autofilling — review the fields below, tweak anything, then publish.</p>
        </div>
      )}
    </div>
  );
}