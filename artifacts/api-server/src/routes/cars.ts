import { Router, type IRouter } from "express";
import { SearchCarsQueryParams } from "@workspace/api-zod";

const router: IRouter = Router();

// In-memory cache: populated by search results so the detail route can look up by ID
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
  // Korean domestic (CarType.Y)
  "hyundai": "현대",
  "kia": "기아",
  "genesis": "제네시스",
  "ssangyong": "쌍용",
  "kg mobility": "KG모빌리티",
  "renault samsung": "르노삼성",
  "renault korea": "르노코리아",
  "chevrolet": "쉐보레",
  // Imported (CarType.N)
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

// Brands that are CarType.Y (Korean domestic)
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

// Common English (and romanized) model names → Korean model name used by Encar
const EN_MODEL_TO_KR: Record<string, string> = {
  // Hyundai — English
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
  // Hyundai — Arabic
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
  // Kia — English
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
  // Kia — Arabic
  "كارنيفال": "카니발",
  "كرنفال": "카니발",
  "سورينتو": "쏘렌토",
  "سبورتاج": "스포티지",
  "سيلتوس": "셀토스",
  "نيرو": "니로",
  "ستينجر": "스팅어",
  // Genesis — English
  "gv80": "GV80",
  "gv70": "GV70",
  "gv60": "GV60",
  "g80": "G80",
  "g70": "G70",
  "g90": "G90",
  "gv90": "GV90",
  // SsangYong / KG Mobility — English
  "rexton": "렉스턴",
  "korando": "코란도",
  "tivoli": "티볼리",
  "musso": "무쏘",
  "actyon": "액티언",
  "torres": "토레스",
  // Toyota — English
  "camry": "캠리",
  "rav4": "RAV4",
  "prius": "프리우스",
  "sienna": "시에나",
  "avalon": "아발론",
  "gr86": "GR86",
  "alphard": "알파드",
  "crown": "크라운 크로스오버",
  // Toyota — Arabic
  "كامري": "캠리",
  "كامرى": "캠리",
  "برايوس": "프리우스",
  "بريوس": "프리우스",
  "راف4": "RAV4",
  "راف 4": "RAV4",
  "سيينا": "시에나",
  // Lexus — English
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
  // Lexus — Arabic
  "لكزس": "ES300h 7세대",
};

const TRANSMISSION_TO_EN: Record<string, string> = {
  "오토": "auto",
  "수동": "manual",
  "CVT": "auto",
  "DCT": "auto",
};

// Korean color name → Arabic label & English key
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

// Arabic/English color key → Korean color name for Encar query
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
  return `${price.toLocaleString()}만원 (~${Math.round(price * 8500).toLocaleString()}﷼)`;
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

  // Determine CarType: Y=domestic Korean, N=imported, omit=show all
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
    // If the value already contains Korean characters (sent from dropdown), use directly
    const isKorean = /[\uAC00-\uD7A3]/.test(input);
    if (isKorean) {
      q += `_.Model.${input}.`;
      modelKr = input;
    } else {
      // English/romanized input: look up translation table
      const translated = EN_MODEL_TO_KR[input.toLowerCase()];
      if (translated) {
        q += `_.Model.${translated}.`;
        modelKr = translated;
      } else {
        // Unknown model: keep for client-side partial-match filtering
        modelRaw = input;
      }
    }
  }

  if (params.sunroof === true) {
    q += "_.Options.선루프.";
  }

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
  OfficeCityState?: string;
  Photos?: Array<{ location: string; ordering: number }>;
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
    sunroof: false,
    inspected,
    imageUrl,
    thumbnailUrl: imageUrl,
    description: `${brandEn} ${car.Model} ${car.FormYear}`,
    features: [] as string[],
    source: "Encar",
    sourceUrl: `${ENCAR_DETAIL}${car.Id}`,
    location: car.OfficeCityState ?? "كوريا",
  };
}

router.get("/brands", (_req, res) => {
  res.json({
    brands: [
      // Korean domestic
      "Hyundai", "Kia", "Genesis", "SsangYong", "KG Mobility",
      "Renault Samsung", "Renault Korea", "Chevrolet",
      // Imported
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
    query,
    model,
    brand,
    yearFrom,
    yearTo,
    sunroof,
    transmission,
    fuelType,
    bodyType,
    color,
    priceMin,
    priceMax,
    mileageMax,
    page = 1,
    limit = 20,
  } = parsed.data;

  try {
    const { q: encarQ, modelRaw } = buildEncarQuery({ brand, model, sunroof, fuelType, transmission, bodyType, color });
    const offset = (page - 1) * limit;

    // Fetch more from Encar so we can post-filter by year, price, mileage, and unknown model names
    const fetchLimit = limit * 5;
    const url = new URL(`${ENCAR_API}/search/car/list/general`);
    url.searchParams.set("count", "true");
    url.searchParams.set("q", encarQ);
    url.searchParams.set("sr", `|ModifiedDate|${offset}|${fetchLimit}`);

    const resp = await fetch(url.toString(), {
      headers: {
        Referer: "https://www.encar.com",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36",
        Accept: "application/json, text/plain, */*",
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!resp.ok) throw new Error(`Encar HTTP ${resp.status}`);

    const data = (await resp.json()) as EncarResponse;
    let cars = data.SearchResults.map(mapEncarCar);
    cars.forEach((c) => carCache.set(c.id, c));

    // Client-side post-filters
    // If model was not in the translation map, filter by partial match on the raw model string
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

router.get("/:id", (req, res) => {
  const { id } = req.params;
  const cached = carCache.get(id);
  if (cached) {
    return res.json(cached);
  }
  // Car not in cache (user navigated directly without searching first)
  res.status(404).json({
    error: "not_found",
    message: "Car not found. Please search first and click a result.",
  });
});

export default router;
