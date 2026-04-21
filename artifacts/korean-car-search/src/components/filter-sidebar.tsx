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

const BRAND_MODELS: Record<string, ModelOption[]> = {
  "Hyundai": [
    { label: "Palisade", value: "팰리세이드" },
    { label: "Palisade (New)", value: "더 뉴 팰리세이드" },
    { label: "Santa Fe MX5 (2023+)", value: "싼타페 (MX5)" },
    { label: "Santa Fe (New)", value: "더 뉴 싼타페" },
    { label: "Santa Fe TM", value: "싼타페 TM" },
    { label: "Grandeur GN7 (2022+)", value: "그랜저 (GN7)" },
    { label: "Grandeur Hybrid GN7", value: "그랜저 하이브리드 (GN7)" },
    { label: "Grandeur IG (New)", value: "더 뉴 그랜저 IG" },
    { label: "Grandeur HG", value: "그랜저 HG" },
    { label: "Sonata DN8", value: "쏘나타 (DN8)" },
    { label: "Sonata Hybrid DN8", value: "쏘나타 하이브리드 (DN8)" },
    { label: "Sonata LF", value: "LF 쏘나타" },
    { label: "Elantra CN7 (2020+)", value: "아반떼 (CN7)" },
    { label: "Elantra Hybrid CN7", value: "아반떼 하이브리드 (CN7)" },
    { label: "Elantra MD", value: "아반떼 MD" },
    { label: "Tucson NX4 (2020+)", value: "투싼 (NX4)" },
    { label: "Tucson TL (New)", value: "더 뉴 투싼 TL" },
    { label: "Kona OS", value: "코나 (OS)" },
    { label: "Kona SX2 (2023+)", value: "코나 (SX2)" },
    { label: "Ioniq 5", value: "아이오닉 5" },
    { label: "Ioniq 5 N", value: "아이오닉 5 N" },
    { label: "Ioniq 6", value: "아이오닉 6" },
    { label: "Ioniq 9", value: "아이오닉 9" },
    { label: "Staria", value: "스타리아" },
    { label: "Staria Lounge", value: "스타리아 라운지" },
    { label: "Grand Starex (New)", value: "더 뉴 그랜드 스타렉스" },
    { label: "Casper", value: "캐스퍼" },
    { label: "Casper Electric", value: "캐스퍼 일렉트릭" },
    { label: "Nexo (Hydrogen)", value: "넥쏘" },
    { label: "Venue", value: "베뉴" },
    { label: "Porter 2", value: "포터 2" },
  ],
  "Kia": [
    { label: "Carnival 4th Gen", value: "카니발 4세대" },
    { label: "Carnival (New)", value: "더 뉴 카니발" },
    { label: "Carnival Limousine", value: "카니발 리무진" },
    { label: "Sorento 4th Gen (2020+)", value: "쏘렌토 4세대" },
    { label: "Sorento Hybrid 4th Gen", value: "쏘렌토 하이브리드 4세대" },
    { label: "Sorento PHEV 4th Gen", value: "쏘렌토 플러그인 하이브리드 4세대" },
    { label: "Sorento (New)", value: "더 뉴 쏘렌토 4세대" },
    { label: "Sportage 5th Gen (2021+)", value: "스포티지 5세대" },
    { label: "Sportage 5th Gen Hybrid", value: "스포티지 5세대 하이브리드" },
    { label: "Sportage 5th Gen PHEV", value: "스포티지 5세대 플러그인 하이브리드" },
    { label: "K8", value: "K8" },
    { label: "K8 Hybrid", value: "K8 하이브리드" },
    { label: "K5 3rd Gen", value: "K5 3세대" },
    { label: "K5 Hybrid 3rd Gen", value: "K5 하이브리드 3세대" },
    { label: "K5 2nd Gen (New)", value: "더 뉴 K5 2세대" },
    { label: "K3", value: "K3" },
    { label: "K3 2nd Gen (New)", value: "더 뉴 K3 2세대" },
    { label: "Seltos", value: "셀토스" },
    { label: "Seltos (New)", value: "더 뉴 셀토스" },
    { label: "Niro (All New)", value: "디 올 뉴 니로" },
    { label: "Niro Hybrid", value: "니로 하이브리드" },
    { label: "Niro EV", value: "니로 EV" },
    { label: "EV6", value: "EV6" },
    { label: "EV6 GT", value: "EV6 GT" },
    { label: "EV9", value: "EV9" },
    { label: "Stinger", value: "스팅어" },
    { label: "Mohave", value: "모하비" },
    { label: "Morning", value: "모닝" },
    { label: "Ray", value: "레이" },
    { label: "Telluride", value: "텔루라이드" },
  ],
  "Genesis": [
    { label: "GV80", value: "GV80" },
    { label: "GV80 Coupe", value: "GV80 쿠페" },
    { label: "GV70", value: "GV70" },
    { label: "GV70 Electrified", value: "GV70 전동화" },
    { label: "GV60", value: "GV60" },
    { label: "GV60 Sport", value: "GV60 스포츠" },
    { label: "G80 RG3 (2020+)", value: "G80 (RG3)" },
    { label: "G80 Electrified", value: "G80 전동화" },
    { label: "G80", value: "G80" },
    { label: "G90 RS4 (2022+)", value: "G90 (RS4)" },
    { label: "G90", value: "G90" },
    { label: "G70 (New)", value: "더 뉴 G70" },
    { label: "G70 2nd Gen", value: "G70 2세대" },
    { label: "EQ900", value: "EQ900" },
  ],
  "SsangYong": [
    { label: "Rexton G4", value: "렉스턴 G4" },
    { label: "Rexton Sports", value: "렉스턴 스포츠" },
    { label: "Korando", value: "코란도" },
    { label: "Korando e-Motion", value: "코란도 이모션" },
    { label: "Tivoli", value: "티볼리" },
    { label: "Tivoli Air", value: "티볼리 에어" },
    { label: "Musso", value: "무쏘" },
    { label: "Actyon", value: "액티언" },
  ],
  "KG Mobility": [
    { label: "Torres", value: "토레스" },
    { label: "Torres EVX", value: "토레스 EVX" },
    { label: "Rexton G4", value: "렉스턴 G4" },
    { label: "Rexton Sports", value: "렉스턴 스포츠" },
    { label: "Korando", value: "코란도" },
    { label: "Tivoli", value: "티볼리" },
    { label: "Musso", value: "무쏘" },
    { label: "Actyon Sports", value: "액티언 스포츠" },
  ],
  "Renault Samsung": [
    { label: "QM6", value: "QM6" },
    { label: "QM6 LPe", value: "QM6 LPe" },
    { label: "SM6", value: "SM6" },
    { label: "XM3", value: "XM3" },
    { label: "SM3", value: "SM3" },
    { label: "SM5", value: "SM5" },
  ],
  "Renault Korea": [
    { label: "QM6", value: "QM6" },
    { label: "SM6", value: "SM6" },
    { label: "XM3", value: "XM3" },
    { label: "Arkana", value: "아르카나" },
    { label: "Megane E-Tech", value: "메간 E-테크" },
  ],
  "Chevrolet": [
    { label: "Trailblazer", value: "트레일블레이저" },
    { label: "Equinox", value: "이쿼녹스" },
    { label: "Equinox EV", value: "이쿼녹스 EV" },
    { label: "Spark", value: "스파크" },
    { label: "Malibu", value: "말리부" },
    { label: "Colorado", value: "콜로라도" },
    { label: "Traverse", value: "트래버스" },
    { label: "Blazer EV", value: "블레이저 EV" },
    { label: "Tahoe", value: "타호" },
  ],
  "BMW": [
    { label: "1 Series F40 (2019+)", value: "1시리즈 (F40)" },
    { label: "2 Series Coupe G42", value: "2시리즈 쿠페 (G42)" },
    { label: "2 Series Active Tourer U06", value: "2시리즈 액티브 투어러 (U06)" },
    { label: "3 Series G20 (2019+)", value: "3시리즈 (G20)" },
    { label: "3 Series F30 (2012-2018)", value: "3시리즈 (F30)" },
    { label: "4 Series G22 Coupe", value: "4시리즈 쿠페 (G22)" },
    { label: "4 Series G26 Gran Coupe", value: "4시리즈 그란쿠페 (G26)" },
    { label: "5 Series G60 (2023+)", value: "5시리즈 (G60)" },
    { label: "5 Series G30 (2017-2023)", value: "5시리즈 (G30)" },
    { label: "6 Series Gran Turismo G32", value: "6시리즈 그란 투리스모 (G32)" },
    { label: "7 Series G70 (2022+)", value: "7시리즈 (G70)" },
    { label: "7 Series G11 (2015-2022)", value: "7시리즈 (G11)" },
    { label: "8 Series G14 Coupe", value: "8시리즈 쿠페 (G14)" },
    { label: "X1 U11 (2022+)", value: "X1 (U11)" },
    { label: "X1 F48 (2015-2022)", value: "X1 (F48)" },
    { label: "X3 G01", value: "X3 (G01)" },
    { label: "X3 M", value: "X3 M" },
    { label: "X4 G02", value: "X4 (G02)" },
    { label: "X5 G05 (2018+)", value: "X5 (G05)" },
    { label: "X5 M", value: "X5 M" },
    { label: "X6 G06", value: "X6 (G06)" },
    { label: "X7 G07", value: "X7 (G07)" },
    { label: "i3", value: "i3" },
    { label: "i4", value: "i4" },
    { label: "i5", value: "i5" },
    { label: "i7", value: "i7" },
    { label: "iX", value: "iX" },
    { label: "iX1", value: "iX1" },
    { label: "iX3", value: "iX3" },
    { label: "M3 G80", value: "M3 (G80)" },
    { label: "M4 G82", value: "M4 (G82)" },
    { label: "M5 F90", value: "M5 (F90)" },
  ],
  "Mercedes-Benz": [
    { label: "A-Class W177 (2018+)", value: "A-클래스 W177" },
    { label: "C-Class W206 (2021+)", value: "C-클래스 W206" },
    { label: "C-Class W205 (2014-2021)", value: "C-클래스 W205" },
    { label: "E-Class W214 (2024+)", value: "E-클래스 W214" },
    { label: "E-Class W213 (2016-2023)", value: "E-클래스 W213" },
    { label: "S-Class W223 (2021+)", value: "S-클래스 W223" },
    { label: "S-Class W222 (2013-2021)", value: "S-클래스 W222" },
    { label: "CLA W118 (2019+)", value: "CLA-클래스 W118" },
    { label: "CLS C257 (2018+)", value: "CLS-클래스 C257" },
    { label: "GLA H247 (2020+)", value: "GLA-클래스 H247" },
    { label: "GLB X247 (2019+)", value: "GLB-클래스 X247" },
    { label: "GLC X254 (2023+)", value: "GLC-클래스 X254" },
    { label: "GLC X253 (2015-2022)", value: "GLC-클래스 X253" },
    { label: "GLC Coupe C253", value: "GLC-클래스 쿠페 C253" },
    { label: "GLE W167 (2019+)", value: "GLE-클래스 W167" },
    { label: "GLS X167 (2019+)", value: "GLS-클래스 X167" },
    { label: "G-Class W463 (2018+)", value: "G-클래스 W463" },
    { label: "EQA H243", value: "EQA" },
    { label: "EQB X243", value: "EQB" },
    { label: "EQC N293", value: "EQC" },
    { label: "EQE V295", value: "EQE" },
    { label: "EQS V297", value: "EQS" },
    { label: "AMG GT C190", value: "AMG GT (C190)" },
    { label: "AMG C63", value: "AMG C63" },
    { label: "AMG E63", value: "AMG E63" },
  ],
  "Audi": [
    { label: "A3 8Y (2020+)", value: "A3 (8Y)" },
    { label: "A4 B9 (2015+)", value: "A4 (B9)" },
    { label: "A5 F5 Coupe", value: "A5 쿠페 (F5)" },
    { label: "A5 Sportback F5", value: "A5 스포트백 (F5)" },
    { label: "A6 C8 (2018+)", value: "A6 (C8)" },
    { label: "A7 C8 Sportback", value: "A7 스포트백 (C8)" },
    { label: "A8 D5 (2017+)", value: "A8 (D5)" },
    { label: "Q3 F3 (2018+)", value: "Q3 (F3)" },
    { label: "Q5 FY (2017+)", value: "Q5 (FY)" },
    { label: "Q5 Sportback FY", value: "Q5 스포트백 (FY)" },
    { label: "Q7 4M (2015+)", value: "Q7 (4M)" },
    { label: "Q8 4M (2018+)", value: "Q8 (4M)" },
    { label: "Q8 e-tron", value: "Q8 e-트론" },
    { label: "e-tron GT", value: "e-트론 GT" },
    { label: "RS6 C8", value: "RS6 (C8)" },
    { label: "RS7 C8", value: "RS7 (C8)" },
    { label: "R8", value: "R8" },
  ],
  "Volkswagen": [
    { label: "Tiguan 2nd Gen (2016+)", value: "티구안 2세대" },
    { label: "Tiguan Allspace", value: "티구안 올스페이스" },
    { label: "Passat B8", value: "파사트 (B8)" },
    { label: "Touareg 3rd Gen", value: "투아렉 3세대" },
    { label: "ID.4", value: "ID.4" },
    { label: "ID.6", value: "ID.6" },
    { label: "Golf 8th Gen", value: "골프 8세대" },
    { label: "Golf GTI", value: "골프 GTI" },
    { label: "Golf R", value: "골프 R" },
    { label: "Arteon", value: "아테온" },
    { label: "T-Roc", value: "T-로크" },
  ],
  "Toyota": [
    { label: "Camry XV70 (2017-2024)", value: "캠리 (XV70)" },
    { label: "Camry XV80 (2024+)", value: "캠리 (XV80)" },
    { label: "Camry Hybrid XV70", value: "캠리 하이브리드 (XV70)" },
    { label: "RAV4 5th Gen (2018+)", value: "RAV4 5세대" },
    { label: "RAV4 Hybrid", value: "RAV4 하이브리드" },
    { label: "RAV4 PHEV", value: "RAV4 PHEV" },
    { label: "Prius 5th Gen (2023+)", value: "프리우스 5세대" },
    { label: "Prius 4th Gen", value: "프리우스 4세대" },
    { label: "Crown Crossover (2022+)", value: "크라운 크로스오버" },
    { label: "Alphard 4th Gen (2023+)", value: "알파드 4세대" },
    { label: "Alphard 3rd Gen", value: "알파드 3세대" },
    { label: "Vellfire", value: "벨파이어" },
    { label: "Sienna 4th Gen", value: "시에나 4세대" },
    { label: "Harrier", value: "해리어" },
    { label: "Land Cruiser 300 (2021+)", value: "랜드크루저 300" },
    { label: "Land Cruiser Prado", value: "랜드크루저 프라도" },
    { label: "GR86", value: "GR86" },
    { label: "GR Supra", value: "GR 수프라" },
    { label: "bZ4X", value: "bZ4X" },
  ],
  "Lexus": [
    { label: "ES300h 7th Gen", value: "ES300h 7세대" },
    { label: "ES350 7th Gen", value: "ES350 7세대" },
    { label: "IS300h", value: "IS300h" },
    { label: "IS500", value: "IS500" },
    { label: "LS500h 5th Gen", value: "LS500h 5세대" },
    { label: "LS500", value: "LS500" },
    { label: "UX250h", value: "UX250h" },
    { label: "UX300e", value: "UX300e" },
    { label: "NX350h 2nd Gen (2021+)", value: "NX350h 2세대" },
    { label: "NX450h+ 2nd Gen (2021+)", value: "NX450h+ 2세대" },
    { label: "RX350h 5th Gen (2022+)", value: "RX350h 5세대" },
    { label: "RX450h 4th Gen", value: "RX450h 4세대" },
    { label: "RX500h", value: "RX500h" },
    { label: "LX600 (2021+)", value: "LX600" },
    { label: "GX460", value: "GX460" },
    { label: "LC500", value: "LC500" },
    { label: "LC500h", value: "LC500h" },
    { label: "RZ450e", value: "RZ450e" },
  ],
  "Porsche": [
    { label: "Cayenne PO536 (2018+)", value: "카이엔 (PO536)" },
    { label: "Cayenne Coupe", value: "카이엔 쿠페" },
    { label: "Cayenne Turbo", value: "카이엔 터보" },
    { label: "Cayenne Turbo S E-Hybrid", value: "카이엔 터보 S E-하이브리드" },
    { label: "Cayenne S", value: "카이엔 S" },
    { label: "Cayenne GTS", value: "카이엔 GTS" },
    { label: "Cayenne E3 (2017+)", value: "카이엔 (E3)" },
    { label: "Panamera 976 (2023+)", value: "파나메라 (976)" },
    { label: "Panamera 971 (2016-2023)", value: "파나메라 (971)" },
    { label: "Panamera Turbo S", value: "파나메라 터보 S" },
    { label: "Panamera 4S", value: "파나메라 4S" },
    { label: "Panamera Sport Turismo", value: "파나메라 스포츠 투리스모" },
    { label: "911 (992) (2019+)", value: "911 (992)" },
    { label: "911 (991) (2011-2019)", value: "911 (991)" },
    { label: "911 Turbo S (992)", value: "911 터보 S (992)" },
    { label: "911 Carrera S", value: "911 카레라 S" },
    { label: "911 GT3", value: "911 GT3" },
    { label: "911 GT3 RS", value: "911 GT3 RS" },
    { label: "Taycan", value: "타이칸" },
    { label: "Taycan Cross Turismo", value: "타이칸 크로스 투리스모" },
    { label: "Taycan Sport Turismo", value: "타이칸 스포츠 투리스모" },
    { label: "Taycan Turbo S", value: "타이칸 터보 S" },
    { label: "Macan (2014-2023)", value: "마칸" },
    { label: "Macan EV (2024+)", value: "마칸 EV" },
    { label: "Macan GTS", value: "마칸 GTS" },
    { label: "Macan Turbo", value: "마칸 터보" },
    { label: "Boxster 718", value: "718 박스터" },
    { label: "Cayman 718", value: "718 카이맨" },
    { label: "Cayman GT4", value: "718 카이맨 GT4" },
  ],
  "Volvo": [
    { label: "XC40", value: "XC40" },
    { label: "XC40 Recharge", value: "XC40 리차지" },
    { label: "XC60 2nd Gen (2017+)", value: "XC60 2세대" },
    { label: "XC60 Recharge", value: "XC60 리차지" },
    { label: "XC90 2nd Gen", value: "XC90 2세대" },
    { label: "XC90 Recharge", value: "XC90 리차지" },
    { label: "C40 Recharge", value: "C40 리차지" },
    { label: "S60 3rd Gen", value: "S60 3세대" },
    { label: "S90 2nd Gen", value: "S90 2세대" },
    { label: "V60 2nd Gen", value: "V60 2세대" },
    { label: "V90 Cross Country", value: "V90 크로스 컨트리" },
    { label: "EX30", value: "EX30" },
    { label: "EX90", value: "EX90" },
  ],
  "Land Rover": [
    { label: "Range Rover 5th Gen (2022+)", value: "레인지로버 5세대" },
    { label: "Range Rover 4th Gen (2012-2021)", value: "레인지로버 4세대" },
    { label: "Range Rover Sport 3rd Gen (2022+)", value: "레인지로버 스포츠 3세대" },
    { label: "Range Rover Sport 2nd Gen", value: "레인지로버 스포츠 2세대" },
    { label: "Range Rover Velar", value: "레인지로버 벨라" },
    { label: "Range Rover Evoque 2nd Gen", value: "레인지로버 이보크 2세대" },
    { label: "Discovery 5th Gen", value: "디스커버리 5세대" },
    { label: "Discovery Sport", value: "디스커버리 스포츠" },
    { label: "Defender 90", value: "디펜더 90" },
    { label: "Defender 110", value: "디펜더 110" },
    { label: "Defender 130", value: "디펜더 130" },
  ],
  "Jaguar": [
    { label: "F-Pace (2021+)", value: "F-페이스" },
    { label: "E-Pace", value: "E-페이스" },
    { label: "XE", value: "XE" },
    { label: "XF", value: "XF" },
    { label: "XJ", value: "XJ" },
    { label: "F-Type", value: "F-타입" },
    { label: "I-Pace", value: "I-페이스" },
  ],
  "MINI": [
    { label: "Countryman F60 (2017+)", value: "컨트리맨 (F60)" },
    { label: "Countryman U25 (2024+)", value: "컨트리맨 (U25)" },
    { label: "Cooper 3-Door F56", value: "쿠퍼 3도어 (F56)" },
    { label: "Cooper 5-Door F55", value: "쿠퍼 5도어 (F55)" },
    { label: "Clubman F54", value: "클럽맨 (F54)" },
    { label: "Convertible F57", value: "컨버터블 (F57)" },
    { label: "Electric", value: "일렉트릭" },
  ],
  "Ford": [
    { label: "Explorer 6th Gen", value: "익스플로러 6세대" },
    { label: "Explorer Hybrid", value: "익스플로러 하이브리드" },
    { label: "Mustang 6th Gen", value: "머스탱 6세대" },
    { label: "Mustang Mach-E", value: "머스탱 마하-E" },
    { label: "Bronco 6th Gen", value: "브롱코" },
    { label: "F-150", value: "F-150" },
    { label: "Edge", value: "엣지" },
  ],
  "Jeep": [
    { label: "Grand Cherokee WL (2021+)", value: "그랜드 체로키 WL" },
    { label: "Grand Cherokee L (2021+)", value: "그랜드 체로키 L" },
    { label: "Wrangler JL (2018+)", value: "랭글러 JL" },
    { label: "Wrangler Rubicon", value: "랭글러 루비콘" },
    { label: "Compass 2nd Gen", value: "컴패스 2세대" },
    { label: "Renegade", value: "레니게이드" },
    { label: "Gladiator", value: "글래디에이터" },
  ],
  "Lincoln": [
    { label: "Navigator 4th Gen (2018+)", value: "네비게이터 4세대" },
    { label: "Navigator L", value: "네비게이터 L" },
    { label: "Aviator", value: "에비에이터" },
    { label: "Nautilus", value: "노틸러스" },
    { label: "Corsair", value: "코세어" },
  ],
  "Cadillac": [
    { label: "Escalade 5th Gen (2021+)", value: "에스컬레이드 5세대" },
    { label: "Escalade ESV", value: "에스컬레이드 ESV" },
    { label: "XT4", value: "XT4" },
    { label: "XT5", value: "XT5" },
    { label: "XT6", value: "XT6" },
    { label: "CT5", value: "CT5" },
    { label: "CT5-V Blackwing", value: "CT5-V 블랙윙" },
    { label: "Lyriq", value: "리릭" },
  ],
  "Infiniti": [
    { label: "QX80 (2022+)", value: "QX80" },
    { label: "QX60 3rd Gen (2021+)", value: "QX60 3세대" },
    { label: "QX55", value: "QX55" },
    { label: "QX50 2nd Gen", value: "QX50 2세대" },
    { label: "Q50", value: "Q50" },
    { label: "Q60 Coupe", value: "Q60 쿠페" },
  ],
  "Maserati": [
    { label: "Ghibli 3rd Gen", value: "기블리 3세대" },
    { label: "Levante (2016+)", value: "르반떼" },
    { label: "Levante Trofeo", value: "르반떼 트로페오" },
    { label: "Quattroporte 6th Gen", value: "콰트로포르테 6세대" },
    { label: "Grecale (2022+)", value: "그레칼레" },
    { label: "Grecale Folgore", value: "그레칼레 폴고레" },
    { label: "GranTurismo", value: "그란투리스모" },
    { label: "MC20", value: "MC20" },
  ],
  "Honda": [
    { label: "Odyssey 5th Gen", value: "오디세이 5세대" },
    { label: "CR-V 6th Gen (2022+)", value: "CR-V 6세대" },
    { label: "CR-V Hybrid", value: "CR-V 하이브리드" },
    { label: "Accord 11th Gen (2022+)", value: "어코드 11세대" },
    { label: "Accord 10th Gen", value: "어코드 10세대" },
    { label: "Pilot 4th Gen", value: "파일럿 4세대" },
    { label: "Civic 11th Gen", value: "시빅 11세대" },
    { label: "HR-V 3rd Gen", value: "HR-V 3세대" },
    { label: "ZR-V", value: "ZR-V" },
    { label: "e:Ny1", value: "e:Ny1" },
  ],
  "Nissan": [
    { label: "Patrol Y62 (2010+)", value: "패트롤 Y62" },
    { label: "Patrol Y62 (2020+)", value: "패트롤 Y62 2020" },
    { label: "Murano 3rd Gen", value: "무라노 3세대" },
    { label: "Ariya", value: "아리야" },
    { label: "X-Trail T33 (2021+)", value: "엑스트레일 T33" },
    { label: "Qashqai J12 (2021+)", value: "캐시카이 J12" },
    { label: "Leaf 2nd Gen", value: "리프 2세대" },
    { label: "Navara (Frontier)", value: "나바라" },
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

  const selectedBrand    = filters.brand || "";
  const brandModels      = selectedBrand ? (BRAND_MODELS[selectedBrand] ?? []) : [];
  const hasModelList     = brandModels.length > 0;
  const selectedCountry  = ((filters as any).country ?? "") as CountryCode | "";
  const compatibleOnly   = !!((filters as any).compatibleOnly);

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

  const toggleFuel  = (type: any) => updateFilter("fuelType",  filters.fuelType  === type ? undefined : type);
  const toggleBody  = (type: any) => updateFilter("bodyType",  filters.bodyType  === type ? undefined : type);
  const toggleColor = (key: string) => updateFilter("color",   filters.color     === key  ? undefined : (key as any));

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

      {/* Country Filter */}
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