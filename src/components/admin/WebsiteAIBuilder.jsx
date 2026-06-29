import React, { useState } from "react";
import { Bot, Sparkles, CheckCircle2, Github, RefreshCw, Wand2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import WebsiteBuilderPromptTools from "@/components/admin/WebsiteBuilderPromptTools";

export default function WebsiteAIBuilder({ content, setContent, editableSections }) {
  const [prompt, setPrompt] = useState("");
  const [mode, setMode] = useState("full");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);

  const generate = async () => {
    if (!prompt.trim()) return;
    setBusy(true);
    setResult(null);
    const currentContent = editableSections.map(f => `${f.key}: ${content[f.key]?.value || ""}`).join("\n");
    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `You are the Base44-powered AI website builder for Gamer.Productions inside Website Editor mode.
Only use Base44 built-in integration credits through this InvokeLLM request. Do not suggest paid external AI APIs, external secrets, or third-party generation services.
The admin selected builder mode: ${mode}.

Admin request:
${prompt}

Current editable website content:
${currentContent}

Return practical website-building help. Use content_updates only for exact editable keys listed above. For anything that cannot be applied directly as text, provide clear build guidance in layout_plan, feature_ideas, seo_checklist, and repo_sync_plan.`,
      response_json_schema: {
        type: "object",
        properties: {
          summary: { type: "string" },
          content_updates: {
            type: "array",
            items: { type: "object", properties: { key: { type: "string" }, value: { type: "string" }, reason: { type: "string" } } },
          },
          layout_plan: { type: "array", items: { type: "string" } },
          feature_ideas: { type: "array", items: { type: "string" } },
          seo_checklist: { type: "array", items: { type: "string" } },
          repo_sync_plan: { type: "array", items: { type: "string" } },
          next_prompts: { type: "array", items: { type: "string" } },
        },
      },
    });
    setResult(res);
    setBusy(false);
  };

  const applyUpdates = () => {
    if (!result?.content_updates?.length) return;
    const allowed = new Set(editableSections.map(f => f.key));
    setContent(prev => {
      const next = { ...prev };
      result.content_updates.forEach(update => {
        if (allowed.has(update.key)) next[update.key] = { ...next[update.key], value: update.value };
      });
      return next;
    });
  };

  const renderList = (title, items) => {
    if (!items?.length) return null;
    return (
      <div className="rounded-xl border border-gray-800 bg-gray-900/70 p-4">
        <h5 className="text-white text-xs font-black uppercase tracking-wider mb-2">{title}</h5>
        <ul className="list-disc pl-5 text-gray-400 text-xs space-y-1">{items.map((item, i) => <li key={i}>{item}</li>)}</ul>
      </div>
    );
  };

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-purple-700/50 bg-gradient-to-br from-purple-950/40 to-gray-900 p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center"><Bot className="w-5 h-5 text-white" /></div>
          <div>
            <h3 className="text-white font-black text-lg">AI Website Builder</h3>
            <p className="text-gray-400 text-xs flex items-center gap-1"><Github className="w-3 h-3" /> Website Editor mode · Base44 integration credits only</p>
          </div>
        </div>

        <WebsiteBuilderPromptTools mode={mode} setMode={setMode} setPrompt={setPrompt} />

        <textarea value={prompt} onChange={e => setPrompt(e.target.value)} rows={5}
          placeholder="Ask Base44 to improve copy, plan layouts, generate SEO guidance, or suggest website features..."
          className="mt-4 w-full rounded-xl border border-gray-700 bg-gray-800 px-4 py-3 text-sm text-white placeholder-gray-600 outline-none focus:border-purple-500 resize-none" />
        <button onClick={generate} disabled={busy || !prompt.trim()}
          className="mt-3 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-5 py-2.5 text-sm font-black text-white disabled:opacity-50">
          {busy ? <><RefreshCw className="w-4 h-4 animate-spin" /> Building with Base44 credits...</> : <><Wand2 className="w-4 h-4" /> Build with Base44 AI</>}
        </button>
      </div>

      {result && (
        <div className="rounded-2xl border border-cyan-700/50 bg-cyan-950/20 p-5 space-y-4">
          <div>
            <h4 className="text-cyan-200 font-black mb-2 flex items-center gap-2"><Sparkles className="w-4 h-4" /> AI Build Result</h4>
            <p className="text-gray-300 text-sm">{result.summary}</p>
          </div>
          {result.content_updates?.length > 0 && (
            <div className="rounded-xl border border-cyan-700/40 bg-gray-900/70 p-4">
              <h5 className="text-white text-xs font-black uppercase tracking-wider mb-2">Editable text updates</h5>
              <div className="space-y-2 mb-3">
                {result.content_updates.map((update, i) => <p key={i} className="text-gray-400 text-xs"><span className="text-cyan-300 font-bold">{update.key}</span>: {update.reason || "Ready to apply"}</p>)}
              </div>
              <button onClick={applyUpdates} className="flex items-center gap-2 rounded-xl bg-cyan-600 px-4 py-2 text-xs font-black text-white hover:bg-cyan-500">
                <CheckCircle2 className="w-4 h-4" /> Apply AI text updates
              </button>
            </div>
          )}
          {renderList("Layout plan", result.layout_plan)}
          {renderList("Helpful website features", result.feature_ideas)}
          {renderList("SEO checklist", result.seo_checklist)}
          {renderList("Repo sync implementation plan", result.repo_sync_plan)}
          {renderList("Next AI prompts", result.next_prompts)}
        </div>
      )}
    </div>
  );
}
