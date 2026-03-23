import { Router, type IRouter } from "express";
import { SearchCarsQueryParams } from "@workspace/api-zod";

const router: IRouter = Router();

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
  "토요타": "Toyota",
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
  "toyota": "토요타",
  "honda": "혼다",
  "lexus": "렉서스",
};

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

function formatPrice(price: number): string {
  return `${price.toLocaleString()}만원 (~${Math.round(price * 8500).toLocaleString()}﷼)`;
}

function buildEncarQuery(params: {
  brand?: string;
  sunroof?: boolean;
  fuelType?: string;
}): string {
  let q = "(And.Hidden.N._.CarType.Y.";

  if (params.brand && params.brand !== "any") {
    const kr = EN_TO_MANUFACTURER[params.brand.toLowerCase()];
    if (kr) q += `_.Maker.${kr}.`;
  }

  if (params.sunroof === true) {
    q += "_.SunRoof.Y.";
  }

  if (params.fuelType && params.fuelType !== "any") {
    const kr = EN_TO_FUEL_KR[params.fuelType];
    if (kr) q += `_.FuelType.${kr}.`;
  }

  q += ")";
  return q;
}

interface EncarCar {
  Id: string;
  Manufacturer: string;
  Model: string;
  Badge?: string;
  GreenType: string;
  FuelType: string;
  FormYear: string;
  Mileage: number;
  Price: number;
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
  const year = parseInt(car.FormYear, 10) || 0;
  const price = Math.round(car.Price);
  const model = car.Badge ? `${car.Model} ${car.Badge}` : car.Model;

  return {
    id: car.Id,
    brand: brandEn,
    model,
    year,
    price,
    priceFormatted: formatPrice(price),
    mileage: Math.round(car.Mileage),
    fuelType: fuelEn,
    transmission: "auto",
    bodyType: "sedan",
    color: "unknown",
    sunroof: false,
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
      "Hyundai", "Kia", "Genesis", "SsangYong", "KG Mobility",
      "Renault Samsung", "Chevrolet", "BMW", "Mercedes-Benz",
      "Audi", "Volkswagen", "Toyota", "Lexus",
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
    brand,
    yearFrom,
    yearTo,
    sunroof,
    fuelType,
    priceMin,
    priceMax,
    mileageMax,
    page = 1,
    limit = 20,
  } = parsed.data;

  try {
    const encarQ = buildEncarQuery({ brand, sunroof, fuelType });
    const offset = (page - 1) * limit;

    // Fetch more from Encar so we can post-filter by year, price, mileage
    const fetchLimit = limit * 5;
    const url = new URL(`${ENCAR_API}/search/car/list/general`);
    url.searchParams.set("count", "true");
    url.searchParams.set("q", encarQ);
    url.searchParams.set("sr", `|ModifiedDate|${offset}|${fetchLimit}`);
    if (query) url.searchParams.set("kw", query);

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

    // Client-side post-filters
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
  res.json({
    id,
    sourceUrl: `${ENCAR_DETAIL}${id}`,
    message: "View this car on Encar",
  });
});

export default router;
