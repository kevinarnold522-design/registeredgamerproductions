import React from "react";
import { Sparkles } from "lucide-react";

const MODES = [
  { id: "full", label: "Full Website Build", hint: "Copy, layout, SEO, and feature plan" },
  { id: "copy", label: "Rewrite Copy", hint: "Improve editable website text" },
  { id: "layout", label: "Layout Planner", hint: "Section-by-section build guidance" },
  { id: "seo", label: "SEO Booster", hint: "Meta text, keywords, page clarity" },
];

const PROMPTS = [
  "Make the homepage feel more premium and conversion-focused for gamers.",
  "Plan a new landing page for digital creators to sell content.",
  "Improve SEO and calls-to-action across the editable website text.",
  "Suggest a cleaner homepage section order with stronger gaming marketplace messaging.",
];

export default function WebsiteBuilderPromptTools({ mode, setMode, setPrompt }) {
  return (
    <div className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-2">
        {MODES.map(item => (
          <button key={item.id} type="button" onClick={() => setMode(item.id)}
            className={`text-left rounded-xl border p-3 transition-all ${mode === item.id ? "border-purple-500 bg-purple-900/40" : "border-gray-800 bg-gray-900 hover:border-purple-700/60"}`}>
            <p className="text-white text-xs font-black">{item.label}</p>
            <p className="text-gray-500 text-[11px] mt-0.5">{item.hint}</p>
          </button>
        ))}
      </div>
      <div>
        <p className="text-gray-400 text-xs font-bold mb-2 flex items-center gap-1"><Sparkles className="w-3 h-3 text-purple-300" /> Quick build prompts</p>
        <div className="flex flex-wrap gap-2">
          {PROMPTS.map(text => (
            <button key={text} type="button" onClick={() => setPrompt(text)}
              className="rounded-lg border border-gray-800 bg-gray-900 px-3 py-2 text-[11px] font-semibold text-purple-200 hover:border-purple-600 hover:text-white">
              {text}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}