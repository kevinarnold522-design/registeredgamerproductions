import React, { useState } from "react";
import { Bot, Sparkles, CheckCircle2, Github, RefreshCw } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function WebsiteAIBuilder({ content, setContent, editableSections }) {
  const [prompt, setPrompt] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);

  const generate = async () => {
    if (!prompt.trim()) return;
    setBusy(true);
    setResult(null);
    const currentContent = editableSections.map(f => `${f.key}: ${content[f.key]?.value || ""}`).join("\n");
    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `You are the Base44-powered AI website builder for Gamer.Productions. The admin chose GitHub Repo Sync mode, so generate practical website updates that can be saved in Base44 and then synced through the existing repo sync workflow. Do not claim you directly pushed to GitHub.

Admin request:
${prompt}

Current editable website content:
${currentContent}

Return improved copy for any matching editable content fields and a concise repo sync implementation plan for changes outside text content.`,
      response_json_schema: {
        type: "object",
        properties: {
          summary: { type: "string" },
          repo_sync_plan: { type: "array", items: { type: "string" } },
          content_updates: {
            type: "array",
            items: {
              type: "object",
              properties: {
                key: { type: "string" },
                value: { type: "string" },
              },
            },
          },
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

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-purple-700/50 bg-gradient-to-br from-purple-950/40 to-gray-900 p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center"><Bot className="w-5 h-5 text-white" /></div>
          <div>
            <h3 className="text-white font-black text-lg">AI Website Builder</h3>
            <p className="text-gray-400 text-xs flex items-center gap-1"><Github className="w-3 h-3" /> Repo Sync mode · Base44 integration credits are used every prompt</p>
          </div>
        </div>
        <textarea value={prompt} onChange={e => setPrompt(e.target.value)} rows={5}
          placeholder="Ask Base44 to rebuild sections, improve homepage copy, plan a new layout, or prepare repo-sync website changes..."
          className="w-full rounded-xl border border-gray-700 bg-gray-800 px-4 py-3 text-sm text-white placeholder-gray-600 outline-none focus:border-purple-500 resize-none" />
        <button onClick={generate} disabled={busy || !prompt.trim()}
          className="mt-3 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-5 py-2.5 text-sm font-black text-white disabled:opacity-50">
          {busy ? <><RefreshCw className="w-4 h-4 animate-spin" /> Building with Base44...</> : <><Sparkles className="w-4 h-4" /> Build Website Prompt</>}
        </button>
      </div>

      {result && (
        <div className="rounded-2xl border border-cyan-700/50 bg-cyan-950/20 p-5">
          <h4 className="text-cyan-200 font-black mb-2">AI Build Result</h4>
          <p className="text-gray-300 text-sm mb-4">{result.summary}</p>
          {result.repo_sync_plan?.length > 0 && <ul className="list-disc pl-5 text-gray-400 text-xs space-y-1 mb-4">{result.repo_sync_plan.map((item, i) => <li key={i}>{item}</li>)}</ul>}
          {result.content_updates?.length > 0 && (
            <button onClick={applyUpdates} className="flex items-center gap-2 rounded-xl bg-cyan-600 px-4 py-2 text-xs font-black text-white hover:bg-cyan-500">
              <CheckCircle2 className="w-4 h-4" /> Apply AI text updates
            </button>
          )}
        </div>
      )}
    </div>
  );
}