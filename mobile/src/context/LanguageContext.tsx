import React, { createContext, useContext, useEffect, useState } from "react";
import {
  LANGUAGES,
  getLang,
  type LangCode,
  type LangMeta,
} from "../lib/lexicon";
import { getAppSetting, setAppSetting } from "../services/database";

type LanguageContextType = {
  lang: LangCode;
  setLang: (code: LangCode) => void;
  meta: LangMeta;
  languages: LangMeta[];
};

const LanguageContext = createContext<LanguageContextType>({
  lang: "sat",
  setLang: () => {},
  meta: LANGUAGES[0]!,
  languages: LANGUAGES,
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [lang, setLangState] = useState<LangCode>("sat");

  useEffect(() => {
    try {
      const savedLang = getAppSetting("active_language", "sat") as LangCode;
      if (savedLang && (savedLang === "sat" || savedLang === "hoc" || savedLang === "unr")) {
        setLangState(savedLang);
      }
    } catch (e) {
      console.warn("Language loading error:", e);
    }
  }, []);

  const setLang = (code: LangCode) => {
    setLangState(code);
    try {
      setAppSetting("active_language", code);
    } catch (e) {
      console.warn("Language saving error:", e);
    }
  };

  const meta = getLang(lang);

  return (
    <LanguageContext.Provider value={{ lang, setLang, meta, languages: LANGUAGES }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
