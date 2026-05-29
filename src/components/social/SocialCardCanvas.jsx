import React, { useRef, useState, useEffect } from "react";
import { Download, X, Palette } from "lucide-react";

const THEMES = [
  { id: "dark_purple", label: "Dark Purple", bg: "linear-gradient(135deg,#0f0a1e,#1a0a2e)", accent: "#a855f7", text: "#fff", sub: "#d8b4fe", border: "rgba(167,85,247,0.5)" },
  { id: "neon_pink",   label: "Neon Pink",   bg: "linear-gradient(135deg,#1a0014,#2e001e)", accent: "#ec4899", text: "#fff", sub: "#fbcfe8", border: "rgba(236,72,153,0.5)" },
  { id: "cyber_blue",  label: "Cyber Blue",  bg: "linear-gradient(135deg,#050a1a,#0a1a2e)", accent: "#22d3ee", text: "#fff", sub: "#a5f3fc", border: "rgba(34,211,238,0.5)" },
  { id: "gold_dark",   label: "Gold Dark",   bg: "linear-gradient(135deg,#1a1000,#2e1f00)", accent: "#f59e0b", text: "#fff", sub: "#fde68a", border: "rgba(245,158,11,0.5)" },
  { id: "green_tech",  label: "Green Tech",  bg: "linear-gradient(135deg,#001a0a,#002e14)", accent: "#22c55e", text: "#fff", sub: "#86efac", border: "rgba(34,197,94,0.5)" },
  { id: "light_card",  label: "Light Card",  bg: "linear-gradient(135deg,#f8fafc,#e2e8f0)", accent: "#7c3aed", text: "#1e1b4b", sub: "#6b7280", border: "rgba(124,58,237,0.3)" },
];

const SIZES = [
  { id: "post",    label: "FB Post",    w: 540, h: 540 },
  { id: "banner",  label: "FB Banner",  w: 820, h: 312 },
  { id: "story",   label: "Story",      w: 400, h: 700 },
  { id: "square",  label: "Square",     w: 480, h: 480 },
  { id: "wide",    label: "Wide",       w: 700, h: 370 },
];

export default function SocialCardCanvas({ post, onClose }) {
  const canvasRef = useRef(null);
  const [themeId, setThemeId] = useState("dark_purple");
  const [sizeId, setSizeId] = useState("post");
  const [customText, setCustomText] = useState(post?.text || "");
  const [rendering, setRendering] = useState(false);

  const theme = THEMES.find(t => t.id === themeId) || THEMES[0];
  const size = SIZES.find(s => s.id === sizeId) || SIZES[0];

  const drawCard = (ctx, w, h) => {
    // Background
    const gradient = ctx.createLinearGradient(0, 0, w, h);
    const bgColors = theme.bg.match(/#[0-9a-fA-F]{6}/g) || ["#0f0a1e", "#1a0a2e"];
    gradient.addColorStop(0, bgColors[0]);
    gradient.addColorStop(1, bgColors[1] || bgColors[0]);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);

    // Border glow rect
    ctx.strokeStyle = theme.border;
    ctx.lineWidth = 3;
    ctx.strokeRect(4, 4, w - 8, h - 8);

    // Corner accent dots
    const corners = [[12, 12], [w - 12, 12], [12, h - 12], [w - 12, h - 12]];
    corners.forEach(([x, y]) => {
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fillStyle = theme.accent;
      ctx.fill();
    });

    // Logo / brand strip
    ctx.fillStyle = theme.accent + "22";
    ctx.fillRect(0, 0, w, 52);
    ctx.fillStyle = theme.accent;
    ctx.font = `bold ${Math.round(w * 0.033)}px 'Arial', sans-serif`;
    ctx.textAlign = "left";
    ctx.fillText("GAMER.PRODUCTIONS", 20, 34);
    ctx.fillStyle = theme.sub;
    ctx.font = `${Math.round(w * 0.022)}px 'Arial', sans-serif`;
    ctx.fillText("gamer.productions", w - 150, 34);

    // Emoji large
    ctx.font = `${Math.round(w * 0.1)}px serif`;
    ctx.textAlign = "center";
    ctx.fillText(post?.emoji || "🎮", w / 2, h * 0.22 + 20);

    // Category badge
    ctx.fillStyle = theme.accent + "33";
    const badgeW = 160, badgeH = 24, badgeX = w / 2 - 80, badgeY = h * 0.32;
    ctx.beginPath();
    ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 12);
    ctx.fill();
    ctx.fillStyle = theme.accent;
    ctx.font = `bold ${Math.round(w * 0.022)}px 'Arial', sans-serif`;
    ctx.textAlign = "center";
    ctx.fillText((post?.category || "Gaming").toUpperCase(), w / 2, badgeY + 16);

    // Main text — word wrapped
    ctx.fillStyle = theme.text;
    ctx.font = `${Math.round(w * 0.028)}px 'Arial', sans-serif`;
    ctx.textAlign = "center";
    const words = customText.split(" ");
    const lineH = Math.round(w * 0.038);
    const maxW = w * 0.82;
    let lines = [], current = "";
    words.forEach(word => {
      const test = current ? current + " " + word : word;
      if (ctx.measureText(test).width > maxW) { lines.push(current); current = word; }
      else current = test;
    });
    if (current) lines.push(current);
    const maxLines = sizeId === "story" ? 10 : 6;
    lines = lines.slice(0, maxLines);
    const textStartY = h * 0.42;
    lines.forEach((line, i) => {
      ctx.fillText(line, w / 2, textStartY + i * lineH);
    });

    // Bottom bar
    ctx.fillStyle = theme.accent + "18";
    ctx.fillRect(0, h - 48, w, 48);
    ctx.fillStyle = theme.sub;
    ctx.font = `bold ${Math.round(w * 0.024)}px 'Arial', sans-serif`;
    ctx.textAlign = "center";
    ctx.fillText("Join us at gamer.productions 🎮", w / 2, h - 18);
  };

  const handleDownload = () => {
    setRendering(true);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    canvas.width = size.w;
    canvas.height = size.h;
    drawCard(ctx, size.w, size.h);
    const link = document.createElement("a");
    link.download = `gamer-productions-${post?.category || "post"}-${Date.now()}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
    setRendering(false);
  };

  const previewScale = Math.min(1, 420 / size.w);

  // Live preview draw
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = size.w;
    canvas.height = size.h;
    drawCard(canvas.getContext("2d"), size.w, size.h);
  }, [themeId, sizeId, customText, post]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ background: "rgba(0,0,0,0.93)" }}>
      <div className="bg-gray-950 border border-purple-700/40 rounded-3xl w-full max-w-3xl max-h-[92vh] overflow-y-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-white font-black text-xl">Design Card / Banner</h2>
            <p className="text-gray-500 text-xs mt-0.5">Customise & download a shareable image</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-gray-800 hover:bg-gray-700 flex items-center justify-center">
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Controls */}
          <div className="space-y-4">
            {/* Theme picker */}
            <div>
              <p className="text-gray-400 text-xs font-bold mb-2 flex items-center gap-1"><Palette className="w-3.5 h-3.5" /> Theme</p>
              <div className="grid grid-cols-3 gap-2">
                {THEMES.map(t => (
                  <button key={t.id} onClick={() => setThemeId(t.id)}
                    className={`py-1.5 rounded-xl text-[10px] font-bold transition-all border ${themeId === t.id ? "border-purple-500 text-white" : "border-gray-700 text-gray-500"}`}
                    style={{ background: t.bg }}>
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Size picker */}
            <div>
              <p className="text-gray-400 text-xs font-bold mb-2">Size / Format</p>
              <div className="flex flex-wrap gap-2">
                {SIZES.map(s => (
                  <button key={s.id} onClick={() => setSizeId(s.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${sizeId === s.id ? "bg-purple-600 border-purple-500 text-white" : "bg-gray-900 border-gray-700 text-gray-400 hover:text-white"}`}>
                    {s.label} <span className="text-gray-500 text-[9px]">({s.w}×{s.h})</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Text edit */}
            <div>
              <p className="text-gray-400 text-xs font-bold mb-2">Edit Text</p>
              <textarea
                value={customText}
                onChange={e => setCustomText(e.target.value)}
                rows={5}
                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2.5 text-white text-xs focus:outline-none focus:border-purple-500 resize-none"
              />
            </div>

            {/* Download */}
            <button
              onClick={handleDownload}
              disabled={rendering}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl font-black text-white text-sm transition-all hover:scale-[1.02]"
              style={{ background: "linear-gradient(135deg,#7c3aed,#ec4899)" }}
            >
              <Download className="w-4 h-4" />
              {rendering ? "Rendering..." : "Download PNG"}
            </button>
          </div>

          {/* Preview */}
          <div className="flex flex-col items-center gap-2">
            <p className="text-gray-500 text-xs">Preview</p>
            <div style={{ transform: `scale(${previewScale})`, transformOrigin: "top center", width: size.w, height: size.h, overflow: "visible" }}>
              <canvas ref={canvasRef} width={size.w} height={size.h} style={{ width: size.w, height: size.h, borderRadius: 16, border: "2px solid rgba(167,85,247,0.3)", display: "block" }} />
            </div>
          </div>
        </div>


      </div>
    </div>
  );
}