import { Router, type IRouter } from "express";

const router: IRouter = Router();

const AUTOBELL_BASE = "https://autobellglobal.com";
const AUTOBELL_EMAIL = process.env.AUTOBELL_EMAIL ?? "";
const AUTOBELL_PASSWORD = process.env.AUTOBELL_PASSWORD ?? "";

let cachedToken: string | null = null;
let tokenExpiry = 0;

const FUEL_MAP: Record<string, string> = {
  "Gasoline": "بنزين", "Diesel": "ديزل",
  "Gasoline + Electric": "هايبرد", "Electric": "كهربائي",
  "LPG": "غاز LPG", "Hydrogen + Electric": "هيدروجين",
};

const TRANS_MAP: Record<string, string> = {
  "Automatic": "أوتوماتيك", "Manual": "يدوي", "CVT": "أوتوماتيك",
};

const BRAND_MAP: Record<string, string> = {
  "HYUNDAI": "Hyundai", "KIA": "Kia", "GENESIS": "Genesis",
  "BMW": "BMW", "BENZ": "Mercedes-Benz", "CHEVROLET(DAEWOO)": "Chevrolet",
  "RENAULT(SAMSUNG)": "Renault", "KG MOBILITY(SSANGYONG)": "KG Mobility",
  "VW/AUDI": "Audi", "VOLKSWAGEN": "Volkswagen", "VOLVO": "Volvo",
  "LANDROVER": "Land Rover", "FORD": "Ford", "JEEP": "Jeep",
  "MINI": "MINI", "JAGUAR": "Jaguar", "LINCOLN": "Lincoln",
  "TOYOTA": "Toyota", "HONDA": "Honda", "LEXUS": "Lexus",
  "CADILLAC": "Cadillac", "NISSAN": "Nissan", "TESLA": "Tesla",
  "INFINITY": "Infiniti", "PORSCHE": "Porsche", "MASERATI": "Maserati",
};

// DEBUG endpoint - يجرب كل login endpoints ويرجع النتائج
router.get("/debug-login", async (req, res) => {
  const body = JSON.stringify({ email: AUTOBELL_EMAIL, password: AUTOBELL_PASSWORD });
  const headers = {
    "Content-Type": "application/json",
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36",
    "Origin": AUTOBELL_BASE,
    "Referer": `${AUTOBELL_BASE}/login`,
    "Accept": "application/json, text/plain, */*",
  };

  const loginEndpoints = [
    "/api/auth/login",
    "/api/v1/auth/signin",
    "/api/auth/signin",
    "/api/login",
    "/api/member/login",
    "/api/v1/member/login",
    "/api/user/login",
    "/api/v1/user/login",
    "/api/accounts/login",
    "/api/session",
  ];

  const results: Record<string, unknown>[] = [];

  for (const endpoint of loginEndpoints) {
    try {
      const r = await fetch(`${AUTOBELL_BASE}${endpoint}`, {
        method: "POST",
        headers,
        body,
        signal: AbortSignal.timeout(8000),
      });

      const text = await r.text();
      let json = null;
      try { json = JSON.parse(text); } catch { /* not json */ }

      results.push({
        endpoint,
        status: r.status,
        ok: r.ok,
        responsePreview: text.substring(0, 200),
        json,
      });
    } catch (err) {
      results.push({
        endpoint,
        error: String(err),
      });
    }
  }

  res.json({ email: AUTOBELL_EMAIL ? "✅ set" : "❌ missing", results });
});

// DEBUG endpoint - يجرب car list endpoints
router.get("/debug-cars", async (req, res) => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36",
    "Origin": AUTOBELL_BASE,
    "Referer": `${AUTOBELL_BASE}/usedcar/list`,
    "Accept": "application/json, text/plain, */*",
  };

  const carEndpoints = [
    "/api/usedcar/list?page=1&pageSize=5",
    "/api/v1/usedcar/list?page=1&size=5",
    "/api/cars?page=1&limit=5",
    "/api/v1/cars?page=1&limit=5",
    "/api/usedcar?page=1&limit=5",
    "/api/v1/usedcar?page=1&limit=5",
    "/api/vehicle/list?page=1&pageSize=5",
    "/api/v1/vehicle/list?page=1&pageSize=5",
  ];

  const results: Record<string, unknown>[] = [];

  for (const endpoint of carEndpoints) {
    try {
      const r = await fetch(`${AUTOBELL_BASE}${endpoint}`, {
        headers,
        signal: AbortSignal.timeout(8000),
      });

      const text = await r.text();
      let json = null;
      try { json = JSON.parse(text); } catch { /* not json */ }

      results.push({
        endpoint,
        status: r.status,
        ok: r.ok,
        responsePreview: text.substring(0, 300),
        json,
      });
    } catch (err) {
      results.push({ endpoint, error: String(err) });
    }
  }

  res.json({ results });
});

async function getToken(): Promise<string | null> {
  if (cachedToken && Date.now() < tokenExpiry) return cachedToken;

  const body = JSON.stringify({ email: AUTOBELL_EMAIL, password: AUTOBELL_PASSWORD });
  const headers = {
    "Content-Type": "application/json",
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36",
    "Origin": AUTOBELL_BASE,
    "Referer": `${AUTOBELL_BASE}/login`,
    "Accept": "application/json, text/plain, */*",
  };

  const loginEndpoints = [
    "/api/auth/login",
    "/api/v1/auth/signin",
    "/api/auth/signin",
    "/api/login",
    "/api/member/login",
    "/api/v1/member/login",
    "/api/user/login",
  ];

  for (const endpoint of loginEndpoints) {
    try {
      const res = await fetch(`${AUTOBELL_BASE}${endpoint}`, {
        method: "POST",
        headers,
        body,
        signal: AbortSignal.timeout(10000),
      });

      if (res.ok) {
        const data = await res.json() as Record<string, unknown>;
        const token =
          (data.token as string) ??
          (data.accessToken as string) ??
          ((data.data as Record<string, unknown>)?.token as string) ??
          ((data.data as Record<string, unknown>)?.accessToken as string) ??
          null;

        if (token) {
          cachedToken = token;
          tokenExpiry = Date.now() + 55 * 60 * 1000;
          return cachedToken;
        }
      }
    } catch { continue; }
  }

  return null;
}

function mapAutobellCar(car: Record<string, unknown>) {
  const brandKey = (car.brand ?? car.manufacturer ?? "") as string;
  const brandEn = BRAND_MAP[brandKey] ?? brandKey;
  const fuelKey = (car.fuel ?? car.fuelType ?? "") as string;
  const fuelAr = FUEL_MAP[fuelKey] ?? fuelKey;
  const transKey = (car.transmission ?? "") as string;
  const transAr = TRANS_MAP[transKey] ?? "أوتوماتيك";
  const priceUsd = (car.price ?? car.fobPrice ?? car.fob ?? 0) as number;
  const priceSar = Math.round(priceUsd * 3.75);
  const id = (car.id ?? car.carId ?? car.vehicleId ?? "") as string;
  const photos = car.photos as string[] | undefined;

  return {
    id,
    brand: brandEn,
    model: (car.model ?? car.modelName ?? "") as string,
    year: (car.year ?? car.modelYear ?? 0) as number,
    mileage: (car.mileage ?? car.odometer ?? 0) as number,
    fuelType: fuelAr,
    transmission: transAr,
    priceUsd,
    priceSar,
    priceFormatted: `$${priceUsd.toLocaleString()} (~${priceSar.toLocaleString()} ﷼)`,
    imageUrl: (car.imageUrl ?? car.image ?? car.thumbnail ?? photos?.[0] ?? "") as string,
    color: (car.color ?? "") as string,
    location: "كوريا",
    source: "Autobell",
    sourceUrl: `${AUTOBELL_BASE}/usedcar/info/${id}`,
    inspected: !!(car.conditionReport),
  };
}

router.get("/search", async (req, res) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;

  try {
    const token = await getToken();
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36",
      "Origin": AUTOBELL_BASE,
      "Referer": `${AUTOBELL_BASE}/usedcar/list`,
      "Accept": "application/json, text/plain, */*",
    };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const endpoints = [
      `/api/usedcar/list?page=${page}&pageSize=${limit}`,
      `/api/v1/usedcar/list?page=${page}&size=${limit}`,
      `/api/cars?page=${page}&limit=${limit}`,
      `/api/v1/cars?page=${page}&limit=${limit}`,
      `/api/usedcar?page=${page}&limit=${limit}`,
      `/api/vehicle/list?page=${page}&pageSize=${limit}`,
    ];

    let result: Record<string, unknown> | null = null;

    for (const endpoint of endpoints) {
      try {
        const r = await fetch(`${AUTOBELL_BASE}${endpoint}`, {
          headers,
          signal: AbortSignal.timeout(10000),
        });
        if (r.ok) {
          result = await r.json() as Record<string, unknown>;
          break;
        }
      } catch { continue; }
    }

    if (!result) {
      res.status(502).json({ error: "upstream_error", message: "تعذر الاتصال بـ Autobell." });
      return;
    }

    const rawList = (result.cars ?? result.data ?? result.items ?? result.list ?? result.results ?? []) as Record<string, unknown>[];
    const cars = rawList.map(mapAutobellCar);

    res.json({
      cars,
      total: (result.total ?? result.count ?? cars.length) as number,
      page,
      limit,
      totalPages: Math.ceil(((result.total ?? cars.length) as number) / limit),
    });
  } catch (err) {
    req.log.error({ err }, "Autobell API error");
    res.status(502).json({ error: "upstream_error", message: "تعذر الاتصال بـ Autobell." });
  }
});

router.get("/:id", async (req, res): Promise<void> => {
  const { id } = req.params;

  try {
    const token = await getToken();
    const headers: Record<string, string> = {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36",
      "Origin": AUTOBELL_BASE,
      "Referer": `${AUTOBELL_BASE}/usedcar/info/${id}`,
      "Accept": "application/json, text/plain, */*",
    };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const endpoints = [
      `/api/usedcar/${id}`,
      `/api/v1/usedcar/${id}`,
      `/api/car/${id}`,
    ];

    for (const endpoint of endpoints) {
      try {
        const r = await fetch(`${AUTOBELL_BASE}${endpoint}`, {
          headers,
          signal: AbortSignal.timeout(10000),
        });
        if (r.ok) {
          const data = await r.json() as Record<string, unknown>;
          const car = (data.car ?? data.data ?? data) as Record<string, unknown>;
          res.json(mapAutobellCar(car));
          return;
        }
      } catch { continue; }
    }

    res.status(404).json({ error: "not_found", message: "السيارة غير موجودة." });
  } catch (err) {
    req.log.error({ err }, "Autobell car detail error");
    res.status(502).json({ error: "upstream_error", message: "تعذر الاتصال بـ Autobell." });
  }
});

export default router;
