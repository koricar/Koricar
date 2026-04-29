import { useState, useEffect } from "react";
import type { SearchCarsParams } from "@workspace/api-client-react";
import { ChevronRight, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

// ── COUNTRY_RULES — مطلوب من car-card.tsx ──────────────
export type CountryCode = "SA" | "AE" | "KW" | "QA" | "BH" | "OM" | "IQ" | "LY" | "YE" | "EG" | "MA";

export const COUNTRY_RULES: Record<CountryCode, { minYear: number; label: string; flag: string }> = {
  SA: { minYear: 2010, label: "السعودية",    flag: "🇸🇦" },
  AE: { minYear: 2010, label: "الإمارات",    flag: "🇦🇪" },
  KW: { minYear: 2008, label: "الكويت",      flag: "🇰🇼" },
  QA: { minYear: 2010, label: "قطر",         flag: "🇶🇦" },
  BH: { minYear: 2008, label: "البحرين",     flag: "🇧🇭" },
  OM: { minYear: 2008, label: "عُمان",       flag: "🇴🇲" },
  IQ: { minYear: 2005, label: "العراق",      flag: "🇮🇶" },
  LY: { minYear: 2005, label: "ليبيا",       flag: "🇱🇾" },
  YE: { minYear: 2005, label: "اليمن",       flag: "🇾🇪" },
  EG: { minYear: 2008, label: "مصر",         flag: "🇪🇬" },
  MA: { minYear: 2008, label: "المغرب",      flag: "🇲🇦" },
};

// ── ترجمة الأسماء الكورية → إنجليزي مع السنوات (للعرض فقط) ──
const KR_TO_EN_LABEL: Record<string, string> = {
  // ── HYUNDAI ──────────────────────────────────────────
  "아반떼": "Elantra",
  "아반떼 HD": "Elantra HD (2006–2010)",
  "아반떼 MD": "Elantra MD (2010–2015)",
  "아반떼 AD": "Elantra AD (2015–2018)",
  "더 뉴 아반떼 AD": "The New Elantra AD (2018–2020)",
  "아반떼 (CN7)": "Elantra CN7 (2020–2023)",
  "더 뉴 아반떼 (CN7)": "The New Elantra CN7 (2023+)",
  "아반떼 하이브리드 (CN7)": "Elantra Hybrid CN7 (2020–2023)",
  "더 뉴 아반떼 하이브리드 (CN7)": "The New Elantra Hybrid CN7 (2023+)",
  "더 뉴 아반떼": "The New Elantra (2013–2015)",
  "아반떼 쿠페": "Elantra Coupe (2013–2015)",
  "아반떼 XD": "Elantra XD (2000–2006)",
  "뉴 아반떼 XD": "New Elantra XD (2003–2006)",
  "올 뉴 아반떼": "All New Elantra",
  "아반떼 하이브리드": "Elantra Hybrid",

  "쏘나타": "Sonata",
  "쏘나타 NF": "Sonata NF (2004–2009)",
  "쏘나타 YF": "Sonata YF (2009–2014)",
  "LF 쏘나타": "Sonata LF (2014–2019)",
  "쏘나타 (DN8)": "Sonata DN8 (2019–2023)",
  "더 뉴 쏘나타 (DN8)": "The New Sonata DN8 (2023+)",
  "쏘나타 하이브리드 (DN8)": "Sonata Hybrid DN8 (2020+)",

  "그랜저": "Grandeur",
  "그랜저 TG": "Grandeur TG (2005–2011)",
  "그랜저 HG": "Grandeur HG (2011–2016)",
  "그랜저 IG": "Grandeur IG (2016–2019)",
  "더 뉴 그랜저 IG": "The New Grandeur IG (2019–2022)",
  "그랜저 (GN7)": "Grandeur GN7 (2022+)",
  "그랜저 하이브리드 (GN7)": "Grandeur Hybrid GN7 (2022+)",

  "투싼": "Tucson",
  "투싼 (NX4)": "Tucson NX4 (2021+)",
  "더 뉴 투싼 TL": "The New Tucson TL (2018–2021)",

  "싼타페": "Santa Fe",
  "싼타페 (MX5)": "Santa Fe MX5 (2023+)",
  "더 뉴 싼타페": "The New Santa Fe (2020–2023)",
  "싼타페 TM": "Santa Fe TM (2018–2020)",

  "팰리세이드": "Palisade",
  "더 뉴 팰리세이드": "The New Palisade (2023+)",

  "코나": "Kona",
  "코나 (OS)": "Kona 1st Gen (2017–2023)",
  "코나 (SX2)": "Kona 2nd Gen (2023+)",

  "아이오닉": "Ioniq",
  "아이오닉 하이브리드": "Ioniq Hybrid",
  "아이오닉 일렉트릭": "Ioniq Electric",
  "아이오닉 플러그인 하이브리드": "Ioniq PHEV",
  "더 뉴 아이오닉 하이브리드": "The New Ioniq Hybrid",
  "아이오닉5": "Ioniq 5",
  "아이오닉 5": "Ioniq 5",
  "아이오닉5 N": "Ioniq 5 N",
  "아이오닉 5 N": "Ioniq 5 N",
  "더 뉴 아이오닉5": "The New Ioniq 5",
  "아이오닉6": "Ioniq 6",
  "아이오닉 6": "Ioniq 6",
  "아이오닉9": "Ioniq 9",
  "아이오닉 9": "Ioniq 9",

  "스타렉스": "Starex",
  "더 뉴 그랜드 스타렉스": "The New Grand Starex (2018–2021)",
  "스타리아": "Staria (2021+)",
  "스타리아 라운지": "Staria Lounge (2021+)",

  "캐스퍼": "Casper (2021+)",
  "캐스퍼 일렉트릭": "Casper Electric (2024+)",
  "넥쏘": "Nexo Hydrogen (2018+)",
  "베뉴": "Venue (2019+)",
  "벨로스터": "Veloster",
  "엑센트": "Accent",
  "포터": "Porter",
  "포터 2": "Porter 2",

  // ── KIA ──────────────────────────────────────────────
  "K3": "K3 / Cerato",
  "더 뉴 K3 2세대": "The New K3 2nd Gen",
  "K5": "K5 / Optima",
  "K5 3세대": "K5 3rd Gen (2019+)",
  "K5 하이브리드 3세대": "K5 Hybrid 3rd Gen",
  "더 뉴 K5 2세대": "The New K5 2nd Gen",
  "K7": "K7",
  "K8": "K8 (2021+)",
  "K8 하이브리드": "K8 Hybrid",
  "K9": "K9",
  "스팅어": "Stinger",
  "스포티지": "Sportage",
  "스포티지 5세대": "Sportage 5th Gen (2021+)",
  "스포티지 5세대 하이브리드": "Sportage 5th Hybrid",
  "스포티지 5세대 플러그인 하이브리드": "Sportage 5th PHEV",
  "쏘렌토": "Sorento",
  "쏘렌토 4세대": "Sorento 4th Gen (2020+)",
  "쏘렌토 하이브리드 4세대": "Sorento Hybrid 4th Gen",
  "쏘렌토 플러그인 하이브리드 4세대": "Sorento PHEV 4th Gen",
  "더 뉴 쏘렌토 4세대": "The New Sorento 4th Gen",
  "텔루라이드": "Telluride",
  "모하비": "Mohave",
  "더 뉴 모하비": "The New Mohave",
  "모하비 더 마스터": "Mohave The Master",
  "셀토스": "Seltos (2019+)",
  "더 뉴 셀토스": "The New Seltos",
  "니로": "Niro",
  "디 올 뉴 니로": "All New Niro (2022+)",
  "니로 하이브리드": "Niro Hybrid",
  "니로 EV": "Niro EV",
  "쏘울": "Soul",
  "카니발": "Carnival",
  "카니발 4세대": "Carnival 4th Gen (2020+)",
  "올 뉴 카니발": "All New Carnival",
  "더 뉴 카니발": "The New Carnival",
  "카니발 리무진": "Carnival Limousine",
  "모닝": "Morning / Picanto",
  "레이": "Ray",
  "EV3": "EV3 (2024+)",
  "EV4": "EV4",
  "EV5": "EV5",
  "EV6": "EV6 (2021+)",
  "EV6 GT": "EV6 GT",
  "EV9": "EV9 (2023+)",
  "프라이드": "Pride / Rio",
  "카렌스": "Carens",
  "스토닉": "Stonic",
  "타스만": "Tasman",
  "포르테": "Forte / Cerato",
  "오피러스": "Opirus",
  "로체": "Lotze",
  "PV5": "PV5",

  // ── GENESIS ──────────────────────────────────────────
  "G70": "G70",
  "더 뉴 G70": "The New G70",
  "G70 2세대": "G70 2nd Gen",
  "G80": "G80",
  "G80 (RG3)": "G80 RG3 (2020+)",
  "G80 전동화": "G80 Electrified",
  "G90": "G90",
  "G90 (RS4)": "G90 RS4 (2022+)",
  "EQ900": "EQ900",
  "GV60": "GV60 (2021+)",
  "GV60 스포츠 플러스": "GV60 Sport Plus",
  "GV70": "GV70 (2021+)",
  "GV70 전동화": "GV70 Electrified",
  "GV80": "GV80 (2020+)",
  "GV80 쿠페": "GV80 Coupe",
  "GV90": "GV90",

  // ── CHEVROLET / DAEWOO ───────────────────────────────
  "트레일블레이저": "Trailblazer",
  "더 뉴 트레일블레이저": "The New Trailblazer",
  "트랙스": "Trax",
  "트랙스 크로스오버": "Trax Crossover",
  "말리부": "Malibu",
  "스파크": "Spark",
  "이쿼녹스": "Equinox",
  "이쿼녹스 EV": "Equinox EV",
  "콜로라도": "Colorado",
  "트래버스": "Traverse",
  "타호": "Tahoe",
  "올란도": "Orlando",
  "캡티바": "Captiva",
  "블레이저 EV": "Blazer EV",
  "다마스": "Damas",
  "뉴 다마스": "New Damas",
  "라보": "Labo",
  "뉴 라보": "New Labo",
  "마티즈": "Matiz",
  "마티즈 크리에이티브": "Matiz Creative",
  "젠트라": "Gentra",
  "라세티": "Lacetti",
  "크루즈": "Cruze",
  "레조": "Rezzo",
  "윈스톰": "Winstorm",
  "알페온": "Alpheon",

  // ── SSANGYONG / KGM ──────────────────────────────────
  "렉스턴": "Rexton",
  "렉스턴 G4": "Rexton G4",
  "렉스턴 스포츠": "Rexton Sports",
  "렉스턴 스포츠 칸": "Rexton Sports Khan",
  "코란도": "Korando",
  "코란도 이모션": "Korando e-Motion",
  "티볼리": "Tivoli",
  "티볼리 에어": "Tivoli Air",
  "무쏘": "Musso",
  "토레스": "Torres (2022+)",
  "토레스 EVX": "Torres EVX",
  "액티언": "Actyon",
  "액티언 스포츠": "Actyon Sports",

  // ── RENAULT KOREA ─────────────────────────────────────
  "QM6": "QM6",
  "QM6 LPe": "QM6 LPe",
  "SM6": "SM6",
  "XM3": "XM3 / Arkana",
  "아르카나": "Arkana",
  "SM3": "SM3",
  "SM5": "SM5",
  "SM7": "SM7",
  "QM3": "QM3",
  "QM5": "QM5",
  "필랑트": "Philante",

  // ── BMW ──────────────────────────────────────────────
  "1시리즈": "1 Series",
  "1시리즈 (E87)": "1 Series E87 (2004–2011)",
  "1시리즈 (F20)": "1 Series F20 (2011–2019)",
  "1시리즈 (F40)": "1 Series F40 (2019+)",
  "2시리즈": "2 Series",
  "2시리즈 쿠페 (F22)": "2 Series Coupe F22",
  "2시리즈 그란쿠페 (F44)": "2 Series Gran Coupe F44",
  "2시리즈 액티브투어러 (F45)": "2 Series Active Tourer F45",
  "2시리즈 (G42)": "2 Series G42 (2021+)",
  "3시리즈": "3 Series",
  "3시리즈 (E90)": "3 Series E90 (2005–2012)",
  "3시리즈 (F30)": "3 Series F30 (2012–2018)",
  "3시리즈 (G20)": "3 Series G20 (2018+)",
  "4시리즈": "4 Series",
  "4시리즈 (F32)": "4 Series F32",
  "4시리즈 (F36)": "4 Series F36 Gran Coupe",
  "4시리즈 (G22)": "4 Series G22 (2020+)",
  "4시리즈 그란쿠페 (F36)": "4 Series Gran Coupe F36",
  "4시리즈 그란쿠페 (G26)": "4 Series Gran Coupe G26",
  "5시리즈": "5 Series",
  "5시리즈 (F10)": "5 Series F10 (2010–2017)",
  "5시리즈 (G30)": "5 Series G30 (2017–2023)",
  "5시리즈 (G60)": "5 Series G60 (2023+)",
  "6시리즈": "6 Series",
  "6시리즈 그란투리스모 (G32)": "6 Series Gran Turismo G32",
  "7시리즈": "7 Series",
  "7시리즈 (F01)": "7 Series F01 (2008–2015)",
  "7시리즈 (G11)": "7 Series G11 (2015–2022)",
  "7시리즈 (G70)": "7 Series G70 (2022+)",
  "8시리즈": "8 Series",
  "8시리즈 (G15)": "8 Series G15",
  "8시리즈 그란쿠페 (G16)": "8 Series Gran Coupe G16",
  "X1": "X1",
  "X1 (E84)": "X1 E84 (2009–2015)",
  "X1 (F48)": "X1 F48 (2015–2022)",
  "X1 (U11)": "X1 U11 (2022+)",
  "X2": "X2",
  "X2 (F39)": "X2 F39 (2017–2023)",
  "X2 (U10)": "X2 U10 (2023+)",
  "X3": "X3",
  "X3 (F25)": "X3 F25 (2010–2017)",
  "X3 (G01)": "X3 G01 (2017–2021)",
  "X3 (G45)": "X3 G45 (2024+)",
  "X4": "X4",
  "X4 (F26)": "X4 F26 (2014–2018)",
  "X4 (G02)": "X4 G02 (2018+)",
  "X5": "X5",
  "X5 (F15)": "X5 F15 (2013–2018)",
  "X5 (G05)": "X5 G05 (2018+)",
  "X6": "X6",
  "X6 (F16)": "X6 F16 (2014–2019)",
  "X6 (G06)": "X6 G06 (2019+)",
  "X7": "X7",
  "X7 (G07)": "X7 G07 (2018+)",
  "M2": "M2",
  "M2 (F87)": "M2 F87",
  "M2 (G87)": "M2 G87 (2022+)",
  "M3": "M3",
  "M3 (F80)": "M3 F80",
  "M3 (G80)": "M3 G80 (2020+)",
  "M4": "M4",
  "M4 (F82)": "M4 F82",
  "M4 (G82)": "M4 G82 (2020+)",
  "M5": "M5",
  "M5 (F90)": "M5 F90",
  "M5 (G90)": "M5 G90 (2024+)",
  "M8": "M8",
  "M8 (F92)": "M8 F92",
  "i3": "i3",
  "i4": "i4",
  "i4 (G26)": "i4 G26",
  "i5": "i5",
  "i5 (G60)": "i5 G60",
  "i7": "i7",
  "i7 (G70)": "i7 G70",
  "i8": "i8",
  "iX": "iX",
  "iX3": "iX3",
  "iX3 (G08)": "iX3 G08",
  "XM": "XM",
  "Z4": "Z4",
  "Z4 (G29)": "Z4 G29",

  // ── MERCEDES-BENZ ─────────────────────────────────────
  "A클래스": "A-Class",
  "A클래스 (W176)": "A-Class W176 (2012–2018)",
  "A클래스 (W177)": "A-Class W177 (2018+)",
  "B클래스": "B-Class",
  "C클래스": "C-Class",
  "C클래스 (W204)": "C-Class W204 (2007–2014)",
  "C클래스 (W205)": "C-Class W205 (2014–2021)",
  "C클래스 (W206)": "C-Class W206 (2021+)",
  "E클래스": "E-Class",
  "E클래스 (W212)": "E-Class W212 (2009–2016)",
  "E클래스 (W213)": "E-Class W213 (2016–2023)",
  "E클래스 (W214)": "E-Class W214 (2024+)",
  "S클래스": "S-Class",
  "S클래스 (W221)": "S-Class W221 (2005–2013)",
  "S클래스 (W222)": "S-Class W222 (2013–2020)",
  "S클래스 (W223)": "S-Class W223 (2020+)",
  "G클래스": "G-Class",
  "G클래스 (W463)": "G-Class W463",
  "CLA클래스": "CLA-Class",
  "CLA (C117)": "CLA C117 (2013–2019)",
  "CLA (C118)": "CLA C118 (2019+)",
  "CLS클래스": "CLS-Class",
  "CLS (C257)": "CLS C257 (2018+)",
  "CLE클래스": "CLE-Class",
  "GLA클래스": "GLA-Class",
  "GLA (X156)": "GLA X156 (2013–2019)",
  "GLA (H247)": "GLA H247 (2020+)",
  "GLB클래스": "GLB-Class",
  "GLC클래스": "GLC-Class",
  "GLC (X253)": "GLC X253 (2015–2022)",
  "GLC (X254)": "GLC X254 (2022+)",
  "GLC쿠페": "GLC Coupe",
  "GLC쿠페 (C253)": "GLC Coupe C253",
  "GLE클래스": "GLE-Class",
  "GLE (W166)": "GLE W166 (2015–2018)",
  "GLE (V167)": "GLE V167 (2019+)",
  "GLE쿠페": "GLE Coupe",
  "GLS클래스": "GLS-Class",
  "GLS (X166)": "GLS X166 (2012–2019)",
  "GLS (X167)": "GLS X167 (2019+)",
  "EQA": "EQA",
  "EQB": "EQB",
  "EQC": "EQC",
  "EQE": "EQE",
  "EQE SUV": "EQE SUV",
  "EQS": "EQS",
  "EQS SUV": "EQS SUV",
  "AMG GT": "AMG GT",
  "AMG GT (R190)": "AMG GT R190",
  "SL클래스": "SL-Class",
  "마이바흐 S클래스": "Maybach S-Class",
  "마이바흐 GLS": "Maybach GLS",

  // ── AUDI ──────────────────────────────────────────────
  "A1": "A1", "A3": "A3", "A4": "A4", "A5": "A5",
  "A6": "A6", "A7": "A7", "A8": "A8",
  "Q2": "Q2", "Q3": "Q3", "Q4 e-tron": "Q4 e-tron",
  "Q5": "Q5", "Q7": "Q7", "Q8": "Q8",
  "Q8 e-tron": "Q8 e-tron",
  "e-tron": "e-tron", "e-tron GT": "e-tron GT",
  "TT": "TT", "R8": "R8",
  "RS3": "RS3", "RS4": "RS4", "RS5": "RS5",
  "RS6": "RS6", "RS7": "RS7",
  "SQ5": "SQ5", "SQ7": "SQ7", "SQ8": "SQ8",
  "S3": "S3", "S4": "S4", "S5": "S5",
  "S6": "S6", "S7": "S7", "S8": "S8",

  // ── VOLKSWAGEN ────────────────────────────────────────
  "골프": "Golf",
  "골프 GTI": "Golf GTI",
  "골프 R": "Golf R",
  "티구안": "Tiguan",
  "티구안 올스페이스": "Tiguan Allspace",
  "파사트": "Passat",
  "파사트 CC": "Passat CC",
  "투아렉": "Touareg",
  "폴로": "Polo",
  "아테온": "Arteon",
  "ID.4": "ID.4",
  "ID.6": "ID.6",

  // ── VOLVO ─────────────────────────────────────────────
  "XC40": "XC40",
  "XC40 리차지": "XC40 Recharge",
  "XC60": "XC60",
  "XC90": "XC90",
  "XC90 리차지": "XC90 Recharge",
  "S60": "S60", "S90": "S90",
  "V60": "V60",
  "V60 크로스컨트리": "V60 Cross Country",
  "V90": "V90",
  "V90 크로스컨트리": "V90 Cross Country",
  "EX30": "EX30", "EX40": "EX40", "EX90": "EX90",
  "C40 리차지": "C40 Recharge",

  // ── TOYOTA ────────────────────────────────────────────
  "캠리": "Camry",
  "RAV4": "RAV4",
  "RAV4 하이브리드": "RAV4 Hybrid",
  "프리우스": "Prius",
  "시에나": "Sienna",
  "아발론": "Avalon",
  "알파드": "Alphard",
  "벨파이어": "Vellfire",
  "크라운 크로스오버": "Crown Crossover",
  "랜드크루저": "Land Cruiser",
  "랜드크루저 프라도": "Land Cruiser Prado",
  "하이랜더": "Highlander",
  "GR86": "GR86",
  "GR 수프라": "GR Supra",

  // ── LEXUS ─────────────────────────────────────────────
  "IS250": "IS250",
  "IS300h": "IS300h",
  "ES300h 7세대": "ES300h 7th Gen",
  "뉴 ES350": "New ES350",
  "RX350": "RX350",
  "RX450h 4세대": "RX450h 4th Gen",
  "NX300h": "NX300h",
  "NX350h 2세대": "NX350h 2nd Gen",
  "NX450h+ 2세대": "NX450h+ 2nd Gen",
  "LS500h 5세대": "LS500h 5th Gen",
  "LS460": "LS460",
  "UX250h": "UX250h",
  "CT200h": "CT200h",
  "LX600": "LX600",
  "LX570": "LX570",
  "LC500": "LC500",
  "LC500h": "LC500h",

  // ── PORSCHE ───────────────────────────────────────────
  "카이엔": "Cayenne",
  "카이엔 쿠페": "Cayenne Coupe",
  "마칸": "Macan",
  "마칸 EV": "Macan EV",
  "파나메라": "Panamera",
  "타이칸": "Taycan",
  "타이칸 크로스 투리스모": "Taycan Cross Turismo",
  "911": "911",
  "박스터": "Boxster",
  "케이맨": "Cayman",

  // ── LAND ROVER ────────────────────────────────────────
  "레인지로버": "Range Rover",
  "레인지로버 스포츠": "Range Rover Sport",
  "레인지로버 이보크": "Range Rover Evoque",
  "레인지로버 벨라": "Range Rover Velar",
  "디스커버리": "Discovery",
  "디스커버리 스포츠": "Discovery Sport",
  "디펜더": "Defender",

  // ── HONDA ─────────────────────────────────────────────
  "어코드": "Accord",
  "시빅": "Civic",
  "CR-V": "CR-V",
  "파일럿": "Pilot",
  "오딧세이": "Odyssey",
  "HR-V": "HR-V",

  // ── NISSAN ────────────────────────────────────────────
  "캐시카이": "Qashqai",
  "무라노": "Murano",
  "패트롤": "Patrol",
  "엑스트레일": "X-Trail",
  "쥬크": "Juke",
  "370Z": "370Z",
  "GT-R": "GT-R",

  // ── INFINITI ──────────────────────────────────────────
  "Q50": "Q50", "Q60": "Q60", "Q70": "Q70",
  "QX50": "QX50", "QX60": "QX60",
  "QX70": "QX70", "QX80": "QX80",

  // ── MINI ──────────────────────────────────────────────
  "미니쿠퍼": "Mini Cooper",
  "컨트리맨": "Countryman",
  "클럽맨": "Clubman",
  "페이스맨": "Paceman",
  "에이스맨": "Aceman",

  // ── FORD ──────────────────────────────────────────────
  "머스탱": "Mustang",
  "머스탱 마하-E": "Mustang Mach-E",
  "익스플로러": "Explorer",
  "F-150": "F-150",
  "브롱코": "Bronco",
  "엣지": "Edge",

  // ── JEEP ──────────────────────────────────────────────
  "랭글러": "Wrangler",
  "그랜드체로키": "Grand Cherokee",
  "컴패스": "Compass",
  "레니게이드": "Renegade",

  // ── LINCOLN ───────────────────────────────────────────
  "네비게이터": "Navigator",
  "에비에이터": "Aviator",
  "노틸러스": "Nautilus",
  "코르세어": "Corsair",
  "컨티넨탈": "Continental",

  // ── CADILLAC ──────────────────────────────────────────
  "에스컬레이드": "Escalade",
  "CT5": "CT5", "CT6": "CT6",
  "XT4": "XT4", "XT5": "XT5", "XT6": "XT6",
  "리릭": "Lyriq",

  // ── TESLA ─────────────────────────────────────────────
  "모델 S": "Model S",
  "모델 3": "Model 3",
  "모델 X": "Model X",
  "모델 Y": "Model Y",
  "사이버트럭": "Cybertruck",

  // ── MASERATI ──────────────────────────────────────────
  "기블리": "Ghibli",
  "레반떼": "Levante",
  "콰트로포르테": "Quattroporte",
  "그레칼레": "Grecale",
  "MC20": "MC20",

  // ── FERRARI ───────────────────────────────────────────
  "로마": "Roma",
  "SF90": "SF90",
  "488": "488",
  "296 GTB": "296 GTB",
  "포르토피노": "Portofino",

  // ── LAMBORGHINI ───────────────────────────────────────
  "우루스": "Urus",
  "우라칸": "Huracán",
  "아벤타도르": "Aventador",

  // ── BENTLEY ───────────────────────────────────────────
  "컨티넨탈 GT": "Continental GT",
  "벤테이가": "Bentayga",
  "플라잉 스퍼": "Flying Spur",

  // ── ROLLS-ROYCE ───────────────────────────────────────
  "팬텀": "Phantom",
  "고스트": "Ghost",
  "컬리넌": "Cullinan",
  "레이스": "Wraith",

  // ── MAZDA ─────────────────────────────────────────────
  "CX-5": "CX-5",
  "CX-8": "CX-8",
  "CX-60": "CX-60",
  "MX-5": "MX-5 Miata",
  "마쯔다 3": "Mazda3",

  // ── SUBARU ────────────────────────────────────────────
  "아웃백": "Outback",
  "포레스터": "Forester",
  "임프레자": "Impreza",
  "레거시": "Legacy",
  "크로스트렉": "Crosstrek",

  // ── ALFA ROMEO ────────────────────────────────────────
  "줄리아": "Giulia",
  "스텔비오": "Stelvio",
  "토날레": "Tonale",

  // ── MITSUBISHI ────────────────────────────────────────
  "아웃랜더": "Outlander",
  "이클립스 크로스": "Eclipse Cross",
  "파제로": "Pajero",
};

// دالة تحويل الاسم للعرض
function getDisplayLabel(krLabel: string): string {
  return KR_TO_EN_LABEL[krLabel] ?? krLabel;
}
interface FilterSidebarProps {
  filters: SearchCarsParams;
  updateFilter: <K extends keyof SearchCarsParams>(key: K, value: SearchCarsParams[K]) => void;
  resetFilters: () => void;
  className?: string;
}

const BRANDS = [
  { en: "Hyundai",       ar: "هيونداي" },
  { en: "Kia",           ar: "كيا" },
  { en: "Genesis",       ar: "جينيسيس" },
  { en: "SsangYong",     ar: "سانغ يونغ" },
  { en: "KG Mobility",   ar: "KG موبيليتي" },
  { en: "Renault Korea", ar: "رينو كوريا" },
  { en: "Chevrolet",     ar: "شيفروليه" },
  { en: "BMW",           ar: "BMW" },
  { en: "Mercedes-Benz", ar: "مرسيدس-بنز" },
  { en: "Audi",          ar: "أودي" },
  { en: "Volkswagen",    ar: "فولكسفاغن" },
  { en: "Volvo",         ar: "فولفو" },
  { en: "Toyota",        ar: "تويوتا" },
  { en: "Lexus",         ar: "لكزس" },
  { en: "Honda",         ar: "هوندا" },
  { en: "Nissan",        ar: "نيسان" },
  { en: "Infiniti",      ar: "إنفينيتي" },
  { en: "Porsche",       ar: "بورشه" },
  { en: "Land Rover",    ar: "لاند روفر" },
  { en: "MINI",          ar: "ميني" },
  { en: "Ford",          ar: "فورد" },
  { en: "Jeep",          ar: "جيب" },
  { en: "Lincoln",       ar: "لينكولن" },
  { en: "Cadillac",      ar: "كاديلاك" },
  { en: "Tesla",         ar: "تسلا" },
  { en: "Mazda",         ar: "مازدا" },
  { en: "Subaru",        ar: "سوبارو" },
  { en: "Maserati",      ar: "مازيراتي" },
  { en: "Ferrari",       ar: "فيراري" },
  { en: "Lamborghini",   ar: "لامبورغيني" },
  { en: "Bentley",       ar: "بنتلي" },
  { en: "Rolls-Royce",   ar: "رولز رويس" },
];

const API_BASE = import.meta.env.VITE_API_URL ?? "";
const YEARS = Array.from({ length: 26 }, (_, i) => 2025 - i);

interface ModelGroup { value: string; label: string; count: number; }
interface CarModel   { value: string; label: string; count: number; }

type Step = "brand" | "modelGroup" | "model" | "filters";

export function FilterSidebar({ filters, updateFilter, resetFilters, className }: FilterSidebarProps) {
  const [step, setStep] = useState<Step>("brand");

  const [selectedBrand,      setSelectedBrand]      = useState<typeof BRANDS[0] | null>(null);
  const [selectedModelGroup, setSelectedModelGroup] = useState<ModelGroup | null>(null);
  const [selectedModel,      setSelectedModel]      = useState<CarModel | null>(null);

  const [modelGroups, setModelGroups] = useState<ModelGroup[]>([]);
  const [models,      setModels]      = useState<CarModel[]>([]);
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState(false);

  // ── جلب ModelGroups ────────────────────────────────
  useEffect(() => {
    if (!selectedBrand) return;
    setLoading(true);
    setError(false);
    setModelGroups([]);
    fetch(`${API_BASE}/api/cars/filters?brand=${encodeURIComponent(selectedBrand.en)}`)
      .then(r => r.json())
      .then(d => { setModelGroups(d.modelGroups ?? []); setLoading(false); })
      .catch(() => { setError(true); setLoading(false); });
  }, [selectedBrand]);

  // ── جلب Models ────────────────────────────────────
  useEffect(() => {
    if (!selectedBrand || !selectedModelGroup) return;
    setLoading(true);
    setError(false);
    setModels([]);
    fetch(`${API_BASE}/api/cars/filters?brand=${encodeURIComponent(selectedBrand.en)}&modelGroup=${encodeURIComponent(selectedModelGroup.value)}`)
      .then(r => r.json())
      .then(d => { setModels(d.models ?? []); setLoading(false); })
      .catch(() => { setError(true); setLoading(false); });
  }, [selectedBrand, selectedModelGroup]);

  // ── تطبيق وانتقال لفلاتر ──────────────────────────
  const applyAndGoFilters = (model?: CarModel) => {
    if (!selectedBrand) return;
    updateFilter("brand", selectedBrand.en);
    if (model) {
      // جيل محدد → نضيف prefix "m:" للتمييز
      updateFilter("model", `m:${model.value}`);
    } else if (selectedModelGroup) {
      // ModelGroup → نضيف prefix "g:"
      updateFilter("model", `g:${selectedModelGroup.value}`);
    } else {
      updateFilter("model", undefined);
    }
    // نحذف modelType لأنه مو في الـ schema
    setStep("filters");
  };

  const handleReset = () => {
    resetFilters();
    setStep("brand");
    setSelectedBrand(null);
    setSelectedModelGroup(null);
    setSelectedModel(null);
    setModelGroups([]);
    setModels([]);
  };

  // ── Breadcrumb ────────────────────────────────────
  const Breadcrumb = () => (
    <div className="flex items-center gap-1 flex-wrap mb-3 text-xs">
      <button onClick={() => { setStep("brand"); setSelectedBrand(null); setSelectedModelGroup(null); setSelectedModel(null); }}
        className="text-blue-600 hover:underline font-medium">الماركات</button>
      {selectedBrand && (<>
        <ChevronRight className="w-3 h-3 text-gray-400" />
        <button onClick={() => { setStep("modelGroup"); setSelectedModelGroup(null); setSelectedModel(null); }}
          className={cn("hover:underline font-medium", step === "modelGroup" ? "text-blue-600" : "text-gray-600")}>
          {selectedBrand.ar}
        </button>
      </>)}
      {selectedModelGroup && (<>
        <ChevronRight className="w-3 h-3 text-gray-400" />
        <button onClick={() => { setStep("model"); setSelectedModel(null); }}
          className={cn("hover:underline font-medium", step === "model" ? "text-blue-600" : "text-gray-600")}>
          {selectedModelGroup.label !== undefined && getDisplayLabel(selectedModelGroup.label)}
        </button>
      </>)}
      {selectedModel && (<>
        <ChevronRight className="w-3 h-3 text-gray-400" />
        <span className="text-blue-600 font-medium">{getDisplayLabel(selectedModel.label)}</span>
      </>)}
    </div>
  );

  return (
    <div className={cn("bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden", className)}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <h3 className="font-bold text-gray-900">البحث والفلترة</h3>
        <button onClick={handleReset} className="text-xs text-gray-400 hover:text-red-500 flex items-center gap-1 transition-colors">
          <X className="w-3 h-3" /> إعادة تعيين
        </button>
      </div>

      <div className="p-4">

        {/* ══ STEP 1: الماركة ══ */}
        {step === "brand" && (
          <div>
            <p className="text-sm font-semibold text-gray-600 mb-3">اختر الماركة</p>
            <div className="grid grid-cols-2 gap-1.5 max-h-[65vh] overflow-y-auto">
              {BRANDS.map(brand => (
                <button
                  key={brand.en}
                  onClick={() => { setSelectedBrand(brand); setStep("modelGroup"); }}
                  className="text-right px-3 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:border-blue-400 hover:bg-blue-50 hover:text-blue-700 transition-all"
                >
                  {brand.ar}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ══ STEP 2: ModelGroup ══ */}
        {step === "modelGroup" && (
          <div>
            <Breadcrumb />
            <p className="text-sm font-semibold text-gray-600 mb-3">اختر الموديل</p>
            {loading ? (
              <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-blue-500" /></div>
            ) : error ? (
              <p className="text-center text-red-500 text-sm py-4">خطأ في التحميل، حاول مرة أخرى</p>
            ) : (
              <div className="space-y-1 max-h-[65vh] overflow-y-auto">
                {/* كل الماركة */}
                <button
                  onClick={() => applyAndGoFilters()}
                  className="w-full flex items-center justify-between px-3 py-3 rounded-xl border border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-all"
                >
                  <span className="text-sm font-semibold text-gray-700">كل موديلات {selectedBrand?.ar}</span>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </button>
                {modelGroups.map(mg => (
                  <button
                    key={mg.value}
                    onClick={() => { setSelectedModelGroup(mg); setStep("model"); }}
                    className="w-full flex items-center justify-between px-3 py-3 rounded-xl border border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-all"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-800">{getDisplayLabel(mg.label)}</span>
                      <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full">{mg.count.toLocaleString()}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </button>
                ))}
                {modelGroups.length === 0 && (
                  <p className="text-center text-gray-400 text-sm py-6">لا توجد موديلات</p>
                )}
              </div>
            )}
          </div>
        )}

        {/* ══ STEP 3: Model (الجيل) ══ */}
        {step === "model" && (
          <div>
            <Breadcrumb />
            <p className="text-sm font-semibold text-gray-600 mb-3">اختر الجيل</p>
            {loading ? (
              <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-blue-500" /></div>
            ) : error ? (
              <p className="text-center text-red-500 text-sm py-4">خطأ في التحميل</p>
            ) : (
              <div className="space-y-1 max-h-[65vh] overflow-y-auto">
                {/* كل الجيل */}
                <button
                  onClick={() => applyAndGoFilters()}
                  className="w-full flex items-center justify-between px-3 py-3 rounded-xl border border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-all"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-700">كل {getDisplayLabel(selectedModelGroup?.label ?? "")}</span>
                    <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full">{selectedModelGroup?.count.toLocaleString()}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </button>
                {models.map(m => (
                  <button
                    key={m.value}
                    onClick={() => { setSelectedModel(m); applyAndGoFilters(m); }}
                    className="w-full flex items-center justify-between px-3 py-3 rounded-xl border border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-all"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-800">{getDisplayLabel(m.label)}</span>
                      <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full">{m.count.toLocaleString()}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </button>
                ))}
                {models.length === 0 && (
                  <p className="text-center text-gray-400 text-sm py-6">لا توجد أجيال</p>
                )}
              </div>
            )}
          </div>
        )}

        {/* ══ STEP 4: فلاتر إضافية ══ */}
        {step === "filters" && (
          <div className="space-y-5">
            {/* ملخص الاختيار */}
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-sm space-y-1">
              {selectedBrand && (
                <div className="flex justify-between">
                  <span className="text-gray-500">الماركة</span>
                  <span className="font-semibold text-gray-800">{selectedBrand.ar}</span>
                </div>
              )}
              {selectedModelGroup && (
                <div className="flex justify-between">
                  <span className="text-gray-500">الموديل</span>
                  <span className="font-semibold text-gray-800">{getDisplayLabel(selectedModelGroup.label)}</span>
                </div>
              )}
              {selectedModel && (
                <div className="flex justify-between">
                  <span className="text-gray-500">الجيل</span>
                  <span className="font-semibold text-blue-700">{getDisplayLabel(selectedModel.label)}</span>
                </div>
              )}
              <button onClick={() => setStep("brand")} className="text-xs text-blue-600 hover:underline pt-1">
                تغيير الاختيار
              </button>
            </div>

            {/* سنة الصنع */}
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-2">سنة الصنع</p>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">من</label>
                  <select
                    value={filters.yearFrom ?? ""}
                    onChange={e => updateFilter("yearFrom", e.target.value ? Number(e.target.value) : undefined)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-400 bg-white"
                  >
                    <option value="">أي سنة</option>
                    {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">إلى</label>
                  <select
                    value={filters.yearTo ?? ""}
                    onChange={e => updateFilter("yearTo", e.target.value ? Number(e.target.value) : undefined)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-400 bg-white"
                  >
                    <option value="">أي سنة</option>
                    {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* السعر */}
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-2">السعر (مليون وون)</p>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  placeholder="الأدنى"
                  value={filters.priceMin ?? ""}
                  onChange={e => updateFilter("priceMin", e.target.value ? Number(e.target.value) : undefined)}
                  className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
                />
                <input
                  type="number"
                  placeholder="الأقصى"
                  value={filters.priceMax ?? ""}
                  onChange={e => updateFilter("priceMax", e.target.value ? Number(e.target.value) : undefined)}
                  className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
                />
              </div>
            </div>

            {/* الممشى */}
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-2">الممشى الأقصى (كم)</p>
              <input
                type="number"
                placeholder="مثال: 100000"
                value={filters.mileageMax ?? ""}
                onChange={e => updateFilter("mileageMax", e.target.value ? Number(e.target.value) : undefined)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
              />
            </div>

            {/* نوع الوقود */}
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-2">نوع الوقود</p>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { value: "gasoline", label: "بنزين" },
                  { value: "diesel",   label: "ديزل" },
                  { value: "hybrid",   label: "هايبرد" },
                  { value: "electric", label: "كهرباء" },
                  { value: "lpg",      label: "غاز LPG" },
                ].map(f => (
                  <button
                    key={f.value}
                    onClick={() => updateFilter("fuelType", filters.fuelType === f.value ? undefined : f.value as any)}
                    className={cn(
                      "px-3 py-2 rounded-xl border text-sm font-medium transition-all",
                      filters.fuelType === f.value
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-gray-200 text-gray-700 hover:border-blue-300 hover:bg-blue-50"
                    )}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* ناقل الحركة */}
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-2">ناقل الحركة</p>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { value: "auto",   label: "أوتوماتيك" },
                  { value: "manual", label: "يدوي" },
                ].map(t => (
                  <button
                    key={t.value}
                    onClick={() => updateFilter("transmission", filters.transmission === t.value ? undefined : t.value as any)}
                    className={cn(
                      "px-3 py-2 rounded-xl border text-sm font-medium transition-all",
                      filters.transmission === t.value
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-gray-200 text-gray-700 hover:border-blue-300 hover:bg-blue-50"
                    )}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* فتحة سقف */}
            <button
              onClick={() => updateFilter("sunroof", filters.sunroof ? undefined : true)}
              className={cn(
                "w-full px-3 py-2.5 rounded-xl border text-sm font-medium transition-all",
                filters.sunroof
                  ? "border-blue-500 bg-blue-50 text-blue-700"
                  : "border-gray-200 text-gray-700 hover:border-blue-300 hover:bg-blue-50"
              )}
            >
              🌤 فتحة سقف فقط
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
