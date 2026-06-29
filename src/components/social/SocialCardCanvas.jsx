import React, { useRef, useState, useEffect } from "react";
import { Download, X, Palette, Layout, Type, Sliders, Send, Users } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { isAdmin } from "@/lib/constants";

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

const SOCIAL_LINKS = {
  facebook: "https://www.facebook.com/share/1D9ey9w8Rw",
  youtube: "https://youtube.com/@registeredgamerproductions",
};

function drawRoundedRect(ctx, x, y, width, height, radius) {
  if (typeof ctx.roundRect === "function") {
    ctx.roundRect(x, y, width, height, radius);
    return;
  }

  const r = Math.max(0, Math.min(radius, width / 2, height / 2));
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + width - r, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + r);
  ctx.lineTo(x + width, y + height - r);
  ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  ctx.lineTo(x + r, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

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

// Draw controller icon (gamepad) using canvas paths
function drawControllerIcon(ctx, x, y, size, color) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.strokeStyle = color;
  ctx.lineWidth = size * 0.06;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  // Body shape
  ctx.beginPath();
  ctx.ellipse(x, y, size * 0.42, size * 0.3, 0, 0, Math.PI * 2);
  ctx.fill();

  // Left grip
  ctx.beginPath();
  ctx.ellipse(x - size * 0.28, y + size * 0.22, size * 0.18, size * 0.14, Math.PI / 6, 0, Math.PI * 2);
  ctx.fill();

  // Right grip
  ctx.beginPath();
  ctx.ellipse(x + size * 0.28, y + size * 0.22, size * 0.18, size * 0.14, -Math.PI / 6, 0, Math.PI * 2);
  ctx.fill();

  // Center background circle (darker)
  ctx.fillStyle = "rgba(0,0,0,0.3)";
  ctx.beginPath();
  ctx.arc(x, y, size * 0.18, 0, Math.PI * 2);
  ctx.fill();

  // Buttons (right side) - circles
  ctx.fillStyle = color + "cc";
  const btnSize = size * 0.055;
  [[size * 0.2, -size * 0.05], [size * 0.26, size * 0.03], [size * 0.14, size * 0.03], [size * 0.2, size * 0.11]].forEach(([dx, dy]) => {
    ctx.beginPath();
    ctx.arc(x + dx, y + dy, btnSize, 0, Math.PI * 2);
    ctx.fill();
  });

  // D-pad (left side)
  ctx.fillStyle = color + "cc";
  const dSize = size * 0.07;
  [[-size * 0.2, -size * 0.05], [-size * 0.26, size * 0.03], [-size * 0.14, size * 0.03], [-size * 0.2, size * 0.11]].forEach(([dx, dy]) => {
    ctx.fillRect(x + dx - dSize * 0.35, y + dy - dSize * 0.35, dSize * 0.7, dSize * 0.7);
  });

  // Start/Select buttons center
  ctx.fillStyle = color + "88";
  ctx.beginPath(); ctx.arc(x - size * 0.04, y - size * 0.04, size * 0.04, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(x + size * 0.04, y - size * 0.04, size * 0.04, 0, Math.PI * 2); ctx.fill();

  ctx.restore();
}

// Draw Facebook icon
function drawFBIcon(ctx, x, y, size, color) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.beginPath();
  drawRoundedRect(ctx, x - size/2, y - size/2, size, size, size * 0.2);
  ctx.fill();
  ctx.fillStyle = "#fff";
  ctx.font = `bold ${size * 0.65}px Arial, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("f", x + size * 0.04, y + size * 0.05);
  ctx.textBaseline = "alphabetic";
  ctx.restore();
}

// Draw YouTube icon
function drawYTIcon(ctx, x, y, size, color) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.beginPath();
  drawRoundedRect(ctx, x - size/2, y - size/2, size, size, size * 0.2);
  ctx.fill();
  // Play triangle
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.15, y - size * 0.2);
  ctx.lineTo(x + size * 0.25, y);
  ctx.lineTo(x - size * 0.15, y + size * 0.2);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

// Draw glowing text
function drawGlowText(ctx, text, x, y, fontSize, color, glowColor, align = "center") {
  ctx.save();
  ctx.textAlign = align;
  ctx.font = `900 ${fontSize}px 'Arial Black', sans-serif`;
  ctx.shadowColor = glowColor;
  ctx.shadowBlur = 18;
  ctx.fillStyle = color;
  ctx.fillText(text, x, y);
  // Second pass for extra glow
  ctx.shadowBlur = 32;
  ctx.globalAlpha = 0.5;
  ctx.fillText(text, x, y);
  ctx.restore();
}

export default function SocialCardCanvas({ post, onClose, userEmail }) {
  const canvasRef = useRef(null);
  const [themeId, setThemeId] = useState("dark_purple");
  const [sizeId, setSizeId] = useState("square");
  const [layoutId, setLayoutId] = useState("centered");
  const [customText, setCustomText] = useState(post?.text || "");
  const [customTitle, setCustomTitle] = useState(post?.category || "GAMER.PRODUCTIONS");
  const [fontSize, setFontSize] = useState(100);
  const [rendering, setRendering] = useState(false);
  const [activeTab, setActiveTab] = useState("theme");
  const [showEmailBlast, setShowEmailBlast] = useState(false);
  const [blastEmail, setBlastEmail] = useState("");
  const [blastType, setBlastType] = useState("single"); // "single" | "all"
  const [blastSending, setBlastSending] = useState(false);
  const [blastDone, setBlastDone] = useState(false);
  const admin = isAdmin(userEmail);

  const theme = THEMES.find(t => t.id === themeId) || THEMES[0];
  const size = SIZES.find(s => s.id === sizeId) || SIZES[0];

  const drawSocials = (ctx, w, h, t) => {
    const iconSize = Math.round(w * 0.045);
    const y = h - 28;
    const centerX = w / 2;

    // Row: YT icon  gamer.productions/yt  |  FB icon  gamer.productions/fb
    const gap = w * 0.08;
    drawYTIcon(ctx, centerX - gap - iconSize * 1.2, y - iconSize / 2, iconSize, "#FF0000");
    drawFBIcon(ctx, centerX + gap + iconSize * 1.2, y - iconSize / 2, iconSize, "#1877F2");

    ctx.save();
    ctx.textAlign = "center";
    ctx.font = `bold ${Math.round(w * 0.018)}px Arial, sans-serif`;
    ctx.fillStyle = t.sub + "bb";
    ctx.fillText("@registeredgamerproductions  ·  facebook.com/gamer.productions", centerX, y + 6);
    ctx.restore();
  };

  const drawCard = (ctx, w, h) => {
    const isLight = themeId === "light_pro";
    const fScale = fontSize / 100;

    // Background
    const bg = ctx.createLinearGradient(0, 0, w, h);
    bg.addColorStop(0, theme.bg1);
    bg.addColorStop(1, theme.bg2);
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);

    // Grid pattern
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

    // Socials footer (always present)
    drawSocials(ctx, w, h, theme);
  };

  const drawCentered = (ctx, w, h, t, isLight, fScale) => {
    const radGlow = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w * 0.55);
    radGlow.addColorStop(0, t.accent + "22");
    radGlow.addColorStop(1, "transparent");
    ctx.fillStyle = radGlow;
    ctx.fillRect(0, 0, w, h);

    // Top accent strip
    const strip = ctx.createLinearGradient(0, 0, w, 0);
    strip.addColorStop(0, t.accent);
    strip.addColorStop(0.5, t.glow);
    strip.addColorStop(1, t.accent);
    ctx.fillStyle = strip;
    ctx.fillRect(0, 0, w, 4);

    // Brand bar with controller icon
    ctx.fillStyle = t.accent + "18";
    ctx.fillRect(0, 0, w, 58);

    // Controller icon in brand bar
    drawControllerIcon(ctx, 22, 28, 30, t.accent);

    // Glowing brand name
    drawGlowText(ctx, "GAMER.PRODUCTIONS", 60, 38, Math.round(w * 0.036 * fScale), t.accent, t.glow, "left");

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
    ctx.font = `bold ${Math.round(w * 0.024)}px Arial, sans-serif`;
    const pillW = ctx.measureText(catText).width + 40;
    ctx.fillStyle = t.accent + "30";
    ctx.beginPath(); drawRoundedRect(ctx, w / 2 - pillW / 2, h * 0.31, pillW, 28, 14); ctx.fill();
    ctx.strokeStyle = t.accent; ctx.lineWidth = 1;
    ctx.beginPath(); drawRoundedRect(ctx, w / 2 - pillW / 2, h * 0.31, pillW, 28, 14); ctx.stroke();
    ctx.fillStyle = t.accent; ctx.textAlign = "center";
    ctx.fillText(catText, w / 2, h * 0.31 + 19);

    // Main glowing text
    ctx.save();
    ctx.shadowColor = t.glow; ctx.shadowBlur = 10;
    ctx.fillStyle = t.text;
    ctx.font = `${Math.round(w * 0.029 * fScale)}px Arial, sans-serif`;
    ctx.textAlign = "center";
    wrapText(ctx, customText, w / 2, h * 0.43, w * 0.82, Math.round(w * 0.042), sizeId === "story" ? 12 : 7);
    ctx.restore();

    // Divider
    ctx.strokeStyle = t.accent + "44"; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(w * 0.1, h - 70); ctx.lineTo(w * 0.9, h - 70); ctx.stroke();

    // Footer bar
    ctx.fillStyle = t.accent + "18";
    ctx.fillRect(0, h - 60, w, 60);
    drawGlowText(ctx, "🎮  Join us at gamer.productions", w / 2, h - 42, Math.round(w * 0.026), t.sub, t.glow);
  };

  const drawSplit = (ctx, w, h, t, isLight, fScale) => {
    const panelW = w * 0.38;
    ctx.fillStyle = t.accent + "22";
    ctx.fillRect(0, 0, panelW, h);
    ctx.fillStyle = t.accent;
    ctx.fillRect(panelW - 3, 0, 3, h);

    // Controller in left panel
    drawControllerIcon(ctx, panelW / 2, h * 0.3, panelW * 0.5, t.accent + "cc");

    drawGlowText(ctx, "GAMER", panelW / 2, h * 0.62, Math.round(panelW * 0.09), t.accent, t.glow);
    drawGlowText(ctx, ".PROD", panelW / 2, h * 0.7, Math.round(panelW * 0.09), t.accent, t.glow);

    ctx.fillStyle = t.sub + "88";
    ctx.font = `${Math.round(panelW * 0.065)}px Arial, sans-serif`;
    ctx.textAlign = "center";
    ctx.fillText("gamer.productions", panelW / 2, h * 0.82);

    // Social icons in left panel bottom
    const iconS = Math.round(panelW * 0.1);
    drawYTIcon(ctx, panelW / 2 - iconS * 0.8, h * 0.9, iconS, "#FF0000");
    drawFBIcon(ctx, panelW / 2 + iconS * 0.8, h * 0.9, iconS, "#1877F2");

    const rx = panelW + 24, rw = w - panelW - 30;
    ctx.fillStyle = t.accent;
    ctx.font = `900 ${Math.round(rw * 0.08 * fScale)}px 'Arial Black', sans-serif`;
    ctx.textAlign = "left";
    ctx.fillText((customTitle || "Gaming").toUpperCase(), rx, h * 0.14);

    ctx.strokeStyle = t.accent; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(rx, h * 0.17); ctx.lineTo(rx + rw * 0.7, h * 0.17); ctx.stroke();

    ctx.save();
    ctx.shadowColor = t.glow; ctx.shadowBlur = 8;
    ctx.fillStyle = t.text;
    ctx.font = `${Math.round(rw * 0.052 * fScale)}px Arial, sans-serif`;
    ctx.textAlign = "left";
    wrapText(ctx, customText, rx, h * 0.24, rw, Math.round(rw * 0.068), 9);
    ctx.restore();

    drawGlowText(ctx, "→ gamer.productions", rx + rw * 0.5, h * 0.92, Math.round(rw * 0.048), t.accent, t.glow, "center");
  };

  const drawHeadline = (ctx, w, h, t, isLight, fScale) => {
    const grad = ctx.createLinearGradient(0, 0, w, 0);
    grad.addColorStop(0, t.accent);
    grad.addColorStop(0.5, t.glow);
    grad.addColorStop(1, t.accent);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h * 0.4);

    // Controller in top section
    drawControllerIcon(ctx, w * 0.08, h * 0.1, h * 0.14, "rgba(255,255,255,0.4)");

    ctx.font = `${Math.round(w * 0.09)}px serif`;
    ctx.textAlign = "center";
    ctx.fillText(post?.emoji || "🎮", w / 2, h * 0.12);

    drawGlowText(ctx, "GAMER.PRODUCTIONS", w / 2, h * 0.24, Math.round(w * 0.05 * fScale), "#fff", t.glow);
    drawGlowText(ctx, (customTitle || "Gaming").toUpperCase(), w / 2, h * 0.36, Math.round(w * 0.072 * fScale), "#fff", t.glow);

    ctx.save();
    ctx.shadowColor = t.glow; ctx.shadowBlur = 8;
    ctx.fillStyle = t.text;
    ctx.font = `${Math.round(w * 0.028 * fScale)}px Arial, sans-serif`;
    ctx.textAlign = "center";
    wrapText(ctx, customText, w / 2, h * 0.52, w * 0.86, Math.round(w * 0.04), 6);
    ctx.restore();

    // Social icons
    const iconS = Math.round(w * 0.045);
    drawYTIcon(ctx, w / 2 - iconS * 1.5, h * 0.9, iconS, "#FF0000");
    drawFBIcon(ctx, w / 2 + iconS * 1.5, h * 0.9, iconS, "#1877F2");

    drawGlowText(ctx, "gamer.productions  🎮", w / 2, h * 0.88, Math.round(w * 0.03), t.accent, t.glow);
  };

  const drawMinimal = (ctx, w, h, t, isLight, fScale) => {
    [[0, 0], [w, 0], [0, h], [w, h]].forEach(([cx, cy], i) => {
      ctx.strokeStyle = t.accent + "66"; ctx.lineWidth = 2;
      ctx.beginPath();
      const dir = [1, -1, 1, -1][i];
      const diry = [1, 1, -1, -1][i];
      ctx.moveTo(cx + dir * 2, cy + diry * 30);
      ctx.lineTo(cx + dir * 2, cy + diry * 2);
      ctx.lineTo(cx + dir * 30, cy + diry * 2);
      ctx.stroke();
    });

    // Controller + brand
    drawControllerIcon(ctx, 22, 28, 28, t.accent);
    drawGlowText(ctx, "GAMER.PRODUCTIONS", 46, 38, Math.round(w * 0.028), t.accent, t.glow, "left");

    // Social icons top right
    const iconS = Math.round(w * 0.04);
    drawYTIcon(ctx, w - iconS * 2.5, 28, iconS, "#FF0000");
    drawFBIcon(ctx, w - iconS * 1, 28, iconS, "#1877F2");

    ctx.font = `${Math.round(w * 0.15)}px serif`;
    ctx.textAlign = "center";
    ctx.fillText(post?.emoji || "🎮", w / 2, h * 0.35);

    drawGlowText(ctx, (customTitle || "Gaming").toUpperCase(), w / 2, h * 0.5, Math.round(w * 0.055 * fScale), t.accent, t.glow);

    ctx.save();
    ctx.shadowColor = t.glow; ctx.shadowBlur = 6;
    ctx.fillStyle = t.sub;
    ctx.font = `${Math.round(w * 0.026 * fScale)}px Arial, sans-serif`;
    ctx.textAlign = "center";
    wrapText(ctx, customText, w / 2, h * 0.62, w * 0.78, Math.round(w * 0.038), 3);
    ctx.restore();

    ctx.fillStyle = t.text + "88";
    ctx.font = `${Math.round(w * 0.022)}px Arial, sans-serif`;
    ctx.textAlign = "center";
    ctx.fillText("gamer.productions", w / 2, h * 0.88);
  };

  const handleDownload = () => {
    setRendering(true);
    const canvas = document.createElement("canvas");
    canvas.width = size.w; canvas.height = size.h;
    drawCard(canvas.getContext("2d"), size.w, size.h);
    const link = document.createElement("a");
    link.download = `gamer-productions-${post?.category || "post"}-${themeId}-${layoutId}-${Date.now()}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
    setRendering(false);
  };

  const handleEmailBlast = async () => {
    setBlastSending(true);
    try {
      if (blastType === "single") {
        await base44.integrations.Core.SendEmail({
          to: blastEmail,
          subject: `🎮 GAMER.Productions — ${customTitle || "New Update"}`,
          body: `<div style="background:#0a0618;color:#fff;font-family:Arial,sans-serif;padding:32px;border-radius:16px;max-width:600px;margin:0 auto;border:2px solid #7c3aed;">
            <div style="display:flex;align-items:center;gap:12px;margin-bottom:24px;">
              <div style="font-size:32px;">🎮</div>
              <div>
                <div style="font-size:22px;font-weight:900;background:linear-gradient(135deg,#a855f7,#ec4899);-webkit-background-clip:text;-webkit-text-fill-color:transparent;">GAMER.PRODUCTIONS</div>
                <div style="color:#7c3aed;font-size:11px;">gamer.productions</div>
              </div>
            </div>
            <div style="background:rgba(168,85,247,0.15);border:1px solid rgba(168,85,247,0.4);padding:8px 16px;border-radius:24px;display:inline-block;font-size:12px;font-weight:bold;color:#a855f7;margin-bottom:16px;">${(customTitle || "Gaming").toUpperCase()}</div>
            <p style="font-size:15px;line-height:1.7;color:#e2e8f0;">${customText.replace(/\n/g, "<br/>")}</p>
            <div style="margin-top:24px;padding-top:16px;border-top:1px solid rgba(168,85,247,0.3);display:flex;align-items:center;gap:16px;">
              <a href="${SOCIAL_LINKS.youtube}" style="background:#FF0000;color:#fff;padding:6px 14px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:12px;">▶ YouTube</a>
              <a href="${SOCIAL_LINKS.facebook}" style="background:#1877F2;color:#fff;padding:6px 14px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:12px;">f Facebook</a>
              <a href="https://gamer.productions" style="color:#a855f7;font-size:12px;font-weight:bold;">gamer.productions →</a>
            </div>
          </div>`,
          from_name: "GAMER.Productions",
        });
        setBlastDone(true);
      } else {
        // Blast to all users — fetch all profiles
        const profiles = await base44.entities.UserProfile.list();
        const emails = [...new Set(profiles.map(p => p.user_email).filter(Boolean))];
        for (const email of emails.slice(0, 200)) {
          await base44.integrations.Core.SendEmail({
            to: email,
            subject: `🎮 GAMER.Productions — ${customTitle || "New Update"}`,
            body: `<div style="background:#0a0618;color:#fff;font-family:Arial,sans-serif;padding:32px;border-radius:16px;max-width:600px;margin:0 auto;border:2px solid #7c3aed;"><div style="font-size:22px;font-weight:900;color:#a855f7;margin-bottom:16px;">GAMER.PRODUCTIONS 🎮</div><div style="background:rgba(168,85,247,0.15);border:1px solid rgba(168,85,247,0.4);padding:6px 14px;border-radius:24px;display:inline-block;font-size:11px;font-weight:bold;color:#a855f7;margin-bottom:14px;">${(customTitle || "Gaming").toUpperCase()}</div><p style="font-size:14px;line-height:1.7;color:#e2e8f0;">${customText.replace(/\n/g, "<br/>")}</p><div style="margin-top:20px;display:flex;gap:12px;"><a href="${SOCIAL_LINKS.youtube}" style="background:#FF0000;color:#fff;padding:5px 12px;border-radius:8px;text-decoration:none;font-size:11px;font-weight:bold;">▶ YouTube</a><a href="${SOCIAL_LINKS.facebook}" style="background:#1877F2;color:#fff;padding:5px 12px;border-radius:8px;text-decoration:none;font-size:11px;font-weight:bold;">f Facebook</a></div></div>`,
            from_name: "GAMER.Productions",
          });
        }
        setBlastDone(true);
      }
    } catch (e) {
      alert("Email failed: " + e.message);
    }
    setBlastSending(false);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = size.w; canvas.height = size.h;
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
    ...(admin ? [{ id: "email", icon: <Send className="w-3.5 h-3.5" />, label: "Email" }] : []),
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-3 py-4" style={{ background: "rgba(0,0,0,0.95)" }}>
      <div className="bg-gray-950 border border-purple-700/40 rounded-3xl w-full max-w-4xl max-h-[95vh] overflow-y-auto p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-white font-black text-xl flex items-center gap-2">
              <span className="text-purple-400">🎮</span>
              Design Card / Banner
            </h2>
            <p className="text-gray-500 text-xs mt-0.5">Controller logo + social icons auto-added · glowing brand theme</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-gray-800 hover:bg-gray-700 flex items-center justify-center">
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        <div className="grid lg:grid-cols-2 gap-5">
          {/* LEFT: Controls */}
          <div className="space-y-4">
            {/* Tabs */}
            <div className="flex gap-1 bg-gray-900 rounded-xl p-1 flex-wrap">
              {tabs.map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-1 py-2 rounded-lg text-xs font-bold transition-all min-w-[60px] ${activeTab === tab.id ? "bg-purple-600 text-white" : "text-gray-400 hover:text-white"}`}>
                  {tab.icon} {tab.label}
                </button>
              ))}
            </div>

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

            {activeTab === "email" && admin && (
              <div className="space-y-3">
                <p className="text-white font-black text-sm">📧 Email Blast</p>
                <p className="text-gray-500 text-xs">Send this card's content as a branded HTML email</p>

                {/* Social links info */}
                <div className="p-3 rounded-xl bg-gray-900 border border-gray-800 space-y-1.5">
                  <p className="text-gray-400 text-[10px] font-bold uppercase">Socials auto-included in email:</p>
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded bg-red-600 flex items-center justify-center text-[10px] text-white font-bold">▶</span>
                    <span className="text-gray-400 text-xs">youtube.com/@registeredgamerproductions</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded bg-blue-600 flex items-center justify-center text-[10px] text-white font-bold">f</span>
                    <span className="text-gray-400 text-xs">facebook.com/share/1D9ey9w8Rw</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button onClick={() => setBlastType("single")}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${blastType === "single" ? "bg-purple-600 border-purple-500 text-white" : "bg-gray-900 border-gray-700 text-gray-400"}`}>
                    Single User
                  </button>
                  <button onClick={() => setBlastType("all")}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${blastType === "all" ? "bg-orange-600 border-orange-500 text-white" : "bg-gray-900 border-gray-700 text-gray-400"}`}>
                    <Users className="w-3 h-3 inline mr-1" /> All Users
                  </button>
                </div>

                {blastType === "single" && (
                  <input value={blastEmail} onChange={e => setBlastEmail(e.target.value)} placeholder="user@email.com"
                    className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500" />
                )}

                {blastType === "all" && (
                  <div className="p-3 rounded-xl bg-orange-950/30 border border-orange-700/40">
                    <p className="text-orange-300 text-xs font-bold">⚠️ This will email ALL registered users (up to 200). Only do this for important announcements.</p>
                  </div>
                )}

                {blastDone ? (
                  <div className="p-3 rounded-xl bg-green-950/40 border border-green-700/40 text-green-400 text-sm font-bold text-center">✅ Email sent successfully!</div>
                ) : (
                  <button onClick={handleEmailBlast} disabled={blastSending || (blastType === "single" && !blastEmail.trim())}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl font-black text-white text-sm disabled:opacity-50 transition-all"
                    style={{ background: "linear-gradient(135deg,#7c3aed,#ec4899)" }}>
                    <Send className="w-4 h-4" />
                    {blastSending ? "Sending..." : blastType === "all" ? "Send to All Users" : "Send Email"}
                  </button>
                )}
              </div>
            )}

            <button onClick={handleDownload} disabled={rendering}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl font-black text-white text-sm transition-all hover:scale-[1.02] disabled:opacity-60"
              style={{ background: "linear-gradient(135deg,#7c3aed,#ec4899)" }}>
              <Download className="w-4 h-4" />
              {rendering ? "Rendering..." : "Download PNG"}
            </button>
          </div>

          {/* RIGHT: Preview */}
          <div className="flex flex-col items-center gap-3">
            <p className="text-gray-500 text-xs">Live Preview</p>
            <div style={{ width: previewW, height: previewH, overflow: "hidden", borderRadius: 12, border: "2px solid rgba(167,85,247,0.3)", flexShrink: 0 }}>
              <canvas ref={canvasRef}
                style={{ width: size.w, height: size.h, transformOrigin: "top left", transform: `scale(${previewScale})`, display: "block" }} />
            </div>
            <p className="text-gray-600 text-[10px]">{size.w}×{size.h}px · {THEMES.find(t=>t.id===themeId)?.label} · {LAYOUTS.find(l=>l.id===layoutId)?.label}</p>

            {/* Socials info */}
            <div className="flex items-center gap-4 mt-1">
              <a href={SOCIAL_LINKS.youtube} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-900/30 border border-red-700/40 text-red-400 text-xs font-bold hover:bg-red-900/50 transition-all">
                ▶ YouTube
              </a>
              <a href={SOCIAL_LINKS.facebook} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-900/30 border border-blue-700/40 text-blue-400 text-xs font-bold hover:bg-blue-900/50 transition-all">
                f Facebook
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
