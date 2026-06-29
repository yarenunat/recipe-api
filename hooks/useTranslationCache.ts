import { useState, useEffect } from "react";

/**
 * A React hook that bulk-translates an array of short strings and heavily caches the results in localStorage.
 * 
 * @param strings Array of original strings to translate.
 * @param locale The target locale (e.g., 'en', 'tr')
 * @returns Array of translated strings matching the order of the input array.
 */
export function useTranslationCache(strings: string[], locale: string) {
  const [translations, setTranslations] = useState<string[]>(strings);

  useEffect(() => {
    if (!strings || strings.length === 0 || !locale) {
      setTranslations([]);
      return;
    }

    const languageNames: Record<string, string> = {
      tr: "Turkish",
      en: "English",
      es: "Spanish",
      zh: "Chinese (Simplified)",
      hi: "Hindi",
    };
    const targetLanguage = languageNames[locale] || "Turkish";

    const fetchTranslations = async () => {
      // Step 1: Check localStorage for existing translations
      const newTranslations = [...strings];
      const missingStrings: { original: string; index: number }[] = [];

      strings.forEach((str, index) => {
        if (!str) return;
        const cacheKey = `trans_${locale}_${str}`;
        const cached = localStorage.getItem(cacheKey);
        
        if (cached) {
          newTranslations[index] = cached;
        } else {
          missingStrings.push({ original: str, index });
        }
      });

      // Update state immediately with cached ones
      setTranslations([...newTranslations]);

      // Step 2: Fetch any missing translations from the API
      if (missingStrings.length > 0) {
        try {
          const res = await fetch("/api/translate/bulk", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              strings: missingStrings.map(m => m.original),
              targetLanguage,
            }),
          });

          if (res.ok) {
            const data = await res.json();
            if (data.translations && Array.isArray(data.translations)) {
              data.translations.forEach((translatedStr: string, i: number) => {
                const mapInfo = missingStrings[i];
                newTranslations[mapInfo.index] = translatedStr;
                
                // Cache it
                const cacheKey = `trans_${locale}_${mapInfo.original}`;
                localStorage.setItem(cacheKey, translatedStr);
              });

              // Final update
              setTranslations([...newTranslations]);
            }
          }
        } catch (error) {
          console.error("Failed to fetch bulk translations:", error);
        }
      }
    };

    fetchTranslations();
  }, [JSON.stringify(strings), locale]);

  return translations;
}
