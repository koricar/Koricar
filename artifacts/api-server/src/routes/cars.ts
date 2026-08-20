import { Router, type Request, type Response } from "express";
import { logger } from "../lib/logger";

const ENCAR_API = "https://api.encar.com";
const ENCAR_PHOTO = "https://ci.encar.com";

// ── Models by Brand ──
const BRAND_MODELS: Record<string, string[]> = {
  "Hyundai": ["Palisade", "Santa Fe", "Tucson", "Grandeur", "Sonata", "Avante", "Staria", "Casper", "Ioniq 5", "Ioniq 6", "Kona", "Venue", "Stargazer"],
  "Kia": ["Sorento", "Carnival", "Sportage", "K5", "K8", "K3", "Seltos", "Sonet", "EV6", "EV9", "Morning", "Ray", "Bongo"],
  "Genesis": ["GV80", "GV70", "GV60", "G90", "G80", "G70", "Electrified G80", "Electrified GV70"],
  "BMW": ["X5", "X3", "X7", "X1", "X6", "5 Series", "3 Series", "7 Series", "iX", "i4", "i5", "i7"],
  "Mercedes-Benz": ["E-Class", "S-Class", "C-Class", "GLE", "GLC", "GLS", "GLA", "G-Class", "EQS", "EQE"],
  "Audi": ["Q5", "Q7", "Q3", "Q8", "A4", "A6", "A8", "e-tron", "e-tron GT"],
  "Toyota": ["Camry", "Corolla", "RAV4", "Highlander", "Land Cruiser", "Prado", "Hilux", "Prius", "Sienna"],
  "Lexus": ["RX", "NX", "ES", "LS", "LX", "UX", "GX", "IS", "LC", "RZ"],
  "Honda": ["Accord", "Civic", "CR-V", "HR-V", "Pilot", "Odyssey"],
  "Nissan": ["Altima", "Maxima", "Patrol", "X-Trail", "Kicks", "Sentra"],
  "Porsche": ["Cayenne", "Macan", "Panamera", "Taycan", "911"],
  "Volkswagen": ["Tiguan", "Atlas", "Passat", "Golf", "ID.4"],
  "Volvo": ["XC90", "XC60", "XC40", "S90", "S60"],
  "Ford": ["Explorer", "Expedition", "F-150", "Mustang", "Bronco"],
  "Jeep": ["Grand Cherokee", "Wrangler", "Compass", "Renegade"],
  "Chevrolet": ["Tahoe", "Suburban", "Traverse", "Malibu", "Equinox"],
  "SsangYong": ["Rexton", "Tivoli", "Korando", "Torres"],
};

// ── Mock Cars (لما Encar ما يرد) ──
const MOCK_CARS = [
  {
    id: "42148518", brand: "Hyundai", model: "Palisade", year: 2022, price: 35000000,
    mileage: 45000, fuelType: "gasoline", transmission: "auto", color: "white",
    bodyType: "suv", imageUrl: "https://images.unsplash.com/photo-1617469767053-d3b523a0b982?w=600",
    location: "Seoul, Korea", options: ["Sunroof", "Leather", "Navigation"], badge: "Calligraphy",
    month: 3, registrationDate: "2022-03-15", engineDisplacement: 3500,
    isHybrid: false, isElectric: false, accident: false, flood: false, theft: false,
    encarId: "42148518", encarUrl: "https://www.encar.com/dc/dc_cardetailview.do?carid=42148518",
    source: "encar", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  },
  {
    id: "42148519", brand: "Kia", model: "Sorento", year: 2023, price: 32000000,
    mileage: 28000, fuelType: "hybrid", transmission: "auto", color: "black",
    bodyType: "suv", imageUrl: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=600",
    location: "Busan, Korea", options: ["Sunroof", "Heated Seats"], badge: "Signature",
    month: 6, registrationDate: "2023-06-20", engineDisplacement: 1600,
    isHybrid: true, isElectric: false, accident: false, flood: false, theft: false,
    encarId: "42148519", encarUrl: "https://www.encar.com/dc/dc_cardetailview.do?carid=42148519",
    source: "encar", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  },
  {
    id: "42148520", brand: "Genesis", model: "GV80", year: 2024, price: 55000000,
    mileage: 12000, fuelType: "gasoline", transmission: "auto", color: "silver",
    bodyType: "suv", imageUrl: "https://images.unsplash.com/photo-1580274455191-1c62238fa333?w=600",
    location: "Incheon, Korea", options: ["Panorama", "Massage Seats", "HUD"], badge: "Luxury",
    month: 1, registrationDate: "2024-01-10", engineDisplacement: 3000,
    isHybrid: false, isElectric: false, accident: false, flood: false, theft: false,
    encarId: "42148520", encarUrl: "https://www.encar.com/dc/dc_cardetailview.do?carid=42148520",
    source: "encar", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  },
  {
    id: "42148521", brand: "Hyundai", model: "Santa Fe", year: 2023, price: 28000000,
    mileage: 35000, fuelType: "diesel", transmission: "auto", color: "gray",
    bodyType: "suv", imageUrl: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=600",
    location: "Daegu, Korea", options: ["Camera", "Navigation"], badge: "Premium",
    month: 9, registrationDate: "2023-09-05", engineDisplacement: 2200,
    isHybrid: false, isElectric: false, accident: false, flood: false, theft: false,
    encarId: "42148521", encarUrl: "https://www.encar.com/dc/dc_cardetailview.do?carid=42148521",
    source: "encar", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  },
  {
    id: "42148522", brand: "Kia", model: "Carnival", year: 2022, price: 30000000,
    mileage: 42000, fuelType: "gasoline", transmission: "auto", color: "blue",
    bodyType: "van", imageUrl: "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=600",
    location: "Seoul, Korea", options: ["Sunroof", "Leather", "Rear Entertainment"], badge: "Hi-Limousine",
    month: 5, registrationDate: "2022-05-18", engineDisplacement: 3500,
    isHybrid: false, isElectric: false, accident: false, flood: false, theft: false,
    encarId: "42148522", encarUrl: "https://www.encar.com/dc/dc_cardetailview.do?carid=42148522",
    source: "encar", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  },
  {
    id: "42148523", brand: "Hyundai", model: "Grandeur", year: 2023, price: 26000000,
    mileage: 22000, fuelType: "hybrid", transmission: "auto", color: "black",
    bodyType: "sedan", imageUrl: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=600",
    location: "Seoul, Korea", options: ["Sunroof", "Ventilated Seats", "Smart Cruise"], badge: "Prestige",
    month: 8, registrationDate: "2023-08-12", engineDisplacement: 1600,
    isHybrid: true, isElectric: false, accident: false, flood: false, theft: false,
    encarId: "42148523", encarUrl: "https://www.encar.com/dc/dc_cardetailview.do?carid=42148523",
    source: "encar", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  },
];

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

const router = Router();

// GET /api/cars/search
router.get("/search", async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 12;
    const params = req.query;

    // Try Encar first
    try {
      const encarUrl = new URL(`${ENCAR_API}/search/car/list/general`);
      encarUrl.searchParams.set("count", "true");
      encarUrl.searchParams.set("q", "( )");
      encarUrl.searchParams.set("sr", "|ModifiedDate|0|30");

      const encarResp = await fetchEncar(encarUrl.toString());
      if (encarResp.ok) {
        const data = await encarResp.json();
        if (data?.SearchResults?.length > 0) {
          const cars = data.SearchResults.map((c: any) => ({
            id: String(c.Id),
            brand: c.Manufacturer,
            model: c.Badge ? `${c.Model} ${c.Badge}` : c.Model,
            year: parseInt(c.FormYear, 10) || 0,
            price: Math.round(c.Price),
            mileage: c.Mileage || 0,
            fuelType: "gasoline",
            transmission: "auto",
            color: "white",
            bodyType: "suv",
            imageUrl: c.Photos?.[0] ? `https://ci.encar.com${c.Photos[0].location}` : "",
            images: c.Photos?.map((p: any) => `https://ci.encar.com${p.location}`) || [],
            location: "Korea",
            options: [],
            badge: c.Badge || "",
            month: 1,
            registrationDate: `${c.FormYear}-01-01`,
            engineDisplacement: 2000,
            isHybrid: false,
            isElectric: false,
            accident: false,
            flood: false,
            theft: false,
            encarId: String(c.Id),
            encarUrl: `https://www.encar.com/dc/dc_cardetailview.do?carid=${c.Id}`,
            source: "encar",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }));

          let filtered = cars;
          if (params.brand) filtered = filtered.filter((c: any) => c.brand === params.brand);
          if (params.model) filtered = filtered.filter((c: any) => c.model.toLowerCase().includes((params.model as string).toLowerCase()));
          if (params.yearFrom) filtered = filtered.filter((c: any) => c.year >= parseInt(params.yearFrom as string));
          if (params.yearTo) filtered = filtered.filter((c: any) => c.year <= parseInt(params.yearTo as string));
          if (params.priceMin) filtered = filtered.filter((c: any) => c.price >= parseInt(params.priceMin as string));
          if (params.priceMax) filtered = filtered.filter((c: any) => c.price <= parseInt(params.priceMax as string));

          const start = (page - 1) * limit;
          const paginated = filtered.slice(start, start + limit);

          return res.json({
            cars: paginated,
            total: filtered.length,
            totalPages: Math.ceil(filtered.length / limit) || 1,
            page,
            limit,
            filters: {
              brands: Object.keys(BRAND_MODELS),
              models: BRAND_MODELS,
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
        }
      }
    } catch (err) {
      logger.warn({ err }, "Encar failed, using mock");
    }

    // Fallback to mock
    let filtered = [...MOCK_CARS];
    if (params.brand) filtered = filtered.filter((c) => c.brand === params.brand);
    if (params.model) filtered = filtered.filter((c) => c.model.toLowerCase().includes((params.model as string).toLowerCase()));
    if (params.yearFrom) filtered = filtered.filter((c) => c.year >= parseInt(params.yearFrom as string));
    if (params.yearTo) filtered = filtered.filter((c) => c.year <= parseInt(params.yearTo as string));
    if (params.priceMin) filtered = filtered.filter((c) => c.price >= parseInt(params.priceMin as string));
    if (params.priceMax) filtered = filtered.filter((c) => c.price <= parseInt(params.priceMax as string));

    const start = (page - 1) * limit;
    const paginated = filtered.slice(start, start + limit);

    res.json({
      cars: paginated,
      total: filtered.length,
      totalPages: Math.ceil(filtered.length / limit) || 1,
      page,
      limit,
      filters: {
        brands: Object.keys(BRAND_MODELS),
        models: BRAND_MODELS,
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
    brands: Object.keys(BRAND_MODELS),
    models: BRAND_MODELS,
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

// GET /api/cars/models?brand=Hyundai
router.get("/models", async (req: Request, res: Response) => {
  const brand = req.query.brand as string;
  if (!brand) {
    return res.status(400).json({ error: "brand_required", message: "الرجاء اختيار الماركة" });
  }
  const models = BRAND_MODELS[brand] || [];
  res.json({ brand, models });
});

// GET /api/cars/:id
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const car = MOCK_CARS.find((c) => c.id === id);
    if (!car) return res.status(404).json({ error: "not_found", message: "السيارة غير موجودة" });
    res.json(car);
  } catch (err) {
    logger.error({ err }, "Car detail error");
    res.status(500).json({ error: "detail_failed", message: "فشل جلب التفاصيل" });
  }
});

export default router;
