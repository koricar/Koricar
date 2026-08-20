import { Router, type Request, type Response } from "express";
import { logger } from "../lib/logger";

const ENCAR_API = "https://api.encar.com";
const ENCAR_PHOTO = "https://ci.encar.com";

// ── Helper: Fetch with Encar headers ──
async function fetchEncar(url: string) {
  return fetch(url, {
    headers: {
      "Accept": "application/json",
      "Accept-Language": "ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7",
      "Referer": "https://www.encar.com/",
      "Origin": "https://www.encar.com",
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
      "Sec-Ch-Ua": '"Not/A)Brand";v="8", "Chromium";v="126", "Google Chrome";v="126"',
      "Sec-Ch-Ua-Mobile": "?0",
      "Sec-Ch-Ua-Platform": '"Windows"',
      "Sec-Fetch-Dest": "empty",
      "Sec-Fetch-Mode": "cors",
      "Sec-Fetch-Site": "same-site",
    },
    signal: AbortSignal.timeout(15000),
  });
}

// ── Mock Fallback ──
const MOCK_CARS = [
  {
    id: "42148518", brand: "Hyundai", model: "Palisade", year: 2022, price: 35000000,
    mileage: 45000, fuelType: "gasoline", transmission: "auto", color: "white",
    bodyType: "suv", imageUrl: "https://images.unsplash.com/photo-1617469767053-d3b523a0b982?w=600",
    location: "Seoul, Korea", options: ["Sunroof", "Leather"], badge: "Calligraphy",
    month: 3, registrationDate: "2022-03-15", engineDisplacement: 3500,
    isHybrid: false, isElectric: false, accident: false, flood: false, theft: false,
    encarId: "42148518", source: "encar",
  },
  {
    id: "42148519", brand: "Kia", model: "Sorento", year: 2023, price: 32000000,
    mileage: 28000, fuelType: "hybrid", transmission: "auto", color: "black",
    bodyType: "suv", imageUrl: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=600",
    location: "Busan, Korea", options: ["Sunroof", "Heated Seats"], badge: "Signature",
    month: 6, registrationDate: "2023-06-20", engineDisplacement: 1600,
    isHybrid: true, isElectric: false, accident: false, flood: false, theft: false,
    encarId: "42148519", source: "encar",
  },
];

const router = Router();

// GET /api/cars/search
router.get("/search", async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 12;

  try {
    // Try Encar first
    const encarUrl = new URL(`${ENCAR_API}/search/car/list/general`);
    encarUrl.searchParams.set("count", "true");
    encarUrl.searchParams.set("q", "( )");
    encarUrl.searchParams.set("sr", "|ModifiedDate|0|30");

    logger.info({ url: encarUrl.toString() }, "Fetching from Encar");

    const encarResp = await fetchEncar(encarUrl.toString());

    logger.info({ status: encarResp.status, statusText: encarResp.statusText }, "Encar response");

    if (encarResp.ok) {
      const data = await encarResp.json();
      logger.info({ carCount: data?.SearchResults?.length || 0 }, "Encar data received");

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

        return res.json({
          cars: cars.slice((page - 1) * limit, page * limit),
          total: cars.length,
          totalPages: Math.ceil(cars.length / limit),
          page,
          limit,
          filters: {
            brands: [...new Set(cars.map((c: any) => c.brand))],
            fuelTypes: ["gasoline", "diesel", "hybrid", "electric"],
            transmissions: ["auto", "manual"],
            bodyTypes: ["sedan", "suv", "van"],
            colors: ["white", "black", "silver", "gray", "blue", "red"],
            years: { min: 2018, max: 2024 },
            prices: { min: 10000000, max: 100000000 },
            mileages: { min: 0, max: 150000 },
            engineDisplacements: { min: 1000, max: 5000 },
          },
        });
      }
    } else {
      const errorText = await encarResp.text();
      logger.warn({ status: encarResp.status, body: errorText }, "Encar returned error");
    }
  } catch (err) {
    logger.error({ err }, "Encar fetch failed");
  }

  // Fallback to mock
  logger.info("Returning mock data");
  return res.json({
    cars: MOCK_CARS,
    total: MOCK_CARS.length,
    totalPages: 1,
    page,
    limit,
    filters: {
      brands: ["Hyundai", "Kia", "Genesis"],
      fuelTypes: ["gasoline", "diesel", "hybrid", "electric"],
      transmissions: ["auto", "manual"],
      bodyTypes: ["sedan", "suv", "van"],
      colors: ["white", "black", "silver", "gray", "blue", "red"],
      years: { min: 2018, max: 2024 },
      prices: { min: 10000000, max: 100000000 },
      mileages: { min: 0, max: 150000 },
      engineDisplacements: { min: 1000, max: 5000 },
    },
  });
});

// GET /api/cars/filters
router.get("/filters", async (req: Request, res: Response) => {
  res.json({
    brands: ["Hyundai", "Kia", "Genesis", "BMW", "Mercedes-Benz", "Audi", "Toyota", "Lexus"],
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
  const { id } = req.params;

  // Try Encar detail
  try {
    const detailUrl = `${ENCAR_API}/v1/readside/car/${id}`;
    const resp = await fetchEncar(detailUrl);
    if (resp.ok) {
      const d = await resp.json();
      return res.json({
        id,
        brand: d.advertisement?.manufacturer || "Unknown",
        model: d.advertisement?.model || "Unknown",
        year: parseInt(d.advertisement?.formYear) || 0,
        price: Math.round(d.advertisement?.price || 0),
        mileage: d.specification?.mileage || 0,
        fuelType: "gasoline",
        transmission: "auto",
        color: d.specification?.colorName || "white",
        bodyType: "suv",
        imageUrl: d.meta?.photos?.[0] ? `https://ci.encar.com${d.meta.photos[0].location}` : "",
        images: d.meta?.photos?.map((p: any) => `https://ci.encar.com${p.location}`) || [],
        location: d.advertisement?.areaName || "Korea",
        options: d.options?.map((o: any) => o.name) || [],
        badge: d.advertisement?.badge || "",
        month: 1,
        registrationDate: `${d.advertisement?.formYear}-01-01`,
        engineDisplacement: d.specification?.displacement || 2000,
        isHybrid: false,
        isElectric: false,
        accident: false,
        flood: false,
        theft: false,
        encarId: id,
        encarUrl: `https://www.encar.com/dc/dc_cardetailview.do?carid=${id}`,
        source: "encar",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
  } catch (err) {
    logger.error({ err, id }, "Encar detail fetch failed");
  }

  // Fallback to mock
  const car = MOCK_CARS.find((c) => c.id === id);
  if (!car) return res.status(404).json({ error: "not_found", message: "السيارة غير موجودة" });
  return res.json(car);
});

export default router;
