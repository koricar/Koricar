import { Router, type Request, type Response } from "express";
import { logger } from "../lib/logger";

const ENCAR_API = "https://api.encar.com";
const ENCAR_PHOTO = "https://ci.encar.com";

// ── Mock Data (بيانات وهمية) ──
const MOCK_CARS = [
  {
    id: "42148518",
    brand: "Hyundai",
    model: "Palisade",
    year: 2022,
    price: 35000000,
    mileage: 45000,
    fuelType: "gasoline",
    transmission: "auto",
    color: "white",
    bodyType: "suv",
    imageUrl: "https://images.unsplash.com/photo-1617469767053-d3b523a0b982?w=600",
    images: [
      "https://images.unsplash.com/photo-1617469767053-d3b523a0b982?w=600",
      "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=600",
    ],
    location: "Seoul, Korea",
    options: ["Sunroof", "Leather Seats", "Navigation", "Camera"],
    badge: "Calligraphy",
    month: 3,
    registrationDate: "2022-03-15",
    engineDisplacement: 3500,
    isHybrid: false,
    isElectric: false,
    accident: false,
    flood: false,
    theft: false,
    encarId: "42148518",
    encarUrl: "https://www.encar.com/dc/dc_cardetailview.do?carid=42148518",
    source: "encar",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "42148519",
    brand: "Kia",
    model: "Sorento",
    year: 2023,
    price: 32000000,
    mileage: 28000,
    fuelType: "hybrid",
    transmission: "auto",
    color: "black",
    bodyType: "suv",
    imageUrl: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=600",
    images: [
      "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=600",
      "https://images.unsplash.com/photo-1580274455191-1c62238fa333?w=600",
    ],
    location: "Busan, Korea",
    options: ["Sunroof", "Heated Seats", "Smart Key", "Cruise Control"],
    badge: "Signature",
    month: 6,
    registrationDate: "2023-06-20",
    engineDisplacement: 1600,
    isHybrid: true,
    isElectric: false,
    accident: false,
    flood: false,
    theft: false,
    encarId: "42148519",
    encarUrl: "https://www.encar.com/dc/dc_cardetailview.do?carid=42148519",
    source: "encar",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "42148520",
    brand: "Genesis",
    model: "GV80",
    year: 2024,
    price: 55000000,
    mileage: 12000,
    fuelType: "gasoline",
    transmission: "auto",
    color: "silver",
    bodyType: "suv",
    imageUrl: "https://images.unsplash.com/photo-1580274455191-1c62238fa333?w=600",
    images: [
      "https://images.unsplash.com/photo-1580274455191-1c62238fa333?w=600",
      "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=600",
    ],
    location: "Incheon, Korea",
    options: ["Panorama Sunroof", "Massage Seats", "HUD", "ADAS"],
    badge: "Luxury",
    month: 1,
    registrationDate: "2024-01-10",
    engineDisplacement: 3000,
    isHybrid: false,
    isElectric: false,
    accident: false,
    flood: false,
    theft: false,
    encarId: "42148520",
    encarUrl: "https://www.encar.com/dc/dc_cardetailview.do?carid=42148520",
    source: "encar",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "42148521",
    brand: "Hyundai",
    model: "Santa Fe",
    year: 2023,
    price: 28000000,
    mileage: 35000,
    fuelType: "diesel",
    transmission: "auto",
    color: "gray",
    bodyType: "suv",
    imageUrl: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=600",
    images: [
      "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=600",
      "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=600",
    ],
    location: "Daegu, Korea",
    options: ["Camera", "Navigation", "Heated Steering"],
    badge: "Premium",
    month: 9,
    registrationDate: "2023-09-05",
    engineDisplacement: 2200,
    isHybrid: false,
    isElectric: false,
    accident: false,
    flood: false,
    theft: false,
    encarId: "42148521",
    encarUrl: "https://www.encar.com/dc/dc_cardetailview.do?carid=42148521",
    source: "encar",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "42148522",
    brand: "Kia",
    model: "Carnival",
    year: 2022,
    price: 30000000,
    mileage: 42000,
    fuelType: "gasoline",
    transmission: "auto",
    color: "blue",
    bodyType: "van",
    imageUrl: "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=600",
    images: [
      "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=600",
      "https://images.unsplash.com/photo-1617469767053-d3b523a0b982?w=600",
    ],
    location: "Seoul, Korea",
    options: ["Sunroof", "Leather Seats", "Rear Entertainment", "Auto Door"],
    badge: "Hi-Limousine",
    month: 5,
    registrationDate: "2022-05-18",
    engineDisplacement: 3500,
    isHybrid: false,
    isElectric: false,
    accident: false,
    flood: false,
    theft: false,
    encarId: "42148522",
    encarUrl: "https://www.encar.com/dc/dc_cardetailview.do?carid=42148522",
    source: "encar",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "42148523",
    brand: "Hyundai",
    model: "Grandeur",
    year: 2023,
    price: 26000000,
    mileage: 22000,
    fuelType: "hybrid",
    transmission: "auto",
    color: "black",
    bodyType: "sedan",
    imageUrl: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=600",
    images: [
      "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=600",
    ],
    location: "Seoul, Korea",
    options: ["Sunroof", "Ventilated Seats", "Smart Cruise"],
    badge: "Prestige",
    month: 8,
    registrationDate: "2023-08-12",
    engineDisplacement: 1600,
    isHybrid: true,
    isElectric: false,
    accident: false,
    flood: false,
    theft: false,
    encarId: "42148523",
    encarUrl: "https://www.encar.com/dc/dc_cardetailview.do?carid=42148523",
    source: "encar",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const MOCK_FILTERS = {
  brands: ["Hyundai", "Kia", "Genesis", "BMW", "Mercedes-Benz", "Audi", "Toyota", "Lexus"],
  fuelTypes: ["gasoline", "diesel", "hybrid", "electric"],
  transmissions: ["auto", "manual"],
  bodyTypes: ["sedan", "suv", "van", "hatchback", "coupe"],
  colors: ["white", "black", "silver", "gray", "blue", "red", "brown", "green"],
  years: { min: 2018, max: 2024 },
  prices: { min: 10000000, max: 100000000 },
  mileages: { min: 0, max: 150000 },
  engineDisplacements: { min: 1000, max: 5000 },
};

// ── Helper: Try Encar first, fallback to mock ──
async function fetchFromEncar(url: string, options?: RequestInit): Promise<Response> {
  return fetch(url, {
    ...options,
    headers: {
      Referer: "https://www.encar.com",
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      Accept: "application/json",
      ...options?.headers,
    },
    signal: AbortSignal.timeout(10000),
  });
}

function filterMockCars(params: any) {
  let filtered = [...MOCK_CARS];

  if (params.brand) {
    filtered = filtered.filter((c) => c.brand.toLowerCase() === params.brand.toLowerCase());
  }
  if (params.model) {
    filtered = filtered.filter((c) => c.model.toLowerCase().includes(params.model.toLowerCase()));
  }
  if (params.yearFrom) {
    filtered = filtered.filter((c) => c.year >= parseInt(params.yearFrom));
  }
  if (params.yearTo) {
    filtered = filtered.filter((c) => c.year <= parseInt(params.yearTo));
  }
  if (params.priceMin) {
    filtered = filtered.filter((c) => c.price >= parseInt(params.priceMin));
  }
  if (params.priceMax) {
    filtered = filtered.filter((c) => c.price <= parseInt(params.priceMax));
  }
  if (params.mileageMax) {
    filtered = filtered.filter((c) => c.mileage <= parseInt(params.mileageMax));
  }
  if (params.fuelType && params.fuelType !== "any") {
    filtered = filtered.filter((c) => c.fuelType === params.fuelType);
  }
  if (params.transmission && params.transmission !== "any") {
    filtered = filtered.filter((c) => c.transmission === params.transmission);
  }
  if (params.bodyType && params.bodyType !== "any") {
    filtered = filtered.filter((c) => c.bodyType === params.bodyType);
  }
  if (params.color && params.color !== "any") {
    filtered = filtered.filter((c) => c.color === params.color);
  }
  if (params.sunroof === "true") {
    filtered = filtered.filter((c) => c.options.some((o) => o.toLowerCase().includes("sunroof")));
  }

  return filtered;
}

const router = Router();

// GET /api/cars/search
router.get("/search", async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 12;

    // Try Encar first
    try {
      const encarUrl = new URL(`${ENCAR_API}/search/car/list/general`);
      encarUrl.searchParams.set("count", "true");
      encarUrl.searchParams.set("q", "( )");
      encarUrl.searchParams.set("sr", "|ModifiedDate|0|30");

      const encarResp = await fetchFromEncar(encarUrl.toString());
      if (encarResp.ok) {
        const data = await encarResp.json();
        // If Encar works, return real data (you can expand this)
        return res.json({
          cars: MOCK_CARS, // For now return mock even if Encar works (to be safe)
          total: MOCK_CARS.length,
          totalPages: 1,
          page,
          limit,
          filters: MOCK_FILTERS,
        });
      }
    } catch (encarErr) {
      logger.warn({ err: encarErr }, "Encar API failed, using mock data");
    }

    // Fallback to mock data
    const filtered = filterMockCars(req.query);
    const start = (page - 1) * limit;
    const paginated = filtered.slice(start, start + limit);

    return res.json({
      cars: paginated,
      total: filtered.length,
      totalPages: Math.ceil(filtered.length / limit),
      page,
      limit,
      filters: MOCK_FILTERS,
    });
  } catch (err) {
    logger.error({ err }, "Error in /api/cars/search");
    return res.status(500).json({
      error: "upstream_error",
      message: "تعذر جلب بيانات السيارة",
    });
  }
});

// GET /api/cars/filters
router.get("/filters", async (req: Request, res: Response) => {
  try {
    return res.json({
      brands: MOCK_FILTERS.brands,
      fuelTypes: MOCK_FILTERS.fuelTypes,
      transmissions: MOCK_FILTERS.transmissions,
      bodyTypes: MOCK_FILTERS.bodyTypes,
      colors: MOCK_FILTERS.colors,
      years: MOCK_FILTERS.years,
      prices: MOCK_FILTERS.prices,
      mileages: MOCK_FILTERS.mileages,
      engineDisplacements: MOCK_FILTERS.engineDisplacements,
    });
  } catch (err) {
    logger.error({ err }, "Error in /api/cars/filters");
    return res.status(500).json({
      error: "upstream_error",
      message: "تعذر جلب الفلاتر",
    });
  }
});

// GET /api/cars/:id
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const car = MOCK_CARS.find((c) => c.id === id);

    if (!car) {
      return res.status(404).json({ error: "not_found", message: "السيارة غير موجودة" });
    }

    return res.json(car);
  } catch (err) {
    logger.error({ err }, "Error in /api/cars/:id");
    return res.status(500).json({
      error: "upstream_error",
      message: "تعذر جلب تفاصيل السيارة",
    });
  }
});

export default router;
