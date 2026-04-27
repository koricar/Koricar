import { useState } from "react";
import { useGetCarBrands, type SearchCarsParams } from "@workspace/api-client-react";
import { Filter, ChevronDown, Check, Globe, ShieldCheck, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface FilterSidebarProps {
  filters: SearchCarsParams;
  updateFilter: <K extends keyof SearchCarsParams>(key: K, value: SearchCarsParams[K]) => void;
  resetFilters: () => void;
  className?: string;
}

// ── نوع الموديل الجديد مع السنوات ─────────────────────────────────────────
type ModelOption = {
  label: string;
  value: string;
  yearFrom?: number;
  yearTo?: number;
};

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
// BRAND_MODELS — مع سنوات كل جيل
// ─────────────────────────────────────────────────────────────────────────────
const BRAND_MODELS: Record<string, ModelOption[]> = {
  "Hyundai": [
    { label: "Palisade (2019+)",              value: "팰리세이드",                yearFrom: 2019 },
    { label: "Palisade New (2023+)",           value: "더 뉴 팰리세이드",         yearFrom: 2023 },
    { label: "Santa Fe MX5 (2023+)",           value: "싼타페 (MX5)",             yearFrom: 2023 },
    { label: "Santa Fe New (2020-2022)",       value: "더 뉴 싼타페",             yearFrom: 2020, yearTo: 2022 },
    { label: "Santa Fe TM (2018-2022)",        value: "싼타페 TM",                yearFrom: 2018, yearTo: 2022 },
    { label: "Grandeur GN7 (2022+)",           value: "그랜저 (GN7)",             yearFrom: 2022 },
    { label: "Grandeur Hybrid GN7 (2022+)",    value: "그랜저 하이브리드 (GN7)", yearFrom: 2022 },
    { label: "Grandeur IG New (2019-2022)",    value: "더 뉴 그랜저 IG",         yearFrom: 2019, yearTo: 2022 },
    { label: "Grandeur HG (2011-2017)",        value: "그랜저 HG",                yearFrom: 2011, yearTo: 2017 },
    { label: "Sonata DN8 (2019+)",             value: "쏘나타 (DN8)",             yearFrom: 2019 },
    { label: "Sonata Hybrid DN8 (2020+)",      value: "쏘나타 하이브리드 (DN8)", yearFrom: 2020 },
    { label: "Sonata LF (2014-2019)",          value: "LF 쏘나타",               yearFrom: 2014, yearTo: 2019 },
    { label: "Elantra CN7 (2020+)",            value: "아반떼 (CN7)",             yearFrom: 2020 },
    { label: "Elantra Hybrid CN7 (2020+)",     value: "아반떼 하이브리드 (CN7)", yearFrom: 2020 },
    { label: "Elantra MD (2010-2015)",         value: "아반떼 MD",                yearFrom: 2010, yearTo: 2015 },
    { label: "Tucson NX4 (2021+)",             value: "투싼 (NX4)",              yearFrom: 2021 },
    { label: "Tucson TL New (2018-2021)",      value: "더 뉴 투싼 TL",           yearFrom: 2018, yearTo: 2021 },
    { label: "Kona SX2 (2023+)",               value: "코나 (SX2)",              yearFrom: 2023 },
    { label: "Kona OS (2017-2023)",            value: "코나 (OS)",               yearFrom: 2017, yearTo: 2023 },
    { label: "Ioniq 5 (2021+)",                value: "아이오닉 5",               yearFrom: 2021 },
    { label: "Ioniq 5 N (2023+)",              value: "아이오닉 5 N",             yearFrom: 2023 },
    { label: "Ioniq 6 (2022+)",                value: "아이오닉 6",               yearFrom: 2022 },
    { label: "Ioniq 9 (2024+)",                value: "아이오닉 9",               yearFrom: 2024 },
    { label: "Staria (2021+)",                 value: "스타리아",                 yearFrom: 2021 },
    { label: "Staria Lounge (2021+)",          value: "스타리아 라운지",          yearFrom: 2021 },
    { label: "Grand Starex New (2018-2021)",   value: "더 뉴 그랜드 스타렉스",   yearFrom: 2018, yearTo: 2021 },
    { label: "Casper (2021+)",                 value: "캐스퍼",                   yearFrom: 2021 },
    { label: "Casper Electric (2024+)",        value: "캐스퍼 일렉트릭",          yearFrom: 2024 },
    { label: "Nexo Hydrogen (2018+)",          value: "넥쏘",                    yearFrom: 2018 },
    { label: "Venue (2019+)",                  value: "베뉴",                    yearFrom: 2019 },
    { label: "Porter 2 (2018+)",               value: "포터 2",                  yearFrom: 2018 },
  ],

  "Kia": [
    { label: "Carnival 4th Gen (2020+)",            value: "카니발 4세대",                      yearFrom: 2020 },
    { label: "Carnival New (2023+)",                value: "더 뉴 카니발",                      yearFrom: 2023 },
    { label: "Carnival Limousine (2020+)",          value: "카니발 리무진",                     yearFrom: 2020 },
    { label: "Sorento 4th Gen (2020+)",             value: "쏘렌토 4세대",                      yearFrom: 2020 },
    { label: "Sorento Hybrid 4th Gen (2020+)",      value: "쏘렌토 하이브리드 4세대",           yearFrom: 2020 },
    { label: "Sorento PHEV 4th Gen (2021+)",        value: "쏘렌토 플러그인 하이브리드 4세대",  yearFrom: 2021 },
    { label: "Sorento New 4th Gen (2023+)",         value: "더 뉴 쏘렌토 4세대",               yearFrom: 2023 },
    { label: "Sportage 5th Gen (2021+)",            value: "스포티지 5세대",                    yearFrom: 2021 },
    { label: "Sportage 5th Gen Hybrid (2021+)",     value: "스포티지 5세대 하이브리드",         yearFrom: 2021 },
    { label: "Sportage 5th Gen PHEV (2022+)",       value: "스포티지 5세대 플러그인 하이브리드", yearFrom: 2022 },
    { label: "K8 (2021+)",                          value: "K8",                               yearFrom: 2021 },
    { label: "K8 Hybrid (2021+)",                   value: "K8 하이브리드",                    yearFrom: 2021 },
    { label: "K5 3rd Gen (2019+)",                  value: "K5 3세대",                         yearFrom: 2019 },
    { label: "K5 Hybrid 3rd Gen (2020+)",           value: "K5 하이브리드 3세대",              yearFrom: 2020 },
    { label: "K5 2nd Gen New (2017-2019)",          value: "더 뉴 K5 2세대",                  yearFrom: 2017, yearTo: 2019 },
    { label: "K3 (2018+)",                          value: "K3",                               yearFrom: 2018 },
    { label: "K3 2nd Gen New (2018-2022)",          value: "더 뉴 K3 2세대",                  yearFrom: 2018, yearTo: 2022 },
    { label: "Seltos (2019+)",                      value: "셀토스",                            yearFrom: 2019 },
    { label: "Seltos New (2022+)",                  value: "더 뉴 셀토스",                     yearFrom: 2022 },
    { label: "Niro All New (2022+)",                value: "디 올 뉴 니로",                   yearFrom: 2022 },
    { label: "Niro Hybrid (2016-2022)",             value: "니로 하이브리드",                  yearFrom: 2016, yearTo: 2022 },
    { label: "Niro EV (2018-2022)",                 value: "니로 EV",                          yearFrom: 2018, yearTo: 2022 },
    { label: "EV3 (2024+)",                         value: "EV3",                              yearFrom: 2024 },
    { label: "EV6 (2021+)",                         value: "EV6",                              yearFrom: 2021 },
    { label: "EV6 GT (2022+)",                      value: "EV6 GT",                           yearFrom: 2022 },
    { label: "EV9 (2023+)",                         value: "EV9",                              yearFrom: 2023 },
    { label: "Stinger (2017+)",                     value: "스팅어",                            yearFrom: 2017 },
    { label: "Mohave The Master (2019+)",           value: "모하비 더 마스터",                 yearFrom: 2019 },
    { label: "Mohave New (2019+)",                  value: "더 뉴 모하비",                     yearFrom: 2019 },
    { label: "Telluride (2019+)",                   value: "텔루라이드",                        yearFrom: 2019 },
    { label: "Morning (2017+)",                     value: "모닝",                             yearFrom: 2017 },
    { label: "Ray (2012+)",                         value: "레이",                             yearFrom: 2012 },
    { label: "Soul (2019+)",                        value: "쏘울",                             yearFrom: 2019 },
  ],

  "Genesis": [
    { label: "GV80 (2020+)",              value: "GV80",          yearFrom: 2020 },
    { label: "GV80 Coupe (2023+)",        value: "GV80 쿠페",     yearFrom: 2023 },
    { label: "GV70 (2021+)",              value: "GV70",          yearFrom: 2021 },
    { label: "GV70 Electrified (2022+)",  value: "GV70 전동화",   yearFrom: 2022 },
    { label: "GV60 (2021+)",              value: "GV60",          yearFrom: 2021 },
    { label: "GV60 Sport Plus (2022+)",   value: "GV60 스포츠 플러스", yearFrom: 2022 },
    { label: "GV90 (2024+)",              value: "GV90",          yearFrom: 2024 },
    { label: "G80 RG3 (2020+)",           value: "G80 (RG3)",     yearFrom: 2020 },
    { label: "G80 Electrified (2022+)",   value: "G80 전동화",    yearFrom: 2022 },
    { label: "G80 (2016-2020)",           value: "G80",           yearFrom: 2016, yearTo: 2020 },
    { label: "G90 RS4 (2022+)",           value: "G90 (RS4)",     yearFrom: 2022 },
    { label: "G90 (2017-2022)",           value: "G90",           yearFrom: 2017, yearTo: 2022 },
    { label: "G70 2nd Gen (2021+)",       value: "G70 2세대",     yearFrom: 2021 },
    { label: "G70 New (2019-2021)",       value: "더 뉴 G70",    yearFrom: 2019, yearTo: 2021 },
    { label: "EQ900 (2015-2020)",         value: "EQ900",         yearFrom: 2015, yearTo: 2020 },
  ],

  "SsangYong": [
    { label: "Rexton G4 (2017+)",          value: "렉스턴 G4",       yearFrom: 2017 },
    { label: "Rexton Sports (2018+)",      value: "렉스턴 스포츠",   yearFrom: 2018 },
    { label: "Rexton Sports Khan (2019+)", value: "렉스턴 스포츠 칸", yearFrom: 2019 },
    { label: "Korando (2019+)",            value: "코란도",           yearFrom: 2019 },
    { label: "Korando e-Motion (2021+)",   value: "코란도 이모션",    yearFrom: 2021 },
    { label: "Tivoli (2015+)",             value: "티볼리",           yearFrom: 2015 },
    { label: "Tivoli Air (2016+)",         value: "티볼리 에어",      yearFrom: 2016 },
    { label: "Musso (2018+)",              value: "무쏘",             yearFrom: 2018 },
    { label: "Actyon (2012+)",             value: "액티언",           yearFrom: 2012 },
  ],

  "KG Mobility": [
    { label: "Torres (2022+)",         value: "토레스",       yearFrom: 2022 },
    { label: "Torres EVX (2023+)",     value: "토레스 EVX",   yearFrom: 2023 },
    { label: "Rexton G4 (2017+)",      value: "렉스턴 G4",   yearFrom: 2017 },
    { label: "Rexton Sports (2018+)",  value: "렉스턴 스포츠", yearFrom: 2018 },
    { label: "Korando (2019+)",        value: "코란도",       yearFrom: 2019 },
    { label: "Tivoli (2015+)",         value: "티볼리",       yearFrom: 2015 },
    { label: "Musso (2018+)",          value: "무쏘",         yearFrom: 2018 },
    { label: "Actyon Sports (2012+)",  value: "액티언 스포츠", yearFrom: 2012 },
  ],

  "Renault Samsung": [
    { label: "QM6 (2016+)",     value: "QM6" },
    { label: "QM6 LPe (2019+)", value: "QM6 LPe" },
    { label: "SM6 (2016+)",     value: "SM6" },
    { label: "XM3 (2020+)",     value: "XM3" },
    { label: "SM3 (-2018)",     value: "SM3",  yearTo: 2018 },
    { label: "SM5 (-2019)",     value: "SM5",  yearTo: 2019 },
    { label: "SM7 (-2019)",     value: "SM7",  yearTo: 2019 },
  ],

  "Renault Korea": [
    { label: "Philante (2023+)", value: "필랑트", yearFrom: 2023 },
    { label: "QM6 (2016+)",     value: "QM6" },
    { label: "SM6 (2016+)",     value: "SM6" },
    { label: "XM3 (2020+)",     value: "XM3" },
    { label: "Arkana (2021+)",  value: "아르카나", yearFrom: 2021 },
  ],

  "Chevrolet": [
    { label: "Trailblazer (2020+)",      value: "트레일블레이저",      yearFrom: 2020 },
    { label: "Trailblazer New (2023+)",  value: "더 뉴 트레일블레이저", yearFrom: 2023 },
    { label: "Equinox (2022+)",          value: "이쿼녹스",            yearFrom: 2022 },
    { label: "Equinox EV (2024+)",       value: "이쿼녹스 EV",         yearFrom: 2024 },
    { label: "Trax (2012-2021)",         value: "트랙스",              yearFrom: 2012, yearTo: 2021 },
    { label: "Trax Crossover (2022+)",   value: "트랙스 크로스오버",   yearFrom: 2022 },
    { label: "Spark (2015+)",            value: "스파크",               yearFrom: 2015 },
    { label: "Malibu (2015+)",           value: "말리부",               yearFrom: 2015 },
    { label: "Colorado (2021+)",         value: "콜로라도",             yearFrom: 2021 },
    { label: "Traverse (2017+)",         value: "트래버스",             yearFrom: 2017 },
    { label: "Blazer EV (2023+)",        value: "블레이저 EV",          yearFrom: 2023 },
    { label: "Tahoe (2021+)",            value: "타호",                 yearFrom: 2021 },
    { label: "Orlando (2011-2018)",      value: "올란도",              yearFrom: 2011, yearTo: 2018 },
    { label: "Captiva (2011-2018)",      value: "캡티바",              yearFrom: 2011, yearTo: 2018 },
  ],

  "BMW": [
    { label: "1 Series F20 (2011-2019)",     value: "1시리즈 (F20)",       yearFrom: 2011, yearTo: 2019 },
    { label: "1 Series F40 (2019+)",         value: "1시리즈 (F40)",       yearFrom: 2019 },
    { label: "2 Series Gran Coupe F44",      value: "2시리즈 그란쿠페 (F44)" },
    { label: "2 Series Coupe G42 (2021+)",   value: "2시리즈 (G42)",       yearFrom: 2021 },
    { label: "3 Series E90 (2005-2012)",     value: "3시리즈 (E90)",       yearFrom: 2005, yearTo: 2012 },
    { label: "3 Series F30 (2012-2019)",     value: "3시리즈 (F30)",       yearFrom: 2012, yearTo: 2019 },
    { label: "3 Series G20 (2019+)",         value: "3시리즈 (G20)",       yearFrom: 2019 },
    { label: "4 Series F32 (2013-2020)",     value: "4시리즈 (F32)",       yearFrom: 2013, yearTo: 2020 },
    { label: "4 Series G22 (2020+)",         value: "4시리즈 (G22)",       yearFrom: 2020 },
    { label: "4 Series Gran Coupe F36",      value: "4시리즈 그란쿠페 (F36)", yearFrom: 2013, yearTo: 2021 },
    { label: "4 Series Gran Coupe G26 (2021+)", value: "4시리즈 그란쿠페 (G26)", yearFrom: 2021 },
    { label: "5 Series F10 (2010-2017)",     value: "5시리즈 (F10)",       yearFrom: 2010, yearTo: 2017 },
    { label: "5 Series G30 (2017-2023)",     value: "5시리즈 (G30)",       yearFrom: 2017, yearTo: 2023 },
    { label: "5 Series G60 (2023+)",         value: "5시리즈 (G60)",       yearFrom: 2023 },
    { label: "6 Series F12 Coupe/Cab",       value: "6시리즈 (F12)",       yearFrom: 2011, yearTo: 2018 },
    { label: "6 Series Gran Turismo G32",    value: "6시리즈 그란투리스모 (G32)", yearFrom: 2017, yearTo: 2023 },
    { label: "7 Series F01 (2009-2015)",     value: "7시리즈 (F01)",       yearFrom: 2009, yearTo: 2015 },
    { label: "7 Series G11 (2015-2022)",     value: "7시리즈 (G11)",       yearFrom: 2015, yearTo: 2022 },
    { label: "7 Series G70 (2022+)",         value: "7시리즈 (G70)",       yearFrom: 2022 },
    { label: "8 Series G15 (2018+)",         value: "8시리즈 (G15)",       yearFrom: 2018 },
    { label: "8 Series Gran Coupe G16",      value: "8시리즈 그란쿠페 (G16)", yearFrom: 2019 },
    { label: "X1 E84 (2009-2015)",           value: "X1 (E84)",            yearFrom: 2009, yearTo: 2015 },
    { label: "X1 F48 (2015-2022)",           value: "X1 (F48)",            yearFrom: 2015, yearTo: 2022 },
    { label: "X1 U11 (2022+)",               value: "X1 (U11)",            yearFrom: 2022 },
    { label: "X2 F39 (2017-2023)",           value: "X2 (F39)",            yearFrom: 2017, yearTo: 2023 },
    { label: "X3 F25 (2010-2017)",           value: "X3 (F25)",            yearFrom: 2010, yearTo: 2017 },
    { label: "X3 G01 (2017-2024)",           value: "X3 (G01)",            yearFrom: 2017, yearTo: 2024 },
    { label: "X3 G45 (2024+)",               value: "X3 (G45)",            yearFrom: 2024 },
    { label: "X4 F26 (2014-2018)",           value: "X4 (F26)",            yearFrom: 2014, yearTo: 2018 },
    { label: "X4 G02 (2018+)",               value: "X4 (G02)",            yearFrom: 2018 },
    { label: "X5 F15 (2013-2018)",           value: "X5 (F15)",            yearFrom: 2013, yearTo: 2018 },
    { label: "X5 G05 (2018+)",               value: "X5 (G05)",            yearFrom: 2018 },
    { label: "X6 F16 (2014-2019)",           value: "X6 (F16)",            yearFrom: 2014, yearTo: 2019 },
    { label: "X6 G06 (2019+)",               value: "X6 (G06)",            yearFrom: 2019 },
    { label: "X7 G07 (2019+)",               value: "X7 (G07)",            yearFrom: 2019 },
    { label: "M2 F87 (2015-2021)",           value: "M2 (F87)",            yearFrom: 2015, yearTo: 2021 },
    { label: "M2 G87 (2022+)",               value: "M2 (G87)",            yearFrom: 2022 },
    { label: "M3 F80 (2014-2020)",           value: "M3 (F80)",            yearFrom: 2014, yearTo: 2020 },
    { label: "M3 G80 (2020+)",               value: "M3 (G80)",            yearFrom: 2020 },
    { label: "M4 F82 (2014-2020)",           value: "M4 (F82)",            yearFrom: 2014, yearTo: 2020 },
    { label: "M4 G82 (2020+)",               value: "M4 (G82)",            yearFrom: 2020 },
    { label: "M5 F90 (2017-2024)",           value: "M5 (F90)",            yearFrom: 2017, yearTo: 2024 },
    { label: "M5 G90 (2024+)",               value: "M5 (G90)",            yearFrom: 2024 },
    { label: "M8 F92 (2018+)",               value: "M8 (F92)",            yearFrom: 2018 },
    { label: "i3 (2013-2022)",               value: "i3",                  yearFrom: 2013, yearTo: 2022 },
    { label: "i4 (2021+)",                   value: "i4",                  yearFrom: 2021 },
    { label: "i5 (2023+)",                   value: "i5",                  yearFrom: 2023 },
    { label: "i7 (2022+)",                   value: "i7",                  yearFrom: 2022 },
    { label: "i8 (2014-2020)",               value: "i8",                  yearFrom: 2014, yearTo: 2020 },
    { label: "iX (2021+)",                   value: "iX",                  yearFrom: 2021 },
    { label: "iX3 (2020+)",                  value: "iX3",                 yearFrom: 2020 },
    { label: "XM (2022+)",                   value: "XM",                  yearFrom: 2022 },
    { label: "Z4 G29 (2018+)",               value: "Z4 (G29)",            yearFrom: 2018 },
  ],

  "Mercedes-Benz": [
    { label: "A-Class W176 (2012-2018)",  value: "A클래스 (W176)",  yearFrom: 2012, yearTo: 2018 },
    { label: "A-Class W177 (2018+)",      value: "A클래스 (W177)",  yearFrom: 2018 },
    { label: "C-Class W204 (2007-2014)",  value: "C클래스 (W204)",  yearFrom: 2007, yearTo: 2014 },
    { label: "C-Class W205 (2014-2021)",  value: "C클래스 (W205)",  yearFrom: 2014, yearTo: 2021 },
    { label: "C-Class W206 (2021+)",      value: "C클래스 (W206)",  yearFrom: 2021 },
    { label: "E-Class W212 (2009-2016)",  value: "E클래스 (W212)",  yearFrom: 2009, yearTo: 2016 },
    { label: "E-Class W213 (2016-2024)",  value: "E클래스 (W213)",  yearFrom: 2016, yearTo: 2024 },
    { label: "E-Class W214 (2024+)",      value: "E클래스 (W214)",  yearFrom: 2024 },
    { label: "S-Class W221 (2005-2013)",  value: "S클래스 (W221)",  yearFrom: 2005, yearTo: 2013 },
    { label: "S-Class W222 (2013-2021)",  value: "S클래스 (W222)",  yearFrom: 2013, yearTo: 2021 },
    { label: "S-Class W223 (2021+)",      value: "S클래스 (W223)",  yearFrom: 2021 },
    { label: "G-Class W463 (2018+)",      value: "G클래스 (W463)",  yearFrom: 2018 },
    { label: "CLA C117 (2013-2019)",      value: "CLA (C117)",      yearFrom: 2013, yearTo: 2019 },
    { label: "CLA C118 (2019+)",          value: "CLA (C118)",      yearFrom: 2019 },
    { label: "CLS C257 (2018+)",          value: "CLS (C257)",      yearFrom: 2018 },
    { label: "CLE (2024+)",               value: "CLE클래스",        yearFrom: 2024 },
    { label: "GLA X156 (2013-2020)",      value: "GLA (X156)",      yearFrom: 2013, yearTo: 2020 },
    { label: "GLA H247 (2020+)",          value: "GLA (H247)",      yearFrom: 2020 },
    { label: "GLB X247 (2019+)",          value: "GLB클래스",        yearFrom: 2019 },
    { label: "GLC X253 (2015-2022)",      value: "GLC (X253)",      yearFrom: 2015, yearTo: 2022 },
    { label: "GLC X254 (2023+)",          value: "GLC (X254)",      yearFrom: 2023 },
    { label: "GLC Coupe C253 (2016+)",    value: "GLC쿠페 (C253)",  yearFrom: 2016 },
    { label: "GLE W166 (2015-2019)",      value: "GLE (W166)",      yearFrom: 2015, yearTo: 2019 },
    { label: "GLE V167 (2019+)",          value: "GLE (V167)",      yearFrom: 2019 },
    { label: "GLE Coupe (2020+)",         value: "GLE쿠페",          yearFrom: 2020 },
    { label: "GLS X166 (2016-2019)",      value: "GLS (X166)",      yearFrom: 2016, yearTo: 2019 },
    { label: "GLS X167 (2019+)",          value: "GLS (X167)",      yearFrom: 2019 },
    { label: "EQA (2021+)",               value: "EQA",              yearFrom: 2021 },
    { label: "EQB (2021+)",               value: "EQB",              yearFrom: 2021 },
    { label: "EQC (2019+)",               value: "EQC",              yearFrom: 2019 },
    { label: "EQE (2022+)",               value: "EQE",              yearFrom: 2022 },
    { label: "EQS (2021+)",               value: "EQS",              yearFrom: 2021 },
    { label: "Maybach S-Class (2020+)",   value: "마이바흐 S클래스", yearFrom: 2020 },
    { label: "AMG GT (2014+)",            value: "AMG GT",           yearFrom: 2014 },
    { label: "SL-Class (2021+)",          value: "SL클래스",          yearFrom: 2021 },
  ],

  "Audi": [
    { label: "A3 (2013+)",         value: "A3",         yearFrom: 2013 },
    { label: "A4 (2015+)",         value: "A4",         yearFrom: 2015 },
    { label: "A5 (2016+)",         value: "A5",         yearFrom: 2016 },
    { label: "A6 (2018+)",         value: "A6",         yearFrom: 2018 },
    { label: "A7 (2018+)",         value: "A7",         yearFrom: 2018 },
    { label: "A8 (2017+)",         value: "A8",         yearFrom: 2017 },
    { label: "Q2 (2016+)",         value: "Q2",         yearFrom: 2016 },
    { label: "Q3 (2018+)",         value: "Q3",         yearFrom: 2018 },
    { label: "Q4 e-tron (2021+)",  value: "Q4 e-tron",  yearFrom: 2021 },
    { label: "Q5 (2017+)",         value: "Q5",         yearFrom: 2017 },
    { label: "Q7 (2015+)",         value: "Q7",         yearFrom: 2015 },
    { label: "Q8 (2018+)",         value: "Q8",         yearFrom: 2018 },
    { label: "Q8 e-tron (2022+)",  value: "Q8 e-tron",  yearFrom: 2022 },
    { label: "e-tron (2018+)",     value: "e-tron",     yearFrom: 2018 },
    { label: "e-tron GT (2021+)",  value: "e-tron GT",  yearFrom: 2021 },
    { label: "TT (2014+)",         value: "TT",         yearFrom: 2014 },
    { label: "R8 (2015+)",         value: "R8",         yearFrom: 2015 },
    { label: "RS3 (2021+)",        value: "RS3",        yearFrom: 2021 },
    { label: "RS4 (2017+)",        value: "RS4",        yearFrom: 2017 },
    { label: "RS5 (2017+)",        value: "RS5",        yearFrom: 2017 },
    { label: "RS6 (2019+)",        value: "RS6",        yearFrom: 2019 },
    { label: "RS7 (2019+)",        value: "RS7",        yearFrom: 2019 },
    { label: "SQ5 (2017+)",        value: "SQ5",        yearFrom: 2017 },
    { label: "SQ7 (2017+)",        value: "SQ7",        yearFrom: 2017 },
    { label: "SQ8 (2019+)",        value: "SQ8",        yearFrom: 2019 },
  ],

  "Volkswagen": [
    { label: "Golf 8 (2019+)",          value: "골프",      yearFrom: 2019 },
    { label: "Golf GTI (2021+)",        value: "골프 GTI",  yearFrom: 2021 },
    { label: "Golf R (2021+)",          value: "골프 R",    yearFrom: 2021 },
    { label: "Tiguan 2nd (2016+)",      value: "티구안",    yearFrom: 2016 },
    { label: "Tiguan Allspace (2017+)", value: "티구안 올스페이스", yearFrom: 2017 },
    { label: "Passat (2019+)",          value: "파사트",    yearFrom: 2019 },
    { label: "Touareg 3rd (2018+)",     value: "투아렉",    yearFrom: 2018 },
    { label: "Arteon (2017+)",          value: "아테온",    yearFrom: 2017 },
    { label: "ID.4 (2020+)",            value: "ID.4",      yearFrom: 2020 },
    { label: "ID.6 (2021+)",            value: "ID.6",      yearFrom: 2021 },
  ],

  "Toyota": [
    { label: "Camry (2017+)",             value: "캠리",               yearFrom: 2017 },
    { label: "RAV4 (2018+)",              value: "RAV4",               yearFrom: 2018 },
    { label: "RAV4 Hybrid (2018+)",       value: "RAV4 하이브리드",   yearFrom: 2018 },
    { label: "Prius (2022+)",             value: "프리우스",            yearFrom: 2022 },
    { label: "Crown Crossover (2022+)",   value: "크라운 크로스오버", yearFrom: 2022 },
    { label: "Alphard (2023+)",           value: "알파드",              yearFrom: 2023 },
    { label: "Vellfire (2023+)",          value: "벨파이어",            yearFrom: 2023 },
    { label: "Sienna (2020+)",            value: "시에나",              yearFrom: 2020 },
    { label: "Land Cruiser (2021+)",      value: "랜드크루저",          yearFrom: 2021 },
    { label: "Land Cruiser Prado",        value: "랜드크루저 프라도" },
    { label: "Highlander (2019+)",        value: "하이랜더",            yearFrom: 2019 },
    { label: "GR86 (2021+)",              value: "GR86",               yearFrom: 2021 },
    { label: "GR Supra (2019+)",          value: "GR 수프라",           yearFrom: 2019 },
  ],

  "Lexus": [
    { label: "ES300h 7th Gen (2018+)",  value: "ES300h 7세대",  yearFrom: 2018 },
    { label: "IS300h (2013+)",          value: "IS300h",         yearFrom: 2013 },
    { label: "IS250 (-2020)",           value: "IS250",          yearTo: 2020 },
    { label: "LS500h 5th Gen (2017+)",  value: "LS500h 5세대",  yearFrom: 2017 },
    { label: "LS460 (-2017)",           value: "LS460",          yearTo: 2017 },
    { label: "UX250h (2018+)",          value: "UX250h",         yearFrom: 2018 },
    { label: "CT200h (-2022)",          value: "CT200h",         yearTo: 2022 },
    { label: "NX300h (-2021)",          value: "NX300h",         yearTo: 2021 },
    { label: "NX350h 2nd Gen (2021+)",  value: "NX350h 2세대",  yearFrom: 2021 },
    { label: "NX450h+ 2nd Gen (2021+)", value: "NX450h+ 2세대", yearFrom: 2021 },
    { label: "RX350 (2022+)",           value: "RX350",          yearFrom: 2022 },
    { label: "RX450h 4th Gen (2015+)",  value: "RX450h 4세대",  yearFrom: 2015 },
    { label: "LX600 (2021+)",           value: "LX600",          yearFrom: 2021 },
    { label: "LX570 (-2021)",           value: "LX570",          yearTo: 2021 },
    { label: "LC500 (2017+)",           value: "LC500",          yearFrom: 2017 },
    { label: "LC500h (2017+)",          value: "LC500h",         yearFrom: 2017 },
  ],

  "Porsche": [
    { label: "Cayenne (2018+)",              value: "카이엔",                  yearFrom: 2018 },
    { label: "Cayenne Coupe (2019+)",        value: "카이엔 쿠페",             yearFrom: 2019 },
    { label: "Panamera (2016+)",             value: "파나메라",                yearFrom: 2016 },
    { label: "Taycan (2019+)",               value: "타이칸",                  yearFrom: 2019 },
    { label: "Taycan Cross Turismo (2021+)", value: "타이칸 크로스 투리스모", yearFrom: 2021 },
    { label: "Macan (2014+)",                value: "마칸",                    yearFrom: 2014 },
    { label: "Macan EV (2024+)",             value: "마칸 EV",                 yearFrom: 2024 },
    { label: "911 (2019+)",                  value: "911",                     yearFrom: 2019 },
    { label: "Boxster (2012+)",              value: "박스터",                  yearFrom: 2012 },
    { label: "Cayman (2012+)",               value: "케이맨",                  yearFrom: 2012 },
  ],

  "Volvo": [
    { label: "XC90 (2014+)",            value: "XC90",         yearFrom: 2014 },
    { label: "XC90 Recharge (2021+)",   value: "XC90 리차지",  yearFrom: 2021 },
    { label: "XC60 (2017+)",            value: "XC60",         yearFrom: 2017 },
    { label: "XC40 (2017+)",            value: "XC40",         yearFrom: 2017 },
    { label: "XC40 Recharge (2020+)",   value: "XC40 리차지",  yearFrom: 2020 },
    { label: "C40 Recharge (2021+)",    value: "C40 리차지",   yearFrom: 2021 },
    { label: "EX90 (2024+)",            value: "EX90",         yearFrom: 2024 },
    { label: "EX40 (2023+)",            value: "EX40",         yearFrom: 2023 },
    { label: "EX30 (2023+)",            value: "EX30",         yearFrom: 2023 },
    { label: "S60 (2018+)",             value: "S60",          yearFrom: 2018 },
    { label: "S90 (2016+)",             value: "S90",          yearFrom: 2016 },
    { label: "V60 (2018+)",             value: "V60",          yearFrom: 2018 },
    { label: "V60 Cross Country",       value: "V60 크로스컨트리" },
    { label: "V90 (2016+)",             value: "V90",          yearFrom: 2016 },
    { label: "V90 Cross Country",       value: "V90 크로스컨트리" },
  ],

  "Land Rover": [
    { label: "Range Rover (2021+)",          value: "레인지로버",          yearFrom: 2021 },
    { label: "Range Rover Sport (2022+)",    value: "레인지로버 스포츠",   yearFrom: 2022 },
    { label: "Range Rover Evoque (2019+)",   value: "레인지로버 이보크",   yearFrom: 2019 },
    { label: "Range Rover Velar (2017+)",    value: "레인지로버 벨라",     yearFrom: 2017 },
    { label: "Defender (2020+)",             value: "디펜더",               yearFrom: 2020 },
    { label: "Discovery (2016+)",            value: "디스커버리",           yearFrom: 2016 },
    { label: "Discovery Sport (2014+)",      value: "디스커버리 스포츠",   yearFrom: 2014 },
  ],

  "Jaguar": [
    { label: "F-Pace (2016+)", value: "F-페이스", yearFrom: 2016 },
    { label: "E-Pace (2017+)", value: "E-페이스", yearFrom: 2017 },
    { label: "I-Pace (2018+)", value: "I-페이스", yearFrom: 2018 },
    { label: "XE (2015+)",     value: "XE",        yearFrom: 2015 },
    { label: "XF (2015+)",     value: "XF",        yearFrom: 2015 },
    { label: "XJ (-2019)",     value: "XJ",        yearTo: 2019 },
    { label: "F-Type (2013+)", value: "F-타입",    yearFrom: 2013 },
  ],

  "MINI": [
    { label: "Cooper (2014+)",      value: "미니쿠퍼",  yearFrom: 2014 },
    { label: "Countryman (2017+)",  value: "컨트리맨",  yearFrom: 2017 },
    { label: "Clubman (2015+)",     value: "클럽맨",    yearFrom: 2015 },
    { label: "Aceman (2024+)",      value: "에이스맨",  yearFrom: 2024 },
  ],

  "Ford": [
    { label: "Mustang (2015+)",         value: "머스탱",        yearFrom: 2015 },
    { label: "Mustang Mach-E (2020+)",  value: "머스탱 마하-E", yearFrom: 2020 },
    { label: "Explorer (2019+)",        value: "익스플로러",    yearFrom: 2019 },
    { label: "F-150 (2021+)",           value: "F-150",         yearFrom: 2021 },
    { label: "Bronco (2021+)",          value: "브롱코",         yearFrom: 2021 },
    { label: "Edge (2015+)",            value: "엣지",           yearFrom: 2015 },
  ],

  "Jeep": [
    { label: "Grand Cherokee (2021+)", value: "그랜드체로키", yearFrom: 2021 },
    { label: "Wrangler (2018+)",       value: "랭글러",        yearFrom: 2018 },
    { label: "Compass (2017+)",        value: "컴패스",        yearFrom: 2017 },
    { label: "Renegade (2014+)",       value: "레니게이드",    yearFrom: 2014 },
  ],

  "Lincoln": [
    { label: "Navigator (2018+)",   value: "네비게이터", yearFrom: 2018 },
    { label: "Aviator (2019+)",     value: "에비에이터", yearFrom: 2019 },
    { label: "Nautilus (2018+)",    value: "노틸러스",   yearFrom: 2018 },
    { label: "Corsair (2019+)",     value: "코르세어",   yearFrom: 2019 },
    { label: "Continental (-2020)", value: "컨티넨탈",   yearTo: 2020 },
  ],

  "Cadillac": [
    { label: "Escalade (2021+)", value: "에스컬레이드", yearFrom: 2021 },
    { label: "XT4 (2018+)",      value: "XT4",          yearFrom: 2018 },
    { label: "XT5 (2016+)",      value: "XT5",          yearFrom: 2016 },
    { label: "XT6 (2019+)",      value: "XT6",          yearFrom: 2019 },
    { label: "CT5 (2019+)",      value: "CT5",          yearFrom: 2019 },
    { label: "CT6 (2016+)",      value: "CT6",          yearFrom: 2016 },
    { label: "Lyriq (2022+)",    value: "리릭",          yearFrom: 2022 },
  ],

  "Infiniti": [
    { label: "QX80 (2010+)", value: "QX80" },
    { label: "QX60 (2012+)", value: "QX60", yearFrom: 2012 },
    { label: "QX50 (2017+)", value: "QX50", yearFrom: 2017 },
    { label: "QX70 (-2017)", value: "QX70", yearTo: 2017 },
    { label: "Q50 (2013+)",  value: "Q50",  yearFrom: 2013 },
    { label: "Q60 (2016+)",  value: "Q60",  yearFrom: 2016 },
    { label: "Q70 (-2019)",  value: "Q70",  yearTo: 2019 },
  ],

  "Tesla": [
    { label: "Model S (2019+)",    value: "모델 S",     yearFrom: 2019 },
    { label: "Model 3 (2019+)",    value: "모델 3",     yearFrom: 2019 },
    { label: "Model X (2019+)",    value: "모델 X",     yearFrom: 2019 },
    { label: "Model Y (2020+)",    value: "모델 Y",     yearFrom: 2020 },
    { label: "Cybertruck (2023+)", value: "사이버트럭",  yearFrom: 2023 },
  ],

  "Honda": [
    { label: "Accord (2017+)",  value: "어코드",   yearFrom: 2017 },
    { label: "Civic (2021+)",   value: "시빅",     yearFrom: 2021 },
    { label: "CR-V (2016+)",    value: "CR-V",     yearFrom: 2016 },
    { label: "Pilot (2022+)",   value: "파일럿",   yearFrom: 2022 },
    { label: "Odyssey (2017+)", value: "오딧세이", yearFrom: 2017 },
    { label: "HR-V (2021+)",    value: "HR-V",     yearFrom: 2021 },
  ],

  "Nissan": [
    { label: "Patrol (2010+)",   value: "패트롤",   yearFrom: 2010 },
    { label: "Murano (2014+)",   value: "무라노",   yearFrom: 2014 },
    { label: "Qashqai (2021+)",  value: "캐시카이", yearFrom: 2021 },
    { label: "X-Trail (2021+)",  value: "엑스트레일", yearFrom: 2021 },
    { label: "Juke (2019+)",     value: "쥬크",     yearFrom: 2019 },
    { label: "370Z (-2022)",     value: "370Z",     yearTo: 2022 },
    { label: "GT-R (2007+)",     value: "GT-R",     yearFrom: 2007 },
  ],

  "Maserati": [
    { label: "Ghibli (2013+)",        value: "기블리",       yearFrom: 2013 },
    { label: "Levante (2016+)",       value: "레반떼",       yearFrom: 2016 },
    { label: "Quattroporte (2013+)",  value: "콰트로포르테", yearFrom: 2013 },
    { label: "Grecale (2022+)",       value: "그레칼레",     yearFrom: 2022 },
    { label: "MC20 (2020+)",          value: "MC20",         yearFrom: 2020 },
  ],

  "Ferrari": [
    { label: "Roma (2019+)",      value: "로마",       yearFrom: 2019 },
    { label: "SF90 (2019+)",      value: "SF90",       yearFrom: 2019 },
    { label: "488 (2015-2019)",   value: "488",        yearFrom: 2015, yearTo: 2019 },
    { label: "296 GTB (2021+)",   value: "296 GTB",    yearFrom: 2021 },
    { label: "Portofino (2017+)", value: "포르토피노", yearFrom: 2017 },
  ],

  "Lamborghini": [
    { label: "Urus (2018+)",        value: "우루스",    yearFrom: 2018 },
    { label: "Huracan (2014+)",     value: "우라칸",    yearFrom: 2014 },
    { label: "Aventador (2011+)",   value: "아벤타도르", yearFrom: 2011 },
  ],

  "Mazda": [
    { label: "CX-5 (2017+)",   value: "CX-5",    yearFrom: 2017 },
    { label: "CX-8 (2017+)",   value: "CX-8",    yearFrom: 2017 },
    { label: "CX-60 (2022+)",  value: "CX-60",   yearFrom: 2022 },
    { label: "MX-5 (2015+)",   value: "MX-5",    yearFrom: 2015 },
    { label: "Mazda 3 (2018+)",value: "마쯔다 3", yearFrom: 2018 },
  ],

  "Subaru": [
    { label: "Outback (2019+)",    value: "아웃백",    yearFrom: 2019 },
    { label: "Forester (2018+)",   value: "포레스터",  yearFrom: 2018 },
    { label: "Impreza (2016+)",    value: "임프레자",  yearFrom: 2016 },
    { label: "Legacy (2019+)",     value: "레거시",    yearFrom: 2019 },
    { label: "Crosstrek (2017+)",  value: "크로스트렉", yearFrom: 2017 },
  ],

  "Alfa Romeo": [
    { label: "Giulia (2016+)",   value: "줄리아",   yearFrom: 2016 },
    { label: "Stelvio (2017+)",  value: "스텔비오", yearFrom: 2017 },
    { label: "Tonale (2022+)",   value: "토날레",   yearFrom: 2022 },
  ],

  "Mitsubishi": [
    { label: "Outlander (2021+)",     value: "아웃랜더",      yearFrom: 2021 },
    { label: "Eclipse Cross (2017+)", value: "이클립스 크로스", yearFrom: 2017 },
    { label: "Pajero (-2021)",        value: "파제로",         yearTo: 2021 },
  ],

  "Bentley": [
    { label: "Continental GT (2017+)", value: "컨티넨탈 GT", yearFrom: 2017 },
    { label: "Bentayga (2015+)",       value: "벤테이가",     yearFrom: 2015 },
    { label: "Flying Spur (2019+)",    value: "플라잉 스퍼",  yearFrom: 2019 },
  ],

  "GMC": [
    { label: "Sierra (2019+)",   value: "시에라",   yearFrom: 2019 },
    { label: "Acadia (2017+)",   value: "아카디아", yearFrom: 2017 },
    { label: "Yukon (2021+)",    value: "유콘",     yearFrom: 2021 },
    { label: "Canyon (2021+)",   value: "캐니언",   yearFrom: 2021 },
  ],

  "Dodge": [
    { label: "Challenger (2008+)", value: "챌린저", yearFrom: 2008 },
    { label: "Charger (2011+)",    value: "차저",   yearFrom: 2011 },
    { label: "Durango (2011+)",    value: "듀랑고", yearFrom: 2011 },
    { label: "RAM (2018+)",        value: "램",     yearFrom: 2018 },
  ],

  "Polestar": [
    { label: "Polestar 2 (2020+)", value: "폴스타 2", yearFrom: 2020 },
    { label: "Polestar 3 (2023+)", value: "폴스타 3", yearFrom: 2023 },
    { label: "Polestar 4 (2024+)", value: "폴스타 4", yearFrom: 2024 },
  ],

  "Fiat": [
    { label: "500 (2007+)",  value: "500" },
    { label: "500X (2014+)", value: "500X", yearFrom: 2014 },
  ],

  "Hummer": [
    { label: "H2 (-2009)",      value: "허머 H2",   yearTo: 2009 },
    { label: "H3 (-2010)",      value: "허머 H3",   yearTo: 2010 },
    { label: "Hummer EV (2021+)", value: "GMC 허머 EV", yearFrom: 2021 },
  ],

  "Saab": [
    { label: "9-3 (-2011)", value: "사브 9-3", yearTo: 2011 },
    { label: "9-5 (-2011)", value: "사브 9-5", yearTo: 2011 },
  ],

  "Lotus": [
    { label: "Elise (-2021)",  value: "엘리스",  yearTo: 2021 },
    { label: "Evora (-2021)",  value: "에보라",  yearTo: 2021 },
    { label: "Emira (2021+)",  value: "에미라",  yearFrom: 2021 },
    { label: "Eletre (2023+)", value: "일레트르", yearFrom: 2023 },
  ],

  "BYD": [
    { label: "Atto 3 (2021+)", value: "아토 3", yearFrom: 2021 },
    { label: "Seal (2022+)",   value: "씰",     yearFrom: 2022 },
    { label: "Dolphin (2021+)",value: "돌핀",   yearFrom: 2021 },
    { label: "Han (2020+)",    value: "한",     yearFrom: 2020 },
    { label: "Tang (2018+)",   value: "탕",     yearFrom: 2018 },
  ],

  "Maybach": [
    { label: "S-Class (2020+)", value: "마이바흐 S클래스", yearFrom: 2020 },
    { label: "GLS (2020+)",     value: "마이바흐 GLS",     yearFrom: 2020 },
  ],

  "Daewoo": [
    { label: "Damas",           value: "다마스" },
    { label: "New Damas",       value: "뉴 다마스" },
    { label: "Labo",            value: "라보" },
    { label: "New Labo",        value: "뉴 라보" },
    { label: "Matiz",           value: "마티즈" },
    { label: "Matiz Creative",  value: "마티즈 크리에이티브" },
    { label: "Gentra",          value: "젠트라" },
    { label: "Lacetti",         value: "라세티" },
    { label: "Lacetti Premier", value: "라세티 프리미어" },
    { label: "Cruze (2011+)",   value: "크루즈", yearFrom: 2011 },
    { label: "Rezzo",           value: "레조" },
    { label: "Winstorm",        value: "윈스톰" },
    { label: "Alpheon",         value: "알페온" },
    { label: "Magnus",          value: "매그너스" },
    { label: "Veritas",         value: "베리타스" },
  ],

  "Rolls-Royce": [
    { label: "Phantom (2017+)",  value: "팬텀",   yearFrom: 2017 },
    { label: "Ghost (2020+)",    value: "고스트", yearFrom: 2020 },
    { label: "Cullinan (2018+)", value: "컬리넌", yearFrom: 2018 },
    { label: "Wraith (-2022)",   value: "레이스", yearTo: 2022 },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// FilterSidebar Component
// ─────────────────────────────────────────────────────────────────────────────
export function FilterSidebar({ filters, updateFilter, resetFilters, className }: FilterSidebarProps) {
  const { data: brandsData, isLoading: isLoadingBrands } = useGetCarBrands();
  const u = uf(updateFilter);

  // ── حالة الموديل المختار (للحصول على سنواته)
  const [selectedModelEntry, setSelectedModelEntry] = useState<ModelOption | null>(null);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 20 }, (_, i) => currentYear - i);

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

  // ── عند اختيار موديل من القائمة، نضبط السنوات تلقائياً
  const handleModelChange = (value: string) => {
    if (!value) {
      u("model", undefined);
      setSelectedModelEntry(null);
      updateFilter("yearFrom", undefined);
      updateFilter("yearTo", undefined);
      return;
    }
    const entry = brandModels.find((m) => m.value === value) ?? null;
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

  // ── badge السنوات للموديل المختار
  const modelYearBadge = selectedModelEntry
    ? selectedModelEntry.yearTo
      ? `${selectedModelEntry.yearFrom ?? ""}–${selectedModelEntry.yearTo}`
      : selectedModelEntry.yearFrom
        ? `${selectedModelEntry.yearFrom}+`
        : null
    : null;

  return (
    <div className={cn("bg-card rounded-2xl border border-border shadow-sm p-6 flex flex-col gap-6", className)}>

      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-border">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <Filter className="w-5 h-5 text-primary" />
          التصفية
        </h3>
        <button
          onClick={() => {
            setSelectedModelEntry(null);
            resetFilters();
          }}
          className="text-sm font-semibold text-muted-foreground hover:text-destructive transition-colors"
        >
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
                !compatibleOnly ? "border-primary bg-primary/10 text-primary" : "border-border bg-background text-muted-foreground hover:border-primary/40"
              )}
            >
              <Globe className="w-3.5 h-3.5" />
              بحث عام
            </button>
            <button
              onClick={() => handleCompatibleToggle("compatible")}
              className={cn(
                "py-2.5 px-3 rounded-xl text-sm font-semibold transition-all border-2 flex items-center justify-center gap-1.5",
                compatibleOnly ? "border-green-500 bg-green-500/10 text-green-600" : "border-border bg-background text-muted-foreground hover:border-green-400/40"
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

      {/* Model — مع badge السنوات */}
      <div className="space-y-3">
        <label className="text-sm font-bold text-foreground flex items-center justify-between">
          <span>الموديل والجيل</span>
          {modelYearBadge && (
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
              {modelYearBadge}
            </span>
          )}
        </label>

        {hasModelList ? (
          <div className="relative">
            <select
              className="w-full appearance-none bg-background border-2 border-border rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all cursor-pointer"
              value={(filters as any).model || ""}
              onChange={(e) => handleModelChange(e.target.value)}
            >
              <option value="">كل الموديلات</option>
              {brandModels.map((m) => {
                const yr = m.yearTo
                  ? `${m.yearFrom ?? ""}–${m.yearTo}`
                  : m.yearFrom ? `${m.yearFrom}+` : "";
                return (
                  <option key={m.value} value={m.value}>
                    {m.label.replace(/\s*\(.*\)$/, "")} {yr ? `(${yr})` : ""}
                  </option>
                );
              })}
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

        {/* إشعار السنوات التلقائية */}
        {selectedModelEntry && modelYearBadge && (
          <div className="bg-primary/5 border border-primary/20 rounded-xl px-3 py-2 text-xs text-primary flex items-center justify-between">
            <span>✅ تم ضبط السنوات تلقائياً: <strong>{modelYearBadge}</strong></span>
            <button
              onClick={() => {
                updateFilter("yearFrom", undefined);
                updateFilter("yearTo", undefined);
              }}
              className="text-muted-foreground hover:text-destructive mr-1"
              title="مسح السنوات"
            >
              ✕
            </button>
          </div>
        )}
      </div>

      {/* Year — يبقى للتعديل اليدوي */}
      <div className="space-y-3">
        <label className="text-sm font-bold text-foreground flex items-center gap-1">
          سنة الصنع
          <span className="text-xs text-muted-foreground font-normal">(يمكن التعديل)</span>
        </label>
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
