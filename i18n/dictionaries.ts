import 'server-only';

const dictionaries = {
  tr: () => import('./dictionaries/tr.json').then((module) => module.default),
  en: () => import('./dictionaries/en.json').then((module) => module.default),
  zh: () => import('./dictionaries/zh.json').then((module) => module.default),
  hi: () => import('./dictionaries/hi.json').then((module) => module.default),
  es: () => import('./dictionaries/es.json').then((module) => module.default),
};

export const getDictionary = async (locale: string) => {
  const load = dictionaries[locale as keyof typeof dictionaries];
  if (!load) return dictionaries['tr'](); // Fallback to Turkish
  return load();
};
