import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Scissors, Layers, Plus, Video, Image, Music,
  Type, Wand2, Mic, Download, Share2, Play, Pause,
  Volume2, VolumeX, Undo2, RotateCcw, Trash2, Copy, ZoomIn, ZoomOut,
  Grid3X3, LayoutGrid, Film, Palette,
  Sparkles, MessageSquare,
  FlipHorizontal, FlipVertical, Sun, Contrast,
  Lock, Unlock, FolderOpen, Save, Clock,
  FileVideo, FileImage, FileAudio,
  X, Search,
  Upload, RefreshCw, ArrowLeft,
  Star, Folder,
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import AuthNavbar from "@/components/layout/AuthNavbar";

// ─── Utility ────────────────────────────────────────────────────────────────
const uid = () => Math.random().toString(36).slice(2, 10);

// ─── Project Creation Screen ─────────────────────────────────────────────────
function ProjectDashboard({ user, profile, onCreateProject, existingProjects }) {
  const navigate = useNavigate();
  const templates = [
    { id: "blank_16_9", label: "Blank 16:9", w: 1920, h: 1080, icon: "🎬" },
    { id: "blank_9_16", label: "Shorts / Reels", w: 1080, h: 1920, icon: "📱" },
    { id: "blank_1_1", label: "Square Post", w: 1080, h: 1080, icon: "⬛" },
    { id: "gaming_intro", label: "Gaming Intro", w: 1920, h: 1080, icon: "🎮" },
    { id: "stream_overlay", label: "Stream Overlay", w: 1920, h: 1080, icon: "📡" },
    { id: "thumbnail", label: "Thumbnail", w: 1280, h: 720, icon: "🖼️" },
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <AuthNavbar user={user} profile={profile} />
      <div className="pt-20 px-6 max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black text-white">
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">AI Video Studio</span>
            </h1>
            <p className="text-gray-400 mt-1">Create, edit and publish videos</p>
          </div>
        </div>

        {/* New Project */}
        <div className="mb-10">
          <h2 className="text-lg font-bold text-white mb-4">New Project</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {templates.map((t) => (
              <button
                key={t.id}
                onClick={() => onCreateProject(t)}
                className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-gray-900 border border-gray-800 hover:border-purple-500 hover:bg-gray-800 transition-all group"
              >
                <span className="text-3xl">{t.icon}</span>
                <span className="text-white text-xs font-semibold text-center">{t.label}</span>
                <span className="text-gray-500 text-[10px]">{t.w}×{t.h}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Existing Projects */}
        {existingProjects.length > 0 && (
          <div>
            <h2 className="text-lg font-bold text-white mb-4">Recent Projects</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {existingProjects.map((p) => (
                <button key={p.id} onClick={() => onCreateProject(null, p)}
                  className="text-left rounded-2xl bg-gray-900 border border-gray-800 hover:border-purple-500 overflow-hidden transition-all group">
                  <div className="aspect-video bg-gradient-to-br from-purple-900/30 to-pink-900/20 flex items-center justify-center">
                    <Film className="w-8 h-8 text-gray-600 group-hover:text-purple-400 transition-colors" />
                  </div>
                  <div className="p-3">
                    <p className="text-white text-sm font-semibold truncate">{p.title || "Untitled"}</p>
                    <p className="text-gray-500 text-xs mt-0.5">{new Date(p.created_date || p.created_at || Date.now()).toLocaleDateString()}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Canvas Element ───────────────────────────────────────────────────────────
function CanvasElement({ el, selected, onSelect, onUpdate, scale }) {
  const dragRef = useRef({ dragging: false, startX: 0, startY: 0, origX: 0, origY: 0 });

  const startDrag = (e) => {
    e.stopPropagation();
    onSelect(el);
    dragRef.current = { dragging: true, startX: e.clientX, startY: e.clientY, origX: el.x, origY: el.y };
    const onMove = (me) => {
      const dx = (me.clientX - dragRef.current.startX) / scale;
      const dy = (me.clientY - dragRef.current.startY) / scale;
      onUpdate(el.id, { x: dragRef.current.origX + dx, y: dragRef.current.origY + dy });
    };
    const onUp = () => { document.removeEventListener("mousemove", onMove); document.removeEventListener("mouseup", onUp); };
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  };

  const style = {
    position: "absolute",
    left: el.x, top: el.y,
    width: el.width, height: el.height,
    opacity: el.opacity ?? 1,
    transform: `rotate(${el.rotation || 0}deg)`,
    outline: selected ? "2px solid #a855f7" : "none",
    cursor: "move",
    userSelect: "none",
  };

  return (
    <div style={style} onMouseDown={startDrag}>
      {el.type === "image" && (
        <img
          src={el.src}
          alt=""
          style={{ width: "100%", height: "100%", objectFit: "contain", pointerEvents: "none", borderRadius: el.borderRadius || 0, display: "block" }}
          onError={e => { e.target.style.border = "2px dashed #ef4444"; e.target.alt = "Failed to load"; }}
        />
      )}
      {el.type === "text" && (
        <div style={{
          width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: el.textAlign === "left" ? "flex-start" : el.textAlign === "right" ? "flex-end" : "center",
          color: el.color || "#fff",
          fontSize: el.fontSize || 24,
          fontFamily: el.fontFamily || "Arial",
          fontWeight: el.bold ? "bold" : el.fontWeight || "normal",
          fontStyle: el.italic ? "italic" : "normal",
          textDecoration: el.underline ? "underline" : "none",
          textAlign: el.textAlign || "center",
          textShadow: el.shadow ? `${el.shadowX || 2}px ${el.shadowY || 2}px ${el.shadowBlur || 4}px ${el.shadowColor || "rgba(0,0,0,0.8)"}` : "none",
          WebkitTextStroke: el.stroke ? `${el.strokeWidth || 1}px ${el.strokeColor || "#000"}` : "none",
          letterSpacing: el.letterSpacing || 0,
          lineHeight: el.lineHeight || 1.2,
          padding: 4,
          background: el.textBg ? el.textBgColor || "rgba(0,0,0,0.5)" : "transparent",
          borderRadius: el.textBg ? 4 : 0,
          wordBreak: "break-word",
        }}>{el.text || "Text"}</div>
      )}
      {el.type === "shape" && (
        <div style={{
          width: "100%", height: "100%",
          background: el.color?.startsWith("linear-gradient") ? el.color : undefined,
          backgroundColor: el.color?.startsWith("linear-gradient") ? undefined : (el.color || "#a855f7"),
          borderRadius: el.borderRadius || 0,
          border: el.borderWidth ? `${el.borderWidth}px solid ${el.borderColor || "#fff"}` : "none",
          opacity: el.shapeOpacity ?? 1
        }} />
      )}
      {el.type === "video" && (
        <video
          src={el.src}
          style={{ width: "100%", height: "100%", objectFit: "cover", pointerEvents: "none", display: "block" }}
          autoPlay={false}
          muted
          loop
          playsInline
          onLoadedData={e => e.target.currentTime = 0}
        />
      )}
      {selected && (
        <div style={{ position: "absolute", inset: 0, border: "2px solid #a855f7", pointerEvents: "none" }}>
          <div style={{ position: "absolute", bottom: -4, right: -4, width: 10, height: 10, background: "#a855f7", cursor: "se-resize" }} />
        </div>
      )}
    </div>
  );
}

// ─── Studio Canvas ────────────────────────────────────────────────────────────
function StudioCanvas({ pages, activePage, elements, selectedId, onSelect, onUpdate, canvasSize, zoom, bgColor }) {
  const elems = elements.filter(e => e.pageId === activePage);
  const scale = zoom / 100;
  const w = canvasSize.width * scale;
  const h = canvasSize.height * scale;

  // Support both solid colors and gradient strings
  const bgStyle = bgColor && bgColor.startsWith("linear-gradient")
    ? { backgroundImage: bgColor }
    : { backgroundColor: bgColor || "#000000" };

  return (
    <div style={{ width: w, height: h, position: "relative", ...bgStyle, borderRadius: 8, overflow: "hidden", boxShadow: "0 8px 40px rgba(0,0,0,0.8)", flexShrink: 0 }}
      onClick={() => onSelect(null)}>
      {elems.map(el => (
        <CanvasElement key={el.id} el={{ ...el, x: el.x * scale, y: el.y * scale, width: el.width * scale, height: el.height * scale }} selected={selectedId === el.id} onSelect={() => onSelect(el.id)} onUpdate={(id, upd) => {
          const unscaled = {};
          if (upd.x !== undefined) unscaled.x = upd.x / scale;
          if (upd.y !== undefined) unscaled.y = upd.y / scale;
          onUpdate(id, unscaled);
        }} scale={scale} />
      ))}
    </div>
  );
}

// ─── Text Properties Panel ────────────────────────────────────────────────────
function TextPropertiesPanel({ el, onUpdate }) {
  const fonts = ["Arial", "Helvetica", "Times New Roman", "Georgia", "Verdana", "Courier New", "Impact", "Comic Sans MS", "Oswald", "Roboto", "Montserrat", "Bebas Neue"];
  const colors = ["#ffffff","#000000","#ff0000","#00ff00","#0088ff","#ffff00","#ff00ff","#00ffff","#ff8800","#8800ff","#ff4466","#44ff88"];

  const u = (k, v) => onUpdate(el.id, { [k]: v });

  return (
    <div className="space-y-4 p-3">
      <div>
        <label className="text-[10px] text-gray-400 uppercase font-semibold block mb-1">Text Content</label>
        <textarea value={el.text || ""} onChange={e => u("text", e.target.value)}
          rows={3} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm resize-none focus:outline-none focus:border-purple-500" />
      </div>
      <div>
        <label className="text-[10px] text-gray-400 uppercase font-semibold block mb-1">Font</label>
        <select value={el.fontFamily || "Arial"} onChange={e => u("fontFamily", e.target.value)}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-2 py-1.5 text-white text-sm focus:outline-none focus:border-purple-500">
          {fonts.map(f => <option key={f} value={f} style={{ fontFamily: f }}>{f}</option>)}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-[10px] text-gray-400 uppercase font-semibold block mb-1">Size</label>
          <input type="number" value={el.fontSize || 24} onChange={e => u("fontSize", +e.target.value)} min={8} max={300}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-2 py-1.5 text-white text-sm focus:outline-none focus:border-purple-500" />
        </div>
        <div>
          <label className="text-[10px] text-gray-400 uppercase font-semibold block mb-1">Letter Spacing</label>
          <input type="number" value={el.letterSpacing || 0} onChange={e => u("letterSpacing", +e.target.value)} min={-10} max={50}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-2 py-1.5 text-white text-sm focus:outline-none focus:border-purple-500" />
        </div>
      </div>
      {/* Style toggles */}
      <div>
        <label className="text-[10px] text-gray-400 uppercase font-semibold block mb-1">Style</label>
        <div className="flex gap-2">
          {[["B","bold"],["I","italic"],["U","underline"]].map(([label, key]) => (
            <button key={key} onClick={() => u(key, !el[key])}
              className={`w-9 h-9 rounded-lg font-bold text-sm transition-colors ${el[key] ? "bg-purple-600 text-white" : "bg-gray-800 text-gray-400 hover:text-white"}`}>
              {label}
            </button>
          ))}
        </div>
      </div>
      {/* Alignment */}
      <div>
        <label className="text-[10px] text-gray-400 uppercase font-semibold block mb-1">Alignment</label>
        <div className="flex gap-1">
          {["left","center","right"].map(align => (
            <button key={align} onClick={() => u("textAlign", align)}
              className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-colors ${el.textAlign === align ? "bg-purple-600 text-white" : "bg-gray-800 text-gray-400 hover:text-white"}`}>
              {align[0].toUpperCase() + align.slice(1)}
            </button>
          ))}
        </div>
      </div>
      {/* Color */}
      <div>
        <label className="text-[10px] text-gray-400 uppercase font-semibold block mb-1">Color</label>
        <div className="flex flex-wrap gap-1.5 mb-2">
          {colors.map(c => (
            <button key={c} onClick={() => u("color", c)} style={{ background: c }}
              className={`w-7 h-7 rounded-md border-2 transition-all ${el.color === c ? "border-white scale-110" : "border-transparent"}`} />
          ))}
        </div>
        <input type="color" value={el.color || "#ffffff"} onChange={e => u("color", e.target.value)} className="w-full h-8 rounded bg-gray-800 border border-gray-700 cursor-pointer" />
      </div>
      {/* Shadow */}
      <div className="flex items-center justify-between">
        <label className="text-[10px] text-gray-400 uppercase font-semibold">Text Shadow</label>
        <button onClick={() => u("shadow", !el.shadow)} className={`w-10 h-5 rounded-full transition-colors relative ${el.shadow ? "bg-purple-600" : "bg-gray-700"}`}>
          <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${el.shadow ? "left-5" : "left-0.5"}`} />
        </button>
      </div>
      {el.shadow && (
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[10px] text-gray-500 block mb-1">Shadow Color</label>
            <input type="color" value={el.shadowColor || "#000000"} onChange={e => u("shadowColor", e.target.value)} className="w-full h-7 rounded bg-gray-800 border border-gray-700 cursor-pointer" />
          </div>
          <div>
            <label className="text-[10px] text-gray-500 block mb-1">Blur</label>
            <input type="number" value={el.shadowBlur || 4} onChange={e => u("shadowBlur", +e.target.value)} min={0} max={40}
              className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white text-xs focus:outline-none" />
          </div>
        </div>
      )}
      {/* Stroke */}
      <div className="flex items-center justify-between">
        <label className="text-[10px] text-gray-400 uppercase font-semibold">Text Stroke</label>
        <button onClick={() => u("stroke", !el.stroke)} className={`w-10 h-5 rounded-full transition-colors relative ${el.stroke ? "bg-purple-600" : "bg-gray-700"}`}>
          <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${el.stroke ? "left-5" : "left-0.5"}`} />
        </button>
      </div>
      {el.stroke && (
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[10px] text-gray-500 block mb-1">Stroke Color</label>
            <input type="color" value={el.strokeColor || "#000000"} onChange={e => u("strokeColor", e.target.value)} className="w-full h-7 rounded bg-gray-800 border border-gray-700 cursor-pointer" />
          </div>
          <div>
            <label className="text-[10px] text-gray-500 block mb-1">Stroke Width</label>
            <input type="number" value={el.strokeWidth || 1} onChange={e => u("strokeWidth", +e.target.value)} min={0} max={20}
              className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white text-xs focus:outline-none" />
          </div>
        </div>
      )}
      {/* Background */}
      <div className="flex items-center justify-between">
        <label className="text-[10px] text-gray-400 uppercase font-semibold">Text Background</label>
        <button onClick={() => u("textBg", !el.textBg)} className={`w-10 h-5 rounded-full transition-colors relative ${el.textBg ? "bg-purple-600" : "bg-gray-700"}`}>
          <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${el.textBg ? "left-5" : "left-0.5"}`} />
        </button>
      </div>
      {el.textBg && (
        <input type="color" value={el.textBgColor || "#000000"} onChange={e => u("textBgColor", e.target.value)} className="w-full h-8 rounded bg-gray-800 border border-gray-700 cursor-pointer" />
      )}
      {/* Opacity */}
      <div>
        <label className="text-[10px] text-gray-400 uppercase font-semibold block mb-1">Opacity: {Math.round((el.opacity ?? 1) * 100)}%</label>
        <input type="range" min={0} max={1} step={0.01} value={el.opacity ?? 1} onChange={e => u("opacity", +e.target.value)} className="w-full accent-purple-600" />
      </div>
    </div>
  );
}

// ─── Image/Shape Properties Panel ─────────────────────────────────────────────
function ElementPropertiesPanel({ el, onUpdate, onDelete, onDuplicate }) {
  const u = (k, v) => onUpdate(el.id, { [k]: v });
  return (
    <div className="space-y-4 p-3">
      <div className="flex items-center justify-between">
        <span className="text-white text-sm font-bold capitalize">{el.type} Properties</span>
        <div className="flex gap-1">
          <button onClick={onDuplicate} className="p-1.5 rounded bg-gray-800 text-gray-400 hover:text-white"><Copy className="w-3.5 h-3.5" /></button>
          <button onClick={onDelete} className="p-1.5 rounded bg-gray-800 text-red-400 hover:text-red-300"><Trash2 className="w-3.5 h-3.5" /></button>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {[["X","x"],["Y","y"],["W","width"],["H","height"]].map(([label, key]) => (
          <div key={key}>
            <label className="text-[10px] text-gray-500 block mb-1">{label}</label>
            <input type="number" value={Math.round(el[key] || 0)} onChange={e => u(key, +e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1.5 text-white text-xs focus:outline-none focus:border-purple-500" />
          </div>
        ))}
      </div>
      <div>
        <label className="text-[10px] text-gray-400 uppercase font-semibold block mb-1">Rotation: {el.rotation || 0}°</label>
        <input type="range" min={-180} max={180} value={el.rotation || 0} onChange={e => u("rotation", +e.target.value)} className="w-full accent-purple-600" />
      </div>
      <div>
        <label className="text-[10px] text-gray-400 uppercase font-semibold block mb-1">Opacity: {Math.round((el.opacity ?? 1) * 100)}%</label>
        <input type="range" min={0} max={1} step={0.01} value={el.opacity ?? 1} onChange={e => u("opacity", +e.target.value)} className="w-full accent-purple-600" />
      </div>
      {(el.type === "shape") && (
        <>
          <div>
            <label className="text-[10px] text-gray-400 uppercase font-semibold block mb-1">Fill Color</label>
            <input type="color" value={el.color || "#a855f7"} onChange={e => u("color", e.target.value)} className="w-full h-8 rounded bg-gray-800 border border-gray-700 cursor-pointer" />
          </div>
          <div>
            <label className="text-[10px] text-gray-400 uppercase font-semibold block mb-1">Corner Radius</label>
            <input type="range" min={0} max={100} value={el.borderRadius || 0} onChange={e => u("borderRadius", +e.target.value)} className="w-full accent-purple-600" />
          </div>
          <div>
            <label className="text-[10px] text-gray-400 uppercase font-semibold block mb-1">Border Width</label>
            <input type="number" min={0} max={20} value={el.borderWidth || 0} onChange={e => u("borderWidth", +e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1.5 text-white text-xs focus:outline-none focus:border-purple-500" />
          </div>
          {(el.borderWidth || 0) > 0 && (
            <div>
              <label className="text-[10px] text-gray-400 uppercase font-semibold block mb-1">Border Color</label>
              <input type="color" value={el.borderColor || "#ffffff"} onChange={e => u("borderColor", e.target.value)} className="w-full h-8 rounded bg-gray-800 border border-gray-700 cursor-pointer" />
            </div>
          )}
        </>
      )}
      {el.type === "image" && (
        <div>
          <label className="text-[10px] text-gray-400 uppercase font-semibold block mb-1">Corner Radius</label>
          <input type="range" min={0} max={200} value={el.borderRadius || 0} onChange={e => u("borderRadius", +e.target.value)} className="w-full accent-purple-600" />
        </div>
      )}
    </div>
  );
}

// ─── Left Panel ───────────────────────────────────────────────────────────────
function LeftPanel({ activePanel, setActivePanel, canvasSize, addElement, addPage, pages, activePage, setActivePage, deletePage, bgColor, setBgColor }) {
  const fileInputRef = useRef(null);
  const videoInputRef = useRef(null);
  const fonts = ["Arial", "Helvetica", "Times New Roman", "Georgia", "Verdana", "Courier New", "Impact", "Comic Sans MS", "Oswald", "Montserrat"];
  const textAnimations = ["Fade In", "Slide In", "Typewriter", "Bounce", "Zoom", "Flip", "Rotate", "Glitch", "Wave", "Neon Glow"];
  const shapes = [
    { label: "Rectangle", r: 0 }, { label: "Rounded", r: 20 }, { label: "Circle", r: 999 },
    { label: "Pill", r: 50 }, { label: "Diamond", r: 0, rotate: 45 },
  ];
  const stickers = ["🎮","🏆","⚡","🔥","💥","🎯","⭐","💎","🌟","🎬","📡","🔫","🗡️","🛡️","👾","🤖","💀","🎵","🎤","📸"];

  const handleImageImport = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    addElement({ type: "image", src: url, x: 100, y: 100, width: 400, height: 300, opacity: 1, borderRadius: 0 });
    e.target.value = "";
  };

  const handleVideoImport = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    addElement({ type: "video", src: url, x: 0, y: 0, width: canvasSize.width, height: canvasSize.height, opacity: 1 });
    e.target.value = "";
  };

  const tools = [
    { id: "media", icon: Image, label: "Media" },
    { id: "text", icon: Type, label: "Text" },
    { id: "shapes", icon: Grid3X3, label: "Shapes" },
    { id: "stickers", icon: Sparkles, label: "Stickers" },
    { id: "music", icon: Music, label: "Music" },
    { id: "pages", icon: Layers, label: "Pages" },
    { id: "background", icon: Palette, label: "BG" },
  ];

  return (
    <div className="w-72 bg-gray-900 border-r border-gray-800 flex flex-col h-full overflow-hidden">
      {/* Tool icons */}
      <div className="p-2 border-b border-gray-800 flex flex-wrap gap-1">
        {tools.map(t => (
          <button key={t.id} onClick={() => setActivePanel(t.id)}
            className={`flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-lg text-[10px] transition-colors ${activePanel === t.id ? "bg-purple-600/30 text-purple-400" : "text-gray-400 hover:text-white hover:bg-gray-800"}`}>
            <t.icon className="w-4 h-4" />
            {t.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {/* MEDIA PANEL */}
        {activePanel === "media" && (
          <div className="space-y-3">
            <h3 className="text-white font-bold text-sm">Import Media</h3>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageImport} />
            <input ref={videoInputRef} type="file" accept="video/*" className="hidden" onChange={handleVideoImport} />
            <button onClick={() => fileInputRef.current?.click()}
              className="w-full flex items-center gap-3 p-3 rounded-xl bg-gray-800 hover:bg-gray-700 border border-dashed border-gray-600 hover:border-purple-500 transition-all group">
              <div className="w-10 h-10 rounded-lg bg-blue-900/40 border border-blue-700/50 flex items-center justify-center group-hover:bg-blue-900/60">
                <FileImage className="w-5 h-5 text-blue-400" />
              </div>
              <div className="text-left">
                <p className="text-white text-sm font-semibold">Import Image</p>
                <p className="text-gray-500 text-xs">PNG, JPG, GIF, WebP</p>
              </div>
              <Upload className="w-4 h-4 text-gray-500 ml-auto" />
            </button>
            <button onClick={() => videoInputRef.current?.click()}
              className="w-full flex items-center gap-3 p-3 rounded-xl bg-gray-800 hover:bg-gray-700 border border-dashed border-gray-600 hover:border-purple-500 transition-all group">
              <div className="w-10 h-10 rounded-lg bg-purple-900/40 border border-purple-700/50 flex items-center justify-center group-hover:bg-purple-900/60">
                <FileVideo className="w-5 h-5 text-purple-400" />
              </div>
              <div className="text-left">
                <p className="text-white text-sm font-semibold">Import Video</p>
                <p className="text-gray-500 text-xs">MP4, MOV, WebM</p>
              </div>
              <Upload className="w-4 h-4 text-gray-500 ml-auto" />
            </button>
            <div className="border-t border-gray-800 pt-3">
              <p className="text-gray-500 text-xs mb-2">Or drag & drop files onto the canvas</p>
              <div className="border-2 border-dashed border-gray-700 rounded-xl p-8 text-center hover:border-purple-500 transition-colors cursor-pointer"
                onClick={() => fileInputRef.current?.click()}>
                <Upload className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                <p className="text-gray-500 text-xs">Drop files here</p>
              </div>
            </div>
          </div>
        )}

        {/* TEXT PANEL */}
        {activePanel === "text" && (
          <div className="space-y-3">
            <h3 className="text-white font-bold text-sm">Add Text</h3>
            {[
              { label: "Big Title", fontSize: 64, fontWeight: "bold", text: "BIG TITLE", color: "#ffffff" },
              { label: "Subtitle", fontSize: 36, fontWeight: "600", text: "Subtitle Text", color: "#cccccc" },
              { label: "Body Text", fontSize: 24, fontWeight: "normal", text: "Body text here", color: "#aaaaaa" },
              { label: "Caption", fontSize: 16, fontWeight: "normal", text: "Caption text", color: "#888888" },
              { label: "Gaming Title", fontSize: 56, fontWeight: "bold", text: "PLAYER 1", color: "#a855f7", shadow: true, shadowColor: "#7c3aed", shadowBlur: 10 },
              { label: "Neon Text", fontSize: 48, fontWeight: "bold", text: "NEON", color: "#00ffff", shadow: true, shadowColor: "#00ffff", shadowBlur: 20 },
            ].map(preset => (
              <button key={preset.label} onClick={() => addElement({ type: "text", ...preset, x: 100, y: 100, width: 600, height: preset.fontSize * 2, opacity: 1, textAlign: "center" })}
                className="w-full p-3 rounded-xl bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-purple-500 text-left transition-all">
                <p style={{ fontFamily: "Arial", fontWeight: preset.fontWeight, fontSize: Math.min(preset.fontSize / 3, 18), color: preset.color }}>{preset.label}</p>
                <p className="text-gray-500 text-[10px] mt-0.5">{preset.fontSize}px · Click to add</p>
              </button>
            ))}
          </div>
        )}

        {/* SHAPES PANEL */}
        {activePanel === "shapes" && (
          <div className="space-y-3">
            <h3 className="text-white font-bold text-sm">Shapes & Elements</h3>
            <div className="grid grid-cols-2 gap-2">
              {shapes.map(s => (
                <button key={s.label} onClick={() => addElement({ type: "shape", color: "#a855f7", x: 100, y: 100, width: 200, height: s.label === "Circle" ? 200 : 120, borderRadius: s.r, rotation: s.rotate || 0, opacity: 1 })}
                  className="p-4 rounded-xl bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-purple-500 transition-all flex flex-col items-center gap-2">
                  <div style={{ width: 40, height: s.label === "Circle" ? 40 : 28, background: "#a855f7", borderRadius: s.r, transform: s.rotate ? `rotate(${s.rotate}deg)` : "none" }} />
                  <span className="text-gray-400 text-xs">{s.label}</span>
                </button>
              ))}
              {/* Gradient shapes */}
              {[["Purple Grad","linear-gradient(135deg,#a855f7,#ec4899)"],["Blue Grad","linear-gradient(135deg,#3b82f6,#06b6d4)"],["Fire Grad","linear-gradient(135deg,#f97316,#ef4444)"]].map(([lbl, grad]) => (
                <button key={lbl} onClick={() => addElement({ type: "shape", color: grad, x: 100, y: 100, width: 200, height: 120, borderRadius: 12, opacity: 1, isGradient: true })}
                  className="p-4 rounded-xl bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-purple-500 transition-all flex flex-col items-center gap-2">
                  <div style={{ width: 60, height: 28, background: grad, borderRadius: 6 }} />
                  <span className="text-gray-400 text-xs">{lbl}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* MUSIC PANEL */}
        {activePanel === "music" && (
          <div className="space-y-3">
            <h3 className="text-white font-bold text-sm">Music Library</h3>
            <p className="text-gray-500 text-xs">Add background music to your video project</p>
            <a href="/music-library" target="_blank" rel="noopener noreferrer"
              className="w-full flex items-center gap-3 p-3 rounded-xl bg-purple-900/30 border border-purple-700/40 hover:bg-purple-900/50 transition-all group">
              <div className="w-10 h-10 rounded-lg bg-purple-600/40 flex items-center justify-center">
                <Music className="w-5 h-5 text-purple-400" />
              </div>
              <div className="text-left flex-1">
                <p className="text-white text-sm font-semibold">Open Music Library</p>
                <p className="text-gray-400 text-xs">Browse royalty-free tracks</p>
              </div>
            </a>
            <div className="border-t border-gray-800 pt-3">
              <p className="text-gray-400 text-xs font-semibold mb-2">Upload Audio Track</p>
              <button className="w-full flex items-center gap-2 p-3 rounded-xl border border-dashed border-gray-700 hover:border-purple-500 text-gray-500 hover:text-purple-400 text-sm transition-colors">
                <Upload className="w-4 h-4" /> Upload MP3 / WAV
              </button>
            </div>
          </div>
        )}

        {/* STICKERS */}
        {activePanel === "stickers" && (
          <div className="space-y-3">
            <h3 className="text-white font-bold text-sm">Stickers & Emojis</h3>
            <div className="grid grid-cols-5 gap-2">
              {stickers.map(s => (
                <button key={s} onClick={() => addElement({ type: "text", text: s, fontSize: 64, x: 100, y: 100, width: 100, height: 100, opacity: 1, textAlign: "center" })}
                  className="text-3xl p-2 rounded-xl bg-gray-800 hover:bg-gray-700 hover:border-purple-500 border border-gray-700 transition-all">
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* PAGES PANEL */}
        {activePanel === "pages" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-white font-bold text-sm">Pages / Scenes</h3>
              <button onClick={addPage} className="flex items-center gap-1 px-2 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-semibold">
                <Plus className="w-3 h-3" /> Add
              </button>
            </div>
            <div className="space-y-2">
              {pages.map((pg, i) => (
                <div key={pg.id} onClick={() => setActivePage(pg.id)}
                  className={`flex items-center gap-2 p-2 rounded-xl border cursor-pointer transition-all ${activePage === pg.id ? "bg-purple-900/30 border-purple-500" : "bg-gray-800 border-gray-700 hover:border-gray-600"}`}>
                  <div className="w-12 h-8 bg-gray-900 rounded border border-gray-700 flex items-center justify-center text-[8px] text-gray-500 font-bold">{i + 1}</div>
                  <span className="text-white text-xs font-medium flex-1">Scene {i + 1}</span>
                  {pages.length > 1 && (
                    <button onClick={e => { e.stopPropagation(); deletePage(pg.id); }} className="text-gray-600 hover:text-red-400 transition-colors">
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button onClick={addPage} className="w-full py-3 border-2 border-dashed border-gray-700 hover:border-purple-500 rounded-xl text-gray-500 hover:text-purple-400 transition-colors flex items-center justify-center gap-2 text-sm">
              <Plus className="w-4 h-4" /> Add New Scene
            </button>
          </div>
        )}

        {/* BACKGROUND */}
        {activePanel === "background" && (
          <div className="space-y-3">
            <h3 className="text-white font-bold text-sm">Canvas Background</h3>
            <div className="grid grid-cols-4 gap-2">
              {["#000000","#111827","#0f0f2e","#1a0a2e","#0d1117","#1e1b4b","#0c1a0c","#1a0a0a",
                "#ffffff","#f8fafc","#f0f4f8","#e5e7eb",
                "#a855f7","#ec4899","#3b82f6","#ef4444","#10b981","#f59e0b",
                "linear-gradient(135deg,#0f0c29,#302b63,#24243e)",
                "linear-gradient(135deg,#0f2027,#203a43,#2c5364)",
                "linear-gradient(135deg,#200122,#6f0000)",
                "linear-gradient(to bottom,#000000,#1a0533)"
              ].map(bg => (
                <button key={bg} onClick={() => setBgColor(bg)}
                  style={{ background: bg, width: "100%", aspectRatio: "1", borderRadius: 8, border: bgColor === bg ? "2px solid #a855f7" : "2px solid transparent" }} />
              ))}
            </div>
            <div>
              <label className="text-gray-400 text-xs font-semibold block mb-1">Custom Color</label>
              <input type="color" value={bgColor.startsWith("#") ? bgColor : "#000000"} onChange={e => setBgColor(e.target.value)} className="w-full h-10 rounded bg-gray-800 border border-gray-700 cursor-pointer" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Studio ───────────────────────────────────────────────────────────────
export default function AIVideoStudioPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDashboard, setShowDashboard] = useState(true);
  const [existingProjects, setExistingProjects] = useState([]);

  // Studio state
  const [projectTitle, setProjectTitle] = useState("Untitled Project");
  const [canvasSize, setCanvasSize] = useState({ width: 1920, height: 1080 });
  const [bgColor, setBgColor] = useState("#000000");
  const [zoom, setZoom] = useState(40);
  const [elements, setElements] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [activePanel, setActivePanel] = useState("media");
  const [history, setHistory] = useState([[]]);
  const [historyIndex, setHistoryIndex] = useState(0);

  // Pages/scenes
  const [pages, setPages] = useState([{ id: uid(), name: "Scene 1" }]);
  const [activePage, setActivePage] = useState(null);

  useEffect(() => {
    const init = async () => {
      try {
        const me = await base44.auth.me();
        if (!me) { base44.auth.redirectToLogin("/ai-video-studio"); return; }
        setUser(me);
        const [profiles, projects] = await Promise.all([
          base44.entities.UserProfile.filter({ user_email: me.email }),
          base44.entities.VideoPost.filter({ creator_email: me.email }),
        ]);
        if (profiles.length > 0) setProfile(profiles[0]);
        setExistingProjects(projects);
      } catch {}
      setLoading(false);
    };
    init();
  }, []);

  useEffect(() => {
    if (pages.length > 0 && !activePage) setActivePage(pages[0].id);
  }, [pages]);

  const selectedEl = elements.find(e => e.id === selectedId) || null;

  const pushHistory = (newElems) => {
    const next = history.slice(0, historyIndex + 1);
    next.push(newElems);
    setHistory(next);
    setHistoryIndex(next.length - 1);
  };

  const updateElements = (newElems) => { setElements(newElems); pushHistory(newElems); };

  const undo = () => { if (historyIndex > 0) { setHistoryIndex(i => i - 1); setElements(history[historyIndex - 1]); } };
  const redo = () => { if (historyIndex < history.length - 1) { setHistoryIndex(i => i + 1); setElements(history[historyIndex + 1]); } };

  const addElement = (data) => {
    const el = { id: uid(), pageId: activePage, ...data };
    updateElements([...elements, el]);
    setSelectedId(el.id);
  };

  const updateElement = (id, updates) => {
    const next = elements.map(e => e.id === id ? { ...e, ...updates } : e);
    updateElements(next);
  };

  const deleteElement = (id) => { updateElements(elements.filter(e => e.id !== id)); setSelectedId(null); };
  const duplicateElement = (id) => { const el = elements.find(e => e.id === id); if (el) addElement({ ...el, x: (el.x || 0) + 20, y: (el.y || 0) + 20 }); };

  const addPage = () => {
    const newPage = { id: uid(), name: `Scene ${pages.length + 1}` };
    setPages(p => [...p, newPage]);
    setActivePage(newPage.id);
  };

  const deletePage = (id) => {
    if (pages.length <= 1) return;
    const remaining = pages.filter(p => p.id !== id);
    setPages(remaining);
    if (activePage === id) setActivePage(remaining[0]?.id);
    updateElements(elements.filter(e => e.pageId !== id));
  };

  const handleCreateProject = (template, existing = null) => {
    if (template) {
      setCanvasSize({ width: template.w, height: template.h });
      setProjectTitle(template.label + " Project");
    } else if (existing) {
      setProjectTitle(existing.title || "Project");
    }
    const firstPage = { id: uid(), name: "Scene 1" };
    setPages([firstPage]);
    setActivePage(firstPage.id);
    setElements([]);
    setHistory([[]]);
    setHistoryIndex(0);
    setShowDashboard(false);
  };

  const handleSave = async () => {
    if (!user) return;
    // Save is implicit — elements are in state
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (showDashboard) return (
    <ProjectDashboard user={user} profile={profile} onCreateProject={handleCreateProject} existingProjects={existingProjects} />
  );

  const scale = zoom / 100;
  const canvasW = canvasSize.width * scale;
  const canvasH = canvasSize.height * scale;

  return (
    <div className="h-screen bg-gray-950 flex flex-col overflow-hidden">
      {/* Top bar */}
      <div className="h-14 bg-gray-900 border-b border-gray-800 flex items-center justify-between px-4 flex-shrink-0 z-10">
        <div className="flex items-center gap-3">
          <button onClick={() => setShowDashboard(true)} className="text-gray-400 hover:text-white p-1.5 rounded hover:bg-gray-800 transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <input value={projectTitle} onChange={e => setProjectTitle(e.target.value)}
            className="bg-transparent text-white font-semibold focus:outline-none text-sm border-b border-transparent focus:border-gray-600 pb-0.5" />
          <span className="text-gray-600 text-xs hidden sm:block">{canvasSize.width}×{canvasSize.height}</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={undo} disabled={historyIndex === 0} className="p-1.5 rounded text-gray-400 hover:text-white hover:bg-gray-800 disabled:opacity-30 transition-colors"><Undo2 className="w-4 h-4" /></button>
          <button onClick={redo} disabled={historyIndex >= history.length - 1} className="p-1.5 rounded text-gray-400 hover:text-white hover:bg-gray-800 disabled:opacity-30 transition-colors"><RotateCcw className="w-4 h-4 scale-x-[-1]" /></button>
          <div className="flex items-center gap-1 bg-gray-800 rounded-lg px-2 py-1">
            <button onClick={() => setZoom(z => Math.max(10, z - 10))} className="text-gray-400 hover:text-white"><ZoomOut className="w-3.5 h-3.5" /></button>
            <span className="text-gray-300 text-xs w-10 text-center">{zoom}%</span>
            <button onClick={() => setZoom(z => Math.min(200, z + 10))} className="text-gray-400 hover:text-white"><ZoomIn className="w-3.5 h-3.5" /></button>
          </div>
          <button onClick={handleSave} className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors">
            <Save className="w-4 h-4" /> Save
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:opacity-90 transition-opacity">
            <Download className="w-4 h-4" /> Export
          </button>
        </div>
      </div>

      {/* Main workspace */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left panel */}
        <LeftPanel
          activePanel={activePanel}
          setActivePanel={setActivePanel}
          canvasSize={canvasSize}
          addElement={addElement}
          addPage={addPage}
          pages={pages}
          activePage={activePage}
          setActivePage={setActivePage}
          deletePage={deletePage}
          bgColor={bgColor}
          setBgColor={setBgColor}
        />

        {/* Canvas area */}
        <div className="flex-1 overflow-auto bg-gray-950 flex items-center justify-center p-8" onClick={() => setSelectedId(null)}>
          <div style={{ flexShrink: 0 }} onClick={e => e.stopPropagation()}>
            <StudioCanvas
              pages={pages}
              activePage={activePage}
              elements={elements}
              selectedId={selectedId}
              onSelect={setSelectedId}
              onUpdate={updateElement}
              canvasSize={canvasSize}
              zoom={zoom}
              bgColor={bgColor}
            />
          </div>
        </div>

        {/* Right panel — properties */}
        {selectedEl && (
          <div className="w-72 bg-gray-900 border-l border-gray-800 overflow-y-auto flex-shrink-0">
            <div className="p-3 border-b border-gray-800 flex items-center justify-between">
              <span className="text-white text-sm font-bold capitalize">{selectedEl.type} Properties</span>
              <div className="flex gap-1">
                <button onClick={() => duplicateElement(selectedId)} className="p-1.5 rounded bg-gray-800 text-gray-400 hover:text-white"><Copy className="w-3.5 h-3.5" /></button>
                <button onClick={() => deleteElement(selectedId)} className="p-1.5 rounded bg-gray-800 text-red-400 hover:text-red-300"><Trash2 className="w-3.5 h-3.5" /></button>
                <button onClick={() => setSelectedId(null)} className="p-1.5 rounded bg-gray-800 text-gray-400 hover:text-white"><X className="w-3.5 h-3.5" /></button>
              </div>
            </div>
            {selectedEl.type === "text" ? (
              <TextPropertiesPanel el={selectedEl} onUpdate={updateElement} />
            ) : (
              <ElementPropertiesPanel el={selectedEl} onUpdate={updateElement} onDelete={() => deleteElement(selectedId)} onDuplicate={() => duplicateElement(selectedId)} />
            )}
          </div>
        )}
      </div>

      {/* Bottom pages bar */}
      <div className="h-12 bg-gray-900 border-t border-gray-800 flex items-center gap-2 px-4 overflow-x-auto flex-shrink-0">
        <span className="text-gray-500 text-xs flex-shrink-0">Scenes:</span>
        {pages.map((pg, i) => (
          <button key={pg.id} onClick={() => setActivePage(pg.id)}
            className={`flex-shrink-0 px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${activePage === pg.id ? "bg-purple-600 text-white" : "bg-gray-800 text-gray-400 hover:text-white"}`}>
            {i + 1}
          </button>
        ))}
        <button onClick={addPage} className="flex-shrink-0 w-7 h-7 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white flex items-center justify-center transition-colors">
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}