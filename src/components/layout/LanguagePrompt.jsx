import React from "react";
import { Globe, X, Check } from "lucide-react";
import { useLanguage } from "@/lib/LanguageContext";
import { getLanguageByCode } from "@/lib/languages";

export default function LanguagePrompt() {
  const { showLangPrompt, suggestedLang, setLanguage, dismissPrompt } = useLanguage();
  if (!showLangPrompt || !suggestedLang) return null;

  const lang = getLanguageByCode(suggestedLang);

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[300] w-full max-w-sm px-4">
      <div className="bg-gray-900 border border-purple-600/50 rounded-2xl shadow-2xl shadow-purple-900/40 p-4 flex items-start gap-3"
        style={{ backdropFilter: "blur(12px)" }}>
        <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-600/40 flex items-center justify-center flex-shrink-0">
          <Globe className="w-5 h-5 text-purple-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white text-sm font-bold">We detected your region</p>
          <p className="text-gray-400 text-xs mt-0.5">
            Switch to <span className="text-purple-300 font-semibold">{lang.native} ({lang.name})</span> for a better experience?
          </p>
          <div className="flex gap-2 mt-3">
            <button
              onClick={() => setLanguage(suggestedLang)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-lg transition-colors"
            >
              <Check className="w-3 h-3" /> Yes, switch
            </button>
            <button
              onClick={dismissPrompt}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-semibold rounded-lg transition-colors"
            >
              Keep English
            </button>
          </div>
        </div>
        <button onClick={dismissPrompt} className="text-gray-600 hover:text-gray-400 flex-shrink-0">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}