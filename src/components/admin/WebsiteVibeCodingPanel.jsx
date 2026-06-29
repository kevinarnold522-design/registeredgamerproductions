import React, { useEffect, useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Bot, Github, GitBranch, FileCode2, FolderGit2, Loader2, Save, Wand2 } from "lucide-react";

const TOKEN_KEY = "gp_vibecoding_github_token";
const REPO_KEY = "gp_vibecoding_repo_url";
const STATE_KEY = "gp_vibecoding_repo_state";

function shortenPath(path = "") {
  if (path.length <= 52) return path;
  return `${path.slice(0, 24)}…${path.slice(-24)}`;
}

export default function WebsiteVibeCodingPanel() {
  const [githubToken, setGithubToken] = useState("");
  const [repoUrl, setRepoUrl] = useState("");
  const [repoState, setRepoState] = useState(null);
  const [selectedPath, setSelectedPath] = useState("");
  const [fileSha, setFileSha] = useState("");
  const [fileContent, setFileContent] = useState("");
  const [instruction, setInstruction] = useState("");
  const [commitMessage, setCommitMessage] = useState("VibeCoding update");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState({ import: false, read: false, ai: false, save: false });

  useEffect(() => {
    try {
      setGithubToken(localStorage.getItem(TOKEN_KEY) || "");
      setRepoUrl(localStorage.getItem(REPO_KEY) || "");
      const raw = localStorage.getItem(STATE_KEY);
      if (raw) setRepoState(JSON.parse(raw));
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(TOKEN_KEY, githubToken);
      localStorage.setItem(REPO_KEY, repoUrl);
      if (repoState) localStorage.setItem(STATE_KEY, JSON.stringify(repoState));
    } catch {}
  }, [githubToken, repoUrl, repoState]);

  const files = useMemo(() => (repoState?.files || []).filter((item) => item.type === "blob"), [repoState]);

  const consumeBase44Credit = async (action, context = "") => {
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `You are the Base44 integration credit meter for the GAMER.PRODUCTIONS vibecoding tool.
Every vibecoding request must consume Base44 integration credits before the GitHub operation runs.
Approve this vibecoding action and return a tiny JSON receipt.

Action: ${action}
Context: ${context || "none"}
`,
      response_json_schema: {
        type: "object",
        properties: {
          ok: { type: "boolean" },
          action: { type: "string" },
          note: { type: "string" },
        },
        required: ["ok", "action"],
      },
    });

    if (!result?.ok) {
      throw new Error("Base44 integration credit request failed.");
    }
    return result;
  };

  const importRepository = async () => {
    if (!githubToken.trim() || !repoUrl.trim()) return;
    setBusy((prev) => ({ ...prev, import: true }));
    setStatus("Importing repository with Base44-backed vibecoding…");
    try {
      await consumeBase44Credit("github_import", repoUrl);
      const res = await base44.functions.invoke("githubImportRepo", {
        githubToken: githubToken.trim(),
        repoUrl: repoUrl.trim(),
      });
      const payload = res?.data || res;
      setRepoState(payload);
      setSelectedPath("");
      setFileContent("");
      setFileSha("");
      setStatus(`Imported ${payload.owner}/${payload.repo} on ${payload.branch}.`);
    } catch (err) {
      setStatus(err?.message || "Repository import failed.");
    } finally {
      setBusy((prev) => ({ ...prev, import: false }));
    }
  };

  const openFile = async (path) => {
    if (!repoState || !path) return;
    setSelectedPath(path);
    setBusy((prev) => ({ ...prev, read: true }));
    setStatus(`Opening ${path}…`);
    try {
      await consumeBase44Credit("github_read_file", `${repoState.full_name}:${path}`);
      const res = await base44.functions.invoke("githubReadRepoFile", {
        githubToken: githubToken.trim(),
        owner: repoState.owner,
        repo: repoState.repo,
        branch: repoState.branch,
        path,
      });
      const payload = res?.data || res;
      setFileContent(payload.content || "");
      setFileSha(payload.sha || "");
      setCommitMessage(`Update ${path}`);
      setStatus(`Loaded ${path}.`);
    } catch (err) {
      setStatus(err?.message || "Failed to load file.");
    } finally {
      setBusy((prev) => ({ ...prev, read: false }));
    }
  };

  const generateWithAI = async () => {
    if (!selectedPath || !instruction.trim()) return;
    setBusy((prev) => ({ ...prev, ai: true }));
    setStatus(`Generating Base44 edit for ${selectedPath}…`);
    try {
      await consumeBase44Credit("vibecoding_generate_edit", `${selectedPath}: ${instruction}`);
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are the Base44 vibecoding editor for GAMER.PRODUCTIONS.
Update the selected repository file according to the user's request.
Return the full updated file contents, a concise summary, and a git commit message.

Repository: ${repoState?.full_name || "unknown"}
File path: ${selectedPath}
User request: ${instruction}

Current file:
${fileContent}
`,
        response_json_schema: {
          type: "object",
          properties: {
            updated_content: { type: "string" },
            summary: { type: "string" },
            commit_message: { type: "string" },
          },
          required: ["updated_content", "summary", "commit_message"],
        },
      });
      setFileContent(result.updated_content || fileContent);
      setCommitMessage(result.commit_message || commitMessage);
      setStatus(result.summary || "Generated Base44 edit.");
    } catch (err) {
      setStatus(err?.message || "Base44 edit generation failed.");
    } finally {
      setBusy((prev) => ({ ...prev, ai: false }));
    }
  };

  const saveAndPush = async () => {
    if (!repoState || !selectedPath || !fileContent.trim()) return;
    setBusy((prev) => ({ ...prev, save: true }));
    setStatus(`Saving ${selectedPath} to GitHub…`);
    try {
      await consumeBase44Credit("github_save_and_push", `${repoState.full_name}:${selectedPath}`);
      const res = await base44.functions.invoke("githubSaveRepoFile", {
        githubToken: githubToken.trim(),
        owner: repoState.owner,
        repo: repoState.repo,
        branch: repoState.branch,
        path: selectedPath,
        content: fileContent,
        sha: fileSha,
        message: commitMessage || `Update ${selectedPath}`,
      });
      const payload = res?.data || res;
      setFileSha(payload.sha || fileSha);
      setStatus(`Saved and pushed ${selectedPath} to ${payload.html_url || repoState.html_url}.`);
    } catch (err) {
      setStatus(err?.message || "Save and push failed.");
    } finally {
      setBusy((prev) => ({ ...prev, save: false }));
    }
  };

  return (
    <div className="space-y-5 rounded-2xl border border-cyan-700/40 bg-cyan-950/10 p-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h4 className="flex items-center gap-2 text-lg font-black text-white"><FolderGit2 className="h-5 w-5 text-cyan-300" /> VibeCoding</h4>
          <p className="text-xs text-gray-400">Real GitHub import, edit, and push workflow backed by Base44 AI credits.</p>
        </div>
        <div className="rounded-xl border border-cyan-700/40 bg-gray-900/80 px-3 py-2 text-[11px] font-semibold text-cyan-200">
          Every import, read, AI edit, and save request consumes Base44 integration credits.
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-[1.3fr_1fr_auto]">
        <input
          value={repoUrl}
          onChange={(e) => setRepoUrl(e.target.value)}
          placeholder="https://github.com/owner/repo.git"
          className="w-full rounded-xl border border-gray-700 bg-gray-800 px-4 py-3 text-sm text-white outline-none focus:border-cyan-500"
        />
        <input
          value={githubToken}
          onChange={(e) => setGithubToken(e.target.value)}
          placeholder="GitHub token"
          className="w-full rounded-xl border border-gray-700 bg-gray-800 px-4 py-3 text-sm text-white outline-none focus:border-cyan-500"
        />
        <button
          type="button"
          onClick={importRepository}
          disabled={busy.import || !repoUrl.trim() || !githubToken.trim()}
          className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 px-5 py-3 text-sm font-black text-white disabled:opacity-50"
        >
          {busy.import ? <Loader2 className="h-4 w-4 animate-spin" /> : <Github className="h-4 w-4" />}
          Import Repo
        </button>
      </div>

      {repoState && (
        <div className="rounded-xl border border-gray-800 bg-gray-900/70 p-4">
          <div className="flex flex-col gap-2 text-sm text-gray-300 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
            <span className="font-black text-white">{repoState.full_name}</span>
            <span className="flex items-center gap-1"><GitBranch className="h-4 w-4 text-cyan-300" /> {repoState.branch}</span>
            {repoState.forked_from && <span className="text-cyan-300">forked from {repoState.forked_from}</span>}
          </div>
        </div>
      )}

      <div className="grid gap-4 xl:grid-cols-[320px_minmax(0,1fr)]">
        <div className="rounded-2xl border border-gray-800 bg-gray-900/70">
          <div className="border-b border-gray-800 px-4 py-3">
            <p className="text-xs font-black uppercase tracking-wider text-white">Repository files</p>
          </div>
          <div className="max-h-[440px] overflow-y-auto p-2">
            {files.length === 0 ? (
              <p className="px-2 py-4 text-xs text-gray-500">Import a repository to browse files.</p>
            ) : (
              files.slice(0, 250).map((file) => (
                <button
                  key={file.path}
                  type="button"
                  onClick={() => openFile(file.path)}
                  className={`mb-1 flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-xs transition-colors ${
                    selectedPath === file.path ? "bg-cyan-900/40 text-cyan-200" : "text-gray-300 hover:bg-gray-800"
                  }`}
                >
                  <FileCode2 className="h-3.5 w-3.5 flex-shrink-0" />
                  <span className="truncate">{shortenPath(file.path)}</span>
                </button>
              ))
            )}
          </div>
        </div>

        <div className="space-y-4 rounded-2xl border border-gray-800 bg-gray-900/70 p-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-wider text-white">Editor</p>
              <p className="text-xs text-gray-500">{selectedPath || "Choose a file to open."}</p>
            </div>
            <input
              value={commitMessage}
              onChange={(e) => setCommitMessage(e.target.value)}
              placeholder="Commit message"
              className="w-full rounded-xl border border-gray-700 bg-gray-800 px-3 py-2 text-xs text-white outline-none focus:border-cyan-500 sm:max-w-xs"
            />
          </div>

          <textarea
            value={fileContent}
            onChange={(e) => setFileContent(e.target.value)}
            rows={18}
            placeholder="Open a file to edit it here."
            className="w-full rounded-xl border border-gray-700 bg-[#0a0e18] px-4 py-3 font-mono text-xs text-white outline-none focus:border-cyan-500"
          />

          <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto_auto]">
            <textarea
              value={instruction}
              onChange={(e) => setInstruction(e.target.value)}
              rows={3}
              placeholder="Describe the code change you want Base44 AI to make..."
              className="w-full rounded-xl border border-gray-700 bg-gray-800 px-4 py-3 text-sm text-white outline-none focus:border-cyan-500"
            />
            <button
              type="button"
              onClick={generateWithAI}
              disabled={busy.ai || !selectedPath || !instruction.trim()}
              className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-5 py-3 text-sm font-black text-white disabled:opacity-50"
            >
              {busy.ai ? <Loader2 className="h-4 w-4 animate-spin" /> : <Bot className="h-4 w-4" />}
              AI Edit
            </button>
            <button
              type="button"
              onClick={saveAndPush}
              disabled={busy.save || !selectedPath || !fileContent.trim()}
              className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-3 text-sm font-black text-white disabled:opacity-50"
            >
              {busy.save ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save & Push
            </button>
          </div>

          <div className="rounded-xl border border-gray-800 bg-black/20 px-4 py-3 text-xs text-gray-300">
            <div className="flex items-center gap-2 font-semibold text-cyan-200"><Wand2 className="h-3.5 w-3.5" /> VibeCoding status</div>
            <p className="mt-1 break-words">{status || "Waiting for a repository import."}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
