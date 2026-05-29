import React, { useRef, useState, useEffect } from "react";
import { Download, X, Palette, Layout, Type, Sliders } from "lucide-react";

const THEMES = [
  { id: "dark_purple", label: "Dark Purple",  bg1: "#0a0618", bg2: "#1a0a2e", accent: "#a855f7", text: "#fff", sub: "#d8b4fe", glow: "#7c3aed" },
  { id: "neon_pink",   label: "Neon Pink",    bg1: "#120010", bg2: "#2e0020", accent: "#f472b6", text: "#fff", sub: "#fbcfe8", glow: "#ec4899" },
  { id: "cyber_blue",  label: "Cyber Blue",   bg1: "#030a18", bg2: "#061830", accent: "#22d3ee", text: "#fff", sub: "#a5f3fc", glow: "#0ea5e9" },
  { id: "gold_elite",  label: "Gold Elite",   bg1: "#120c00", bg2: "#2e1d00", accent: "#f59e0b", text: "#fff", sub: "#fde68a", glow: "#d97706" },
  { id: "green_tech",  label: "Green Tech",   bg1: "#001208", bg2: "#002814", accent: "#22c55e", text: "#fff", sub: "#86efac", glow: "#16a34a" },
  { id: "crimson",     label: "Crimson",      bg1: "#120005", bg2: "#2a000e", accent: "#ef4444", text: "#fff", sub: "#fca5a5", glow: "#dc2626" },
  { id: "aurora",      label: "Aurora",       bg1: "#05001a", bg2: "#0a0030", accent: "#8b5cf6", text: "#fff", sub: "#c4b5fd", glow: "#6d28d9" },
  { id: "light_pro",   label: "Light Pro",    bg1: "#f1f5f9", bg2: "#e2e8f0", accent: "#7c3aed", text: "#1e1b4b", sub: "#4b5563", glow: "#7c3aed" },
];

const SIZES = [
  { id: "square",  label: "Square",      w: 540,  h: 540 },
  { id: "post",    label: "FB Post",     w: 540,  h: 670 },
  { id: "banner",  label: "FB Banner",   w: 820,  h: 312 },
  { id: "story",   label: "Story 9:16",  w: 420,  h: 748 },
  { id: "wide",    label: "Wide",        w: 780,  h: 410 },
  { id: "twitter", label: "Twitter/X",   w: 600,  h: 335 },
];

const LAYOUTS = [
  { id: "centered",   label: "Centered" },
  { id: "split",      label: "Split" },
  { id: "headline",   label: "Headline" },
  { id: "minimal",    label: "Minimal" },
];

function wrapText(ctx, text, x, y, maxWidth, lineHeight, maxLines) {
  const words = text.split(" ");
  let lines = [], line = "";
  for (const word of words) {
    const test = line ? line + " " + word : word;
    if (ctx.measureText(test).width > maxWidth) { lines.push(line); line = word; }
    else line = test;
  }
  if (line) lines.push(line);
  lines = lines.slice(0, maxLines);
  lines.forEach((l, i) => ctx.fillText(l, x, y + i * lineHeight));
  return lines.length;
}

function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r},${g},${b}`;
}

export default function SocialCardCanvas({ post, onClose }) {
  const canvasRef = useRef(null);
  const [themeId, setThemeId] = useState("dark_purple");
  const [sizeId, setSizeId] = useState("square");
  const [layoutId, setLayoutId] = useState("centered");
  const [customText, setCustomText] = useState(post?.text || "");
  const [customTitle, setCustomTitle] = useState(post?.category || "GAMER.PRODUCTIONS");
  const [fontSize, setFontSize] = useState(100); // percent
  const [rendering, setRendering] = useState(false);
  const [activeTab, setActiveTab] = useState("theme");

  const theme = THEMES.find(t => t.id === themeId) || THEMES[0];
  const size = SIZES.find(s => s.id === sizeId) || SIZES[0];

  const drawCard = (ctx, w, h) => {
    const isLight = themeId === "light_pro";
    const fScale = fontSize / 100;

    // ── Background ──────────────────────────────────────────
    const bg = ctx.createLinearGradient(0, 0, w, h);
    bg.addColorStop(0, theme.bg1);
    bg.addColorStop(1, theme.bg2);
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);

    // Grid pattern overlay
    ctx.save();
    ctx.globalAlpha = 0.06;
    ctx.strokeStyle = theme.accent;
    ctx.lineWidth = 0.5;
    const grid = 40;
    for (let x = 0; x <= w; x += grid) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
    for (let y = 0; y <= h; y += grid) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }
    ctx.restore();

    if (layoutId === "centered") drawCentered(ctx, w, h, theme, isLight, fScale);
    else if (layoutId === "split") drawSplit(ctx, w, h, theme, isLight, fScale);
    else if (layoutId === "headline") drawHeadline(ctx, w, h, theme, isLight, fScale);
    else drawMinimal(ctx, w, h, theme, isLight, fScale);
  };

  const drawCentered = (ctx, w, h, t, isLight, fScale) => {
    // Glow orb center
    const radGlow = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w * 0.55);
    radGlow.addColorStop(0, t.accent + "22");
    radGlow.addColorStop(1, "transparent");
    ctx.fillStyle = radGlow;
    ctx.fillRect(0, 0, w, h);

    // Top border strip
    ctx.fillStyle = t.accent;
    ctx.fillRect(0, 0, w, 4);

    // Brand bar
    ctx.fillStyle = t.accent + "18";
    ctx.fillRect(0, 0, w, 54);
    ctx.fillStyle = t.accent;
    ctx.font = `900 ${Math.round(w * 0.036 * fScale)}px 'Arial Black', sans-serif`;
    ctx.textAlign = "left";
    ctx.fillText("GAMER.PRODUCTIONS", 20, 36);
    ctx.fillStyle = t.sub + "cc";
    ctx.font = `${Math.round(w * 0.022)}px Arial, sans-serif`;
    ctx.textAlign = "right";
    ctx.fillText("gamer.productions", w - 18, 36);

    // Big emoji
    ctx.font = `${Math.round(w * 0.12)}px serif`;
    ctx.textAlign = "center";
    ctx.fillText(post?.emoji || "🎮", w / 2, h * 0.24 + 10);

    // Category pill
    const catText = (customTitle || "Gaming").toUpperCase();
    const pillW = ctx.measureText(catText).width + 40;
    ctx.fillStyle = t.accent + "30";
    ctx.beginPath();
    ctx.roundRect(w / 2 - pillW / 2, h * 0.31, pillW, 28, 14);
    ctx.fill();
    ctx.strokeStyle = t.accent;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(w / 2 - pillW / 2, h * 0.31, pillW, 28, 14);
    ctx.stroke();
    ctx.fillStyle = t.accent;
    ctx.font = `bold ${Math.round(w * 0.024)}px Arial, sans-serif`;
    ctx.textAlign = "center";
    ctx.fillText(catText, w / 2, h * 0.31 + 19);

    // Main text
    ctx.fillStyle = t.text;
    ctx.font = `${Math.round(w * 0.029 * fScale)}px Arial, sans-serif`;
    ctx.textAlign = "center";
    wrapText(ctx, customText, w / 2, h * 0.43, w * 0.82, Math.round(w * 0.042), sizeId === "story" ? 12 : 7);

    // Divider line
    ctx.strokeStyle = t.accent + "44";
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(w * 0.1, h - 56); ctx.lineTo(w * 0.9, h - 56); ctx.stroke();

    // Footer
    ctx.fillStyle = t.accent + "18";
    ctx.fillRect(0, h - 50, w, 50);
    ctx.fillStyle = t.sub;
    ctx.font = `bold ${Math.round(w * 0.026)}px Arial, sans-serif`;
    ctx.textAlign = "center";
    ctx.fillText("🎮  Join us at gamer.productions", w / 2, h - 18);
  };

  const drawSplit = (ctx, w, h, t, isLight, fScale) => {
    // Left accent panel
    const panelW = w * 0.38;
    ctx.fillStyle = t.accent + "22";
    ctx.fillRect(0, 0, panelW, h);
    ctx.fillStyle = t.accent;
    ctx.fillRect(panelW - 3, 0, 3, h);

    // Left: big emoji + brand
    ctx.font = `${Math.round(panelW * 0.28)}px serif`;
    ctx.textAlign = "center";
    ctx.fillText(post?.emoji || "🎮", panelW / 2, h * 0.42);

    ctx.fillStyle = t.accent;
    ctx.font = `900 ${Math.round(panelW * 0.09)}px 'Arial Black', sans-serif`;
    ctx.textAlign = "center";
    ctx.fillText("GAMER", panelW / 2, h * 0.62);
    ctx.fillText(".PROD", panelW / 2, h * 0.7);

    ctx.fillStyle = t.sub + "88";
    ctx.font = `${Math.round(panelW * 0.065)}px Arial, sans-serif`;
    ctx.fillText("gamer.productions", panelW / 2, h * 0.82);

    // Right: title + text
    const rx = panelW + 24, rw = w - panelW - 30;
    ctx.fillStyle = t.accent;
    ctx.font = `900 ${Math.round(rw * 0.08 * fScale)}px 'Arial Black', sans-serif`;
    ctx.textAlign = "left";
    ctx.fillText((customTitle || "Gaming").toUpperCase(), rx, h * 0.14);

    ctx.strokeStyle = t.accent;
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(rx, h * 0.17); ctx.lineTo(rx + rw * 0.7, h * 0.17); ctx.stroke();

    ctx.fillStyle = t.text;
    ctx.font = `${Math.round(rw * 0.052 * fScale)}px Arial, sans-serif`;
    wrapText(ctx, customText, rx, h * 0.24, rw, Math.round(rw * 0.068), 9);

    ctx.fillStyle = t.accent;
    ctx.font = `bold ${Math.round(rw * 0.048)}px Arial, sans-serif`;
    ctx.fillText("→ gamer.productions", rx, h * 0.92);
  };

  const drawHeadline = (ctx, w, h, t, isLight, fScale) => {
    // Full width glow strip top
    const grad = ctx.createLinearGradient(0, 0, w, 0);
    grad.addColorStop(0, t.accent);
    grad.addColorStop(0.5, t.glow);
    grad.addColorStop(1, t.accent);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h * 0.4);

    // Emoji on top
    ctx.font = `${Math.round(w * 0.09)}px serif`;
    ctx.textAlign = "center";
    ctx.fillText(post?.emoji || "🎮", w / 2, h * 0.12);

    // Brand name
    ctx.fillStyle = "#fff";
    ctx.font = `900 ${Math.round(w * 0.05 * fScale)}px 'Arial Black', sans-serif`;
    ctx.textAlign = "center";
    ctx.fillText("GAMER.PRODUCTIONS", w / 2, h * 0.24);

    // Category title huge
    ctx.fillStyle = "#fff";
    ctx.font = `900 ${Math.round(w * 0.072 * fScale)}px 'Arial Black', sans-serif`;
    ctx.fillText((customTitle || "Gaming").toUpperCase(), w / 2, h * 0.36);

    // Body text below
    ctx.fillStyle = t.text;
    ctx.font = `${Math.round(w * 0.028 * fScale)}px Arial, sans-serif`;
    wrapText(ctx, customText, w / 2, h * 0.52, w * 0.86, Math.round(w * 0.04), 6);

    // Bottom CTA
    ctx.fillStyle = t.accent;
    ctx.font = `bold ${Math.round(w * 0.03)}px Arial, sans-serif`;
    ctx.fillText("gamer.productions  🎮", w / 2, h * 0.93);
  };

  const drawMinimal = (ctx, w, h, t, isLight, fScale) => {
    // Subtle corner accents only
    [[0, 0], [w, 0], [0, h], [w, h]].forEach(([cx, cy], i) => {
      ctx.strokeStyle = t.accent + "66";
      ctx.lineWidth = 2;
      ctx.beginPath();
      const dir = [1, -1, 1, -1][i];
      const diry = [1, 1, -1, -1][i];
      ctx.moveTo(cx + dir * 2, cy + diry * 30);
      ctx.lineTo(cx + dir * 2, cy + diry * 2);
      ctx.lineTo(cx + dir * 30, cy + diry * 2);
      ctx.stroke();
    });

    // Minimal top brand
    ctx.fillStyle = t.accent;
    ctx.font = `bold ${Math.round(w * 0.028)}px Arial, sans-serif`;
    ctx.textAlign = "left";
    ctx.fillText("GAMER.PRODUCTIONS", 24, 36);

    // Huge emoji
    ctx.font = `${Math.round(w * 0.15)}px serif`;
    ctx.textAlign = "center";
    ctx.fillText(post?.emoji || "🎮", w / 2, h * 0.35);

    // Title
    ctx.fillStyle = t.accent;
    ctx.font = `900 ${Math.round(w * 0.055 * fScale)}px 'Arial Black', sans-serif`;
    ctx.textAlign = "center";
    ctx.fillText((customTitle || "Gaming").toUpperCase(), w / 2, h * 0.5);

    // Short sub text (1-2 lines)
    ctx.fillStyle = t.sub;
    ctx.font = `${Math.round(w * 0.026 * fScale)}px Arial, sans-serif`;
    wrapText(ctx, customText, w / 2, h * 0.62, w * 0.78, Math.round(w * 0.038), 3);

    // Bottom
    ctx.fillStyle = t.text + "88";
    ctx.font = `${Math.round(w * 0.022)}px Arial, sans-serif`;
    ctx.fillText("gamer.productions", w / 2, h * 0.93);
  };

  const handleDownload = () => {
    setRendering(true);
    const canvas = document.createElement("canvas");
    canvas.width = size.w;
    canvas.height = size.h;
    drawCard(canvas.getContext("2d"), size.w, size.h);
    const link = document.createElement("a");
    link.download = `gamer-productions-${post?.category || "post"}-${themeId}-${layoutId}-${Date.now()}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
    setRendering(false);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = size.w;
    canvas.height = size.h;
    drawCard(canvas.getContext("2d"), size.w, size.h);
  }, [themeId, sizeId, layoutId, customText, customTitle, fontSize, post]);

  const previewW = Math.min(380, size.w);
  const previewScale = previewW / size.w;
  const previewH = size.h * previewScale;

  const tabs = [
    { id: "theme", icon: <Palette className="w-3.5 h-3.5" />, label: "Theme" },
    { id: "layout", icon: <Layout className="w-3.5 h-3.5" />, label: "Layout" },
    { id: "text", icon: <Type className="w-3.5 h-3.5" />, label: "Text" },
    { id: "size", icon: <Sliders className="w-3.5 h-3.5" />, label: "Size" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-3 py-4" style={{ background: "rgba(0,0,0,0.95)" }}>
      <div className="bg-gray-950 border border-purple-700/40 rounded-3xl w-full max-w-4xl max-h-[95vh] overflow-y-auto p-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-white font-black text-xl">Design Card / Banner</h2>
            <p className="text-gray-500 text-xs mt-0.5">Professional branded images ready to share</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-gray-800 hover:bg-gray-700 flex items-center justify-center">
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        <div className="grid lg:grid-cols-2 gap-5">
          {/* LEFT: Controls */}
          <div className="space-y-4">
            {/* Tabs */}
            <div className="flex gap-1 bg-gray-900 rounded-xl p-1">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-1 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === tab.id ? "bg-purple-600 text-white" : "text-gray-400 hover:text-white"}`}
                >
                  {tab.icon} {tab.label}
                </button>
              ))}
            </div>

            {/* Theme */}
            {activeTab === "theme" && (
              <div className="grid grid-cols-2 gap-2">
                {THEMES.map(t => (
                  <button key={t.id} onClick={() => setThemeId(t.id)}
                    className={`py-3 px-3 rounded-xl text-xs font-bold transition-all border flex items-center gap-2 ${themeId === t.id ? "border-purple-500 ring-2 ring-purple-500/40" : "border-gray-700 hover:border-gray-500"}`}
                    style={{ background: `linear-gradient(135deg, ${t.bg1}, ${t.bg2})`, color: t.text }}>
                    <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: t.accent }} />
                    <span style={{ color: t.accent }}>{t.label}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Layout */}
            {activeTab === "layout" && (
              <div className="grid grid-cols-2 gap-2">
                {LAYOUTS.map(l => (
                  <button key={l.id} onClick={() => setLayoutId(l.id)}
                    className={`py-3 rounded-xl text-xs font-bold transition-all border ${layoutId === l.id ? "bg-purple-600 border-purple-500 text-white" : "bg-gray-900 border-gray-700 text-gray-400 hover:text-white"}`}>
                    {l.label}
                  </button>
                ))}
              </div>
            )}

            {/* Text */}
            {activeTab === "text" && (
              <div className="space-y-3">
                <div>
                  <p className="text-gray-400 text-xs font-bold mb-1">Title / Category Label</p>
                  <input value={customTitle} onChange={e => setCustomTitle(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500"
                    placeholder="e.g. Referral Program" />
                </div>
                <div>
                  <p className="text-gray-400 text-xs font-bold mb-1">Post Body Text</p>
                  <textarea value={customText} onChange={e => setCustomText(e.target.value)} rows={6}
                    className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2.5 text-white text-xs focus:outline-none focus:border-purple-500 resize-none" />
                </div>
                <div>
                  <p className="text-gray-400 text-xs font-bold mb-1">Font Size: {fontSize}%</p>
                  <input type="range" min={70} max={140} value={fontSize} onChange={e => setFontSize(Number(e.target.value))}
                    className="w-full accent-purple-500" />
                </div>
              </div>
            )}

            {/* Size */}
            {activeTab === "size" && (
              <div className="grid grid-cols-2 gap-2">
                {SIZES.map(s => (
                  <button key={s.id} onClick={() => setSizeId(s.id)}
                    className={`py-3 px-3 rounded-xl text-xs font-bold transition-all border text-left ${sizeId === s.id ? "bg-purple-600 border-purple-500 text-white" : "bg-gray-900 border-gray-700 text-gray-400 hover:text-white"}`}>
                    <p>{s.label}</p>
                    <p className="text-[10px] opacity-60 mt-0.5">{s.w}×{s.h}px</p>
                  </button>
                ))}
              </div>
            )}

            {/* Download */}
            <button
              onClick={handleDownload}
              disabled={rendering}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl font-black text-white text-sm transition-all hover:scale-[1.02] disabled:opacity-60"
              style={{ background: "linear-gradient(135deg,#7c3aed,#ec4899)" }}
            >
              <Download className="w-4 h-4" />
              {rendering ? "Rendering..." : "Download PNG"}
            </button>
          </div>

          {/* RIGHT: Preview */}
          <div className="flex flex-col items-center gap-3">
            <p className="text-gray-500 text-xs">Live Preview</p>
            <div style={{ width: previewW, height: previewH, overflow: "hidden", borderRadius: 12, border: "2px solid rgba(167,85,247,0.3)", flexShrink: 0 }}>
              <canvas
                ref={canvasRef}
                style={{ width: size.w, height: size.h, transformOrigin: "top left", transform: `scale(${previewScale})`, display: "block" }}
              />
            </div>
            <p className="text-gray-600 text-[10px]">{size.w}×{size.h}px · {THEMES.find(t=>t.id===themeId)?.label} · {LAYOUTS.find(l=>l.id===layoutId)?.label}</p>
          </div>
        </div>
      </div>
    </div>
  );
}