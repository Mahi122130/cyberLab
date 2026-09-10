"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

import {
  Language,
  translations,
} from "./translations";

type I18nContextType = {
  language: Language;
  setLanguage: (language: Language) => void;
  t: typeof translations.en;
};

const I18nContext =
  createContext<I18nContextType | undefined>(
    undefined,
  );

export function I18nProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [language, setLanguageState] =
    useState<Language>("en");

  useEffect(() => {
    const savedLanguage =
      localStorage.getItem(
        "cyberlab_language",
      ) as Language | null;

    if (
      savedLanguage === "en" ||
      savedLanguage === "am"
    ) {
      setLanguageState(savedLanguage);
    }
  }, []);

  function setLanguage(language: Language) {
    setLanguageState(language);

    localStorage.setItem(
      "cyberlab_language",
      language,
    );

    document.documentElement.lang =
      language === "am" ? "am" : "en";
  }

  return (
    <I18nContext.Provider
      value={{
        language,
        setLanguage,
        t: translations[language],
      }}
    >
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);

  if (!context) {
    throw new Error(
      "useI18n must be used inside I18nProvider",
    );
  }

  return context;
}