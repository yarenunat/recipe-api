'use client';

import React, { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Globe } from 'lucide-react';

const languages = [
  { code: 'tr', name: 'Türkçe', flag: 'tr' },
  { code: 'en', name: 'English', flag: 'gb' },
  { code: 'zh', name: '中文', flag: 'cn' },
  { code: 'hi', name: 'हिन्दी', flag: 'in' },
  { code: 'es', name: 'Español', flag: 'es' },
];

export default function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname(); // e.g. /tr/health
  const [isOpen, setIsOpen] = useState(false);

  // Determine current locale from pathname
  const currentLocale = pathname.split('/')[1] || 'tr';
  const currentLang = languages.find(l => l.code === currentLocale) || languages[0];

  const changeLanguage = (code: string) => {
    setIsOpen(false);
    if (code === currentLocale) return;

    // Split pathname into segments and replace the locale segment safely
    const segments = pathname.split('/');
    if (languages.some(lang => lang.code === segments[1])) {
      segments[1] = code;
    } else {
      segments.splice(1, 0, code);
    }
    const newPathname = segments.join('/');
    router.push(newPathname);
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm relative cursor-pointer hover:bg-slate-50 transition-colors border border-slate-100"
      >
        <Globe size={20} className="text-slate-400" />
        <span className="absolute bottom-0 right-0 bg-white rounded-full p-0.5 shadow-sm border border-slate-100">
          <img src={`https://flagcdn.com/w20/${currentLang.flag}.png`} alt={currentLang.code} className="w-4 h-3 rounded-[1px] object-cover" />
        </span>
      </button>

      {isOpen && (
        <div className="absolute top-[120%] right-0 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-50 w-40">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => changeLanguage(lang.code)}
              className={`w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-slate-50 transition-colors ${
                currentLocale === lang.code ? 'bg-slate-50 text-[var(--primary)] font-bold' : 'text-slate-600 font-medium'
              }`}
            >
              <img src={`https://flagcdn.com/w20/${lang.flag}.png`} alt={lang.name} className="w-5 h-4 object-cover rounded-sm shadow-sm" />
              <span className="text-sm">{lang.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
