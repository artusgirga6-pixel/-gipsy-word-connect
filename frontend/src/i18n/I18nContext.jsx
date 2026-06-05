import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { TRANSLATIONS, format, LANGUAGES } from "./translations";

const STORAGE_KEY = "romword_lang";
const DEFAULT_LANG = "rmn";

const I18nContext = createContext({
  lang: DEFAULT_LANG,
  setLang: () => {},
  t: (k) => k,
});

export function I18nProvider({ children }) {
  const [lang, setLangState] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && TRANSLATIONS[saved]) return saved;
    } catch {}
    return DEFAULT_LANG;
  });

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, lang); } catch {}
    if (typeof document !== "undefined") {
      document.documentElement.lang = lang;
    }
  }, [lang]);

  const t = useCallback(
    (key, params) => {
      const dict = TRANSLATIONS[lang] || TRANSLATIONS[DEFAULT_LANG];
      const raw = dict[key] ?? TRANSLATIONS[DEFAULT_LANG][key] ?? key;
      return params ? format(raw, params) : raw;
    },
    [lang]
  );

  const setLang = useCallback((code) => {
    if (TRANSLATIONS[code]) setLangState(code);
  }, []);

  return (
    <I18nContext.Provider value={{ lang, setLang, t, languages: LANGUAGES }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}
