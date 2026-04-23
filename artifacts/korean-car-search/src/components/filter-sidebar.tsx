import { useGetCarBrands, type SearchCarsParams } from "@workspace/api-client-react";
import { Filter, ChevronDown, Check, Globe, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface FilterSidebarProps {
  filters: SearchCarsParams;
  updateFilter: <K extends keyof SearchCarsParams>(key: K, value: SearchCarsParams[K]) => void;
  resetFilters: () => void;
  className?: string;
}

type ModelOption = { label: string; value: string };

export type CountryCode = "SA" | "AE" | "KW" | "QA" | "BH" | "OM";

interface CountryRule {
  label: string;
  flag: string;
  minYear: number;
}

export const COUNTRY_RULES: Record<CountryCode, CountryRule> = {
  SA: { label: "السعودية", flag: "🇸🇦", minYear: 2021 },
  AE: { label: "الإمارات", flag: "🇦🇪", minYear: 2021 },
  KW: { label: "الكويت",   flag: "🇰🇼", minYear: 2021 },
  QA: { label: "قطر",      flag: "🇶🇦", minYear: 2021 },
  BH: { label: "البحرين",  flag: "🇧🇭", minYear: 2021 },
  OM: { label: "عُمان",    flag: "🇴🇲", minYear: 2021 },
};

const uf = (fn: any) => fn as (key: string, value: any) => void;

// ─────────────────────────────────────────────────────────────────────────────
// BRAND_MODELS — values must exactly match MODEL_GROUP_MAP keys in cars.ts
// ─────────────────────────────────────────────────────────────────────────────
const BRAND_MODELS: Record<string, ModelOption[]> = {
  // ── HYUNDAI ──────────────────────────────────────────────────────────────
  "Hyundai": [
    { label: "Palisade",               value: "팰리세이드" },
    { label: "Palisade (New)",          value: "더 뉴 팰리세이드" },
    { label: "Santa Fe MX5 (2023+)",    value: "싼타페 (MX5)" },
    { label: "Santa Fe (New)",          value: "더 뉴 싼타페" },
    { label: "Santa Fe TM",            value: "싼타페 TM" },
    { label: "Grandeur GN7 (2022+)",   value: "그랜저 (GN7)" },
    { label: "Grandeur Hybrid GN7",    value: "그랜저 하이브리드 (GN7)" },
    { label: "Grandeur IG (New)",      value: "더 뉴 그랜저 IG" },
    { label: "Grandeur HG",            value: "그랜저 HG" },
    { label: "Sonata DN8",             value: "쏘나타 (DN8)" },
    { label: "Sonata Hybrid DN8",      value: "쏘나타 하이브리드 (DN8)" },
    { label: "Sonata LF",              value: "LF 쏘나타" },
    { label: "Elantra CN7 (2020+)",    value: "아반떼 (CN7)" },
    { label: "Elantra Hybrid CN7",     value: "아반떼 하이브리드 (CN7)" },
    { label: "Elantra MD",             value: "아반떼 MD" },
    { label: "Tucson NX4 (2021+)",     value: "투싼 (NX4)" },
    { label: "Tucson TL (New)",        value: "더 뉴 투싼 TL" },
    { label: "Kona OS",                value: "코나 (OS)" },
    { label: "Kona SX2 (2023+)",       value: "코나 (SX2)" },
    { label: "Ioniq 5",                value: "아이오닉 5" },
    { label: "Ioniq 5 N",              value: "아이오닉 5 N" },
    { label: "Ioniq 6",                value: "아이오닉 6" },
    { label: "Ioniq 9",                value: "아이오닉 9" },
    { label: "Staria",                 value: "스타리아" },
    { label: "Staria Lounge",          value: "스타리아 라운지" },
    { label: "Grand Starex (New)",     value: "더 뉴 그랜드 스타렉스" },
    { label: "Casper",                 value: "캐스퍼" },
    { label: "Casper Electric",        value: "캐스퍼 일렉트릭" },
    { label: "Nexo (Hydrogen)",        value: "넥쏘" },
    { label: "Venue",                  value: "베뉴" },
    { label: "Porter 2",               value: "포터 2" },
  ],

  // ── KIA ──────────────────────────────────────────────────────────────────
  "Kia": [
    { label: "Carnival 4th Gen",              value: "카니발 4세대" },
    { label: "Carnival (New)",                value: "더 뉴 카니발" },
    { label: "Carnival Limousine",            value: "카니발 리무진" },
    { label: "Sorento 4th Gen (2020+)",       value: "쏘렌토 4세대" },
    { label: "Sorento Hybrid 4th Gen",        value: "쏘렌토 하이브리드 4세대" },
    { label: "Sorento PHEV 4th Gen",          value: "쏘렌토 플러그인 하이브리드 4세대" },
    { label: "Sorento (New) 4th Gen",         value: "더 뉴 쏘렌토 4세대" },
    { label: "Sportage 5th Gen (2021+)",      value: "스포티지 5세대" },
    { label: "Sportage 5th Gen Hybrid",       value: "스포티지 5세대 하이브리드" },
    { label: "Sportage 5th Gen PHEV",         value: "스포티지 5세대 플러그인 하이브리드" },
    { label: "K8",                            value: "K8" },
    { label: "K8 Hybrid",                     value: "K8 하이브리드" },
    { label: "K5 3rd Gen",                    value: "K5 3세대" },
    { label: "K5 Hybrid 3rd Gen",             value: "K5 하이브리드 3세대" },
    { label: "K5 2nd Gen (New)",              value: "더 뉴 K5 2세대" },
    { label: "K3",                            value: "K3" },
    { label: "K3 2nd Gen (New)",              value: "더 뉴 K3 2세대" },
    { label: "Seltos",                        value: "셀토스" },
    { label: "Seltos (New)",                  value: "더 뉴 셀토스" },
    { label: "Niro (All New)",                value: "디 올 뉴 니로" },
    { label: "Niro Hybrid",                   value: "니로 하이브리드" },
    { label: "Niro EV",                       value: "니로 EV" },
    { label: "EV3",                           value: "EV3" },
    { label: "EV6",                           value: "EV6" },
    { label: "EV6 GT",                        value: "EV6 GT" },
    { label: "EV9",                           value: "EV9" },
    { label: "Stinger",                       value: "스팅어" },
    { label: "Mohave",                        value: "모하비" },
    { label: "Mohave (New)",                  value: "더 뉴 모하비" },
    { label: "Mohave The Master",             value: "모하비 더 마스터" },
    { label: "Morning",                       value: "모닝" },
    { label: "Ray",                           value: "레이" },
    { label: "Telluride",                     value: "텔루라이드" },
    { label: "Soul",                          value: "쏘울" },
  ],

  // ── GENESIS ───────────────────────────────────────────────────────────────
  "Genesis": [
    { label: "GV80",              value: "GV80" },
    { label: "GV80 Coupe",        value: "GV80 쿠페" },
    { label: "GV70",              value: "GV70" },
    { label: "GV70 Electrified",  value: "GV70 전동화" },
    { label: "GV60",              value: "GV60" },
    { label: "GV60 Sport Plus",   value: "GV60 스포츠 플러스" },
    { label: "GV90",              value: "GV90" },
    { label: "G80 RG3 (2020+)",   value: "G80 (RG3)" },
    { label: "G80 Electrified",   value: "G80 전동화" },
    { label: "G80",               value: "G80" },
    { label: "G90 RS4 (2022+)",   value: "G90 (RS4)" },
    { label: "G90",               value: "G90" },
    { label: "G70 (New)",         value: "더 뉴 G70" },
    { label: "G70 2nd Gen",       value: "G70 2세대" },
    { label: "EQ900",             value: "EQ900" },
  ],

  // ── SSANGYONG ─────────────────────────────────────────────────────────────
  "SsangYong": [
    { label: "Rexton G4",         value: "렉스턴 G4" },
    { label: "Rexton Sports",     value: "렉스턴 스포츠" },
    { label: "Rexton Sports Khan",value: "렉스턴 스포츠 칸" },
    { label: "Korando",           value: "코란도" },
    { label: "Korando e-Motion",  value: "코란도 이모션" },
    { label: "Tivoli",            value: "티볼리" },
    { label: "Tivoli Air",        value: "티볼리 에어" },
    { label: "Musso",             value: "무쏘" },
    { label: "Actyon",            value: "액티언" },
  ],

  // ── KG MOBILITY ───────────────────────────────────────────────────────────
  "KG Mobility": [
    { label: "Torres",            value: "토레스" },
    { label: "Torres EVX",        value: "토레스 EVX" },
    { label: "Rexton G4",         value: "렉스턴 G4" },
    { label: "Rexton Sports",     value: "렉스턴 스포츠" },
    { label: "Korando",           value: "코란도" },
    { label: "Tivoli",            value: "티볼리" },
    { label: "Musso",             value: "무쏘" },
    { label: "Actyon Sports",     value: "액티언 스포츠" },
  ],

  // ── RENAULT SAMSUNG ───────────────────────────────────────────────────────
  "Renault Samsung": [
    { label: "QM6",       value: "QM6" },
    { label: "QM6 LPe",   value: "QM6 LPe" },
    { label: "SM6",       value: "SM6" },
    { label: "XM3",       value: "XM3" },
    { label: "SM3",       value: "SM3" },
    { label: "SM5",       value: "SM5" },
    { label: "SM7",       value: "SM7" },
  ],

  // ── RENAULT KOREA ─────────────────────────────────────────────────────────
  "Renault Korea": [
    { label: "Philante",  value: "필랑트" },
    { label: "QM6",       value: "QM6" },
    { label: "SM6",       value: "SM6" },
    { label: "XM3",       value: "XM3" },
    { label: "Arkana",    value: "아르카나" },
  ],

  // ── CHEVROLET ─────────────────────────────────────────────────────────────
  "Chevrolet": [
    { label: "Trailblazer",     value: "트레일블레이저" },
    { label: "Trailblazer (New)",value: "더 뉴 트레일블레이저" },
    { label: "Equinox",         value: "이쿼녹스" },
    { label: "Equinox EV",      value: "이쿼녹스 EV" },
    { label: "Trax",            value: "트랙스" },
    { label: "Trax Crossover",  value: "트랙스 크로스오버" },
    { label: "Spark",           value: "스파크" },
    { label: "Malibu",          value: "말리부" },
    { label: "Colorado",        value: "콜로라도" },
    { label: "Traverse",        value: "트래버스" },
    { label: "Blazer EV",       value: "블레이저 EV" },
    { label: "Tahoe",           value: "타호" },
    { label: "Orlando",         value: "올란도" },
    { label: "Captiva",         value: "캡티바" },
  ],

  // ── BMW ───────────────────────────────────────────────────────────────────
  "BMW": [
    // 1 Series
    { label: "1 Series F20 (2011-2019)", value: "1시리즈 (F20)" },
    { label: "1 Series F40 (2019+)",     value: "1시리즈 (F40)" },
    // 2 Series
    { label: "2 Series Gran Coupe F44",  value: "2시리즈 그란쿠페 (F44)" },
    { label: "2 Series Coupe G42",       value: "2시리즈 (G42)" },
    { label: "2 Series Active Tourer F45",value: "2시리즈 액티브투어러 (F45)" },
    // 3 Series
    { label: "3 Series E90 (2005-2011)", value: "3시리즈 (E90)" },
    { label: "3 Series F30 (2012-2018)", value: "3시리즈 (F30)" },
    { label: "3 Series G20 (2019+)",     value: "3시리즈 (G20)" },
    // 4 Series
    { label: "4 Series F32 (2013-2020)", value: "4시리즈 (F32)" },
    { label: "4 Series G22 (2020+)",     value: "4시리즈 (G22)" },
    { label: "4 Series Gran Coupe F36",  value: "4시리즈 그란쿠페 (F36)" },
    { label: "4 Series Gran Coupe G26",  value: "4시리즈 그란쿠페 (G26)" },
    // 5 Series
    { label: "5 Series F10 (2010-2016)", value: "5시리즈 (F10)" },
    { label: "5 Series G30 (2017-2023)", value: "5시리즈 (G30)" },
    { label: "5 Series G60 (2023+)",     value: "5시리즈 (G60)" },
    // 6 Series
    { label: "6 Series F12 Coupe/Cab",   value: "6시리즈 (F12)" },
    { label: "6 Series Gran Turismo G32",value: "6시리즈 그란투리스모 (G32)" },
    // 7 Series
    { label: "7 Series F01 (2009-2015)", value: "7시리즈 (F01)" },
    { label: "7 Series G11 (2015-2022)", value: "7시리즈 (G11)" },
    { label: "7 Series G70 (2022+)",     value: "7시리즈 (G70)" },
    // 8 Series
    { label: "8 Series G15 (2018+)",     value: "8시리즈 (G15)" },
    { label: "8 Series Gran Coupe G16",  value: "8시리즈 그란쿠페 (G16)" },
    // X Series
    { label: "X1 E84 (2009-2015)",       value: "X1 (E84)" },
    { label: "X1 F48 (2015-2022)",       value: "X1 (F48)" },
    { label: "X1 U11 (2022+)",           value: "X1 (U11)" },
    { label: "X2 F39 (2017-2023)",       value: "X2 (F39)" },
    { label: "X3 F25 (2010-2017)",       value: "X3 (F25)" },
    { label: "X3 G01 (2017+)",           value: "X3 (G01)" },
    { label: "X4 F26 (2014-2018)",       value: "X4 (F26)" },
    { label: "X4 G02 (2018+)",           value: "X4 (G02)" },
    { label: "X5 F15 (2013-2018)",       value: "X5 (F15)" },
    { label: "X5 G05 (2018+)",           value: "X5 (G05)" },
    { label: "X6 F16 (2014-2019)",       value: "X6 (F16)" },
    { label: "X6 G06 (2019+)",           value: "X6 (G06)" },
    { label: "X7 G07 (2019+)",           value: "X7 (G07)" },
    // M Series
    { label: "M2 F87",                   value: "M2 (F87)" },
    { label: "M2 G87 (2022+)",           value: "M2 (G87)" },
    { label: "M3 F80",                   value: "M3 (F80)" },
    { label: "M3 G80 (2020+)",           value: "M3 (G80)" },
    { label: "M4 F82",                   value: "M4 (F82)" },
    { label: "M4 G82 (2020+)",           value: "M4 (G82)" },
    { label: "M5 F90",                   value: "M5 (F90)" },
    { label: "M5 G90 (2024+)",           value: "M5 (G90)" },
    { label: "M8 F92",                   value: "M8 (F92)" },
    // Electric / i Series
    { label: "i3",                       value: "i3" },
    { label: "i4",                       value: "i4" },
    { label: "i5",                       value: "i5" },
    { label: "i7",                       value: "i7" },
    { label: "i8",                       value: "i8" },
    { label: "iX",                       value: "iX" },
    { label: "iX3",                      value: "iX3" },
    { label: "XM",                       value: "XM" },
    { label: "Z4 G29",                   value: "Z4 (G29)" },
  ],

  // ── MERCEDES-BENZ ─────────────────────────────────────────────────────────
  "Mercedes-Benz": [
    { label: "A-Class W176",          value: "A클래스 (W176)" },
    { label: "A-Class W177 (2018+)",  value: "A클래스 (W177)" },
    { label: "C-Class W204",          value: "C클래스 (W204)" },
    { label: "C-Class W205 (2014+)",  value: "C클래스 (W205)" },
    { label: "C-Class W206 (2021+)",  value: "C클래스 (W206)" },
    { label: "E-Class W212",          value: "E클래스 (W212)" },
    { label: "E-Class W213 (2016+)",  value: "E클래스 (W213)" },
    { label: "E-Class W214 (2024+)",  value: "E클래스 (W214)" },
    { label: "S-Class W221",          value: "S클래스 (W221)" },
    { label: "S-Class W222 (2013+)",  value: "S클래스 (W222)" },
    { label: "S-Class W223 (2021+)",  value: "S클래스 (W223)" },
    { label: "G-Class W463",          value: "G클래스 (W463)" },
    { label: "CLA C117",              value: "CLA (C117)" },
    { label: "CLA C118 (2019+)",      value: "CLA (C118)" },
    { label: "CLS C257 (2018+)",      value: "CLS (C257)" },
    { label: "CLE",                   value: "CLE클래스" },
    { label: "GLA X156",              value: "GLA (X156)" },
    { label: "GLA H247 (2020+)",      value: "GLA (H247)" },
    { label: "GLB X247 (2019+)",      value: "GLB클래스" },
    { label: "GLC X253 (2015-2022)",  value: "GLC (X253)" },
    { label: "GLC X254 (2023+)",      value: "GLC (X254)" },
    { label: "GLC Coupe C253",        value: "GLC쿠페 (C253)" },
    { label: "GLE W166",              value: "GLE (W166)" },
    { label: "GLE V167 (2019+)",      value: "GLE (V167)" },
    { label: "GLE Coupe",             value: "GLE쿠페" },
    { label: "GLS X166",              value: "GLS (X166)" },
    { label: "GLS X167 (2019+)",      value: "GLS (X167)" },
    { label: "EQA",                   value: "EQA" },
    { label: "EQB",                   value: "EQB" },
    { label: "EQC",                   value: "EQC" },
    { label: "EQE",                   value: "EQE" },
    { label: "EQS",                   value: "EQS" },
    { label: "Maybach S-Class",       value: "마이바흐 S클래스" },
    { label: "AMG GT",                value: "AMG GT" },
    { label: "SL-Class",              value: "SL클래스" },
  ],

  // ── AUDI ──────────────────────────────────────────────────────────────────
  "Audi": [
    { label: "A3",          value: "A3" },
    { label: "A4",          value: "A4" },
    { label: "A5",          value: "A5" },
    { label: "A6",          value: "A6" },
    { label: "A7",          value: "A7" },
    { label: "A8",          value: "A8" },
    { label: "Q2",          value: "Q2" },
    { label: "Q3",          value: "Q3" },
    { label: "Q4 e-tron",   value: "Q4 e-tron" },
    { label: "Q5",          value: "Q5" },
    { label: "Q7",          value: "Q7" },
    { label: "Q8",          value: "Q8" },
    { label: "Q8 e-tron",   value: "Q8 e-tron" },
    { label: "e-tron",      value: "e-tron" },
    { label: "e-tron GT",   value: "e-tron GT" },
    { label: "TT",          value: "TT" },
    { label: "R8",          value: "R8" },
    { label: "RS3",         value: "RS3" },
    { label: "RS4",         value: "RS4" },
    { label: "RS5",         value: "RS5" },
    { label: "RS6",         value: "RS6" },
    { label: "RS7",         value: "RS7" },
    { label: "SQ5",         value: "SQ5" },
    { label: "SQ7",         value: "SQ7" },
    { label: "SQ8",         value: "SQ8" },
  ],

  // ── VOLKSWAGEN ────────────────────────────────────────────────────────────
  "Volkswagen": [
    { label: "Golf",          value: "골프" },
    { label: "Golf GTI",      value: "골프 GTI" },
    { label: "Golf R",        value: "골프 R" },
    { label: "Tiguan",        value: "티구안" },
    { label: "Tiguan Allspace",value: "티구안 올스페이스" },
    { label: "Passat",        value: "파사트" },
    { label: "Touareg",       value: "투아렉" },
    { label: "Arteon",        value: "아테온" },
    { label: "ID.4",          value: "ID.4" },
    { label: "ID.6",          value: "ID.6" },
  ],

  // ── TOYOTA ────────────────────────────────────────────────────────────────
  "Toyota": [
    { label: "Camry",                   value: "캠리" },
    { label: "RAV4",                    value: "RAV4" },
    { label: "RAV4 Hybrid",             value: "RAV4 하이브리드" },
    { label: "Prius",                   value: "프리우스" },
    { label: "Crown Crossover",         value: "크라운 크로스오버" },
    { label: "Alphard",                 value: "알파드" },
    { label: "Vellfire",                value: "벨파이어" },
    { label: "Sienna",                  value: "시에나" },
    { label: "Land Cruiser",            value: "랜드크루저" },
    { label: "Land Cruiser Prado",      value: "랜드크루저 프라도" },
    { label: "Highlander",              value: "하이랜더" },
    { label: "GR86",                    value: "GR86" },
    { label: "GR Supra",                value: "GR 수프라" },
  ],

  // ── LEXUS ─────────────────────────────────────────────────────────────────
  "Lexus": [
    { label: "ES300h 7th Gen",    value: "ES300h 7세대" },
    { label: "IS300h",            value: "IS300h" },
    { label: "IS250",             value: "IS250" },
    { label: "LS500h 5th Gen",    value: "LS500h 5세대" },
    { label: "LS460",             value: "LS460" },
    { label: "UX250h",            value: "UX250h" },
    { label: "CT200h",            value: "CT200h" },
    { label: "NX300h",            value: "NX300h" },
    { label: "NX350h 2nd Gen",    value: "NX350h 2세대" },
    { label: "NX450h+ 2nd Gen",   value: "NX450h+ 2세대" },
    { label: "RX350",             value: "RX350" },
    { label: "RX450h 4th Gen",    value: "RX450h 4세대" },
    { label: "LX600",             value: "LX600" },
    { label: "LX570",             value: "LX570" },
    { label: "LC500",             value: "LC500" },
    { label: "LC500h",            value: "LC500h" },
  ],

  // ── PORSCHE ───────────────────────────────────────────────────────────────
  "Porsche": [
    { label: "Cayenne",               value: "카이엔" },
    { label: "Cayenne Coupe",         value: "카이엔 쿠페" },
    { label: "Panamera",              value: "파나메라" },
    { label: "Taycan",                value: "타이칸" },
    { label: "Taycan Cross Turismo",  value: "타이칸 크로스 투리스모" },
    { label: "Macan",                 value: "마칸" },
    { label: "Macan EV",              value: "마칸 EV" },
    { label: "911",                   value: "911" },
    { label: "Boxster",               value: "박스터" },
    { label: "Cayman",                value: "케이맨" },
  ],

  // ── VOLVO ─────────────────────────────────────────────────────────────────
  "Volvo": [
    { label: "XC40",              value: "XC40" },
    { label: "XC40 Recharge",     value: "XC40 리차지" },
    { label: "XC60",              value: "XC60" },
    { label: "XC90",              value: "XC90" },
    { label: "XC90 Recharge",     value: "XC90 리차지" },
    { label: "C40 Recharge",      value: "C40 리차지" },
    { label: "S60",               value: "S60" },
    { label: "S90",               value: "S90" },
    { label: "V60",               value: "V60" },
    { label: "V60 Cross Country", value: "V60 크로스컨트리" },
    { label: "V90",               value: "V90" },
    { label: "V90 Cross Country", value: "V90 크로스컨트리" },
    { label: "EX30",              value: "EX30" },
    { label: "EX40",              value: "EX40" },
    { label: "EX90",              value: "EX90" },
  ],

  // ── LAND ROVER ────────────────────────────────────────────────────────────
  "Land Rover": [
    { label: "Range Rover",             value: "레인지로버" },
    { label: "Range Rover Sport",       value: "레인지로버 스포츠" },
    { label: "Range Rover Evoque",      value: "레인지로버 이보크" },
    { label: "Range Rover Velar",       value: "레인지로버 벨라" },
    { label: "Discovery",               value: "디스커버리" },
    { label: "Discovery Sport",         value: "디스커버리 스포츠" },
    { label: "Defender",                value: "디펜더" },
  ],

  // ── JAGUAR ────────────────────────────────────────────────────────────────
  "Jaguar": [
    { label: "F-Pace",  value: "F-페이스" },
    { label: "E-Pace",  value: "E-페이스" },
    { label: "XE",      value: "XE" },
    { label: "XF",      value: "XF" },
    { label: "XJ",      value: "XJ" },
    { label: "F-Type",  value: "F-타입" },
    { label: "I-Pace",  value: "I-페이스" },
  ],

  // ── MINI ──────────────────────────────────────────────────────────────────
  "MINI": [
    { label: "Cooper",      value: "미니쿠퍼" },
    { label: "Countryman",  value: "컨트리맨" },
    { label: "Clubman",     value: "클럽맨" },
    { label: "Aceman",      value: "에이스맨" },
  ],

  // ── FORD ──────────────────────────────────────────────────────────────────
  "Ford": [
    { label: "Mustang",       value: "머스탱" },
    { label: "Mustang Mach-E",value: "머스탱 마하-E" },
    { label: "Explorer",      value: "익스플로러" },
    { label: "F-150",         value: "F-150" },
    { label: "Bronco",        value: "브롱코" },
    { label: "Edge",          value: "엣지" },
  ],

  // ── JEEP ──────────────────────────────────────────────────────────────────
  "Jeep": [
    { label: "Grand Cherokee", value: "그랜드체로키" },
    { label: "Wrangler",       value: "랭글러" },
    { label: "Compass",        value: "컴패스" },
    { label: "Renegade",       value: "레니게이드" },
  ],

  // ── LINCOLN ───────────────────────────────────────────────────────────────
  "Lincoln": [
    { label: "Navigator",   value: "네비게이터" },
    { label: "Aviator",     value: "에비에이터" },
    { label: "Nautilus",    value: "노틸러스" },
    { label: "Corsair",     value: "코르세어" },
    { label: "Continental", value: "컨티넨탈" },
  ],

  // ── CADILLAC ──────────────────────────────────────────────────────────────
  "Cadillac": [
    { label: "Escalade",  value: "에스컬레이드" },
    { label: "XT4",       value: "XT4" },
    { label: "XT5",       value: "XT5" },
    { label: "XT6",       value: "XT6" },
    { label: "CT5",       value: "CT5" },
    { label: "CT6",       value: "CT6" },
    { label: "Lyriq",     value: "리릭" },
  ],

  // ── INFINITI ──────────────────────────────────────────────────────────────
  "Infiniti": [
    { label: "QX80",  value: "QX80" },
    { label: "QX60",  value: "QX60" },
    { label: "QX50",  value: "QX50" },
    { label: "QX70",  value: "QX70" },
    { label: "Q50",   value: "Q50" },
    { label: "Q60",   value: "Q60" },
    { label: "Q70",   value: "Q70" },
  ],

  // ── TESLA ─────────────────────────────────────────────────────────────────
  "Tesla": [
    { label: "Model S",     value: "모델 S" },
    { label: "Model 3",     value: "모델 3" },
    { label: "Model X",     value: "모델 X" },
    { label: "Model Y",     value: "모델 Y" },
    { label: "Cybertruck",  value: "사이버트럭" },
  ],

  // ── HONDA ─────────────────────────────────────────────────────────────────
  "Honda": [
    { label: "Accord",    value: "어코드" },
    { label: "Civic",     value: "시빅" },
    { label: "CR-V",      value: "CR-V" },
    { label: "Pilot",     value: "파일럿" },
    { label: "Odyssey",   value: "오딧세이" },
    { label: "HR-V",      value: "HR-V" },
  ],

  // ── NISSAN ────────────────────────────────────────────────────────────────
  "Nissan": [
    { label: "Patrol",    value: "패트롤" },
    { label: "Murano",    value: "무라노" },
    { label: "Qashqai",   value: "캐시카이" },
    { label: "X-Trail",   value: "엑스트레일" },
    { label: "Juke",      value: "쥬크" },
    { label: "370Z",      value: "370Z" },
    { label: "GT-R",      value: "GT-R" },
  ],

  // ── MASERATI ──────────────────────────────────────────────────────────────
  "Maserati": [
    { label: "Ghibli",        value: "기블리" },
    { label: "Levante",       value: "레반떼" },
    { label: "Quattroporte",  value: "콰트로포르테" },
    { label: "Grecale",       value: "그레칼레" },
    { label: "MC20",          value: "MC20" },
  ],

  // ── FERRARI ───────────────────────────────────────────────────────────────
  "Ferrari": [
    { label: "Roma",        value: "로마" },
    { label: "SF90",        value: "SF90" },
    { label: "488",         value: "488" },
    { label: "296 GTB",     value: "296 GTB" },
    { label: "Portofino",   value: "포르토피노" },
  ],

  // ── LAMBORGHINI ───────────────────────────────────────────────────────────
  "Lamborghini": [
    { label: "Urus",        value: "우루스" },
    { label: "Huracan",     value: "우라칸" },
    { label: "Aventador",   value: "아벤타도르" },
  ],

  // ── MAZDA ─────────────────────────────────────────────────────────────────
  "Mazda": [
    { label: "CX-5",    value: "CX-5" },
    { label: "CX-8",    value: "CX-8" },
    { label: "CX-60",   value: "CX-60" },
    { label: "MX-5",    value: "MX-5" },
    { label: "Mazda 3", value: "마쯔다 3" },
  ],

  // ── SUBARU ────────────────────────────────────────────────────────────────
  "Subaru": [
    { label: "Outback",     value: "아웃백" },
    { label: "Forester",    value: "포레스터" },
    { label: "Impreza",     value: "임프레자" },
    { label: "Legacy",      value: "레거시" },
    { label: "Crosstrek",   value: "크로스트렉" },
  ],

  // ── ALFA ROMEO ────────────────────────────────────────────────────────────
  "Alfa Romeo": [
    { label: "Giulia",    value: "줄리아" },
    { label: "Stelvio",   value: "스텔비오" },
    { label: "Tonale",    value: "토날레" },
  ],

  // ── MITSUBISHI ────────────────────────────────────────────────────────────
  "Mitsubishi": [
    { label: "Outlander",     value: "아웃랜더" },
    { label: "Eclipse Cross", value: "이클립스 크로스" },
    { label: "Pajero",        value: "파제로" },
  ],

  // ── BENTLEY ───────────────────────────────────────────────────────────────
  "Bentley": [
    { label: "Continental GT",  value: "컨티넨탈 GT" },
    { label: "Bentayga",        value: "벤테이가" },
    { label: "Flying Spur",     value: "플라잉 스퍼" },
  ],

  // ── ROLLS-ROYCE ───────────────────────────────────────────────────────────
  "Rolls-Royce": [
    { label: "Phantom",   value: "팬텀" },
    { label: "Ghost",     value: "고스트" },
    { label: "Cullinan",  value: "컬리넌" },
    { label: "Wraith",    value: "레이스" },
  ],
};

export function FilterSidebar({ filters, updateFilter, resetFilters, className }: FilterSidebarProps) {
  const { data: brandsData, isLoading: isLoadingBrands } = useGetCarBrands();
  const u = uf(updateFilter);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 15 }, (_, i) => currentYear - i);

  const fuelTypes = [
    { id: "gasoline", label: "بنزين" },
    { id: "diesel",   label: "ديزل" },
    { id: "hybrid",   label: "هايبرد" },
    { id: "electric", label: "كهرباء" },
  ];

  const bodyTypes = [
    { id: "sedan",     label: "سيدان" },
    { id: "suv",       label: "عائلية (SUV)" },
    { id: "hatchback", label: "هاتشباك" },
    { id: "coupe",     label: "كوبيه" },
  ];

  const selectedBrand   = filters.brand || "";
  const brandModels     = selectedBrand ? (BRAND_MODELS[selectedBrand] ?? []) : [];
  const hasModelList    = brandModels.length > 0;
  const selectedCountry = ((filters as any).country ?? "") as CountryCode | "";
  const compatibleOnly  = !!((filters as any).compatibleOnly);

  const handleBrandChange = (brand: string) => {
    u("brand", brand || undefined);
    u("model", undefined);
  };

  const handleCountryChange = (country: string) => {
    u("country", country || undefined);
    if (!country) u("compatibleOnly", undefined);
  };

  const handleCompatibleToggle = (mode: "all" | "compatible") => {
    u("compatibleOnly", mode === "compatible" ? true : undefined);
    if (mode === "compatible" && selectedCountry) {
      updateFilter("yearFrom", COUNTRY_RULES[selectedCountry].minYear);
    } else {
      updateFilter("yearFrom", undefined);
    }
  };

  const toggleFuel  = (type: any) => updateFilter("fuelType", filters.fuelType  === type ? undefined : type);
  const toggleBody  = (type: any) => updateFilter("bodyType", filters.bodyType  === type ? undefined : type);
  const toggleColor = (key: string) => updateFilter("color",  filters.color     === key  ? undefined : (key as any));

  const colors = [
    { key: "white",     ar: "أبيض",       css: "#F8F8F8", border: "#D1D5DB" },
    { key: "silver",    ar: "فضي",         css: "#C0C0C0", border: "#9CA3AF" },
    { key: "gray",      ar: "رمادي",       css: "#6B7280", border: "#4B5563" },
    { key: "black",     ar: "أسود",        css: "#1A1A1A", border: "#374151" },
    { key: "red",       ar: "أحمر",        css: "#EF4444", border: "#DC2626" },
    { key: "orange",    ar: "برتقالي",     css: "#F97316", border: "#EA580C" },
    { key: "yellow",    ar: "أصفر",        css: "#EAB308", border: "#CA8A04" },
    { key: "green",     ar: "أخضر",        css: "#22C55E", border: "#16A34A" },
    { key: "lime",      ar: "أخضر فاتح",  css: "#84CC16", border: "#65A30D" },
    { key: "lightblue", ar: "أزرق فاتح",  css: "#60A5FA", border: "#3B82F6" },
    { key: "brown",     ar: "بني",         css: "#92400E", border: "#78350F" },
  ];

  const lightColors = ["white", "silver", "yellow", "lime"];

  return (
    <div className={cn("bg-card rounded-2xl border border-border shadow-sm p-6 flex flex-col gap-6", className)}>

      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-border">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <Filter className="w-5 h-5 text-primary" />
          التصفية
        </h3>
        <button onClick={resetFilters} className="text-sm font-semibold text-muted-foreground hover:text-destructive transition-colors">
          مسح الكل
        </button>
      </div>

      {/* Country */}
      <div className="space-y-3 pb-4 border-b border-border">
        <label className="text-sm font-bold text-foreground flex items-center gap-2">
          <Globe className="w-4 h-4 text-primary" />
          دولتك
        </label>
        <div className="relative">
          <select
            className="w-full appearance-none bg-background border-2 border-border rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all cursor-pointer"
            value={selectedCountry}
            onChange={(e) => handleCountryChange(e.target.value)}
          >
            <option value="">اختر دولتك</option>
            {Object.entries(COUNTRY_RULES).map(([code, rule]) => (
              <option key={code} value={code}>{rule.flag} {rule.label}</option>
            ))}
          </select>
          <ChevronDown className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
        </div>

        {selectedCountry && (
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleCompatibleToggle("all")}
              className={cn(
                "py-2.5 px-3 rounded-xl text-sm font-semibold transition-all border-2 flex items-center justify-center gap-1.5",
                !compatibleOnly
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-background text-muted-foreground hover:border-primary/40"
              )}
            >
              <Globe className="w-3.5 h-3.5" />
              بحث عام
            </button>
            <button
              onClick={() => handleCompatibleToggle("compatible")}
              className={cn(
                "py-2.5 px-3 rounded-xl text-sm font-semibold transition-all border-2 flex items-center justify-center gap-1.5",
                compatibleOnly
                  ? "border-green-500 bg-green-500/10 text-green-600"
                  : "border-border bg-background text-muted-foreground hover:border-green-400/40"
              )}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              متوافق فقط
            </button>
          </div>
        )}

        {selectedCountry && compatibleOnly && (
          <div className="bg-green-50 border border-green-300 rounded-xl px-3 py-2 text-xs text-green-800 flex items-start gap-2">
            <ShieldCheck className="w-3.5 h-3.5 mt-0.5 shrink-0" />
            <span>يعرض فقط سيارات {COUNTRY_RULES[selectedCountry].minYear}+ المتوافقة مع {COUNTRY_RULES[selectedCountry].flag} {COUNTRY_RULES[selectedCountry].label}</span>
          </div>
        )}

        {selectedCountry && !compatibleOnly && (
          <div className="bg-amber-50 border border-amber-300 rounded-xl px-3 py-2 text-xs text-amber-800 flex items-start gap-2">
            <span className="mt-0.5">⚠️</span>
            <span>بعض السيارات قد لا تتوافق مع اشتراطات {COUNTRY_RULES[selectedCountry].label}</span>
          </div>
        )}
      </div>

      {/* Brand */}
      <div className="space-y-3">
        <label className="text-sm font-bold text-foreground">الماركة</label>
        <div className="relative">
          <select
            className="w-full appearance-none bg-background border-2 border-border rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all cursor-pointer"
            value={selectedBrand}
            onChange={(e) => handleBrandChange(e.target.value)}
            disabled={isLoadingBrands}
          >
            <option value="">كل الماركات</option>
            {brandsData?.brands.map((brand) => (
              <option key={brand} value={brand}>{brand}</option>
            ))}
          </select>
          <ChevronDown className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
        </div>
      </div>

      {/* Model */}
      <div className="space-y-3">
        <label className="text-sm font-bold text-foreground">الموديل</label>
        {hasModelList ? (
          <div className="relative">
            <select
              className="w-full appearance-none bg-background border-2 border-border rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all cursor-pointer"
              value={(filters as any).model || ""}
              onChange={(e) => u("model", e.target.value || undefined)}
            >
              <option value="">كل الموديلات</option>
              {brandModels.map((m) => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
            <ChevronDown className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
          </div>
        ) : (
          <input
            type="text"
            placeholder={selectedBrand ? "اكتب اسم الموديل..." : "اختر الماركة أولاً أو اكتب الموديل..."}
            className="w-full bg-background border-2 border-border rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
            value={(filters as any).model || ""}
            onChange={(e) => u("model", e.target.value || undefined)}
          />
        )}
      </div>

      {/* Year */}
      <div className="space-y-3">
        <label className="text-sm font-bold text-foreground">سنة الصنع</label>
        <div className="grid grid-cols-2 gap-3">
          {(["yearFrom", "yearTo"] as const).map((key, i) => (
            <div key={key} className="relative">
              <select
                className="w-full appearance-none bg-background border-2 border-border rounded-xl px-4 py-3 text-sm font-medium font-numbers focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all cursor-pointer"
                value={filters[key] || ""}
                onChange={(e) => updateFilter(key, e.target.value ? parseInt(e.target.value) : undefined)}
              >
                <option value="">{i === 0 ? "من" : "إلى"}</option>
                {years.map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
              <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            </div>
          ))}
        </div>
      </div>

      {/* Price */}
      <div className="space-y-3">
        <label className="text-sm font-bold text-foreground">السعر (مليون وون)</label>
        <div className="grid grid-cols-2 gap-3">
          <input type="number" placeholder="الحد الأدنى"
            className="w-full bg-background border-2 border-border rounded-xl px-4 py-3 text-sm font-medium font-numbers focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
            value={filters.priceMin || ""}
            onChange={(e) => updateFilter("priceMin", e.target.value ? parseInt(e.target.value) : undefined)} />
          <input type="number" placeholder="الحد الأقصى"
            className="w-full bg-background border-2 border-border rounded-xl px-4 py-3 text-sm font-medium font-numbers focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
            value={filters.priceMax || ""}
            onChange={(e) => updateFilter("priceMax", e.target.value ? parseInt(e.target.value) : undefined)} />
        </div>
      </div>

      {/* Mileage */}
      <div className="space-y-3">
        <label className="text-sm font-bold text-foreground">الممشى الأقصى (كم)</label>
        <input type="number" placeholder="مثال: 100000"
          className="w-full bg-background border-2 border-border rounded-xl px-4 py-3 text-sm font-medium font-numbers focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
          value={filters.mileageMax || ""}
          onChange={(e) => updateFilter("mileageMax", e.target.value ? parseInt(e.target.value) : undefined)} />
      </div>

      {/* Fuel */}
      <div className="space-y-3">
        <label className="text-sm font-bold text-foreground">نوع الوقود</label>
        <div className="grid grid-cols-2 gap-2">
          {fuelTypes.map((fuel) => {
            const isSelected = filters.fuelType === fuel.id;
            return (
              <button key={fuel.id} onClick={() => toggleFuel(fuel.id)}
                className={cn("py-2.5 px-3 rounded-lg text-sm font-semibold transition-all border-2 flex items-center justify-center gap-2",
                  isSelected ? "border-primary bg-primary/10 text-primary" : "border-border bg-background text-muted-foreground hover:border-primary/40")}>
                {isSelected && <Check className="w-4 h-4" />}
                {fuel.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Body */}
      "Peugeot"
      <div className="space-y-3">
        <label className="text-sm font-bold text-foreground">نوع السيارة</label>
        <div className="grid grid-cols-2 gap-2">
          {bodyTypes.map((body) => {
            const isSelected = filters.bodyType === body.id;
            return (
              <button key={body.id} onClick={() => toggleBody(body.id)}
                className={cn("py-2.5 px-3 rounded-lg text-sm font-semibold transition-all border-2 flex items-center justify-center gap-2",
                  isSelected ? "border-primary bg-primary/10 text-primary" : "border-border bg-background text-muted-foreground hover:border-primary/40")}>
                {isSelected && <Check className="w-4 h-4" />}
                {body.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Colors */}
      <div className="space-y-3">
        <label className="text-sm font-bold text-foreground">
          اللون
          {filters.color && (
            <button onClick={() => updateFilter("color", undefined)} className="mr-2 text-xs font-normal text-muted-foreground hover:text-destructive transition-colors">(مسح)</button>
          )}
        </label>
        <div className="flex flex-wrap gap-2">
          {colors.map((c) => {
            const isSelected = filters.color === c.key;
            return (
              <button key={c.key} onClick={() => toggleColor(c.key)} title={c.ar}
                className={cn("relative w-8 h-8 rounded-full transition-all focus:outline-none",
                  isSelected ? "scale-110 ring-2 ring-primary ring-offset-2 ring-offset-card" : "hover:scale-105")}
                style={{ backgroundColor: c.css, border: `2px solid ${c.border}` }}>
                {isSelected && (
                  <Check className="absolute inset-0 m-auto w-4 h-4"
                    style={{ color: lightColors.includes(c.key) ? "#374151" : "#fff" }} />
                )}
              </button>
            );
          })}
        </div>
        {filters.color && <p className="text-xs text-muted-foreground">{colors.find((c) => c.key === filters.color)?.ar}</p>}
      </div>

      {/* Sunroof */}
      <div className="space-y-4 pt-4 border-t border-border">
        <label className="flex items-center gap-3 cursor-pointer group">
          <div className="relative flex items-center justify-center">
            <input type="checkbox" className="peer sr-only"
              checked={filters.sunroof || false}
              onChange={(e) => updateFilter("sunroof", e.target.checked || undefined)} />
            <div className="w-6 h-6 rounded-md border-2 border-border bg-background peer-checked:bg-primary peer-checked:border-primary transition-all group-hover:border-primary/50"></div>
            <Check className="absolute w-4 h-4 text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" />
          </div>
          <span className="font-semibold text-sm group-hover:text-primary transition-colors">فتحة سقف</span>
        </label>
      </div>

    </div>
  );
}
