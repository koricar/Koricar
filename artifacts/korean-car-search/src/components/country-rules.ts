export type CountryCode = "SA" | "AE" | "KW" | "QA" | "BH" | "OM" | "IQ" | "LY" | "YE" | "EG" | "MA";

export const COUNTRY_RULES: Record<CountryCode, { minYear: number; label: string; flag: string }> = {
  SA: { minYear: 2010, label: "السعودية", flag: "🇸🇦" },
  AE: { minYear: 2010, label: "الإمارات", flag: "🇦🇪" },
  KW: { minYear: 2008, label: "الكويت",   flag: "🇰🇼" },
  QA: { minYear: 2010, label: "قطر",      flag: "🇶🇦" },
  BH: { minYear: 2008, label: "البحرين",  flag: "🇧🇭" },
  OM: { minYear: 2008, label: "عُمان",    flag: "🇴🇲" },
  IQ: { minYear: 2005, label: "العراق",   flag: "🇮🇶" },
  LY: { minYear: 2005, label: "ليبيا",    flag: "🇱🇾" },
  YE: { minYear: 2005, label: "اليمن",    flag: "🇾🇪" },
  EG: { minYear: 2008, label: "مصر",      flag: "🇪🇬" },
  MA: { minYear: 2008, label: "المغرب",   flag: "🇲🇦" },
};
