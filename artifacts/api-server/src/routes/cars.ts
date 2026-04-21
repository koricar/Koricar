import { Router, type IRouter } from "express";
import { SearchCarsQueryParams } from "@workspace/api-zod";

const router: IRouter = Router();

const carCache = new Map<string, ReturnType<typeof mapEncarCar>>();

const ENCAR_API = "https://api.encar.com";
const ENCAR_PHOTO = "https://ci.encar.com";
const ENCAR_DETAIL = "https://www.encar.com/dc/dc_cardetailview.do?carid=";

const MANUFACTURER_TO_EN: Record<string, string> = {
  "현대": "Hyundai",
  "기아": "Kia",
  "제네시스": "Genesis",
  "쌍용": "SsangYong",
  "KG모빌리티": "KG Mobility",
  "르노삼성": "Renault Samsung",
  "르노코리아": "Renault Korea",
  "쉐보레": "Chevrolet",
  "BMW": "BMW",
  "벤츠": "Mercedes-Benz",
  "아우디": "Audi",
  "폭스바겐": "Volkswagen",
  "볼보": "Volvo",
  "도요타": "Toyota",
  "혼다": "Honda",
  "닛산": "Nissan",
  "렉서스": "Lexus",
  "포르쉐": "Porsche",
  "랜드로버": "Land Rover",
  "재규어": "Jaguar",
  "미니": "MINI",
  "포드": "Ford",
  "지프": "Jeep",
  "링컨": "Lincoln",
  "캐딜락": "Cadillac",
  "인피니티": "Infiniti",
  "마세라티": "Maserati",
  "페라리": "Ferrari",
  "람보르기니": "Lamborghini",
};

const EN_TO_MANUFACTURER: Record<string, string> = {
  "hyundai": "현대",
  "kia": "기아",
  "genesis": "제네시스",
  "ssangyong": "쌍용",
  "kg mobility": "KG모빌리티",
  "renault samsung": "르노삼성",
  "renault korea": "르노코리아",
  "chevrolet": "쉐보레",
  "bmw": "BMW",
  "mercedes": "벤츠",
  "mercedes-benz": "벤츠",
  "audi": "아우디",
  "volkswagen": "폭스바겐",
  "volvo": "볼보",
  "toyota": "도요타",
  "honda": "혼다",
  "lexus": "렉서스",
  "nissan": "닛산",
  "infiniti": "인피니티",
  "porsche": "포르쉐",
  "land rover": "랜드로버",
  "jaguar": "재규어",
  "mini": "미니",
  "ford": "포드",
  "jeep": "지프",
  "lincoln": "링컨",
  "cadillac": "캐딜락",
  "ferrari": "페라리",
  "lamborghini": "람보르기니",
  "maserati": "마세라티",
  "rolls-royce": "롤스로이스",
  "mclaren": "맥라렌",
};

const DOMESTIC_BRANDS = new Set([
  "hyundai", "kia", "genesis", "ssangyong", "kg mobility",
  "renault samsung", "renault korea", "chevrolet",
]);

const FUEL_TO_EN: Record<string, string> = {
  "가솔린": "gasoline",
  "디젤": "diesel",
  "LPG": "lpg",
  "전기": "electric",
  "수소": "hydrogen",
  "가솔린+전기": "hybrid",
  "디젤+전기": "hybrid",
  "플러그인하이브리드": "hybrid",
  "가솔린+LPG": "lpg",
};

const EN_TO_FUEL_KR: Record<string, string> = {
  "gasoline": "가솔린",
  "diesel": "디젤",
  "lpg": "LPG",
  "electric": "전기",
  "hybrid": "가솔린+전기",
};

const EN_TO_TRANSMISSION_KR: Record<string, string> = {
  "auto": "오토",
  "manual": "수동",
};

const EN_MODEL_TO_KR: Record<string, string> = {
  "palisade": "팰리세이드",
  "tucson": "투싼",
  "sonata": "쏘나타",
  "elantra": "아반떼",
  "avante": "아반떼",
  "santa fe": "싼타페",
  "santafe": "싼타페",
  "kona": "코나",
  "ioniq": "아이오닉",
  "ioniq 5": "아이오닉 5",
  "ioniq 6": "아이오닉 6",
  "ioniq5": "아이오닉 5",
  "ioniq6": "아이오닉 6",
  "staria": "스타리아",
  "nexo": "넥쏘",
  "grandeur": "그랜저",
  "accent": "엑센트",
  "veloster": "벨로스터",
  "casper": "캐스퍼",
  "porter": "포터",
  "starex": "스타렉스",
  "باليسيد": "팰리세이드",
  "بالسيد": "팰리세이드",
  "توسان": "투싼",
  "سانتافي": "싼타페",
  "سانتا في": "싼타페",
  "سوناتا": "쏘나타",
  "سونانتا": "쏘나타",
  "ايلانترا": "아반떼",
  "ألانترا": "아반떼",
  "كونا": "코나",
  "ايونيك": "아이오닉",
  "ايونق": "아이오닉",
  "جرانديور": "그랜저",
  "كاسبر": "캐스퍼",
  "k5": "K5",
  "k8": "K8",
  "k3": "K3",
  "k9": "K9",
  "carnival": "카니발",
  "sedona": "카니발",
  "sorento": "쏘렌토",
  "sportage": "스포티지",
  "stinger": "스팅어",
  "telluride": "텔루라이드",
  "mohave": "모하비",
  "soul": "쏘울",
  "niro": "니로",
  "seltos": "셀토스",
  "morning": "모닝",
  "ray": "레이",
  "ev6": "EV6",
  "ev9": "EV9",
  "كارنيفال": "카니발",
  "كرنفال": "카니발",
  "سورينتو": "쏘렌토",
  "سبورتاج": "스포티지",
  "سيلتوس": "셀토스",
  "نيرو": "니로",
  "ستينجر": "스팅어",
  "gv80": "GV80",
  "gv70": "GV70",
  "gv60": "GV60",
  "g80": "G80",
  "g70": "G70",
  "g90": "G90",
  "gv90": "GV90",
  "rexton": "렉스턴",
  "korando": "코란도",
  "tivoli": "티볼리",
  "musso": "무쏘",
  "actyon": "액티언",
  "torres": "토레스",
  "camry": "캠리",
  "rav4": "RAV4",
  "prius": "프리우스",
  "sienna": "시에나",
  "avalon": "아발론",
  "gr86": "GR86",
  "alphard": "알파드",
  "crown": "크라운 크로스오버",
  "كامري": "캠리",
  "كامرى": "캠리",
  "برايوس": "프리우스",
  "بريوس": "프리우스",
  "راف4": "RAV4",
  "راف 4": "RAV4",
  "سيينا": "시에나",
  "es300h": "ES300h 7세대",
  "es350": "뉴 ES350",
  "nx300h": "NX300h",
  "nx350h": "NX350h 2세대",
  "nx450h": "NX450h+ 2세대",
  "rx450h": "RX450h 4세대",
  "is250": "IS250",
  "is300h": "IS300h",
  "ls500h": "LS500h 5세대",
  "ls460": "LS460",
  "ux250h": "UX250h",
  "ct200h": "CT200h",
  "لكزس": "ES300h 7세대",
};

const TRANSMISSION_TO_EN: Record<string, string> = {
  "오토": "auto",
  "수동": "manual",
  "CVT": "auto",
  "DCT": "auto",
};

const COLOR_MAP: Record<string, { ar: string; en: string }> = {
  "흰색":   { ar: "أبيض",    en: "white" },
  "검정색": { ar: "أسود",    en: "black" },
  "쥐색":   { ar: "رمادي",   en: "gray" },
  "은색":   { ar: "فضي",     en: "silver" },
  "빨간색": { ar: "أحمر",    en: "red" },
  "하늘색": { ar: "أزرق فاتح", en: "lightblue" },
  "갈색":   { ar: "بني",     en: "brown" },
  "녹색":   { ar: "أخضر",    en: "green" },
  "노란색": { ar: "أصفر",    en: "yellow" },
  "주황색": { ar: "برتقالي", en: "orange" },
  "연두색": { ar: "أخضر فاتح", en: "lime" },
};

const EN_COLOR_TO_KR: Record<string, string> = {
  "white":     "흰색",
  "black":     "검정색",
  "gray":      "쥐색",
  "grey":      "쥐색",
  "silver":    "은색",
  "red":       "빨간색",
  "lightblue": "하늘색",
  "blue":      "하늘색",
  "brown":     "갈색",
  "green":     "녹색",
  "yellow":    "노란색",
  "orange":    "주황색",
  "lime":      "연두색",
};

function formatPrice(price: number): string {
  const sar = Math.round(price * 27.4);
  return `${price.toLocaleString()}만원 (~${sar.toLocaleString()}﷼)`;
}

function buildEncarQuery(params: {
  brand?: string;
  model?: string;
  sunroof?: boolean;
  fuelType?: string;
  transmission?: string;
  bodyType?: string;
  color?: string;
}): { q: string; modelKr: string | null; modelRaw: string | null } {
  let modelKr: string | null = null;
  let modelRaw: string | null = null;

  let carType = "";
  if (params.brand && params.brand !== "any") {
    const key = params.brand.toLowerCase();
    carType = DOMESTIC_BRANDS.has(key) ? "_.CarType.Y." : "_.CarType.N.";
  }

  let q = `(And.Hidden.N.${carType}`;

  if (params.brand && params.brand !== "any") {
    const kr = EN_TO_MANUFACTURER[params.brand.toLowerCase()];
    if (kr) q += `_.Manufacturer.${kr}.`;
  }

  if (params.model) {
    const input = params.model.trim();
    const isKorean = /[\uAC00-\uD7A3]/.test(input);
    if (isKorean) {
      q += `_.Model.${input}.`;
      modelKr = input;
    } else {
      const translated = EN_MODEL_TO_KR[input.toLowerCase()];
      if (translated) {
        q += `_.Model.${translated}.`;
        modelKr = translated;
      } else {
        modelRaw = input;
      }
    }
  }

  if (params.sunroof === true) q += "_.Options.선루프.";
  if (params.fuelType && params.fuelType !== "any") {
    const kr = EN_TO_FUEL_KR[params.fuelType];
    if (kr) q += `_.FuelType.${kr}.`;
  }
  if (params.transmission && params.transmission !== "any") {
    const kr = EN_TO_TRANSMISSION_KR[params.transmission];
    if (kr) q += `_.Transmission.${kr}.`;
  }
  if (params.bodyType && params.bodyType !== "any" && params.bodyType === "suv") {
    q += "_.Category.RV.";
  }
  if (params.color && params.color !== "any") {
    const kr = EN_COLOR_TO_KR[params.color.toLowerCase()];
    if (kr) q += `_.Color.${kr}.`;
  }

  q += ")";
  return { q, modelKr, modelRaw };
}

interface EncarCar {
  Id: string;
  Manufacturer: string;
  Model: string;
  Badge?: string;
  GreenType: string;
  FuelType: string;
  Transmission?: string;
  FormYear: string;
  Mileage: number;
  Price: number;
  Color?: string;
  Condition?: string[];
  Trust?: string[];
  ServiceMark?: string[];
  BuyType?: string[];
  HomeServiceVerification?: string;
  OfficeCityState?: string;
  Photos?: Array<{ location: string; ordering: number }>;
  Year?: number;
  Options?: string[];
}

const HARDWARE_OPTIONS: Array<{ keywords: string[]; id: string; ar: string }> = [
  { keywords: ["파노라마", "파노라믹", "파노라믹선루프"], id: "sunroof_pano", ar: "سقف بانورامي" },
  { keywords: ["선루프", "썬루프", "sunroof"], id: "sunroof", ar: "فتحة سقف" },
  { keywords: ["네비게이션", "내비게이션", "내비", "네비", "navi", "네비+"], id: "navigation", ar: "ملاحة" },
  { keywords: ["후방카메라", "후방 카메라", "후카", "후방cam", "리어카메라"], id: "camera_rear", ar: "كاميرا خلفية" },
  { keywords: ["360", "서라운드뷰", "어라운드뷰", "전방카메라"], id: "camera_360", ar: "كاميرا 360°" },
  { keywords: ["열선시트", "열선 시트", "열선"], id: "heated_seat", ar: "مقاعد مدفأة" },
  { keywords: ["통풍시트", "통풍 시트", "쿨링시트", "통풍"], id: "ventilated_seat", ar: "مقاعد مهوّاة" },
  { keywords: ["스마트키", "스마트 키", "스마트키리스"], id: "smart_key", ar: "مفتاح ذكي" },
  { keywords: ["가죽시트", "나파", "퀼팅시트", "천연가죽", "인조가죽"], id: "leather_seat", ar: "مقاعد جلدية" },
  { keywords: ["오토에어컨", "듀얼에어컨", "풀오토에어컨", "풀오토 에어", "tri-zone", "trizone"], id: "auto_ac", ar: "مكيّف تلقائي" },
  { keywords: ["파킹센서", "후방센서", "전방센서", "주차보조", "pdc", "주차센서", "upa"], id: "parking_sensor", ar: "حساسات وقوف" },
  { keywords: ["led헤드", "led 헤드", "풀led", "풀 led", "헤드램프 led", "레이저헤드", "매트릭스led"], id: "led_lights", ar: "مصابيح LED" },
  { keywords: ["어댑티브크루즈", "어댑티브 크루즈", "스마트크루즈", "acc", "scc"], id: "cruise_control", ar: "كروز تكيّفي" },
  { keywords: ["차선이탈", "차선 이탈", "레인킵", "lka", "lda"], id: "lane_assist", ar: "مساعد الحارة" },
  { keywords: ["사각지대", "bsd", "bcw", "후측방경보"], id: "blind_spot", ar: "كشف النقطة العمياء" },
  { keywords: ["헤드업", "hud", "헤드업 디스플레이"], id: "hud", ar: "HUD" },
  { keywords: ["전동시트", "파워시트", "전동 시트"], id: "power_seat", ar: "مقاعد كهربائية" },
  { keywords: ["메모리시트", "메모리 시트"], id: "memory_seat", ar: "مقاعد بذاكرة" },
  { keywords: ["4wd", "awd", "사륜", "4륜", "htrac", "xdrive", "quattro", "4motion"], id: "awd", ar: "دفع رباعي" },
  { keywords: ["하이브리드", "hybrid", "hev"], id: "hybrid", ar: "هجين" },
  { keywords: ["전기차", "전기", "electric", "ev6", "ev3", "ev9", "ioniq", "아이오닉"], id: "electric", ar: "كهربائي" },
  { keywords: ["플러그인", "phev", "plug-in", "플러그"], id: "phev", ar: "هجين قابل للشحن" },
];

const KOREAN_DOMESTIC_BRANDS = new Set([
  "현대", "기아", "제네시스", "쌍용", "르노삼성", "한국GM", "쉐보레", "대우",
  "hyundai", "kia", "genesis", "ssangyong",
]);

function getModelYear(car: EncarCar): number {
  if (!car.Year) return 0;
  return Math.floor(car.Year / 100);
}

function getKoreanBaselineOptions(brand: string, year: number): Array<{ id: string; ar: string }> {
  const b = brand.toLowerCase();
  const isKorean = [...KOREAN_DOMESTIC_BRANDS].some((k) => b.includes(k));
  if (!isKorean || year < 2014) return [];

  const opts: Array<{ id: string; ar: string }> = [];
  if (year >= 2014) opts.push({ id: "navigation", ar: "ملاحة" });
  if (year >= 2016) opts.push({ id: "smart_key", ar: "مفتاح ذكي" });
  if (year >= 2017) opts.push({ id: "heated_seat", ar: "مقاعد مدفأة" });
  if (year >= 2018) opts.push({ id: "camera_rear", ar: "كاميرا خلفية" });
  if (year >= 2019) opts.push({ id: "auto_ac", ar: "مكيّف تلقائي" });
  if (year >= 2020) opts.push({ id: "parking_sensor", ar: "حساسات وقوف" });
  if (year >= 2021) opts.push({ id: "led_lights", ar: "مصابيح LED" });
  return opts;
}

const TOP_TRIM_KEYWORDS = [
  "칼리그라피", "인스퍼레이션", "익스클루시브", "풀옵션", "최고급", "플래티넘",
  "시그니처", "그래비티", "마스터즈", "prestige", "프레스티지",
];

const PREMIUM_KEYWORDS = [
  "럭셔리", "프리미엄", "어드밴스드", "모던", "리미티드",
  "파인스펙", "스마트", "트렌디", "디럭스플러스",
];

const BADGE_FEATURE_MAP: Array<{ keywords: string[]; ar: string }> = [
  { keywords: ["m 스포츠", "m스포츠", "m sport", "m-sport"], ar: "حزمة M الرياضية" },
  { keywords: ["럭셔리", "프리미엄", "익스클루시브", "풀옵션", "최고급", "플래티넘", "칼리그라피", "어드밴스드", "인스퍼레이션"], ar: "فئة مميزة" },
];

const CONDITION_FEATURE_MAP: Record<string, string> = {
  Record: "سجل الصيانة",
  Resume: "تاريخ السيارة",
};

const TRUST_FEATURE_MAP: Record<string, string> = {
  HomeService: "توصيل للمنزل",
};

const SERVICE_MARK_MAP: Record<string, string> = {
  EncarDiagnosisP1: "تشخيص Encar",
  EncarDiagnosisP2: "تشخيص Encar",
  EncarMeetgo: "Encar Meetgo",
};

const ENCAR_OPTION_MAP: Record<string, { id: string; ar: string }> = {
  "선루프": { id: "sunroof", ar: "فتحة سقف" },
  "파노라마선루프": { id: "sunroof_pano", ar: "سقف بانورامي" },
  "열선시트": { id: "heated_seat", ar: "مقاعد مدفأة" },
  "통풍시트": { id: "ventilated_seat", ar: "مقاعد مهوّاة" },
  "가죽시트": { id: "leather_seat", ar: "مقاعد جلدية" },
  "전동시트": { id: "power_seat", ar: "مقاعد كهربائية" },
  "메모리시트": { id: "memory_seat", ar: "مقاعد بذاكرة" },
  "네비게이션": { id: "navigation", ar: "ملاحة" },
  "후방카메라": { id: "camera_rear", ar: "كاميرا خلفية" },
  "어라운드뷰": { id: "camera_360", ar: "كاميرا 360°" },
  "스마트키": { id: "smart_key", ar: "مفتاح ذكي" },
  "오토에어컨": { id: "auto_ac", ar: "مكيّف تلقائي" },
  "주차보조": { id: "parking_sensor", ar: "حساسات وقوف" },
  "LED헤드램프": { id: "led_lights", ar: "مصابيح LED" },
  "어댑티브크루즈": { id: "cruise_control", ar: "كروز تكيّفي" },
  "차선이탈방지": { id: "lane_assist", ar: "مساعد الحارة" },
  "사각지대감지": { id: "blind_spot", ar: "كشف النقطة العمياء" },
  "헤드업디스플레이": { id: "hud", ar: "HUD" },
  "4WD": { id: "awd", ar: "دفع رباعي" },
};

function extractOptionsFromEncarOptions(options: string[]): Array<{ id: string; ar: string }> {
  const result: Array<{ id: string; ar: string }> = [];
  const seen = new Set<string>();
  for (const opt of options) {
    const mapped = ENCAR_OPTION_MAP[opt];
    if (mapped && !seen.has(mapped.id)) {
      seen.add(mapped.id);
      result.push(mapped);
    }
  }
  return result;
}

function extractOptions(car: EncarCar): Array<{ id: string; ar: string }> {
  if (car.Options && car.Options.length > 0) {
    const fromOptions = extractOptionsFromEncarOptions(car.Options);
    if (fromOptions.length > 0) return fromOptions;
  }

  const text = `${car.Model ?? ""} ${car.Badge ?? ""}`.toLowerCase();
  const result: Array<{ id: string; ar: string }> = [];
  const seen = new Set<string>();
  const add = (o: { id: string; ar: string }) => { if (!seen.has(o.id)) { seen.add(o.id); result.push(o); } };

  const isTopTrim = TOP_TRIM_KEYWORDS.some((kw) => text.includes(kw.toLowerCase()));
  const isPremiumTrim = PREMIUM_KEYWORDS.some((kw) => text.includes(kw.toLowerCase()));

  const priorityOrder = ["phev", "electric", "hybrid"];
  const sorted = [...HARDWARE_OPTIONS].sort((a, b) => {
    const ai = priorityOrder.indexOf(a.id);
    const bi = priorityOrder.indexOf(b.id);
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
  });
  for (const opt of sorted) {
    if (opt.keywords.some((kw) => text.includes(kw.toLowerCase()))) {
      if (opt.id === "hybrid" && seen.has("phev")) continue;
      add(opt);
    }
  }

  const year = getModelYear(car);
  const brand = car.Manufacturer ?? "";
  for (const o of getKoreanBaselineOptions(brand, year)) add(o);

  if (isTopTrim) {
    for (const o of [
      { id: "leather_seat", ar: "مقاعد جلدية" },
      { id: "ventilated_seat", ar: "مقاعد مهوّاة" },
      { id: "power_seat", ar: "مقاعد كهربائية" },
      { id: "navigation", ar: "ملاحة" },
      { id: "smart_key", ar: "مفتاح ذكي" },
      { id: "auto_ac", ar: "مكيّف تلقائي" },
      { id: "camera_rear", ar: "كاميرا خلفية" },
      { id: "parking_sensor", ar: "حساسات وقوف" },
      { id: "led_lights", ar: "مصابيح LED" },
      { id: "heated_seat", ar: "مقاعد مدفأة" },
    ]) add(o);
  } else if (isPremiumTrim) {
    for (const o of [
      { id: "leather_seat", ar: "مقاعد جلدية" },
      { id: "navigation", ar: "ملاحة" },
      { id: "smart_key", ar: "مفتاح ذكي" },
      { id: "auto_ac", ar: "مكيّف تلقائي" },
      { id: "camera_rear", ar: "كاميرا خلفية" },
      { id: "heated_seat", ar: "مقاعد مدفأة" },
    ]) add(o);
  }

  return result;
}

function extractFeatures(car: EncarCar): string[] {
  const features: string[] = [];
  const seen = new Set<string>();
  const add = (label: string) => { if (!seen.has(label)) { seen.add(label); features.push(label); } };

  const text = `${car.Model ?? ""} ${car.Badge ?? ""}`.toLowerCase();
  for (const { keywords, ar } of BADGE_FEATURE_MAP) {
    if (keywords.some((kw) => text.includes(kw.toLowerCase()))) add(ar);
  }

  for (const c of car.Condition ?? []) {
    const label = CONDITION_FEATURE_MAP[c];
    if (label) add(label);
  }

  for (const t of car.Trust ?? []) {
    const label = TRUST_FEATURE_MAP[t];
    if (label) add(label);
  }

  for (const sm of car.ServiceMark ?? []) {
    const label = SERVICE_MARK_MAP[sm];
    if (label) { add(label); break; }
  }

  const fuel = FUEL_TO_EN[car.FuelType ?? ""] ?? "";
  const fuelAr: Record<string, string> = {
    gasoline: "بنزين", diesel: "ديزل", hybrid: "هايبرد",
    electric: "كهربائي", hydrogen: "هيدروجين", lpg: "غاز LPG",
  };
  if (fuelAr[fuel]) add(fuelAr[fuel]);

  const trans = TRANSMISSION_TO_EN[car.Transmission ?? ""] ?? "";
  if (trans === "auto") add("أوتوماتيك");
  else if (trans === "manual") add("يدوي");

  const condition2 = car.Condition ?? [];
  const inspected = condition2.includes("Inspection") || condition2.includes("InspectionDirect");
  if (inspected) add("فحص معتمد");

  const year = parseInt(car.FormYear ?? "0", 10);
  if (year >= 2023) add("موديل حديث");
  else if (year >= 2020) add("موديل جيد");

  if ((car.Mileage ?? 0) < 50000) add("ممشى منخفض");

  return features;
}

interface EncarResponse {
  Count: number;
  SearchResults: EncarCar[];
}

function mapEncarCar(car: EncarCar) {
  const sortedPhotos = (car.Photos ?? []).sort((a, b) => a.ordering - b.ordering);
  const firstPhoto = sortedPhotos[0];
  const imageUrl = firstPhoto ? `${ENCAR_PHOTO}${firstPhoto.location}` : "";

  const brandEn = MANUFACTURER_TO_EN[car.Manufacturer] ?? car.Manufacturer;
  const fuelEn = FUEL_TO_EN[car.FuelType] ?? "gasoline";
  const transmissionEn = TRANSMISSION_TO_EN[car.Transmission ?? ""] ?? "auto";
  const year = parseInt(car.FormYear, 10) || 0;
  const price = Math.round(car.Price);
  const model = car.Badge ? `${car.Model} ${car.Badge}` : car.Model;

  const colorKr = car.Color ?? "";
  const colorInfo = COLOR_MAP[colorKr];
  const colorEn = colorInfo?.en ?? colorKr;
  const colorAr = colorInfo?.ar;

  const condition = car.Condition ?? [];
  const inspected = condition.includes("Inspection") || condition.includes("InspectionDirect");

  const features = extractFeatures(car);
  const options = extractOptions(car);

  const badgeText = `${car.Model ?? ""} ${car.Badge ?? ""}`.toLowerCase();
  const hasSunroof = ["선루프", "썬루프", "파노라마", "파노라믹", "파노"].some((kw) => badgeText.includes(kw));

  return {
    id: car.Id,
    brand: brandEn,
    model,
    year,
    price,
    priceFormatted: formatPrice(price),
    mileage: Math.round(car.Mileage),
    fuelType: fuelEn,
    transmission: transmissionEn,
    bodyType: "sedan",
    color: colorEn,
    colorAr,
    sunroof: hasSunroof,
    inspected,
    imageUrl,
    thumbnailUrl: imageUrl,
    description: `${brandEn} ${car.Model} ${car.FormYear}`,
    features,
    options,
    source: "Encar",
    sourceUrl: `${ENCAR_DETAIL}${car.Id}`,
    location: car.OfficeCityState ?? "كوريا",
  };
}

router.get("/brands", (_req, res) => {
  res.json({
    brands: [
      "Hyundai", "Kia", "Genesis", "SsangYong", "KG Mobility",
      "Renault Samsung", "Renault Korea", "Chevrolet",
      "BMW", "Mercedes-Benz", "Audi", "Volkswagen", "Volvo",
      "Toyota", "Lexus", "Honda", "Nissan", "Infiniti",
      "Porsche", "Land Rover", "MINI", "Ford", "Jeep",
      "Lincoln", "Cadillac", "Maserati",
    ],
  });
});

router.get("/search", async (req, res) => {
  const parsed = SearchCarsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: "invalid_params", message: "Invalid query parameters" });
    return;
  }

  const {
    query, model, brand, yearFrom, yearTo, sunroof, transmission,
    fuelType, bodyType, color, priceMin, priceMax, mileageMax,
    page = 1, limit = 20,
  } = parsed.data;

  try {
    const { q: encarQ, modelRaw } = buildEncarQuery({ brand, model, sunroof, fuelType, transmission, bodyType, color });
    const offset = (page - 1) * limit * 5;
    const fetchLimit = limit * 5;
    const url = new URL(`${ENCAR_API}/search/car/list/general`);
    url.searchParams.set("count", "true");
    url.searchParams.set("q", encarQ);
    url.searchParams.set("sr", `|ModifiedDate|${offset}|${fetchLimit}`);

    const resp = await fetch(url.toString(), {
      headers: {
        Referer: "https://www.encar.com",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36",
        Accept: "application/json, text/plain, */*",
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!resp.ok) throw new Error(`Encar HTTP ${resp.status}`);

    const data = (await resp.json()) as EncarResponse;
    let cars = data.SearchResults.map(mapEncarCar);

    // Remove duplicates by ID
    const seenIds = new Set<string>();
    cars = cars.filter(c => {
      if (seenIds.has(c.id)) return false;
      seenIds.add(c.id);
      return true;
    });

    cars.forEach((c) => carCache.set(c.id, c));

    if (modelRaw) {
      const needle = modelRaw.toLowerCase();
      cars = cars.filter((c) => c.model.toLowerCase().includes(needle));
    }
    if (yearFrom !== undefined) cars = cars.filter((c) => c.year >= yearFrom);
    if (yearTo !== undefined) cars = cars.filter((c) => c.year <= yearTo);
    if (priceMin !== undefined) cars = cars.filter((c) => c.price >= priceMin);
    if (priceMax !== undefined) cars = cars.filter((c) => c.price <= priceMax);
    if (mileageMax !== undefined) cars = cars.filter((c) => c.mileage <= mileageMax);

    const total = data.Count;
    const totalPages = Math.ceil(total / limit);
    const paginated = cars.slice(0, limit);

    res.json({ cars: paginated, total, page, limit, totalPages });
  } catch (err) {
    req.log.error({ err }, "Encar API error");
    res.status(502).json({
      error: "upstream_error",
      message: "تعذر الاتصال بموقع Encar. يرجى المحاولة مرة أخرى.",
    });
  }
});

router.get("/:id", async (req, res): Promise<void> => {
  const { id } = req.params;

  try {
    const url = `https://api.encar.com/search/car/view/general/${id}`;
    const resp = await fetch(url, {
      headers: {
        Referer: "https://www.encar.com",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36",
        Accept: "application/json, text/plain, */*",
      },
      signal: AbortSignal.timeout(10000),
    });

    if (resp.ok) {
      const data = await resp.json() as EncarCar;
      const car = mapEncarCar(data);
      carCache.set(car.id, car);
      res.json(car); return;
    }
  } catch (err) {
    req.log.warn({ err }, "Failed to fetch car details from Encar, falling back to cache");
  }

  const cached = carCache.get(id);
  if (cached) { res.json(cached); return; }

  res.status(404).json({
    error: "not_found",
    message: "Car not found. Please search first and click a result.",
  });
});

export default router;