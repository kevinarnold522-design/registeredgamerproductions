import React, { useState, useRef, useEffect } from "react";
import { Globe, Search, Check, X } from "lucide-react";
import { LANGUAGES } from "@/lib/languages";
import { useLanguage } from "@/lib/LanguageContext";

// Priority languages shown at top
const PRIORITY_LANGS = ["en","zh-TW","zh-CN","ar","es","fr","de","ja","ko","pt","ru","hi","fil","vi","th","id","ms","fa","he","ur","tr","it","nl","pl"];

export default function LanguageSelector() {
  const { language, setLanguage } = useLanguage();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef(null);

  const currentLang = LANGUAGES.find(l => l.code === language) || LANGUAGES[0];

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const priorityLangs = PRIORITY_LANGS.map(c => LANGUAGES.find(l => l.code === c)).filter(Boolean);
  const otherLangs = LANGUAGES.filter(l => !PRIORITY_LANGS.includes(l.code));

  const filtered = search
    ? LANGUAGES.filter(l => l.name.toLowerCase().includes(search.toLowerCase()) || l.native.toLowerCase().includes(search.toLowerCase()) || l.code.toLowerCase().includes(search.toLowerCase()))
    : null;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1.5 px-2.5 py-2 rounded-xl bg-gray-900/60 border border-gray-800 hover:border-purple-700/40 text-gray-400 hover:text-purple-300 transition-all text-sm font-medium"
        title="Change language"
      >
        <Globe className="w-4 h-4" />
        <span className="hidden sm:block text-xs font-bold">{currentLang.native.slice(0, 8)}</span>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-72 bg-gray-950 border border-purple-900/40 rounded-2xl shadow-2xl shadow-purple-900/30 z-[200] overflow-hidden">
          {/* Header */}
          <div className="p-3 border-b border-gray-800">
            <p className="text-white font-bold text-sm mb-2 flex items-center gap-2">
              <Globe className="w-4 h-4 text-purple-400" /> Choose Language
            </p>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search 200+ languages..."
                className="w-full bg-gray-900 border border-gray-700 rounded-lg pl-8 pr-3 py-2 text-white text-xs placeholder-gray-500 focus:outline-none focus:border-purple-500"
              />
              {search && (
                <button onClick={() => setSearch("")} className="absolute right-2 top-1/2 -translate-y-1/2">
                  <X className="w-3 h-3 text-gray-500 hover:text-white" />
                </button>
              )}
            </div>
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto">
            {(filtered || [...priorityLangs, ...otherLangs]).map((lang) => (
              <button
                key={lang.code}
                onClick={() => { setLanguage(lang.code); setOpen(false); setSearch(""); }}
                className={`w-full flex items-center justify-between px-4 py-2.5 text-left hover:bg-purple-900/20 transition-colors ${language === lang.code ? "bg-purple-900/30" : ""}`}
              >
                <div>
                  <span className={`text-sm font-semibold ${language === lang.code ? "text-purple-300" : "text-white"}`}>{lang.native}</span>
                  <span className="text-gray-500 text-xs ml-2">{lang.name}</span>
                </div>
                {language === lang.code && <Check className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />}
              </button>
            ))}
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-gray-800 text-center">
            <p className="text-gray-600 text-[10px]">{LANGUAGES.length} languages available</p>
          </div>
        </div>
      )}
    </div>
  );
}