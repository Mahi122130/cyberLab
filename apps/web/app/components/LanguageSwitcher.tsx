"use client";

import { useEffect, useState } from "react";
import {
  Language,
  getTranslations,
} from "../../lib/i18n/i18n";

export default function LanguageSwitcher() {
  const [language, setLanguage] =
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
      setLanguage(savedLanguage);
    }
  }, []);

  function changeLanguage(
    newLanguage: Language,
  ) {
    setLanguage(newLanguage);

    localStorage.setItem(
      "cyberlab_language",
      newLanguage,
    );

    window.dispatchEvent(
      new Event("languagechange"),
    );
  }

  const t = getTranslations(language);

  return (
    <div className="flex items-center gap-1 rounded-md border border-white/[0.08] p-1 font-mono text-[10px]">
      <button
        type="button"
        onClick={() => changeLanguage("en")}
        className={`rounded px-2 py-1.5 transition ${
          language === "en"
            ? "bg-emerald-400 text-black"
            : "text-gray-500 hover:text-white"
        }`}
      >
        {t.english}
      </button>

      <button
        type="button"
        onClick={() => changeLanguage("am")}
        className={`rounded px-2 py-1.5 transition ${
          language === "am"
            ? "bg-emerald-400 text-black"
            : "text-gray-500 hover:text-white"
        }`}
      >
        {t.amharic}
      </button>
    </div>
  );
}