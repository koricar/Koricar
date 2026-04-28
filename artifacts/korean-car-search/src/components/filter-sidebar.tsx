import { useState } from "react";
import { useGetCarBrands, type SearchCarsParams } from "@workspace/api-client-react";
import { Filter, ChevronDown, Check, Globe, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface FilterSidebarProps {
  filters: SearchCarsParams;
  updateFilter: <K extends keyof SearchCarsParams>(key: K, value: SearchCarsParams[K]) => void;
  resetFilters: () => void;
  className?: string;
}

type ModelOption = { label: string; value: string; yearFrom?: number; yearTo?: number; };

export type CountryCode = "SA" | "AE" | "KW" | "QA" | "BH" | "OM";
interface CountryRule { label: string; flag: string; minYear: number; }

export const COUNTRY_RULES: Record<CountryCode, CountryRule> = {
  SA: { label: "السعودية", flag: "🇸🇦", minYear: 2021 },
  AE: { label: "الإمارات", flag: "🇦🇪", minYear: 2021 },
  KW: { label: "الكويت",   flag: "🇰🇼", minYear: 2021 },
  QA: { label: "قطر",      flag: "🇶🇦", minYear: 2021 },
  BH: { label: "البحرين",  flag: "🇧🇭", minYear: 2021 },
  OM: { label: "عُمان",    flag: "🇴🇲", minYear: 2021 },
};

const uf = (fn: any) => fn as (key: string, value: any) => void;

const BRAND_MODELS: Record<string, ModelOption[]> = {

  // ══ HYUNDAI ══════════════════════════════════════════════════════════════
  "Hyundai": [
    // Elantra / Avante — ModelGroup = 아반떼 + year filter
    { label: "Elantra HD (2006–2010)",             value: "아반떼",   yearFrom: 2006, yearTo: 2010 },
    { label: "Elantra MD (2010–2015)",             value: "아반떼",   yearFrom: 2010, yearTo: 2015 },
    { label: "Elantra AD (2015–2020)",             value: "아반떼",   yearFrom: 2015, yearTo: 2020 },
    { label: "Elantra CN7 (2020+)",                value: "아반떼",   yearFrom: 2020 },
    // Sonata — ModelGroup = 쏘나타
    { label: "Sonata NF (2004–2009)",              value: "쏘나타",   yearFrom: 2004, yearTo: 2009 },
    { label: "Sonata YF (2009–2014)",              value: "쏘나타",   yearFrom: 2009, yearTo: 2014 },
    { label: "Sonata LF (2014–2019)",              value: "쏘나타",   yearFrom: 2014, yearTo: 2019 },
    { label: "Sonata DN8 (2019+)",                 value: "쏘나타",   yearFrom: 2019 },
    // Grandeur — ModelGroup = 그랜저
    { label: "Grandeur TG (2005–2011)",            value: "그랜저",   yearFrom: 2005, yearTo: 2011 },
    { label: "Grandeur HG (2011–2016)",            value: "그랜저",   yearFrom: 2011, yearTo: 2016 },
    { label: "Grandeur IG (2016–2022)",            value: "그랜저",   yearFrom: 2016, yearTo: 2022 },
    { label: "Grandeur GN7 (2022+)",               value: "그랜저",   yearFrom: 2022 },
    // Tucson — ModelGroup = 투싼
    { label: "Tucson JM (2004–2009)",              value: "투싼",     yearFrom: 2004, yearTo: 2009 },
    { label: "Tucson ix (2009–2015)",              value: "투싼",     yearFrom: 2009, yearTo: 2015 },
    { label: "Tucson TL (2015–2021)",              value: "투싼",     yearFrom: 2015, yearTo: 2021 },
    { label: "Tucson NX4 (2021+)",                 value: "투싼",     yearFrom: 2021 },
    // Santa Fe — ModelGroup = 싼타페
    { label: "Santa Fe CM (2006–2012)",            value: "싼타페",   yearFrom: 2006, yearTo: 2012 },
    { label: "Santa Fe DM (2012–2018)",            value: "싼타페",   yearFrom: 2012, yearTo: 2018 },
    { label: "Santa Fe TM (2018–2023)",            value: "싼타페",   yearFrom: 2018, yearTo: 2023 },
    { label: "Santa Fe MX5 (2023+)",               value: "싼타페",   yearFrom: 2023 },
    // Palisade — ModelGroup = 팰리세이드
    { label: "Palisade (2019+)",                   value: "팰리세이드", yearFrom: 2019 },
    // Kona — ModelGroup = 코나
    { label: "Kona 1st (2017–2023)",               value: "코나",     yearFrom: 2017, yearTo: 2023 },
    { label: "Kona 2nd (2023+)",                   value: "코나",     yearFrom: 2023 },
    // Ioniq — ModelGroup = 아이오닉
    { label: "Ioniq (2016–2022)",                  value: "아이오닉", yearFrom: 2016, yearTo: 2022 },
    // Ioniq 5 — ModelGroup = 아이오닉5
    { label: "Ioniq 5 (2021+)",                    value: "아이오닉5", yearFrom: 2021 },
    // Ioniq 6 — ModelGroup = 아이오닉6
    { label: "Ioniq 6 (2022+)",                    value: "아이오닉6", yearFrom: 2022 },
    // Ioniq 9 — ModelGroup = 아이오닉9
    { label: "Ioniq 9 (2024+)",                    value: "아이오닉9", yearFrom: 2024 },
    // Starex / Staria
    { label: "Starex (2007–2021)",                 value: "스타렉스", yearFrom: 2007, yearTo: 2021 },
    { label: "Staria (2021+)",                     value: "스타리아", yearFrom: 2021 },
    // باقي — ModelGroup مباشر
    { label: "Casper (2021+)",                     value: "캐스퍼",   yearFrom: 2021 },
    { label: "Nexo Hydrogen (2018+)",              value: "넥쏘",     yearFrom: 2018 },
    { label: "Venue (2019+)",                      value: "베뉴",     yearFrom: 2019 },
    { label: "Veloster (2011–2022)",               value: "벨로스터", yearFrom: 2011, yearTo: 2022 },
    { label: "Accent (2010–2017)",                 value: "엑센트",   yearFrom: 2010, yearTo: 2017 },
    { label: "Porter 2 (2004+)",                   value: "포터",     yearFrom: 2004 },
  ],

  // ══ KIA ══════════════════════════════════════════════════════════════════
  "Kia": [
    // K3 — ModelGroup = K3
    { label: "Cerato / K3 (2008–2018)",          value: "K3",       yearFrom: 2008, yearTo: 2018 },
    { label: "K3 2nd Gen (2018+)",               value: "K3",       yearFrom: 2018 },
    // K5 — ModelGroup = K5
    { label: "K5 1st Gen (2010–2015)",           value: "K5",       yearFrom: 2010, yearTo: 2015 },
    { label: "K5 2nd Gen (2015–2019)",           value: "K5",       yearFrom: 2015, yearTo: 2019 },
    { label: "K5 3rd Gen (2019+)",               value: "K5",       yearFrom: 2019 },
    // K8 / K7 — ModelGroup = K8
    { label: "K7 1st (2009–2016)",               value: "K8",       yearFrom: 2009, yearTo: 2016 },
    { label: "K7 2nd (2016–2021)",               value: "K8",       yearFrom: 2016, yearTo: 2021 },
    { label: "K8 (2021+)",                       value: "K8",       yearFrom: 2021 },
    { label: "K9 (2012+)",                       value: "K9",       yearFrom: 2012 },
    // Sportage — ModelGroup = 스포티지
    { label: "Sportage 3rd (2010–2015)",         value: "스포티지", yearFrom: 2010, yearTo: 2015 },
    { label: "Sportage 4th (2015–2021)",         value: "스포티지", yearFrom: 2015, yearTo: 2021 },
    { label: "Sportage 5th (2021+)",             value: "스포티지", yearFrom: 2021 },
    // Sorento — ModelGroup = 쏘렌토
    { label: "Sorento 2nd (2009–2014)",          value: "쏘렌토",   yearFrom: 2009, yearTo: 2014 },
    { label: "Sorento 3rd (2014–2020)",          value: "쏘렌토",   yearFrom: 2014, yearTo: 2020 },
    { label: "Sorento 4th (2020+)",              value: "쏘렌토",   yearFrom: 2020 },
    // Carnival — ModelGroup = 카니발
    { label: "Carnival 3rd (2014–2020)",         value: "카니발",   yearFrom: 2014, yearTo: 2020 },
    { label: "Carnival 4th (2020+)",             value: "카니발",   yearFrom: 2020 },
    // Seltos — ModelGroup = 셀토스
    { label: "Seltos (2019+)",                   value: "셀토스",   yearFrom: 2019 },
    // Niro — ModelGroup = 니로
    { label: "Niro 1st Gen (2016–2022)",         value: "니로",     yearFrom: 2016, yearTo: 2022 },
    { label: "Niro 2nd Gen (2022+)",             value: "니로",     yearFrom: 2022 },
    // EV
    { label: "EV3 (2024+)",                      value: "EV3",      yearFrom: 2024 },
    { label: "EV6 (2021+)",                      value: "EV6",      yearFrom: 2021 },
    { label: "EV9 (2023+)",                      value: "EV9",      yearFrom: 2023 },
    // باقي
    { label: "Stinger (2017+)",                  value: "스팅어",   yearFrom: 2017 },
    { label: "Mohave (2008+)",                   value: "모하비",   yearFrom: 2008 },
    { label: "Telluride (2019+)",                value: "텔루라이드", yearFrom: 2019 },
    { label: "Soul (2013–2021)",                 value: "쏘울",     yearFrom: 2013, yearTo: 2021 },
    { label: "Morning (2011+)",                  value: "모닝",     yearFrom: 2011 },
    { label: "Ray (2012+)",                      value: "레이",     yearFrom: 2012 },
  ],

  // ══ GENESIS ══════════════════════════════════════════════════════════════
  "Genesis": [
    { label: "G70 (2017+)",    value: "G70",  yearFrom: 2017 },
    { label: "G80 (2016+)",    value: "G80",  yearFrom: 2016 },
    { label: "G90 (2015+)",    value: "G90",  yearFrom: 2015 },
    { label: "GV60 (2021+)",   value: "GV60", yearFrom: 2021 },
    { label: "GV70 (2021+)",   value: "GV70", yearFrom: 2021 },
    { label: "GV80 (2020+)",   value: "GV80", yearFrom: 2020 },
  ],

  // ══ SSANGYONG ════════════════════════════════════════════════════════════
  "SsangYong": [
    { label: "Rexton (2012+)",               value: "렉스턴",   yearFrom: 2012 },
    { label: "Rexton Sports (2018+)",        value: "렉스턴",   yearFrom: 2018 },
    { label: "Korando (2010+)",              value: "코란도",   yearFrom: 2010 },
    { label: "Tivoli (2015+)",               value: "티볼리",   yearFrom: 2015 },
    { label: "Musso (2018+)",                value: "무쏘",     yearFrom: 2018 },
    { label: "Actyon Sports (2012+)",        value: "액티언",   yearFrom: 2012 },
  ],

  // ══ KG MOBILITY ══════════════════════════════════════════════════════════
  "KG Mobility": [
    { label: "Torres (2022+)",               value: "토레스",   yearFrom: 2022 },
    { label: "Rexton (2017+)",               value: "렉스턴",   yearFrom: 2017 },
    { label: "Rexton Sports (2018+)",        value: "렉스턴",   yearFrom: 2018 },
    { label: "Korando (2019+)",              value: "코란도",   yearFrom: 2019 },
    { label: "Tivoli (2015+)",               value: "티볼리",   yearFrom: 2015 },
    { label: "Musso (2018+)",                value: "무쏘",     yearFrom: 2018 },
  ],

  // ══ RENAULT SAMSUNG ══════════════════════════════════════════════════════
  "Renault Samsung": [
    { label: "SM3 2nd (2009–2018)",           value: "SM3",                        yearFrom: 2009, yearTo: 2018 },
    { label: "SM5 3rd (2010–2019)",           value: "SM5",                        yearFrom: 2010, yearTo: 2019 },
    { label: "SM6 (2016+)",                   value: "SM6",                        yearFrom: 2016 },
    { label: "SM7 2nd (2011–2019)",           value: "SM7",                        yearFrom: 2011, yearTo: 2019 },
    { label: "QM3 (2013–2019)",               value: "QM3",                        yearFrom: 2013, yearTo: 2019 },
    { label: "QM5 (2007–2017)",               value: "QM5",                        yearFrom: 2007, yearTo: 2017 },
    { label: "QM6 (2016+)",                   value: "QM6",                        yearFrom: 2016 },
    { label: "QM6 LPe (2019+)",               value: "QM6 LPe",                   yearFrom: 2019 },
    { label: "XM3 (2020+)",                   value: "XM3",                        yearFrom: 2020 },
  ],

  // ══ RENAULT KOREA ════════════════════════════════════════════════════════
  "Renault Korea": [
    { label: "QM6 (2016+)",                   value: "QM6",                        yearFrom: 2016 },
    { label: "SM6 (2016+)",                   value: "SM6",                        yearFrom: 2016 },
    { label: "XM3 / Arkana (2020+)",          value: "XM3",                        yearFrom: 2020 },
    { label: "Philante (2023+)",              value: "필랑트",                     yearFrom: 2023 },
  ],

  // ══ CHEVROLET ════════════════════════════════════════════════════════════
  "Chevrolet": [
    { label: "Spark M300 (2009–2015)",        value: "스파크 M300",                yearFrom: 2009, yearTo: 2015 },
    { label: "Spark M400 (2015+)",            value: "스파크",                     yearFrom: 2015 },
    { label: "Malibu 8th (2015+)",            value: "말리부",                     yearFrom: 2015 },
    { label: "Trax 1st (2012–2021)",          value: "트랙스",                     yearFrom: 2012, yearTo: 2021 },
    { label: "Trax Crossover (2022+)",        value: "트랙스 크로스오버",          yearFrom: 2022 },
    { label: "Trailblazer (2020+)",           value: "트레일블레이저",             yearFrom: 2020 },
    { label: "Trailblazer New (2023+)",       value: "더 뉴 트레일블레이저",       yearFrom: 2023 },
    { label: "Equinox 3rd (2017+)",           value: "이쿼녹스",                   yearFrom: 2017 },
    { label: "Equinox EV (2024+)",            value: "이쿼녹스 EV",                yearFrom: 2024 },
    { label: "Colorado (2021+)",              value: "콜로라도",                   yearFrom: 2021 },
    { label: "Traverse 2nd (2017+)",          value: "트래버스",                   yearFrom: 2017 },
    { label: "Blazer EV (2023+)",             value: "블레이저 EV",                yearFrom: 2023 },
    { label: "Tahoe 5th (2021+)",             value: "타호",                       yearFrom: 2021 },
    { label: "Orlando (2011–2018)",           value: "올란도",                     yearFrom: 2011, yearTo: 2018 },
    { label: "Captiva (2011–2018)",           value: "캡티바",                     yearFrom: 2011, yearTo: 2018 },
  ],

  // ══ BMW ══════════════════════════════════════════════════════════════════
  "BMW": [
    { label: "1 Series E87 (2004–2011)",      value: "1시리즈 (E87)",              yearFrom: 2004, yearTo: 2011 },
    { label: "1 Series F20 (2011–2019)",      value: "1시리즈 (F20)",              yearFrom: 2011, yearTo: 2019 },
    { label: "1 Series F40 (2019+)",          value: "1시리즈 (F40)",              yearFrom: 2019 },
    { label: "2 Series F22 Coupe (2013–2021)",value: "2시리즈 쿠페 (F22)",         yearFrom: 2013, yearTo: 2021 },
    { label: "2 Series F44 Gran Coupe (2019+)",value: "2시리즈 그란쿠페 (F44)",   yearFrom: 2019 },
    { label: "2 Series F45 Active (2014–2021)",value: "2시리즈 액티브투어러 (F45)", yearFrom: 2014, yearTo: 2021 },
    { label: "2 Series G42 Coupe (2021+)",    value: "2시리즈 (G42)",              yearFrom: 2021 },
    { label: "3 Series E90 (2005–2012)",      value: "3시리즈 (E90)",              yearFrom: 2005, yearTo: 2012 },
    { label: "3 Series F30 (2012–2019)",      value: "3시리즈 (F30)",              yearFrom: 2012, yearTo: 2019 },
    { label: "3 Series G20 (2019+)",          value: "3시리즈 (G20)",              yearFrom: 2019 },
    { label: "4 Series F32 (2013–2020)",      value: "4시리즈 (F32)",              yearFrom: 2013, yearTo: 2020 },
    { label: "4 Series F36 Gran Coupe (2014–2021)", value: "4시리즈 그란쿠페 (F36)", yearFrom: 2014, yearTo: 2021 },
    { label: "4 Series G22 (2020+)",          value: "4시리즈 (G22)",              yearFrom: 2020 },
    { label: "4 Series G26 Gran Coupe (2021+)",value: "4시리즈 그란쿠페 (G26)",   yearFrom: 2021 },
    { label: "5 Series E60 (2003–2010)",      value: "5시리즈 (E60)",              yearFrom: 2003, yearTo: 2010 },
    { label: "5 Series F10 (2010–2017)",      value: "5시리즈 (F10)",              yearFrom: 2010, yearTo: 2017 },
    { label: "5 Series G30 (2017–2023)",      value: "5시리즈 (G30)",              yearFrom: 2017, yearTo: 2023 },
    { label: "5 Series G60 (2023+)",          value: "5시리즈 (G60)",              yearFrom: 2023 },
    { label: "6 Series F12 (2011–2018)",      value: "6시리즈 (F12)",              yearFrom: 2011, yearTo: 2018 },
    { label: "6 Series G32 Gran Turismo (2017–2023)", value: "6시리즈 그란투리스모 (G32)", yearFrom: 2017, yearTo: 2023 },
    { label: "7 Series F01 (2008–2015)",      value: "7시리즈 (F01)",              yearFrom: 2008, yearTo: 2015 },
    { label: "7 Series G11 (2015–2022)",      value: "7시리즈 (G11)",              yearFrom: 2015, yearTo: 2022 },
    { label: "7 Series G70 (2022+)",          value: "7시리즈 (G70)",              yearFrom: 2022 },
    { label: "8 Series G15 (2018+)",          value: "8시리즈 (G15)",              yearFrom: 2018 },
    { label: "8 Series G16 Gran Coupe (2019+)",value: "8시리즈 그란쿠페 (G16)",   yearFrom: 2019 },
    { label: "X1 E84 (2009–2015)",            value: "X1 (E84)",                   yearFrom: 2009, yearTo: 2015 },
    { label: "X1 F48 (2015–2022)",            value: "X1 (F48)",                   yearFrom: 2015, yearTo: 2022 },
    { label: "X1 U11 (2022+)",                value: "X1 (U11)",                   yearFrom: 2022 },
    { label: "X2 F39 (2017–2023)",            value: "X2 (F39)",                   yearFrom: 2017, yearTo: 2023 },
    { label: "X2 U10 (2024+)",                value: "X2 (U10)",                   yearFrom: 2024 },
    { label: "X3 E83 (2003–2010)",            value: "X3 (E83)",                   yearFrom: 2003, yearTo: 2010 },
    { label: "X3 F25 (2010–2017)",            value: "X3 (F25)",                   yearFrom: 2010, yearTo: 2017 },
    { label: "X3 G01 (2017–2024)",            value: "X3 (G01)",                   yearFrom: 2017, yearTo: 2024 },
    { label: "X3 G45 (2024+)",                value: "X3 (G45)",                   yearFrom: 2024 },
    { label: "X4 F26 (2014–2018)",            value: "X4 (F26)",                   yearFrom: 2014, yearTo: 2018 },
    { label: "X4 G02 (2018+)",                value: "X4 (G02)",                   yearFrom: 2018 },
    { label: "X5 E70 (2006–2013)",            value: "X5 (E70)",                   yearFrom: 2006, yearTo: 2013 },
    { label: "X5 F15 (2013–2018)",            value: "X5 (F15)",                   yearFrom: 2013, yearTo: 2018 },
    { label: "X5 G05 (2018+)",                value: "X5 (G05)",                   yearFrom: 2018 },
    { label: "X6 E71 (2008–2014)",            value: "X6 (E71)",                   yearFrom: 2008, yearTo: 2014 },
    { label: "X6 F16 (2014–2019)",            value: "X6 (F16)",                   yearFrom: 2014, yearTo: 2019 },
    { label: "X6 G06 (2019+)",                value: "X6 (G06)",                   yearFrom: 2019 },
    { label: "X7 G07 (2019+)",                value: "X7 (G07)",                   yearFrom: 2019 },
    { label: "M2 F87 (2015–2021)",            value: "M2 (F87)",                   yearFrom: 2015, yearTo: 2021 },
    { label: "M2 G87 (2022+)",                value: "M2 (G87)",                   yearFrom: 2022 },
    { label: "M3 F80 (2014–2020)",            value: "M3 (F80)",                   yearFrom: 2014, yearTo: 2020 },
    { label: "M3 G80 (2020+)",                value: "M3 (G80)",                   yearFrom: 2020 },
    { label: "M4 F82 (2014–2020)",            value: "M4 (F82)",                   yearFrom: 2014, yearTo: 2020 },
    { label: "M4 G82 (2020+)",                value: "M4 (G82)",                   yearFrom: 2020 },
    { label: "M5 F10 (2011–2017)",            value: "M5 (F10)",                   yearFrom: 2011, yearTo: 2017 },
    { label: "M5 F90 (2017–2024)",            value: "M5 (F90)",                   yearFrom: 2017, yearTo: 2024 },
    { label: "M5 G90 (2024+)",                value: "M5 (G90)",                   yearFrom: 2024 },
    { label: "M8 F92 (2018+)",                value: "M8 (F92)",                   yearFrom: 2018 },
    { label: "i3 (2013–2022)",                value: "i3",                          yearFrom: 2013, yearTo: 2022 },
    { label: "i4 (2021+)",                    value: "i4",                          yearFrom: 2021 },
    { label: "i5 (2023+)",                    value: "i5",                          yearFrom: 2023 },
    { label: "i7 (2022+)",                    value: "i7",                          yearFrom: 2022 },
    { label: "i8 (2014–2020)",                value: "i8",                          yearFrom: 2014, yearTo: 2020 },
    { label: "iX (2021+)",                    value: "iX",                          yearFrom: 2021 },
    { label: "iX3 (2020+)",                   value: "iX3",                         yearFrom: 2020 },
    { label: "XM (2022+)",                    value: "XM",                          yearFrom: 2022 },
    { label: "Z4 G29 (2018+)",                value: "Z4 (G29)",                   yearFrom: 2018 },
  ],

  // ══ MERCEDES-BENZ ════════════════════════════════════════════════════════
  "Mercedes-Benz": [
    { label: "A-Class W176 (2012–2018)",      value: "A클래스 (W176)",             yearFrom: 2012, yearTo: 2018 },
    { label: "A-Class W177 (2018+)",          value: "A클래스 (W177)",             yearFrom: 2018 },
    { label: "B-Class W246 (2011–2018)",      value: "B클래스",                    yearFrom: 2011, yearTo: 2018 },
    { label: "C-Class W204 (2007–2014)",      value: "C클래스 (W204)",             yearFrom: 2007, yearTo: 2014 },
    { label: "C-Class W205 (2014–2021)",      value: "C클래스 (W205)",             yearFrom: 2014, yearTo: 2021 },
    { label: "C-Class W206 (2021+)",          value: "C클래스 (W206)",             yearFrom: 2021 },
    { label: "E-Class W212 (2009–2016)",      value: "E클래스 (W212)",             yearFrom: 2009, yearTo: 2016 },
    { label: "E-Class W213 (2016–2024)",      value: "E클래스 (W213)",             yearFrom: 2016, yearTo: 2024 },
    { label: "E-Class W214 (2024+)",          value: "E클래스 (W214)",             yearFrom: 2024 },
    { label: "S-Class W221 (2005–2013)",      value: "S클래스 (W221)",             yearFrom: 2005, yearTo: 2013 },
    { label: "S-Class W222 (2013–2021)",      value: "S클래스 (W222)",             yearFrom: 2013, yearTo: 2021 },
    { label: "S-Class W223 (2021+)",          value: "S클래스 (W223)",             yearFrom: 2021 },
    { label: "G-Class W463 (2018+)",          value: "G클래스 (W463)",             yearFrom: 2018 },
    { label: "CLA C117 (2013–2019)",          value: "CLA (C117)",                 yearFrom: 2013, yearTo: 2019 },
    { label: "CLA C118 (2019+)",              value: "CLA (C118)",                 yearFrom: 2019 },
    { label: "CLS C218 (2010–2018)",          value: "CLS클래스",                  yearFrom: 2010, yearTo: 2018 },
    { label: "CLS C257 (2018+)",              value: "CLS (C257)",                 yearFrom: 2018 },
    { label: "CLE (2024+)",                   value: "CLE클래스",                  yearFrom: 2024 },
    { label: "GLA X156 (2013–2020)",          value: "GLA (X156)",                 yearFrom: 2013, yearTo: 2020 },
    { label: "GLA H247 (2020+)",              value: "GLA (H247)",                 yearFrom: 2020 },
    { label: "GLB X247 (2019+)",              value: "GLB클래스",                  yearFrom: 2019 },
    { label: "GLC X253 (2015–2022)",          value: "GLC (X253)",                 yearFrom: 2015, yearTo: 2022 },
    { label: "GLC X254 (2023+)",              value: "GLC (X254)",                 yearFrom: 2023 },
    { label: "GLC Coupe C253 (2016–2022)",    value: "GLC쿠페 (C253)",             yearFrom: 2016, yearTo: 2022 },
    { label: "GLE W166 (2015–2019)",          value: "GLE (W166)",                 yearFrom: 2015, yearTo: 2019 },
    { label: "GLE V167 (2019+)",              value: "GLE (V167)",                 yearFrom: 2019 },
    { label: "GLE Coupe C167 (2020+)",        value: "GLE쿠페",                    yearFrom: 2020 },
    { label: "GLS X166 (2016–2019)",          value: "GLS (X166)",                 yearFrom: 2016, yearTo: 2019 },
    { label: "GLS X167 (2019+)",              value: "GLS (X167)",                 yearFrom: 2019 },
    { label: "EQA (2021+)",                   value: "EQA",                        yearFrom: 2021 },
    { label: "EQB (2021+)",                   value: "EQB",                        yearFrom: 2021 },
    { label: "EQC (2019+)",                   value: "EQC",                        yearFrom: 2019 },
    { label: "EQE (2022+)",                   value: "EQE",                        yearFrom: 2022 },
    { label: "EQS (2021+)",                   value: "EQS",                        yearFrom: 2021 },
    { label: "Maybach S-Class (2020+)",       value: "마이바흐 S클래스",           yearFrom: 2020 },
    { label: "AMG GT R190 (2015+)",           value: "AMG GT",                     yearFrom: 2015 },
    { label: "SL-Class R232 (2021+)",         value: "SL클래스",                   yearFrom: 2021 },
  ],

  // ══ AUDI ══════════════════════════════════════════════════════════════════
  "Audi": [
    { label: "A3 8V (2013–2020)",             value: "A3",                          yearFrom: 2013, yearTo: 2020 },
    { label: "A3 8Y (2020+)",                 value: "A3",                          yearFrom: 2020 },
    { label: "A4 B8 (2007–2015)",             value: "A4 B8",                       yearFrom: 2007, yearTo: 2015 },
    { label: "A4 B9 (2015+)",                 value: "A4",                          yearFrom: 2015 },
    { label: "A5 8T (2007–2016)",             value: "A5 8T",                       yearFrom: 2007, yearTo: 2016 },
    { label: "A5 F5 (2016+)",                 value: "A5",                          yearFrom: 2016 },
    { label: "A6 C7 (2011–2018)",             value: "A6 C7",                       yearFrom: 2011, yearTo: 2018 },
    { label: "A6 C8 (2018+)",                 value: "A6",                          yearFrom: 2018 },
    { label: "A7 4K (2018+)",                 value: "A7",                          yearFrom: 2018 },
    { label: "A8 D4 (2009–2017)",             value: "A8 D4",                       yearFrom: 2009, yearTo: 2017 },
    { label: "A8 D5 (2017+)",                 value: "A8",                          yearFrom: 2017 },
    { label: "Q3 8U (2011–2018)",             value: "Q3 8U",                       yearFrom: 2011, yearTo: 2018 },
    { label: "Q3 F3 (2018+)",                 value: "Q3",                          yearFrom: 2018 },
    { label: "Q4 e-tron (2021+)",             value: "Q4 e-tron",                   yearFrom: 2021 },
    { label: "Q5 8R (2008–2017)",             value: "Q5 8R",                       yearFrom: 2008, yearTo: 2017 },
    { label: "Q5 FY (2017+)",                 value: "Q5",                          yearFrom: 2017 },
    { label: "Q7 4L (2005–2015)",             value: "Q7 4L",                       yearFrom: 2005, yearTo: 2015 },
    { label: "Q7 4M (2015+)",                 value: "Q7",                          yearFrom: 2015 },
    { label: "Q8 (2018+)",                    value: "Q8",                          yearFrom: 2018 },
    { label: "Q8 e-tron (2022+)",             value: "Q8 e-tron",                   yearFrom: 2022 },
    { label: "e-tron (2018+)",                value: "e-tron",                      yearFrom: 2018 },
    { label: "e-tron GT (2021+)",             value: "e-tron GT",                   yearFrom: 2021 },
    { label: "TT 8S (2014+)",                 value: "TT",                          yearFrom: 2014 },
    { label: "R8 (2006+)",                    value: "R8",                          yearFrom: 2006 },
    { label: "RS3 (2021+)",                   value: "RS3",                         yearFrom: 2021 },
    { label: "RS4 B9 (2017+)",               value: "RS4",                         yearFrom: 2017 },
    { label: "RS5 F5 (2017+)",               value: "RS5",                         yearFrom: 2017 },
    { label: "RS6 C8 (2019+)",               value: "RS6",                         yearFrom: 2019 },
    { label: "RS7 C8 (2019+)",               value: "RS7",                         yearFrom: 2019 },
    { label: "SQ5 (2013+)",                   value: "SQ5",                         yearFrom: 2013 },
    { label: "SQ7 (2016+)",                   value: "SQ7",                         yearFrom: 2016 },
    { label: "SQ8 (2019+)",                   value: "SQ8",                         yearFrom: 2019 },
  ],

  // ══ VOLKSWAGEN ════════════════════════════════════════════════════════════
  "Volkswagen": [
    { label: "Golf 6 (2008–2013)",            value: "골프 6",                      yearFrom: 2008, yearTo: 2013 },
    { label: "Golf 7 (2013–2019)",            value: "골프 7",                      yearFrom: 2013, yearTo: 2019 },
    { label: "Golf GTI 7 (2013–2019)",        value: "골프 GTI",                   yearFrom: 2013, yearTo: 2019 },
    { label: "Golf 8 (2019+)",                value: "골프",                        yearFrom: 2019 },
    { label: "Golf GTI 8 (2021+)",            value: "골프 GTI",                   yearFrom: 2021 },
    { label: "Golf R 8 (2021+)",              value: "골프 R",                      yearFrom: 2021 },
    { label: "Tiguan 1st 5N (2007–2016)",     value: "티구안 1세대",               yearFrom: 2007, yearTo: 2016 },
    { label: "Tiguan 2nd AD1 (2016+)",        value: "티구안",                     yearFrom: 2016 },
    { label: "Tiguan Allspace (2017+)",       value: "티구안 올스페이스",          yearFrom: 2017 },
    { label: "Passat B8 (2014+)",             value: "파사트",                     yearFrom: 2014 },
    { label: "Touareg 3rd CR (2018+)",        value: "투아렉",                     yearFrom: 2018 },
    { label: "Arteon (2017+)",                value: "아테온",                     yearFrom: 2017 },
    { label: "ID.4 (2020+)",                  value: "ID.4",                        yearFrom: 2020 },
    { label: "ID.6 (2021+)",                  value: "ID.6",                        yearFrom: 2021 },
    { label: "Polo AW (2017+)",               value: "폴로",                       yearFrom: 2017 },
  ],

  // ══ TOYOTA ════════════════════════════════════════════════════════════════
  "Toyota": [
    { label: "Camry XV50 (2011–2017)",        value: "캠리 XV50",                  yearFrom: 2011, yearTo: 2017 },
    { label: "Camry XV70 (2017+)",            value: "캠리",                       yearFrom: 2017 },
    { label: "RAV4 4th XA40 (2013–2018)",     value: "RAV4 XA40",                  yearFrom: 2013, yearTo: 2018 },
    { label: "RAV4 5th XA50 (2018+)",         value: "RAV4",                       yearFrom: 2018 },
    { label: "RAV4 Hybrid XA50 (2018+)",      value: "RAV4 하이브리드",            yearFrom: 2018 },
    { label: "Prius 4th XW50 (2015–2022)",    value: "프리우스 XW50",              yearFrom: 2015, yearTo: 2022 },
    { label: "Prius 5th XW60 (2022+)",        value: "프리우스",                   yearFrom: 2022 },
    { label: "Crown Crossover (2022+)",       value: "크라운 크로스오버",          yearFrom: 2022 },
    { label: "Alphard 3rd H30 (2015–2023)",   value: "알파드 H30",                 yearFrom: 2015, yearTo: 2023 },
    { label: "Alphard 4th H40 (2023+)",       value: "알파드",                     yearFrom: 2023 },
    { label: "Vellfire 3rd (2015–2022)",      value: "벨파이어",                   yearFrom: 2015, yearTo: 2022 },
    { label: "Sienna 4th (2020+)",            value: "시에나",                     yearFrom: 2020 },
    { label: "Land Cruiser 200 (2007–2021)",  value: "랜드크루저 200",             yearFrom: 2007, yearTo: 2021 },
    { label: "Land Cruiser 300 (2021+)",      value: "랜드크루저",                 yearFrom: 2021 },
    { label: "Land Cruiser Prado 150 (2009+)",value: "랜드크루저 프라도",          yearFrom: 2009 },
    { label: "Highlander 3rd XU50 (2013–2019)",value: "하이랜더 XU50",            yearFrom: 2013, yearTo: 2019 },
    { label: "Highlander 4th XU70 (2019+)",  value: "하이랜더",                   yearFrom: 2019 },
    { label: "GR86 (2021+)",                  value: "GR86",                       yearFrom: 2021 },
    { label: "GR Supra A90 (2019+)",          value: "GR 수프라",                  yearFrom: 2019 },
  ],

  // ══ LEXUS ═════════════════════════════════════════════════════════════════
  "Lexus": [
    { label: "IS250 3rd XE30 (2013–2020)",    value: "IS250",                      yearFrom: 2013, yearTo: 2020 },
    { label: "IS300h (2013+)",                value: "IS300h",                     yearFrom: 2013 },
    { label: "ES300h 6th XV60 (2012–2018)",   value: "ES300h",                     yearFrom: 2012, yearTo: 2018 },
    { label: "ES300h 7th XV70 (2018+)",       value: "ES300h 7세대",               yearFrom: 2018 },
    { label: "LS460 4th F40 (2006–2017)",     value: "LS460",                      yearFrom: 2006, yearTo: 2017 },
    { label: "LS500h 5th F50 (2017+)",        value: "LS500h 5세대",               yearFrom: 2017 },
    { label: "UX250h (2018+)",                value: "UX250h",                     yearFrom: 2018 },
    { label: "CT200h (2011–2020)",            value: "CT200h",                     yearFrom: 2011, yearTo: 2020 },
    { label: "NX300h 1st AZ10 (2014–2021)",   value: "NX300h",                     yearFrom: 2014, yearTo: 2021 },
    { label: "NX350h 2nd AZ20 (2021+)",       value: "NX350h 2세대",               yearFrom: 2021 },
    { label: "NX450h+ 2nd (2021+)",           value: "NX450h+ 2세대",              yearFrom: 2021 },
    { label: "RX350 3rd AL10 (2009–2015)",    value: "RX350 AL10",                 yearFrom: 2009, yearTo: 2015 },
    { label: "RX450h 4th AL20 (2015–2022)",   value: "RX450h 4세대",               yearFrom: 2015, yearTo: 2022 },
    { label: "RX350 5th AL30 (2022+)",        value: "RX350",                      yearFrom: 2022 },
    { label: "LX570 (2007–2021)",             value: "LX570",                      yearFrom: 2007, yearTo: 2021 },
    { label: "LX600 (2021+)",                 value: "LX600",                      yearFrom: 2021 },
    { label: "LC500 (2017+)",                 value: "LC500",                      yearFrom: 2017 },
    { label: "LC500h (2017+)",                value: "LC500h",                     yearFrom: 2017 },
  ],

  // ══ PORSCHE ═══════════════════════════════════════════════════════════════
  "Porsche": [
    { label: "Cayenne 2nd 92A (2010–2018)",   value: "카이엔 92A",                 yearFrom: 2010, yearTo: 2018 },
    { label: "Cayenne 3rd 9YA (2018+)",       value: "카이엔",                     yearFrom: 2018 },
    { label: "Cayenne Coupe (2019+)",         value: "카이엔 쿠페",                yearFrom: 2019 },
    { label: "Panamera 1st 970 (2009–2016)",  value: "파나메라 970",               yearFrom: 2009, yearTo: 2016 },
    { label: "Panamera 2nd 971 (2016+)",      value: "파나메라",                   yearFrom: 2016 },
    { label: "Taycan Y1A (2019+)",            value: "타이칸",                     yearFrom: 2019 },
    { label: "Taycan Cross Turismo (2021+)",  value: "타이칸 크로스 투리스모",     yearFrom: 2021 },
    { label: "Macan 1st 95B (2014–2024)",     value: "마칸",                       yearFrom: 2014, yearTo: 2024 },
    { label: "Macan EV (2024+)",              value: "마칸 EV",                    yearFrom: 2024 },
    { label: "911 991 (2011–2019)",           value: "911 991",                    yearFrom: 2011, yearTo: 2019 },
    { label: "911 992 (2019+)",               value: "911",                        yearFrom: 2019 },
    { label: "Boxster 718 982 (2016+)",       value: "박스터",                     yearFrom: 2016 },
    { label: "Cayman 718 982 (2016+)",        value: "케이맨",                     yearFrom: 2016 },
  ],

  // ══ VOLVO ═════════════════════════════════════════════════════════════════
  "Volvo": [
    { label: "XC90 1st (2002–2014)",          value: "XC90 1세대",                 yearFrom: 2002, yearTo: 2014 },
    { label: "XC90 2nd (2014+)",              value: "XC90",                       yearFrom: 2014 },
    { label: "XC90 Recharge (2021+)",         value: "XC90 리차지",                yearFrom: 2021 },
    { label: "XC60 1st (2008–2017)",          value: "XC60 1세대",                 yearFrom: 2008, yearTo: 2017 },
    { label: "XC60 2nd (2017+)",              value: "XC60",                       yearFrom: 2017 },
    { label: "XC40 (2017+)",                  value: "XC40",                       yearFrom: 2017 },
    { label: "XC40 Recharge (2020+)",         value: "XC40 리차지",                yearFrom: 2020 },
    { label: "C40 Recharge (2021+)",          value: "C40 리차지",                 yearFrom: 2021 },
    { label: "EX30 (2023+)",                  value: "EX30",                       yearFrom: 2023 },
    { label: "EX40 (2023+)",                  value: "EX40",                       yearFrom: 2023 },
    { label: "EX90 (2024+)",                  value: "EX90",                       yearFrom: 2024 },
    { label: "S60 3rd (2018+)",               value: "S60",                        yearFrom: 2018 },
    { label: "S90 2nd (2016+)",               value: "S90",                        yearFrom: 2016 },
    { label: "V60 2nd (2018+)",               value: "V60",                        yearFrom: 2018 },
    { label: "V60 Cross Country (2018+)",     value: "V60 크로스컨트리",           yearFrom: 2018 },
    { label: "V90 2nd (2016+)",               value: "V90",                        yearFrom: 2016 },
    { label: "V90 Cross Country (2016+)",     value: "V90 크로스컨트리",           yearFrom: 2016 },
  ],

  // ══ LAND ROVER ════════════════════════════════════════════════════════════
  "Land Rover": [
    { label: "Range Rover 4th L405 (2012–2021)", value: "레인지로버 L405",         yearFrom: 2012, yearTo: 2021 },
    { label: "Range Rover 5th L460 (2021+)",   value: "레인지로버",                yearFrom: 2021 },
    { label: "RR Sport 2nd L494 (2013–2022)",  value: "레인지로버 스포츠 L494",    yearFrom: 2013, yearTo: 2022 },
    { label: "RR Sport 3rd L461 (2022+)",      value: "레인지로버 스포츠",         yearFrom: 2022 },
    { label: "Evoque 1st L538 (2011–2019)",    value: "레인지로버 이보크 L538",    yearFrom: 2011, yearTo: 2019 },
    { label: "Evoque 2nd L551 (2019+)",        value: "레인지로버 이보크",         yearFrom: 2019 },
    { label: "Velar L560 (2017+)",             value: "레인지로버 벨라",           yearFrom: 2017 },
    { label: "Defender 4th L663 (2020+)",      value: "디펜더",                    yearFrom: 2020 },
    { label: "Discovery 5th L462 (2016+)",     value: "디스커버리",                yearFrom: 2016 },
    { label: "Discovery Sport L550 (2014+)",   value: "디스커버리 스포츠",         yearFrom: 2014 },
  ],

  // ══ TESLA ═════════════════════════════════════════════════════════════════
  "Tesla": [
    { label: "Model S (2012+)",               value: "모델 S",                     yearFrom: 2012 },
    { label: "Model X (2015+)",               value: "모델 X",                     yearFrom: 2015 },
    { label: "Model 3 (2017+)",               value: "모델 3",                     yearFrom: 2017 },
    { label: "Model Y (2020+)",               value: "모델 Y",                     yearFrom: 2020 },
    { label: "Cybertruck (2023+)",            value: "사이버트럭",                 yearFrom: 2023 },
  ],

  // ══ JAGUAR ════════════════════════════════════════════════════════════════
  "Jaguar": [
    { label: "F-Pace X761 (2016+)",           value: "F-페이스",                   yearFrom: 2016 },
    { label: "E-Pace X540 (2017+)",           value: "E-페이스",                   yearFrom: 2017 },
    { label: "I-Pace X590 (2018+)",           value: "I-페이스",                   yearFrom: 2018 },
    { label: "XE X760 (2015+)",               value: "XE",                         yearFrom: 2015 },
    { label: "XF 2nd X260 (2015+)",           value: "XF",                         yearFrom: 2015 },
    { label: "XJ 4th X351 (2010–2019)",       value: "XJ",                         yearFrom: 2010, yearTo: 2019 },
    { label: "F-Type X152 (2013+)",           value: "F-타입",                     yearFrom: 2013 },
  ],

  // ══ MINI ══════════════════════════════════════════════════════════════════
  "MINI": [
    { label: "Cooper R56 (2006–2013)",        value: "미니쿠퍼 R56",               yearFrom: 2006, yearTo: 2013 },
    { label: "Cooper F56 (2013+)",            value: "미니쿠퍼",                   yearFrom: 2013 },
    { label: "Countryman R60 (2010–2016)",    value: "컨트리맨 R60",               yearFrom: 2010, yearTo: 2016 },
    { label: "Countryman F60 (2016+)",        value: "컨트리맨",                   yearFrom: 2016 },
    { label: "Clubman F54 (2015+)",           value: "클럽맨",                     yearFrom: 2015 },
    { label: "Aceman J01 (2024+)",            value: "에이스맨",                   yearFrom: 2024 },
  ],

  // ══ FORD ══════════════════════════════════════════════════════════════════
  "Ford": [
    { label: "Mustang 6th S550 (2015+)",      value: "머스탱",                     yearFrom: 2015 },
    { label: "Mustang Mach-E (2020+)",        value: "머스탱 마하-E",              yearFrom: 2020 },
    { label: "Explorer 5th (2011–2019)",      value: "익스플로러 5세대",           yearFrom: 2011, yearTo: 2019 },
    { label: "Explorer 6th (2019+)",          value: "익스플로러",                 yearFrom: 2019 },
    { label: "F-150 14th (2021+)",            value: "F-150",                      yearFrom: 2021 },
    { label: "Bronco 6th (2021+)",            value: "브롱코",                     yearFrom: 2021 },
    { label: "Edge 2nd (2015+)",              value: "엣지",                       yearFrom: 2015 },
  ],

  // ══ JEEP ══════════════════════════════════════════════════════════════════
  "Jeep": [
    { label: "Grand Cherokee WK2 (2011–2021)",value: "그랜드체로키 WK2",           yearFrom: 2011, yearTo: 2021 },
    { label: "Grand Cherokee WL (2021+)",     value: "그랜드체로키",               yearFrom: 2021 },
    { label: "Wrangler JK (2007–2018)",       value: "랭글러 JK",                  yearFrom: 2007, yearTo: 2018 },
    { label: "Wrangler JL (2018+)",           value: "랭글러",                     yearFrom: 2018 },
    { label: "Compass 2nd (2017+)",           value: "컴패스",                     yearFrom: 2017 },
    { label: "Renegade (2014+)",              value: "레니게이드",                 yearFrom: 2014 },
  ],

  // ══ LINCOLN ═══════════════════════════════════════════════════════════════
  "Lincoln": [
    { label: "Navigator 3rd (2007–2017)",     value: "네비게이터 3세대",           yearFrom: 2007, yearTo: 2017 },
    { label: "Navigator 4th (2018+)",         value: "네비게이터",                 yearFrom: 2018 },
    { label: "Aviator 2nd (2019+)",           value: "에비에이터",                 yearFrom: 2019 },
    { label: "Nautilus (2018+)",              value: "노틸러스",                   yearFrom: 2018 },
    { label: "Corsair (2019+)",               value: "코르세어",                   yearFrom: 2019 },
    { label: "Continental 10th (2016–2020)",  value: "컨티넨탈",                   yearFrom: 2016, yearTo: 2020 },
    { label: "MKZ 2nd (2012–2020)",           value: "MKZ",                        yearFrom: 2012, yearTo: 2020 },
  ],

  // ══ CADILLAC ══════════════════════════════════════════════════════════════
  "Cadillac": [
    { label: "Escalade 4th (2014–2020)",      value: "에스컬레이드 4세대",         yearFrom: 2014, yearTo: 2020 },
    { label: "Escalade 5th (2021+)",          value: "에스컬레이드",               yearFrom: 2021 },
    { label: "XT4 (2018+)",                   value: "XT4",                        yearFrom: 2018 },
    { label: "XT5 (2016+)",                   value: "XT5",                        yearFrom: 2016 },
    { label: "XT6 (2019+)",                   value: "XT6",                        yearFrom: 2019 },
    { label: "CT5 (2019+)",                   value: "CT5",                        yearFrom: 2019 },
    { label: "CT6 (2016+)",                   value: "CT6",                        yearFrom: 2016 },
    { label: "Lyriq (2022+)",                 value: "리릭",                       yearFrom: 2022 },
  ],

  // ══ INFINITI ══════════════════════════════════════════════════════════════
  "Infiniti": [
    { label: "QX80 Z62 (2010+)",              value: "QX80",                       yearFrom: 2010 },
    { label: "QX60 2nd L50 (2021+)",          value: "QX60",                       yearFrom: 2021 },
    { label: "QX60 1st L50 (2012–2021)",      value: "QX60 1세대",                 yearFrom: 2012, yearTo: 2021 },
    { label: "QX50 2nd J55 (2017+)",          value: "QX50",                       yearFrom: 2017 },
    { label: "QX50 1st EX (2007–2017)",       value: "QX50 EX",                    yearFrom: 2007, yearTo: 2017 },
    { label: "QX70 FX (2008–2017)",           value: "QX70",                       yearFrom: 2008, yearTo: 2017 },
    { label: "Q50 V37 (2013+)",               value: "Q50",                        yearFrom: 2013 },
    { label: "Q60 V36 (2016+)",               value: "Q60",                        yearFrom: 2016 },
    { label: "Q70 Y51 (2010–2019)",           value: "Q70",                        yearFrom: 2010, yearTo: 2019 },
  ],

  // ══ HONDA ═════════════════════════════════════════════════════════════════
  "Honda": [
    { label: "Accord 9th (2012–2017)",        value: "어코드 9세대",               yearFrom: 2012, yearTo: 2017 },
    { label: "Accord 10th (2017+)",           value: "어코드",                     yearFrom: 2017 },
    { label: "Civic 10th (2015–2021)",        value: "시빅 10세대",                yearFrom: 2015, yearTo: 2021 },
    { label: "Civic 11th (2021+)",            value: "시빅",                       yearFrom: 2021 },
    { label: "CR-V 5th (2016+)",              value: "CR-V",                       yearFrom: 2016 },
    { label: "Pilot 3rd (2015+)",             value: "파일럿",                     yearFrom: 2015 },
    { label: "Odyssey 5th (2017+)",           value: "오딧세이",                   yearFrom: 2017 },
    { label: "HR-V 3rd (2021+)",              value: "HR-V",                       yearFrom: 2021 },
  ],

  // ══ NISSAN ════════════════════════════════════════════════════════════════
  "Nissan": [
    { label: "Patrol Y62 (2010+)",            value: "패트롤",                     yearFrom: 2010 },
    { label: "Murano 3rd Z52 (2014+)",        value: "무라노",                     yearFrom: 2014 },
    { label: "Qashqai 2nd J11 (2013–2021)",   value: "캐시카이 J11",               yearFrom: 2013, yearTo: 2021 },
    { label: "Qashqai 3rd J12 (2021+)",       value: "캐시카이",                   yearFrom: 2021 },
    { label: "X-Trail 3rd T32 (2013–2021)",   value: "엑스트레일 T32",             yearFrom: 2013, yearTo: 2021 },
    { label: "X-Trail 4th T33 (2021+)",       value: "엑스트레일",                 yearFrom: 2021 },
    { label: "Juke 1st F15 (2010–2019)",      value: "쥬크 F15",                   yearFrom: 2010, yearTo: 2019 },
    { label: "Juke 2nd F16 (2019+)",          value: "쥬크",                       yearFrom: 2019 },
    { label: "GT-R R35 (2007+)",              value: "GT-R",                       yearFrom: 2007 },
    { label: "370Z Z34 (2008–2020)",          value: "370Z",                       yearFrom: 2008, yearTo: 2020 },
  ],

  // ══ MASERATI / FERRARI / LAMBORGHINI ══════════════════════════════════════
  "Maserati": [
    { label: "Ghibli M157 (2013+)",           value: "기블리",                     yearFrom: 2013 },
    { label: "Levante M161 (2016+)",          value: "레반떼",                     yearFrom: 2016 },
    { label: "Quattroporte M156 (2013+)",     value: "콰트로포르테",               yearFrom: 2013 },
    { label: "Grecale (2022+)",               value: "그레칼레",                   yearFrom: 2022 },
    { label: "MC20 (2020+)",                  value: "MC20",                       yearFrom: 2020 },
  ],

  "Ferrari": [
    { label: "488 (2015–2019)",               value: "488",                        yearFrom: 2015, yearTo: 2019 },
    { label: "Portofino (2017+)",             value: "포르토피노",                 yearFrom: 2017 },
    { label: "SF90 (2019+)",                  value: "SF90",                       yearFrom: 2019 },
    { label: "Roma (2019+)",                  value: "로마",                       yearFrom: 2019 },
    { label: "296 GTB (2021+)",               value: "296 GTB",                    yearFrom: 2021 },
  ],

  "Lamborghini": [
    { label: "Aventador (2011+)",             value: "아벤타도르",                 yearFrom: 2011 },
    { label: "Huracan (2014+)",               value: "우라칸",                     yearFrom: 2014 },
    { label: "Urus (2018+)",                  value: "우루스",                     yearFrom: 2018 },
  ],

  // ══ MAZDA / SUBARU ═══════════════════════════════════════════════════════
  "Mazda": [
    { label: "Mazda 3 3rd BM (2013–2019)",    value: "마쯔다 3 BM",                yearFrom: 2013, yearTo: 2019 },
    { label: "Mazda 3 4th BP (2019+)",        value: "마쯔다 3",                   yearFrom: 2019 },
    { label: "CX-5 1st KE (2012–2017)",       value: "CX-5 1세대",                 yearFrom: 2012, yearTo: 2017 },
    { label: "CX-5 2nd KF (2017+)",           value: "CX-5",                       yearFrom: 2017 },
    { label: "CX-8 (2017+)",                  value: "CX-8",                       yearFrom: 2017 },
    { label: "CX-60 (2022+)",                 value: "CX-60",                      yearFrom: 2022 },
    { label: "MX-5 ND (2015+)",               value: "MX-5",                       yearFrom: 2015 },
  ],

  "Subaru": [
    { label: "Outback 5th BS (2014–2019)",    value: "아웃백 5세대",               yearFrom: 2014, yearTo: 2019 },
    { label: "Outback 6th BT (2019+)",        value: "아웃백",                     yearFrom: 2019 },
    { label: "Forester 5th SK (2018+)",       value: "포레스터",                   yearFrom: 2018 },
    { label: "Impreza 5th GK (2016+)",        value: "임프레자",                   yearFrom: 2016 },
    { label: "Legacy 6th BN (2014+)",         value: "레거시",                     yearFrom: 2014 },
    { label: "Crosstrek 2nd GT (2017+)",      value: "크로스트렉",                 yearFrom: 2017 },
  ],

  // ══ باقي الماركات ══════════════════════════════════════════════════════════
  "Alfa Romeo": [
    { label: "Giulia (2016+)",                value: "줄리아",                     yearFrom: 2016 },
    { label: "Stelvio (2017+)",               value: "스텔비오",                   yearFrom: 2017 },
    { label: "Tonale (2022+)",                value: "토날레",                     yearFrom: 2022 },
  ],

  "Mitsubishi": [
    { label: "Outlander 3rd GF (2012–2021)",  value: "아웃랜더 3세대",             yearFrom: 2012, yearTo: 2021 },
    { label: "Outlander 4th GN (2021+)",      value: "아웃랜더",                   yearFrom: 2021 },
    { label: "Eclipse Cross (2017+)",         value: "이클립스 크로스",            yearFrom: 2017 },
    { label: "Pajero Sport 3rd QF (2015+)",   value: "파제로 스포츠",              yearFrom: 2015 },
  ],

  "Bentley": [
    { label: "Continental GT 2nd (2011–2017)",value: "컨티넨탈 GT 2세대",          yearFrom: 2011, yearTo: 2017 },
    { label: "Continental GT 3rd (2017+)",    value: "컨티넨탈 GT",                yearFrom: 2017 },
    { label: "Bentayga (2015+)",              value: "벤테이가",                   yearFrom: 2015 },
    { label: "Flying Spur (2019+)",           value: "플라잉 스퍼",                yearFrom: 2019 },
  ],

  "Rolls-Royce": [
    { label: "Ghost 1st (2009–2020)",         value: "고스트 1세대",               yearFrom: 2009, yearTo: 2020 },
    { label: "Ghost 2nd (2020+)",             value: "고스트",                     yearFrom: 2020 },
    { label: "Phantom 8th (2017+)",           value: "팬텀",                       yearFrom: 2017 },
    { label: "Cullinan (2018+)",              value: "컬리넌",                     yearFrom: 2018 },
    { label: "Wraith (2013–2022)",            value: "레이스",                     yearFrom: 2013, yearTo: 2022 },
  ],

  "GMC": [
    { label: "Sierra 4th T1 (2019+)",         value: "시에라",                     yearFrom: 2019 },
    { label: "Acadia 2nd (2017+)",            value: "아카디아",                   yearFrom: 2017 },
    { label: "Yukon 5th (2021+)",             value: "유콘",                       yearFrom: 2021 },
    { label: "Canyon 3rd (2021+)",            value: "캐니언",                     yearFrom: 2021 },
  ],

  "Dodge": [
    { label: "Challenger 3rd LC (2008+)",     value: "챌린저",                     yearFrom: 2008 },
    { label: "Charger 7th LD (2011+)",        value: "차저",                       yearFrom: 2011 },
    { label: "Durango 3rd WD (2011+)",        value: "듀랑고",                     yearFrom: 2011 },
    { label: "RAM 1500 5th DT (2019+)",       value: "램",                         yearFrom: 2019 },
  ],

  "Polestar": [
    { label: "Polestar 2 (2020+)",            value: "폴스타 2",                   yearFrom: 2020 },
    { label: "Polestar 3 (2023+)",            value: "폴스타 3",                   yearFrom: 2023 },
    { label: "Polestar 4 (2024+)",            value: "폴스타 4",                   yearFrom: 2024 },
  ],

  "Fiat": [
    { label: "500 3rd (2007+)",               value: "500",                        yearFrom: 2007 },
    { label: "500X (2014+)",                  value: "500X",                       yearFrom: 2014 },
  ],

  "Hummer": [
    { label: "H2 (2002–2009)",                value: "허머 H2",                    yearFrom: 2002, yearTo: 2009 },
    { label: "H3 (2005–2010)",                value: "허머 H3",                    yearFrom: 2005, yearTo: 2010 },
    { label: "GMC Hummer EV (2021+)",         value: "GMC 허머 EV",                yearFrom: 2021 },
  ],

  "BYD": [
    { label: "Han (2020+)",                   value: "한",                         yearFrom: 2020 },
    { label: "Tang (2018+)",                  value: "탕",                         yearFrom: 2018 },
    { label: "Atto 3 (2021+)",                value: "아토 3",                     yearFrom: 2021 },
    { label: "Dolphin (2021+)",               value: "돌핀",                       yearFrom: 2021 },
    { label: "Seal (2022+)",                  value: "씰",                         yearFrom: 2022 },
  ],

  "Maybach": [
    { label: "S-Class (2020+)",               value: "마이바흐 S클래스",           yearFrom: 2020 },
    { label: "GLS (2020+)",                   value: "마이바흐 GLS",               yearFrom: 2020 },
  ],

  "Daewoo": [
    { label: "Damas (1991+)",                 value: "다마스",                     yearFrom: 1991 },
    { label: "New Damas (2013+)",             value: "뉴 다마스",                  yearFrom: 2013 },
    { label: "Labo (1991+)",                  value: "라보",                       yearFrom: 1991 },
    { label: "New Labo (2013+)",              value: "뉴 라보",                    yearFrom: 2013 },
    { label: "Matiz 1st (1998–2009)",         value: "마티즈",                     yearFrom: 1998, yearTo: 2009 },
    { label: "Matiz Creative (2009–2015)",    value: "마티즈 크리에이티브",        yearFrom: 2009, yearTo: 2015 },
    { label: "Gentra (2005–2011)",            value: "젠트라",                     yearFrom: 2005, yearTo: 2011 },
    { label: "Lacetti (2002–2008)",           value: "라세티",                     yearFrom: 2002, yearTo: 2008 },
    { label: "Lacetti Premier (2008–2015)",   value: "라세티 프리미어",            yearFrom: 2008, yearTo: 2015 },
    { label: "Cruze (2011–2019)",             value: "크루즈",                     yearFrom: 2011, yearTo: 2019 },
    { label: "Winstorm (2006–2015)",          value: "윈스톰",                     yearFrom: 2006, yearTo: 2015 },
    { label: "Alpheon (2010–2016)",           value: "알페온",                     yearFrom: 2010, yearTo: 2016 },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// FilterSidebar
// ─────────────────────────────────────────────────────────────────────────────
export function FilterSidebar({ filters, updateFilter, resetFilters, className }: FilterSidebarProps) {
  const { data: brandsData, isLoading: isLoadingBrands } = useGetCarBrands();
  const u = uf(updateFilter);
  const [selectedModelEntry, setSelectedModelEntry] = useState<ModelOption | null>(null);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 25 }, (_, i) => currentYear - i);

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
    setSelectedModelEntry(null);
    updateFilter("yearFrom", undefined);
    updateFilter("yearTo", undefined);
  };

  const handleModelChange = (value: string) => {
    if (!value) {
      u("model", undefined);
      setSelectedModelEntry(null);
      updateFilter("yearFrom", undefined);
      updateFilter("yearTo", undefined);
      return;
    }
    // نبحث بالـ value والـ label معاً لأن بعض الموديلات تشارك نفس الـ value
    const entry = brandModels.find((m) => m.value === value && m.label === brandModels.find(x => x.value === value && ((filters as any).model !== value || m.label === (selectedModelEntry?.label ?? "")))?.label) 
      ?? brandModels.find((m) => m.value === value) 
      ?? null;
    u("model", value);
    setSelectedModelEntry(entry);
    if (entry?.yearFrom) updateFilter("yearFrom", entry.yearFrom);
    else updateFilter("yearFrom", undefined);
    if (entry?.yearTo) updateFilter("yearTo", entry.yearTo);
    else updateFilter("yearTo", undefined);
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
      updateFilter("yearFrom", selectedModelEntry?.yearFrom ?? undefined);
    }
  };

  const toggleFuel  = (type: any) => updateFilter("fuelType", filters.fuelType === type ? undefined : type);
  const toggleBody  = (type: any) => updateFilter("bodyType", filters.bodyType === type ? undefined : type);
  const toggleColor = (key: string) => updateFilter("color", filters.color === key ? undefined : (key as any));

  const colors = [
    { key: "white",     ar: "أبيض",      css: "#F8F8F8", border: "#D1D5DB" },
    { key: "silver",    ar: "فضي",        css: "#C0C0C0", border: "#9CA3AF" },
    { key: "gray",      ar: "رمادي",      css: "#6B7280", border: "#4B5563" },
    { key: "black",     ar: "أسود",       css: "#1A1A1A", border: "#374151" },
    { key: "red",       ar: "أحمر",       css: "#EF4444", border: "#DC2626" },
    { key: "orange",    ar: "برتقالي",    css: "#F97316", border: "#EA580C" },
    { key: "yellow",    ar: "أصفر",       css: "#EAB308", border: "#CA8A04" },
    { key: "green",     ar: "أخضر",       css: "#22C55E", border: "#16A34A" },
    { key: "lime",      ar: "أخضر فاتح", css: "#84CC16", border: "#65A30D" },
    { key: "lightblue", ar: "أزرق فاتح", css: "#60A5FA", border: "#3B82F6" },
    { key: "brown",     ar: "بني",        css: "#92400E", border: "#78350F" },
  ];
  const lightColors = ["white", "silver", "yellow", "lime"];

  const modelYearBadge = selectedModelEntry
    ? selectedModelEntry.yearTo
      ? `${selectedModelEntry.yearFrom ?? ""}–${selectedModelEntry.yearTo}`
      : selectedModelEntry.yearFrom ? `${selectedModelEntry.yearFrom}+` : null
    : null;

  return (
    <div className={cn("bg-card rounded-2xl border border-border shadow-sm p-6 flex flex-col gap-6", className)}>

      <div className="flex items-center justify-between pb-4 border-b border-border">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <Filter className="w-5 h-5 text-primary" />التصفية
        </h3>
        <button onClick={() => { setSelectedModelEntry(null); resetFilters(); }}
          className="text-sm font-semibold text-muted-foreground hover:text-destructive transition-colors">
          مسح الكل
        </button>
      </div>

      {/* Country */}
      <div className="space-y-3 pb-4 border-b border-border">
        <label className="text-sm font-bold text-foreground flex items-center gap-2">
          <Globe className="w-4 h-4 text-primary" />دولتك
        </label>
        <div className="relative">
          <select className="w-full appearance-none bg-background border-2 border-border rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all cursor-pointer"
            value={selectedCountry} onChange={(e) => handleCountryChange(e.target.value)}>
            <option value="">اختر دولتك</option>
            {Object.entries(COUNTRY_RULES).map(([code, rule]) => (
              <option key={code} value={code}>{rule.flag} {rule.label}</option>
            ))}
          </select>
          <ChevronDown className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
        </div>

        {selectedCountry && (
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => handleCompatibleToggle("all")}
              className={cn("py-2.5 px-3 rounded-xl text-sm font-semibold transition-all border-2 flex items-center justify-center gap-1.5",
                !compatibleOnly ? "border-primary bg-primary/10 text-primary" : "border-border bg-background text-muted-foreground hover:border-primary/40")}>
              <Globe className="w-3.5 h-3.5" />بحث عام
            </button>
            <button onClick={() => handleCompatibleToggle("compatible")}
              className={cn("py-2.5 px-3 rounded-xl text-sm font-semibold transition-all border-2 flex items-center justify-center gap-1.5",
                compatibleOnly ? "border-green-500 bg-green-500/10 text-green-600" : "border-border bg-background text-muted-foreground hover:border-green-400/40")}>
              <ShieldCheck className="w-3.5 h-3.5" />متوافق فقط
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
          <select className="w-full appearance-none bg-background border-2 border-border rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all cursor-pointer"
            value={selectedBrand} onChange={(e) => handleBrandChange(e.target.value)} disabled={isLoadingBrands}>
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
        <label className="text-sm font-bold text-foreground flex items-center justify-between">
          <span>الموديل والجيل</span>
          {modelYearBadge && (
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary">{modelYearBadge}</span>
          )}
        </label>

        {hasModelList ? (
          <div className="relative">
            <select className="w-full appearance-none bg-background border-2 border-border rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all cursor-pointer"
              value={(filters as any).model || ""}
              onChange={(e) => {
                // عند تغيير الاختيار، نبحث عن الـ entry المطابق بالـ label من الـ option
                const selectedOption = e.target.options[e.target.selectedIndex];
                const label = selectedOption.text;
                const value = e.target.value;
                const entry = brandModels.find(m => m.value === value && m.label === label) 
                  ?? brandModels.find(m => m.value === value) 
                  ?? null;
                u("model", value || undefined);
                setSelectedModelEntry(entry);
                if (entry?.yearFrom) updateFilter("yearFrom", entry.yearFrom);
                else updateFilter("yearFrom", undefined);
                if (entry?.yearTo) updateFilter("yearTo", entry.yearTo);
                else updateFilter("yearTo", undefined);
              }}>
              <option value="">كل الموديلات</option>
              {brandModels.map((m, i) => (
                <option key={`${m.value}-${i}`} value={m.value}>{m.label}</option>
              ))}
            </select>
            <ChevronDown className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
          </div>
        ) : (
          <input type="text"
            placeholder={selectedBrand ? "اكتب اسم الموديل..." : "اختر الماركة أولاً أو اكتب الموديل..."}
            className="w-full bg-background border-2 border-border rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
            value={(filters as any).model || ""} onChange={(e) => u("model", e.target.value || undefined)} />
        )}

        {selectedModelEntry && modelYearBadge && (
          <div className="bg-primary/5 border border-primary/20 rounded-xl px-3 py-2 text-xs text-primary flex items-center justify-between">
            <span>✅ السنوات المضبوطة: <strong>{modelYearBadge}</strong></span>
            <button onClick={() => { updateFilter("yearFrom", undefined); updateFilter("yearTo", undefined); }}
              className="text-muted-foreground hover:text-destructive mr-1">✕</button>
          </div>
        )}
      </div>

      {/* Year */}
      <div className="space-y-3">
        <label className="text-sm font-bold text-foreground flex items-center gap-1">
          سنة الصنع <span className="text-xs text-muted-foreground font-normal">(يمكن التعديل)</span>
        </label>
        <div className="grid grid-cols-2 gap-3">
          {(["yearFrom", "yearTo"] as const).map((key, i) => (
            <div key={key} className="relative">
              <select className="w-full appearance-none bg-background border-2 border-border rounded-xl px-4 py-3 text-sm font-medium font-numbers focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all cursor-pointer"
                value={filters[key] || ""} onChange={(e) => updateFilter(key, e.target.value ? parseInt(e.target.value) : undefined)}>
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
            value={filters.priceMin || ""} onChange={(e) => updateFilter("priceMin", e.target.value ? parseInt(e.target.value) : undefined)} />
          <input type="number" placeholder="الحد الأقصى"
            className="w-full bg-background border-2 border-border rounded-xl px-4 py-3 text-sm font-medium font-numbers focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
            value={filters.priceMax || ""} onChange={(e) => updateFilter("priceMax", e.target.value ? parseInt(e.target.value) : undefined)} />
        </div>
      </div>

      {/* Mileage */}
      <div className="space-y-3">
        <label className="text-sm font-bold text-foreground">الممشى الأقصى (كم)</label>
        <input type="number" placeholder="مثال: 100000"
          className="w-full bg-background border-2 border-border rounded-xl px-4 py-3 text-sm font-medium font-numbers focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
          value={filters.mileageMax || ""} onChange={(e) => updateFilter("mileageMax", e.target.value ? parseInt(e.target.value) : undefined)} />
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
                {isSelected && <Check className="w-4 h-4" />}{fuel.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Body */}
      <div className="space-y-3">
        <label className="text-sm font-bold text-foreground">نوع السيارة</label>
        <div className="grid grid-cols-2 gap-2">
          {bodyTypes.map((body) => {
            const isSelected = filters.bodyType === body.id;
            return (
              <button key={body.id} onClick={() => toggleBody(body.id)}
                className={cn("py-2.5 px-3 rounded-lg text-sm font-semibold transition-all border-2 flex items-center justify-center gap-2",
                  isSelected ? "border-primary bg-primary/10 text-primary" : "border-border bg-background text-muted-foreground hover:border-primary/40")}>
                {isSelected && <Check className="w-4 h-4" />}{body.label}
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
                {isSelected && <Check className="absolute inset-0 m-auto w-4 h-4" style={{ color: lightColors.includes(c.key) ? "#374151" : "#fff" }} />}
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
