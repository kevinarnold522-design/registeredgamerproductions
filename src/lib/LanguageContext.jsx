import React, { createContext, useContext, useState, useEffect } from "react";
import { COUNTRY_TO_LANG, getLanguageByCode } from "@/lib/languages";

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    // Check localStorage first
    return localStorage.getItem("gp_lang") || "en";
  });
  const [detectedCountry, setDetectedCountry] = useState(null);
  const [autoDetected, setAutoDetected] = useState(false);
  const [showLangPrompt, setShowLangPrompt] = useState(false);
  const [suggestedLang, setSuggestedLang] = useState(null);

  useEffect(() => {
    const savedLang = localStorage.getItem("gp_lang");
    const dismissed = localStorage.getItem("gp_lang_prompt_dismissed");
    if (savedLang || dismissed) return; // Already chosen or dismissed

    // Use the same-origin geo endpoint so Cloudflare/Vercel deploys behave the same
    // and mobile web is not blocked by third-party CORS failures.
    fetch("/functions/api/geo")
      .then((r) => {
        if (!r.ok) throw new Error(`Geo request failed: ${r.status}`);
        return r.json();
      })
      .then(data => {
        const country = data.countryCode || data.country || data.country_code;
        setDetectedCountry(country);
        const mappedLang = COUNTRY_TO_LANG[country];
        if (mappedLang && mappedLang !== "en") {
          setSuggestedLang(mappedLang);
          setShowLangPrompt(true);
        }
      })
      .catch(() => {}); // Silently fail
  }, []);

  const applyLanguage = (code) => {
    setLanguage(code);
    localStorage.setItem("gp_lang", code);
    setShowLangPrompt(false);
    // Apply RTL if needed
    const lang = getLanguageByCode(code);
    document.documentElement.dir = lang.rtl ? "rtl" : "ltr";
    document.documentElement.lang = code;
  };

  const dismissPrompt = () => {
    localStorage.setItem("gp_lang_prompt_dismissed", "1");
    setShowLangPrompt(false);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: applyLanguage, detectedCountry, showLangPrompt, suggestedLang, dismissPrompt }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) return { language: "en", setLanguage: () => {}, showLangPrompt: false };
  return ctx;
}