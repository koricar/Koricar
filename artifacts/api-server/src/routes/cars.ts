import { Router, type IRouter } from "express";

const router: IRouter = Router();

const carCache = new Map<string, any>();
const ENCAR_API = "https://api.encar.com";
const ENCAR_PHOTO = "https://ci.encar.com";
const ENCAR_DETAIL = "https://www.encar.com/dc/dc_cardetailview.do?carid=";

/* ────────────────────────────
   Translation Maps (مختصرة)
   ──────────────────────────── */

const MANUFACTURER_TO_EN: Record<string, string> = {
  "현대": "Hyundai", "기아": "Kia", "제네시스": "Genesis",
  "쌍용": "SsangYong", "KG모빌리티": "KG Mobility",
  "르노삼성": "Renault Samsung", "르노코리아": "Renault Korea",
  "쉐보레": "Chevrolet", "쉐보레(GM대우)": "Chevrolet",
  "대우": "Daewoo", "GM대우": "Daewoo", "한국GM": "Daewoo",
  "BMW": "BMW", "벤츠": "Mercedes-Benz", "아우디": "Audi",
  "폭스바겐": "Volkswagen", "볼보": "Volvo",
  "도요타": "Toyota", "혼다": "Honda", "닛산": "Nissan",
  "렉서스": "Lexus", "포르쉐": "Porsche",
  "랜드로버": "Land Rover", "재규어": "Jaguar",
  "미니": "MINI", "포드": "Ford", "지프": "Jeep",
  "링컨": "Lincoln", "캐딜락": "Cadillac",
  "인피니티": "Infiniti", "마세라티": "Maserati",
  "페라리": "Ferrari", "람보르기니": "Lamborghini",
  "테슬라": "Tesla", "마쯔다": "Mazda", "스바루": "Subaru",
  "알파로메오": "Alfa Romeo", "미쯔비시": "Mitsubishi",
  "크라이슬러": "Chrysler", "푸조": "Peugeot",
  "시트로엥": "Citroen", "벤틀리": "Bentley",
  "롤스로이스": "Rolls-Royce", "맥라렌": "McLaren",
  "애스턴마틴": "Aston Martin", "GMC": "GMC",
  "닷지": "Dodge", "다이하쯔": "Daihatsu",
  "폴스타": "Polestar", "피아트": "Fiat",
  "험머": "Hummer", "사브": "Saab",
  "이네오스": "Ineos", "로터스": "Lotus",
  "BYD": "BYD", "비와이디": "BYD", "마이바흐": "Maybach",
};

const EN_TO_MANUFACTURER: Record<string, string> = {
  "hyundai": "현대", "kia": "기아", "genesis": "제네시스",
  "ssangyong": "쌍용", "kg mobility": "KG모빌리티",
  "renault samsung": "르노삼성", "renault korea": "르노코리아",
  "chevrolet": "쉐보레(GM대우)", "daewoo": "쉐보레(GM대우)",
  "bmw": "BMW", "mercedes": "벤츠", "mercedes-benz": "벤츠",
  "audi": "아우디", "volkswagen": "폭스바겐", "volvo": "볼보",
  "toyota": "도요타", "honda": "혼다", "lexus": "렉서스",
  "nissan": "닛산", "infiniti": "인피니티", "porsche": "포르쉐",
  "land rover": "랜드로버", "jaguar": "재규어", "mini": "미니",
  "ford": "포드", "jeep": "지프", "lincoln": "링컨",
  "cadillac": "캐딜락", "ferrari": "페라리",
  "lamborghini": "람보르기니", "maserati": "마세라티",
  "rolls-royce": "롤스로이스", "mclaren": "맥라렌",
  "tesla": "테슬라", "mazda": "마쯔다", "subaru": "스바루",
  "alfa romeo": "알파로메오", "mitsubishi": "미쯔비시",
  "chrysler": "크라이슬러", "peugeot": "푸조",
  "citroen": "시트로엥", "bentley": "벤틀리",
  "aston martin": "애스턴마틴", "gmc": "GMC", "dodge": "닷지",
  "daihatsu": "다이하쯔", "polestar": "폴스타", "fiat": "피아트",
  "hummer": "험머", "saab": "사브", "ineos": "이네오스",
  "lotus": "로터스", "byd": "BYD", "maybach": "마이바흐",
};

const DOMESTIC_BRANDS = new Set([
  "hyundai", "kia", "genesis", "ssangyong", "kg mobility",
  "renault samsung", "renault korea", "chevrolet",
  "daewoo", "gm daewoo",
]);

const FUEL_TO_EN: Record<string, string> = {
  "가솔린": "gasoline", "디젤": "diesel", "LPG": "lpg",
  "전기": "electric", "수소": "hydrogen",
  "가솔린+전기": "hybrid", "디젤+전기": "hybrid",
  "플러그인하이브리드": "hybrid", "가솔린+LPG": "lpg",
};

const EN_TO_FUEL_KR: Record<string, string> = {
  "gasoline": "가솔린", "diesel": "디젤",
  "lpg": "LPG(일반인 구입_)", "electric": "전기", "hybrid": "가솔린+전기",
};

const EN_TO_TRANSMISSION_KR: Record<string, string> = {
  "auto": "오토", "manual": "수동",
};

const TRANSMISSION_TO_EN: Record<string, string> = {
  "오토": "auto", "수동": "manual", "CVT": "auto", "DCT": "auto",
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
  "white": "흰색", "black": "검정색", "gray": "쥐색", "grey": "쥐색",
  "silver": "은색", "red": "빨간색", "lightblue": "하늘색", "blue": "하늘색",
  "brown": "갈색", "green": "녹색", "yellow": "노란색",
  "orange": "주황색", "lime": "연두색",
};

const BODY_TYPE_KR_TO_AR: Record<string, string> = {
  "suv": "دفع رباعي (SUV)",
  "경차": "سيارة صغيرة جدًا",
  "소형차": "سيارة صغيرة",
  "준중형차": "سيارة مدمجة",
  "중형차": "سيارة متوسطة",
  "대형차": "سيارة كبيرة",
  "스포츠카": "سيارة رياضية",
  "승합차": "فان / حافلة صغيرة",
  "화물차": "شاحنة / نقل",
  "제네시스": "جينيسيس",
};

const ENCAR_OPTION_CODE_MAP: Record<string, string> = {
  "001": "ABS", "004": "ESC (نظام التحكم بالثبات)",
  "005": "TCS (نظام منع الانزلاق)", "006": "HAC (مساعد الانطلاق على المرتفعات)",
  "007": "TPMS (مراقبة ضغط الإطارات)", "008": "فرملة طوارئ أوتوماتيكية",
  "010": "وسادة هوائية للسائق", "014": "وسادة هوائية للراكب",
  "015": "وسائد هوائية جانبية", "017": "وسائد هوائية ستارية",
  "019": "تحذير مغادرة المسار", "020": "مساعد الحفاظ على المسار",
  "021": "كشف النقطة العمياء", "022": "تحذير النقطة العمياء الخلفية",
  "023": "منع الاصطدام الأمامي", "024": "كاميرا خلفية",
  "026": "مثبت سرعة", "027": "كروز تكيّفي / ذكي",
  "030": "مفتاح ذكي", "031": "تشغيل بالزر", "032": "دخول بدون مفتاح",
  "033": "مقاعد كهربائية", "034": "مقاعد مدفأة", "035": "مقاعد مهوّاة",
  "051": "مكيّف هواء أوتوماتيكي",
  "055": "مرايا جانبية كهربائية قابلة للطي", "056": "نوافذ كهربائية",
  "057": "إضاءة أوتوماتيكية", "058": "بلوتوث", "059": "نظام ملاحة",
  "062": "مصابيح أمامية LED", "063": "مصابيح خلفية LED",
  "072": "حساسات ركن", "075": "كاميرا 360°", "077": "فتحة سقف",
  "078": "سقف بانورامي", "079": "دفع رباعي",
  "081": "مقاعد جلدية", "082": "مقعد بذاكرة",
  "083": "عجلة قيادة مدفأة", "084": "عجلة قيادة مهواة",
  "085": "شنطة كهربائية", "086": "فتح الشنطة بالقدم",
  "087": "قضبان سقف", "088": "تظليل زجاج",
  "092": "Apple CarPlay", "093": "Android Auto",
  "094": "شاحن لاسلكي", "095": "نظام دفع رسوم المرور",
  "096": "مشغل أقراص CD", "097": "منفذ USB/AUX",
};

/* ────────────────────────────
   Helpers
   ──────────────────────────── */

function formatPrice(price: number): string {
  const sar = Math.round(price * 27.4);
  return `${price.toLocaleString()}만원 (~${sar.toLocaleString()}﷼)`;
}

function getProxyUrl(url: string): string {
  return `https://wsrv.nl/?url=${encodeURIComponent(url)}&af`;
}

function getModelYear(car: any): number {
  if (!car.Year) return 0;
  return Math.floor(car.Year / 100);
}

function extractOptionsFromEncarOptions(options: string[]): Array<{ id: string; ar: string }> {
  const result: Array<{ id: string; ar: string }> = [];
  const seen = new Set<string>();
  for (const code of options) {
    const name = ENCAR_OPTION_CODE_MAP[code];
    if (name && !seen.has(code)) {
      seen.add(code);
      result.push({ id: code, ar: name });
    }
  }
  return result;
}

function extractOptions(car: any): Array<{ id: string; ar: string }> {
  if (car.Options && car.Options.length > 0) {
    const fromOptions = extractOptionsFromEncarOptions(car.Options);
    if (fromOptions.length > 0) return fromOptions;
  }
  const text = `${car.Model ?? ""} ${car.Badge ?? ""}`.toLowerCase();
  const result: Array<{ id: string; ar: string }> = [];
  const seen = new Set<string>();
  const add = (o: { id: string; ar: string }) => {
    if (!seen.has(o.id)) { seen.add(o.id); result.push(o); }
  };

  const TOP_TRIM_KEYWORDS = [
    "칼리그라피", "인스퍼레이션", "익스클루시브", "풀옵션", "최고급", "플래티넘",
    "시그니처", "그래비티", "마스터즈", "prestige", "프레스티지",
  ];

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
    { keywords: ["오토에어컨", "듀얼에어컨", "풀오토에어컨", "풀오토 에어"], id: "auto_ac", ar: "مكيّف تلقائي" },
    { keywords: ["파킹센서", "후방센서", "전방센서", "주차보조", "pdc", "주차센서"], id: "parking_sensor", ar: "حساسات وقوف" },
    { keywords: ["led헤드", "led 헤드", "풀led", "풀 led", "헤드램프 led", "매트릭스led"], id: "led_lights", ar: "مصابيح LED" },
    { keywords: ["어댑티브크루즈", "어댑티브 크루즈", "스마트크루즈", "acc", "scc"], id: "cruise_control", ar: "كروز تكيّفي" },
    { keywords: ["차선이탈", "차선 이탈", "레인킵", "lka", "lda"], id: "lane_assist", ar: "مساعد الحارة" },
    { keywords: ["사각지대", "bsd", "bcw", "후측방경보"], id: "blind_spot", ar: "كشف النقطة العمياء" },
    { keywords: ["헤드업", "hud", "헤드업 디스플레이"], id: "hud", ar: "HUD" },
    { keywords: ["전동시트", "파워시트", "전동 시트"], id: "power_seat", ar: "مقاعد كهربائية" },
    { keywords: ["메모리시트", "메모리 시트"], id: "memory_seat", ar: "مقاعد بذاكرة" },
    { keywords: ["4wd", "awd", "사륜", "4륜", "htrac", "xdrive", "quattro", "4motion"], id: "awd", ar: "دفع رباعي" },
    { keywords: ["하이브리드", "hybrid", "hev"], id: "hybrid", ar: "هجين" },
    { keywords: ["전기차", "전기", "electric", "ev6", "ev3", "ev9", "ioniq", "아이오닉", "모델"], id: "electric", ar: "كهربائي" },
    { keywords: ["플러그인", "phev", "plug-in", "플러그"], id: "phev", ar: "هجين قابل للشحن" },
  ];

  const isTopTrim = TOP_TRIM_KEYWORDS.some((kw) => text.includes(kw.toLowerCase()));
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
  const KOREAN_DOMESTIC_BRANDS = new Set(["현대", "기아", "제네시스", "쌍용", "르노삼성", "한국GM", "쉐보레", "쉐보레(GM대우)", "대우", "hyundai", "kia", "genesis", "ssangyong"]);
  const isKorean = [...KOREAN_DOMESTIC_BRANDS].some((k) => brand.toLowerCase().includes(k.toLowerCase()));

  if (isKorean && year >= 2014) {
    if (year >= 2014) add({ id: "navigation", ar: "ملاحة" });
    if (year >= 2016) add({ id: "smart_key", ar: "مفتاح ذكي" });
    if (year >= 2017) add({ id: "heated_seat", ar: "مقاعد مدفأة" });
    if (year >= 2018) add({ id: "camera_rear", ar: "كاميرا خلفية" });
    if (year >= 2019) add({ id: "auto_ac", ar: "مكيّف تلقائي" });
    if (year >= 2020) add({ id: "parking_sensor", ar: "حساسات وقوف" });
    if (year >= 2021) add({ id: "led_lights", ar: "مصابيح LED" });
  }

  if (isTopTrim) {
    [
      { id: "leather_seat", ar: "مقاعد جلدية" }, { id: "ventilated_seat", ar: "مقاعد مهوّاة" },
      { id: "power_seat", ar: "مقاعد كهربائية" }, { id: "navigation", ar: "ملاحة" },
      { id: "smart_key", ar: "مفتاح ذكي" }, { id: "auto_ac", ar: "مكيّف تلقائي" },
      { id: "camera_rear", ar: "كاميرا خلفية" }, { id: "parking_sensor", ar: "حساسات وقوف" },
      { id: "led_lights", ar: "مصابيح LED" }, { id: "heated_seat", ar: "مقاعد مدفأة" },
    ].forEach(add);
  }

  return result;
}

function extractFeatures(car: any): string[] {
  const features: string[] = [];
  const seen = new Set<string>();
  const add = (label: string) => { if (!seen.has(label)) { seen.add(label); features.push(label); } };

  const text = `${car.Model ?? ""} ${car.Badge ?? ""}`.toLowerCase();
  const BADGE_FEATURE_MAP = [
    { keywords: ["m 스포츠", "m스포츠", "m sport", "m-sport"], ar: "حزمة M الرياضية" },
    { keywords: ["럭셔리", "프리미엄", "익스클루시브", "풀옵션", "최고급", "플래티넘", "칼리그라피", "어드밴스드", "인스퍼레이션"], ar: "فئة مميزة" },
  ];

  for (const { keywords, ar } of BADGE_FEATURE_MAP) {
    if (keywords.some((kw) => text.includes(kw.toLowerCase()))) add(ar);
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

  const condition = car.Condition ?? [];
  const inspected = condition.includes("Inspection") || condition.includes("InspectionDirect");
  if (inspected) add("فحص معتمد");

  const year = parseInt(car.FormYear ?? "0", 10);
  if (year >= 2023) add("موديل حديث");
  else if (year >= 2020) add("موديل جيد");

  if ((car.Mileage ?? 0) < 50000) add("ممشى منخفض");

  return features;
}

function mapEncarCar(car: any) {
  const sortedPhotos = (car.Photos ?? []).sort((a: any, b: any) => a.ordering - b.ordering);
  const images = sortedPhotos.map((photo: any) => getProxyUrl(`${ENCAR_PHOTO}${photo.location}`));
  const imageUrl = images[0] || "";

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
    images,
    description: `${brandEn} ${car.Model} ${car.FormYear}`,
    features,
    options,
    source: "Encar",
    sourceUrl: `${ENCAR_DETAIL}${car.Id}`,
    location: car.OfficeCityState ?? "كوريا",
  };
}

function mapEncarCarExtended(car: any) {
  const base = mapEncarCar(car);
  const bodyTypeRaw = (car.BodyType ?? "").trim();
  const bodyTypeAr = BODY_TYPE_KR_TO_AR[bodyTypeRaw.toLowerCase()] ?? BODY_TYPE_KR_TO_AR[bodyTypeRaw] ?? bodyTypeRaw;

  const choiceOptions = (car.ChoiceOptions ?? []).map((o: any) => ({
    id: o.optionCd,
    nameKr: o.optionName,
    price: o.price ?? null,
  }));

  return {
    ...base,
    bodyType: bodyTypeRaw || base.bodyType,
    bodyTypeAr,
    vin: car.Vin ?? null,
    seatCount: car.SeatCount ?? null,
    seatColor: car.SeatColor ?? null,
    displacement: car.Displacement ?? null,
    generation: car.Generation ?? null,
    choiceOptions,
  };
}

/* ────────────────────────────
   NEW: Smart Inspection Fetcher
   ──────────────────────────── */

interface InspectionResult {
  available: boolean;
  hasDamage: boolean;
  damageCount: number;
  parts: Array<{ name: string; grade: string; damaged: boolean; section: string }>;
  summary: string | null;
  images: string[];
  message: string;
  rawData?: any; // for debugging
}

interface InsuranceResult {
  available: boolean;
  totalAccidents: number;
  myAccidents: number;
  otherAccidents: number;
  ownerChanges: number;
  ownerChangeDates: string[];
  message: string;
  rawData?: any;
}

const INSPECTION_ENDPOINTS = [
  (id: string) => `https://api.encar.com/v1/readside/vehicles/car/${id}/inspection`,
  (id: string) => `https://api.encar.com/v1/readside/vehicle/${id}/inspection`,
  (id: string) => `https://api.encar.com/v1/readside/car/${id}/inspection`,
  (id: string) => `https://api.encar.com/v1/readside/vehicles/${id}/inspection`,
];

const INSURANCE_ENDPOINTS = [
  (id: string) => `https://api.encar.com/v1/readside/vehicles/car/${id}/insurance`,
  (id: string) => `https://api.encar.com/v1/readside/vehicle/${id}/insurance`,
  (id: string) => `https://api.encar.com/v1/readside/car/${id}/insurance`,
  (id: string) => `https://api.encar.com/v1/readside/vehicles/${id}/insurance`,
];

async function fetchWithFallback(
  endpoints: ((id: string) => string)[],
  carId: string,
  label: string,
  log: any
): Promise<{ data: any | null; endpointUsed: string | null }> {
  for (const buildUrl of endpoints) {
    const url = buildUrl(carId);
    try {
      const resp = await fetch(url, {
        headers: {
          Referer: `https://fem.encar.com/cars/detail/${carId}`,
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          Accept: "application/json",
        },
        signal: AbortSignal.timeout(6000),
      });

      if (!resp.ok) {
        log?.warn?.({ status: resp.status, url, carId }, `${label} endpoint non-ok`);
        continue;
      }

      const data = await resp.json();
      const hasData = data && typeof data === "object" && Object.keys(data).length > 0;

      if (hasData) {
        log?.info?.({ carId, url, keys: Object.keys(data) }, `${label} success`);
        return { data, endpointUsed: url };
      }
    } catch (e) {
      log?.warn?.({ carId, url, err: e }, `${label} fetch error`);
    }
  }

  log?.warn?.({ carId }, `${label} all endpoints failed`);
  return { data: null, endpointUsed: null };
}

function parseInspection(raw: any): InspectionResult {
  const result: InspectionResult = {
    available: false,
    hasDamage: false,
    damageCount: 0,
    parts: [],
    summary: null,
    images: [],
    message: "تقرير الفحص غير متوفر لهذه السيارة",
    rawData: raw,
  };

  if (!raw || typeof raw !== "object") return result;

  // Encar يرجع إما مباشرة أو داخل carCheckInfo
  const root = raw.carCheckInfo ?? raw;

  // جمع كل أنواع items الممكنة
  const items: any[] =
    root.checkItems ??
    root.inspectionItems ??
    root.items ??
    root.checkItemList ??
    [];

  if (!Array.isArray(items) || items.length === 0) {
    // ممكن يكون فيه summary بس
    if (root.summary || root.result || root.checkResult) {
      result.available = true;
      result.summary = root.summary ?? root.result ?? root.checkResult ?? null;
      result.message = "تقرير الفحص متوفر (بدون تفاصيل أجزاء)";
    }
    return result;
  }

  result.available = true;
  result.message = "تقرير الفحص متوفر";

  result.parts = items.map((item: any) => {
    const grade = item.grade ?? item.status ?? item.result ?? item.checkResult ?? "A";
    const isBad = ["D", "C", "E", "X", "F", "불량"].includes(String(grade).toUpperCase()) || item.damaged === true;
    return {
      name: item.itemName ?? item.name ?? item.partName ?? item.checkItemName ?? item.checkName ?? "جزء غير مسمى",
      grade: String(grade).toUpperCase(),
      damaged: isBad,
      section: item.section ?? item.category ?? item.partGroup ?? "عام",
    };
  });

  result.damageCount = result.parts.filter((p) => p.damaged).length;
  result.hasDamage = result.damageCount > 0;

  // صور الفحص
  const rawImages =
    raw.checkImages ??
    root.checkImages ??
    raw.images ??
    root.images ??
    [];

  result.images = rawImages
    .map((img: any) => {
      const loc = img.location ?? img.path ?? img.url ?? img.imageUrl ?? "";
      if (!loc) return null;
      return loc.startsWith("http") ? loc : `https://ci.encar.com${loc}`;
    })
    .filter(Boolean) as string[];

  result.summary = root.summary ?? root.result ?? root.checkResult ?? raw.summary ?? null;

  return result;
}

function parseInsurance(raw: any): InsuranceResult {
  const result: InsuranceResult = {
    available: false,
    totalAccidents: 0,
    myAccidents: 0,
    otherAccidents: 0,
    ownerChanges: 0,
    ownerChangeDates: [],
    message: "سجل التأمين غير متوفر لهذه السيارة",
    rawData: raw,
  };

  if (!raw || typeof raw !== "object") return result;

  // جرب كل الحقول الممكنة
  const total =
    raw.accidentCount ??
    raw.totalAccidents ??
    raw.accidentTotalCount ??
    0;

  const my =
    raw.myAccidentCount ??
    raw.myAccidents ??
    raw.ownerAccidentCount ??
    0;

  const other =
    raw.otherAccidentCount ??
    raw.otherAccidents ??
    raw.thirdPartyAccidentCount ??
    0;

  const changes =
    raw.ownerChangeCount ??
    raw.ownerChanges ??
    raw.ownershipChangeCount ??
    0;

  const dates =
    raw.ownerChangeDateList ??
    raw.ownerChangeDates ??
    raw.ownershipChangeDates ??
    [];

  const hasAnyData = total > 0 || my > 0 || other > 0 || changes > 0 || dates.length > 0;

  if (hasAnyData || raw.accidentHistory || raw.ownershipHistory) {
    result.available = true;
    result.message = "سجل التأمين متوفر";
    result.totalAccidents = Number(total) || 0;
    result.myAccidents = Number(my) || 0;
    result.otherAccidents = Number(other) || 0;
    result.ownerChanges = Number(changes) || 0;
    result.ownerChangeDates = dates
      .map((d: any) => (typeof d === "string" ? d : d.date ?? d.changeDate ?? ""))
      .filter(Boolean);
  }

  return result;
}

async function fetchChoiceOptions(carId: string): Promise<any[]> {
  try {
    const url = `https://api.encar.com/v1/readside/vehicles/car/${carId}/options/choice`;
    const resp = await fetch(url, {
      headers: {
        Referer: `https://fem.encar.com/cars/detail/${carId}`,
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        Accept: "application/json",
      },
      signal: AbortSignal.timeout(5000),
    });
    if (!resp.ok) return [];
    const data = await resp.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

/* ────────────────────────────
   Routes
   ──────────────────────────── */

router.get("/brands", (_req, res) => {
  res.json({
    brands: [
      "Hyundai", "Kia", "Genesis", "SsangYong", "KG Mobility",
      "Renault Samsung", "Renault Korea", "Chevrolet", "Daewoo",
      "BMW", "Mercedes-Benz", "Audi", "Volkswagen", "Volvo",
      "Toyota", "Lexus", "Honda", "Nissan", "Infiniti",
      "Porsche", "Land Rover", "MINI", "Ford", "Jeep",
      "Lincoln", "Cadillac", "Maserati", "Ferrari", "Lamborghini",
      "Tesla", "Mazda", "Subaru", "Alfa Romeo", "Mitsubishi",
      "Chrysler", "Peugeot", "Citroen", "Bentley", "Rolls-Royce", "McLaren",
      "GMC", "Dodge", "Polestar", "Fiat", "Hummer", "Saab",
      "Lotus", "BYD", "Maybach",
    ],
  });
});

router.get("/:id", async (req, res): Promise<void> => {
  const { id } = req.params;

  try {
    const includeParams = [
      "CATEGORY", "SPEC", "PHOTOS", "CONTENTS", "ADVERTISEMENT",
      "MANAGE", "OPTIONS", "CONDITION", "PARTNERSHIP", "CONTACT",
    ].join(",");

    // ─── 1. جلب بيانات السيارة الأساسية ───
    const carUrl = `https://api.encar.com/v1/readside/vehicle/${id}?include=${includeParams}`;
    const carResp = await fetch(carUrl, {
      headers: {
        Referer: `https://fem.encar.com/cars/detail/${id}`,
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        Accept: "application/json",
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!carResp.ok) {
      res.status(502).json({ error: "upstream_error", message: "تعذر جلب بيانات السيارة." });
      return;
    }

    const raw = await carResp.json();
    const rawPhotos = Array.isArray(raw.photos) ? raw.photos : [];
    const spec = raw.spec ?? {};
    const category = raw.category ?? {};
    const advertisement = raw.advertisement ?? {};

    // ─── 2. جلب الفحص + التأمين + ChoiceOptions بالتوازي ───
    const [inspectionRaw, insuranceRaw, choiceOptions] = await Promise.all([
      fetchWithFallback(INSPECTION_ENDPOINTS, id, "inspection", req.log),
      fetchWithFallback(INSURANCE_ENDPOINTS, id, "insurance", req.log),
      fetchChoiceOptions(id),
    ]);

    // ─── 3. Parse النتائج ───
    const inspection = parseInspection(inspectionRaw.data);
    const insurance = parseInsurance(insuranceRaw.data);

    // ─── 4. Debug Logging ───
    req.log.info(
      {
        carId: id,
        inspectionAvailable: inspection.available,
        inspectionEndpoint: inspectionRaw.endpointUsed,
        inspectionKeys: inspectionRaw.data ? Object.keys(inspectionRaw.data) : null,
        insuranceAvailable: insurance.available,
        insuranceEndpoint: insuranceRaw.endpointUsed,
        insuranceKeys: insuranceRaw.data ? Object.keys(insuranceRaw.data) : null,
        choiceOptionsCount: choiceOptions.length,
      },
      "detail fetch complete"
    );

    // ─── 5. بناء كائن السيارة ───
    const encarCarLike = {
      Id: String(raw.vehicleId ?? id),
      Manufacturer: category.manufacturerName ?? "",
      Model: category.modelName ?? "",
      Badge: category.gradeName ?? category.gradeDetailName ?? "",
      GreenType: "",
      FuelType: spec.fuelName ?? "",
      Transmission: spec.transmissionName ?? "",
      FormYear: String(category.formYear ?? category.yearMonth ?? ""),
      Mileage: Number(spec.mileage ?? 0),
      Price: Number(advertisement.price ?? 0),
      Color: spec.colorName ?? "",
      Condition: [],
      Trust: [],
      ServiceMark: [],
      BuyType: [],
      OfficeCityState: advertisement.city ?? "",
      Photos: rawPhotos.map((p: any, i: number) => ({
        location: p.location ?? p.path ?? p.url ?? "",
        ordering: p.ordering ?? i,
      })),
      Year: Number(category.formYear ?? category.yearMonth ?? 0),
      Options: (() => {
        const rawOpts = raw.options ?? {};
        const standard = Array.isArray(rawOpts.standard) ? rawOpts.standard : [];
        const etc = Array.isArray(rawOpts.etc) ? rawOpts.etc : [];
        const tuning = Array.isArray(rawOpts.tuning) ? rawOpts.tuning : [];
        return [...standard, ...etc, ...tuning];
      })(),
      Vin: raw.vin ?? spec.vin ?? undefined,
      BodyType: spec.bodyName ?? category.bodyName ?? undefined,
      SeatCount: spec.seatCount ?? undefined,
      SeatColor: spec.seatColorName ?? undefined,
      Displacement: spec.displacement ?? undefined,
      Generation: category.gradeName ?? category.carGradeName ?? undefined,
      ChoiceOptions: choiceOptions,
    };

    const car = mapEncarCarExtended(encarCarLike);

    // ─── 6. الرد النهائي ───
    res.json({
      ...car,
      inspection,
      insurance,
      _meta: {
        fetchedAt: new Date().toISOString(),
        carId: id,
        inspectionEndpoint: inspectionRaw.endpointUsed,
        insuranceEndpoint: insuranceRaw.endpointUsed,
      },
    });
  } catch (err) {
    req.log.error({ err, id }, "Encar detail API error");
    res.status(502).json({
      error: "upstream_error",
      message: "تعذر الاتصال بموقع Encar. يرجى المحاولة مرة أخرى.",
    });
  }
});

export default router;
