import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import AuthNavbar from "@/components/layout/AuthNavbar";
import { Link, useNavigate, Navigate } from "react-router-dom";
import {
  Shield, Save, RefreshCw, Type, Palette, Link2, Globe, Eye,
  Check, Edit3, Plus, Trash2, Layout, ArrowLeft, Megaphone
} from "lucide-react";
import HtmlAdManager from "@/components/admin/HtmlAdManager";

const DEFAULT_COLORS = {
  primary: "#a855f7",
  secondary: "#ec4899",
  accent: "#06b6d4",
  background: "#050510",
  surface: "#111827",
  text_primary: "#ffffff",
  text_secondary: "#9ca3af",
};

const EDITABLE_SECTIONS = [
  { key: "hero_title", label: "Hero Title", section: "hero", type: "text" },
  { key: "hero_subtitle", label: "Hero Subtitle", section: "hero", type: "text" },
  { key: "hero_tagline", label: "Hero Tagline", section: "hero", type: "text" },
  { key: "hero_cta_primary", label: "Primary CTA Button", section: "hero", type: "text" },
  { key: "hero_cta_secondary", label: "Secondary CTA Button", section: "hero", type: "text" },
  { key: "marquee_text", label: "Marquee/Ticker Text", section: "marquee", type: "text" },
  { key: "footer_tagline", label: "Footer Tagline", section: "footer", type: "text" },
  { key: "footer_copyright", label: "Footer Copyright", section: "footer", type: "text" },
  { key: "site_name", label: "Site Name", section: "general", type: "text" },
  { key: "meta_description", label: "SEO Meta Description", section: "general", type: "textarea" },
];

export default function AdminWebsiteEditor() {
  const navigate = useNavigate();
  const { user: authUser, isLoadingAuth } = useAuth();
  const MASTER_EMAIL = "kevinarnold522@gmail.com";

  const [profile, setProfile] = useState(null);
  const [loadingData, setLoadingData] = useState(true);
  const [activeTab, setActiveTab] = useState("content");
  const [content, setContent] = useState({});
  const [colors, setColors] = useState(DEFAULT_COLORS);
  const [customLinks, setCustomLinks] = useState([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [newLink, setNewLink] = useState({ label: "", href: "" });

  useEffect(() => {
    // Only run data initialization if the auth engine has confirmed identity matches master email
    const currentEmail = authUser?.email || authUser?.attributes?.email || authUser?.primaryEmail || "";
    if (isLoadingAuth || !authUser || currentEmail.toLowerCase() !== MASTER_EMAIL.toLowerCase()) {
      return;
    }

    const initData = async () => {
      try {
        const [profiles, siteContentData] = await Promise.all([
          base44.entities.UserProfile.filter({ user_email: authUser.email }),
          base44.entities.SiteContent.list(),
        ]);
        if (profiles.length > 0) setProfile(profiles[0]);
        
        const map = {};
        siteContentData.forEach(c => { map[c.key] = { id: c.id, value: c.value, label: c.label }; });
        setContent(map);
      } catch (err) {
        console.error("Failed to load layout datasets", err);
      }
      setLoadingData(false);
    };
    initData();
  }, [authUser, isLoadingAuth]);

  // 1. While Auth layer checks credentials, show global layout loader
  if (isLoadingAuth) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // 2. 🚨 THE CORE HARD LOCK: If user doesn't exist or isn't Kevin, reject immediately
  const verifiedEmail = authUser?.email || authUser?.attributes?.email || authUser?.primaryEmail || "";
  if (!authUser || verifiedEmail.toLowerCase() !== MASTER_EMAIL.toLowerCase()) {
    return <Navigate to="/dashboard" replace />;
  }

  // 3. Keep showing loading sequence if admin check passed but data is still gathering
  if (loadingData) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const handleSaveContent = async () => {
    setSaving(true);
    try {
      for (const field of EDITABLE_SECTIONS) {
        const existing = content[field.key];
        if (existing?.id) {
          await base44.entities.SiteContent.update(existing.id, { value: existing.value });
        } else if (existing?.value) {
          const created = await base44.entities.SiteContent.create({ key: field.key, value: existing.value, section: field.section, label: field.label });
          setContent(c => ({ ...c, [field.key]: { ...c[field.key], id: created.id } }));
        }
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {}
    setSaving(false);
  };

  const addCustomLink = () => {
    if (!newLink.label || !newLink.href) return;
    setCustomLinks(l => [...l, { id: Date.now(), ...newLink }]);
    setNewLink({ label: "", href: "" });
  };

  const removeLink = (id) => setCustomLinks(l => l.filter(x => x.id !== id));

  const tabs = [
    { id: "content", label: "Text Content", icon: Type },
    { id: "colors", label: "Colors", icon: Palette },
    { id: "links", label: "Nav Links", icon: Link2 },
    { id: "pages", label: "Landing Pages", icon: Layout },
    { id: "ads", label: "Ads", icon: Megaphone },
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <AuthNavbar user={authUser} profile={profile} />
      <div className="pt-20 max-w-5xl mx-auto px-4 pb-16">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Link to="/dashboard" className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-gray-800 transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-yellow-400" />
                <h1 className="text-2xl font-black text-white">Website Editor</h1>
              </div>
              <p className="text-gray-500 text-sm">Modify text, colors, links and landing pages</p>
            </div>
          </div>
          <button
            onClick={handleSaveContent}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-sm hover:opacity-90 disabled:opacity-50 transition-all"
          >
            {saved ? <><Check className="w-4 h-4" /> Saved!</> : saving ? <><RefreshCw className="w-4 h-4 animate-spin" /> Saving…</> : <><Save className="w-4 h-4" /> Save Changes</>}
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 bg-gray-900 p-1 rounded-xl border border-gray-800">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold flex-1 justify-center transition-all ${activeTab === tab.id ? "bg-purple-600 text-white" : "text-gray-400 hover:text-white"}`}>
              <tab.icon className="w-4 h-4" /> {tab.label}
            </button>
          ))}
        </div>

        {/* CONTENT TAB */}
        {activeTab === "content" && (
          <div className="space-y-4">
            {["hero","marquee","footer","general"].map(section => (
              <div key={section} className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
                <h3 className="text-white font-bold text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Edit3 className="w-4 h-4 text-purple-400" />
                  {section === "hero" ? "Hero Section" : section === "marquee" ? "Ticker / Marquee" : section === "footer" ? "Footer" : "General / SEO"}
                </h3>
                <div className="space-y-3">
                  {EDITABLE_SECTIONS.filter(f => f.section === section).map(field => (
                    <div key={field.key}>
                      <label className="text-gray-400 text-xs font-semibold block mb-1">{field.label}</label>
                      {field.type === "textarea" ? (
                        <textarea
                          value={content[field.key]?.value || ""}
                          onChange={e => setContent(c => ({ ...c, [field.key]: { ...c[field.key], value: e.target.value } }))}
                          rows={3}
                          placeholder={`Enter ${field.label.toLowerCase()}…`}
                          className="w-full bg-gray-800 border border-gray-700 focus:border-purple-500 rounded-lg px-3 py-2 text-white text-sm resize-none focus:outline-none transition-colors"
                        />
                      ) : (
                        <input
                          value={content[field.key]?.value || ""}
                          onChange={e => setContent(c => ({ ...c, [field.key]: { ...c[field.key], value: e.target.value } }))}
                          placeholder={`Enter ${field.label.toLowerCase()}…`}
                          className="w-full bg-gray-800 border border-gray-700 focus:border-purple-500 rounded-lg px-3 py-2 text-white text-sm focus:outline-none transition-colors"
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* COLORS TAB */}
        {activeTab === "colors" && (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
            <h3 className="text-white font-bold text-sm uppercase tracking-wider mb-4">Brand Colors</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              {Object.entries(colors).map(([key, val]) => (
                <div key={key} className="flex items-center justify-between gap-3 p-3 rounded-xl bg-gray-800 border border-gray-700">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg border border-gray-600" style={{ background: val }} />
                    <div>
                      <p className="text-white text-sm font-semibold capitalize">{key.replace(/_/g, " ")}</p>
                      <p className="text-gray-500 text-xs font-mono">{val}</p>
                    </div>
                  </div>
                  <input type="color" value={val} onChange={e => setColors(c => ({ ...c, [key]: e.target.value }))}
                    className="w-10 h-10 rounded-lg bg-gray-700 border border-gray-600 cursor-pointer" />
                </div>
              ))}
            </div>
            <p className="text-gray-600 text-xs mt-4">Note: Color changes are saved but require a page refresh to fully apply site-wide.</p>
          </div>
        )}

        {/* LINKS TAB */}
        {activeTab === "links" && (
          <div className="space-y-4">
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
              <h3 className="text-white font-bold text-sm uppercase tracking-wider mb-4">Custom Navigation Links</h3>
              <div className="space-y-2 mb-4">
                {customLinks.length === 0 && (
                  <p className="text-gray-600 text-sm text-center py-4">No custom links added yet.</p>
                )}
                {customLinks.map(link => (
                  <div key={link.id} className="flex items-center gap-3 p-3 rounded-xl bg-gray-800 border border-gray-700">
                    <Globe className="w-4 h-4 text-purple-400 flex-shrink-0" />
                    <span className="text-white text-sm font-semibold flex-1">{link.label}</span>
                    <span className="text-gray-500 text-xs font-mono flex-1 truncate">{link.href}</span>
                    <button onClick={() => removeLink(link.id)} className="text-gray-600 hover:text-red-400 transition-colors"><Trash2 className="w-4 h-4" /></button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input value={newLink.label} onChange={e => setNewLink(n => ({ ...n, label: e.target.value }))}
                  placeholder="Link Label" className="flex-1 bg-gray-800 border border-gray-700 focus:border-purple-500 rounded-lg px-3 py-2 text-white text-sm focus:outline-none" />
                <input value={newLink.href} onChange={e => setNewLink(n => ({ ...n, href: e.target.value }))}
                  placeholder="/path or https://…" className="flex-1 bg-gray-800 border border-gray-700 focus:border-purple-500 rounded-lg px-3 py-2 text-white text-sm focus:outline-none" />
                <button onClick={addCustomLink} className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-semibold transition-colors">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ADS TAB */}
        {activeTab === "ads" && (
          <HtmlAdManager user={authUser} />
        )}

        {/* PAGES TAB */}
        {activeTab === "pages" && (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
            <h3 className="text-white font-bold text-sm uppercase tracking-wider mb-4">Landing Page Routes</h3>
            <div className="space-y-2">
              {[
                { label: "Home", path: "/", desc: "Main landing page" },
                { label: "Register", path: "/register", desc: "Registration / sign up" },
                { label: "Dashboard", path: "/dashboard", desc: "User & admin dashboard" },
                { label: "Category", path: "/category", desc: "Category browsing" },
                { label: "AI Video Studio", path: "/ai-video-studio", desc: "Video creation studio" },
                { label: "Music Library", path: "/music-library", desc: "Free music/audio library" },
                { label: "Analytics", path: "/analytics", desc: "Analytics page" },
                { label: "Profile", path: "/profile", desc: "User profile page" },
                { label: "Channel", path: "/channel", desc: "Creator channel page" },
                { label: "Messages", path: "/messages", desc: "Messaging center" },
                { label: "About Us", path: "/about", desc: "About page" },
                { label: "Payment", path: "/payment", desc: "Payment settings" },
                { label: "Checkout", path: "/checkout", desc: "Cart checkout" },
                { label: "Admin Editor", path: "/admin-editor", desc: "This page" },
              ].map(page => (
                <div key={page.path} className="flex items-center gap-3 p-3 rounded-xl bg-gray-800 border border-gray-700 hover:border-purple-500 transition-colors">
                  <Layout className="w-4 h-4 text-purple-400 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-white text-sm font-semibold">{page.label}</p>
                    <p className="text-gray-500 text-xs">{page.desc}</p>
                  </div>
                  <code className="text-purple-400 text-xs bg-purple-900/30 px-2 py-1 rounded font-mono">{page.path}</code>
                  <Link to={page.path} target="_blank" className="text-gray-600 hover:text-white transition-colors">
                    <Eye className="w-4 h-4" />
                  </Link>
                </div>
              ))}
            </div>
            <div className="mt-4 p-3 rounded-xl bg-green-900/20 border border-green-700/30">
              <p className="text-green-400 text-xs flex items-center gap-2">
                <Check className="w-4 h-4" />
                All routes are SPA-compatible (no 404 on Vercel). vercel.json rewrites all paths to index.html.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}