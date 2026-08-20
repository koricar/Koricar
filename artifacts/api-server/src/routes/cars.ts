import { Router, type Request, type Response } from "express";
import { logger } from "../lib/logger";

const ENCAR_API = "https://api.encar.com";
const ENCAR_PHOTO = "https://ci.encar.com";

// ── Translation Maps ──
const MANUFACTURER_TO_EN: Record<string, string> = {
  "현대": "Hyundai", "기아": "Kia", "제네시스": "Genesis",
  "BMW": "BMW", "메르세데스-벤츠": "Mercedes-Benz", "아우디": "Audi",
  "폭스바겐": "Volkswagen", "볼보": "Volvo", "도요타": "Toyota",
  "렉서스": "Lexus", "혼다": "Honda", "닛산": "Nissan",
  "인피니티": "Infiniti", "포르쉐": "Porsche", "랜드로버": "Land Rover",
  "MINI": "MINI", "포드": "Ford", "지프": "Jeep",
  "쉐보레": "Chevrolet", "쌍용": "SsangYong",
};

const EN_TO_MANUFACTURER: Record<string, string> = Object.fromEntries(
  Object.entries(MANUFACTURER_TO_EN).map(([k, v]) => [v, k])
);

const DOMESTIC_BRANDS = ["Hyundai", "Kia", "Genesis", "SsangYong", "KG Mobility", "Renault Korea"];

const EN_TO_FUEL_KR: Record<string, string> = {
  gasoline: "가솔린", diesel: "디젤", hybrid: "하이브리드", electric: "전기",
};

const EN_TO_TRANSMISSION_KR: Record<string, string> = {
  auto: "오토", manual: "수동",
};

const EN_COLOR_TO_KR: Record<string, string> = {
  white: "흰색", black: "검정색", gray: "쥐색", grey: "쥐색",
  silver: "은색", red: "빨간색", blue: "파란색", brown: "갈색",
  green: "녹색", yellow: "노란색", orange: "주황색",
};

// ── Helper: Build Encar Query ──
function buildQuery(params: any): string {
  let q = "(";

  // Brand
  if (params.brand) {
    const kr = EN_TO_MANUFACTURER[params.brand] || params.brand;
    q += `_.Manufacturer.${kr}.`;
  }

  // Model
  if (params.model) {
    q += `_.Model.${params.model}.`;
  }

  // Fuel Type
  if (params.fuelType && params.fuelType !== "any") {
    const kr = EN_TO_FUEL_KR[params.fuelType];
    if (kr) q += `_.FuelType.${kr}.`;
  }

  // Transmission
  if (params.transmission && params.transmission !== "any") {
    const kr = EN_TO_TRANSMISSION_KR[params.transmission];
    if (kr) q += `_.Transmission.${kr}.`;
  }

  // Body Type
  if (params.bodyType === "suv") {
    q += "_.Category.RV.";
  } else if (params.bodyType && params.bodyType !== "any") {
    q += `_.Category.${params.bodyType}.`;
  }

  // Color
  if (params.color && params.color !== "any") {
    const kr = EN_COLOR_TO_KR[params.color.toLowerCase()];
    if (kr) q += `_.Color.${kr}.`;
  }

  q += ")";
  return q || "( )";
}

// ── Helper: Parse Registration Date ──
function parseRegistrationDate(formYear: string, month?: number): string {
  const year = parseInt(formYear, 10) || 0;
  const m = month || 1;
  return `${year}-${String(m).padStart(2, "0")}-01`;
}

// ── Helper: Translate Options ──
function translateOptions(options: string[]): string[] {
  const map: Record<string, string> = {
    "선루프": "Sunroof", "루프랙": "Roof Rack", "전동트렁크": "Power Trunk",
    "헤드업디스플레이": "HUD", "열선시트": "Heated Seats", "통풍시트": "Ventilated Seats",
    "마사지시트": "Massage Seats", "전동시트": "Power Seats", "가죽시트": "Leather Seats",
    "메모리시트": "Memory Seats", "하이패스": "Hi-Pass", "스마트키": "Smart Key",
    "키레스": "Keyless", "내비게이션": "Navigation", "후방카메라": "Rear Camera",
    "전방카메라": "Front Camera", "360도카메라": "360 Camera", "블랙박스": "Black Box",
    "블루투스": "Bluetooth", "USB": "USB", "AUX": "AUX", "CD플레이어": "CD Player",
    "DVD플레이어": "DVD Player", "앰프": "Amplifier", "스피커": "Speaker",
    "서브우퍼": "Subwoofer", "크루즈컨트롤": "Cruise Control", "스마트크루즈": "Smart Cruise",
    "차선이탈": "Lane Departure", "자동주차": "Auto Parking", "주차보조": "Parking Assist",
    "HUD": "HUD", "TPMS": "TPMS", "ECS": "ECS", "ABS": "ABS", "ESC": "ESC",
    "VDC": "VDC", "TCS": "TCS", "HAC": "HAC", "DBC": "DBC", "ABP": "ABP",
  };
  return options.map((o) => map[o] || o).filter(Boolean);
}

// ── Helper: Fetch with Encar headers ──
async function fetchEncar(url: string) {
  return fetch(url, {
    headers: {
      Accept: "application/json",
      Referer: "https://www.encar.com/",
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    },
    signal: AbortSignal.timeout(15000),
  });
}

// ── Cache ──
const carCache = new Map<string, any>();

// ── Helper: Fetch Car Detail ──
async function fetchCarDetail(carId: string) {
  if (carCache.has(carId)) return carCache.get(carId);

  try {
    const resp = await fetchEncar(`${ENCAR_API}/v1/readside/car/${carId}`);
    if (!resp.ok) return null;
    const data = await resp.json();
    carCache.set(carId, data);
    return data;
  } catch (err) {
    logger.error({ err, carId }, "Failed to fetch car detail");
    return null;
  }
}

// ── Helper: Search Cars from Encar ──
async function searchCars(params: any) {
  const q = buildQuery(params);
  const url = new URL(`${ENCAR_API}/search/car/list/general`);
  url.searchParams.set("count", "true");
  url.searchParams.set("q", q);
  url.searchParams.set("sr", "|ModifiedDate|0|30");

  logger.info({ url: url.toString() }, "Searching Encar");

  const resp = await fetchEncar(url.toString());
  if (!resp.ok) {
    const text = await resp.text();
    logger.warn({ status: resp.status, body: text }, "Encar search failed");
    throw new Error(`Encar ${resp.status}`);
  }

  const data = await resp.json() as {
    SearchResults: Array<{
      Id: string; Manufacturer: string; Model: string; Badge?: string;
      FormYear: string; Price: number; Photos?: Array<{ location: string }>;
      Mileage?: number; Category?: string; FuelType?: string;
    }>;
  };

  const cars = [];
  for (const c of data.SearchResults || []) {
    const year = parseInt(c.FormYear, 10) || 0;
    const detail = await fetchCarDetail(c.Id);

    const photos = c.Photos || [];
    const imageUrl = photos[0] ? `${ENCAR_PHOTO}${photos[0].location}` : "";

    cars.push({
      id: String(c.Id),
      brand: MANUFACTURER_TO_EN[c.Manufacturer] || c.Manufacturer,
      model: c.Badge ? `${c.Model} ${c.Badge}` : c.Model,
      year,
      price: Math.round(c.Price),
      mileage: c.Mileage || 0,
      fuelType: c.FuelType || "gasoline",
      transmission: "auto",
      color: "white",
      bodyType: c.Category || "suv",
      imageUrl,
      images: photos.map((p) => `${ENCAR_PHOTO}${p.location}`),
      location: "Korea",
      options: detail?.options ? translateOptions(detail.options.map((o: any) => o.name)) : [],
      badge: c.Badge || "",
      month: 1,
      registrationDate: parseRegistrationDate(c.FormYear),
      engineDisplacement: detail?.specification?.displacement || 2000,
      isHybrid: (c.FuelType || "").includes("하이브리드"),
      isElectric: (c.FuelType || "").includes("전기"),
      accident: false,
      flood: false,
      theft: false,
      encarId: String(c.Id),
      encarUrl: `https://www.encar.com/dc/dc_cardetailview.do?carid=${c.Id}`,
      source: "encar",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  return cars;
}

const router = Router();

// GET /api/cars/search
router.get("/search", async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 12;
    const params = req.query;

    const cars = await searchCars(params);

    // Apply filters
    let filtered = cars;
    if (params.yearFrom) filtered = filtered.filter((c) => c.year >= parseInt(params.yearFrom as string));
    if (params.yearTo) filtered = filtered.filter((c) => c.year <= parseInt(params.yearTo as string));
    if (params.priceMin) filtered = filtered.filter((c) => c.price >= parseInt(params.priceMin as string));
    if (params.priceMax) filtered = filtered.filter((c) => c.price <= parseInt(params.priceMax as string));
    if (params.mileageMax) filtered = filtered.filter((c) => c.mileage <= parseInt(params.mileageMax as string));

    const start = (page - 1) * limit;
    const paginated = filtered.slice(start, start + limit);

    res.json({
      cars: paginated,
      total: filtered.length,
      totalPages: Math.ceil(filtered.length / limit) || 1,
      page,
      limit,
      filters: {
        brands: [...new Set(cars.map((c) => c.brand))],
        fuelTypes: ["gasoline", "diesel", "hybrid", "electric"],
        transmissions: ["auto", "manual"],
        bodyTypes: ["sedan", "suv", "van", "hatchback", "coupe"],
        colors: ["white", "black", "silver", "gray", "blue", "red", "brown", "green"],
        years: { min: 2018, max: 2024 },
        prices: { min: 10000000, max: 100000000 },
        mileages: { min: 0, max: 150000 },
        engineDisplacements: { min: 1000, max: 5000 },
      },
    });
  } catch (err) {
    logger.error({ err }, "Search error");
    res.status(500).json({ error: "search_failed", message: "فشل البحث" });
  }
});

// GET /api/cars/filters
router.get("/filters", async (_req: Request, res: Response) => {
  res.json({
    brands: Object.values(MANUFACTURER_TO_EN),
    fuelTypes: ["gasoline", "diesel", "hybrid", "electric"],
    transmissions: ["auto", "manual"],
    bodyTypes: ["sedan", "suv", "van", "hatchback", "coupe"],
    colors: ["white", "black", "silver", "gray", "blue", "red", "brown", "green"],
    years: { min: 2018, max: 2024 },
    prices: { min: 10000000, max: 100000000 },
    mileages: { min: 0, max: 150000 },
    engineDisplacements: { min: 1000, max: 5000 },
  });
});

// GET /api/cars/:id
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const detail = await fetchCarDetail(id);

    if (!detail) {
      return res.status(404).json({ error: "not_found", message: "السيارة غير موجودة" });
    }

    const ad = detail.advertisement || {};
    const spec = detail.specification || {};
    const photos = detail.meta?.photos || [];

    res.json({
      id,
      brand: MANUFACTURER_TO_EN[ad.manufacturer] || ad.manufacturer || "Unknown",
      model: ad.model || "Unknown",
      year: parseInt(ad.formYear) || 0,
      price: Math.round(ad.price || 0),
      mileage: spec.mileage || 0,
      fuelType: ad.fuelType || "gasoline",
      transmission: "auto",
      color: spec.colorName || "white",
      bodyType: ad.category || "suv",
      imageUrl: photos[0] ? `${ENCAR_PHOTO}${photos[0].location}` : "",
      images: photos.map((p: any) => `${ENCAR_PHOTO}${p.location}`),
      location: ad.areaName || "Korea",
      options: detail.options ? translateOptions(detail.options.map((o: any) => o.name)) : [],
      badge: ad.badge || "",
      month: 1,
      registrationDate: parseRegistrationDate(ad.formYear),
      engineDisplacement: spec.displacement || 2000,
      isHybrid: (ad.fuelType || "").includes("하이브리드"),
      isElectric: (ad.fuelType || "").includes("전기"),
      accident: false,
      flood: false,
      theft: false,
      encarId: id,
      encarUrl: `https://www.encar.com/dc/dc_cardetailview.do?carid=${id}`,
      source: "encar",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    logger.error({ err, id }, "Car detail error");
    res.status(500).json({ error: "detail_failed", message: "فشل جلب التفاصيل" });
  }
});

export default router;
