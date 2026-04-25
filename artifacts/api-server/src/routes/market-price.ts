import { Router, Request, Response } from "express";

const router = Router();

interface SearchItem {
  title: string;
  snippet: string;
  displayLink: string;
  link: string;
}

interface SearchResult {
  items?: SearchItem[];
}

interface PriceResult {
  price: number | null;
  source: string;
  timestamp: number;
}

// Cache بسيط في الذاكرة
const cache = new Map<string, PriceResult>();
const CACHE_TTL = 1000 * 60 * 60 * 6; // 6 ساعات

async function fetchMarketPrice(
  brand: string,
  model: string,
  year: number
): Promise<{ price: number | null; source: string }> {
  const key = `${brand}-${model}-${year}`.toLowerCase();

  // تحقق من الـ cache
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return { price: cached.price, source: cached.source };
  }

  const apiKey = process.env.GOOGLE_SEARCH_API_KEY;
  const engineId = process.env.GOOGLE_SEARCH_ENGINE_ID;

  if (!apiKey || !engineId) {
    return { price: null, source: "no_api_key" };
  }

  try {
    const query = `${brand} ${model} ${year} سعر ريال`;
    const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${engineId}&q=${encodeURIComponent(query)}&num=5&lr=lang_ar`;

    const response = await fetch(url);
    const data = (await response.json()) as SearchResult;

    if (!data.items || data.items.length === 0) {
      return { price: null, source: "no_results" };
    }

    let foundPrice: number | null = null;
    let foundSource = "";

    for (const item of data.items) {
      const text = `${item.title} ${item.snippet}`;

      const patterns = [
        /(\d{2,3}[,،]\d{3})\s*ريال/,
        /ريال\s*(\d{2,3}[,،]\d{3})/,
        /(\d{2,3}\.\d{3})\s*ريال/,
        /بـ?\s*(\d{2,3}[,،]\d{3})/,
        /السعر[:\s]+(\d{2,3}[,،]\d{3})/,
      ];

      for (const pattern of patterns) {
        const match = text.match(pattern);
        if (match) {
          const priceStr = match[1].replace(/[,،]/g, "");
          const price = parseInt(priceStr, 10);
          if (price >= 20000 && price <= 500000) {
            foundPrice = price;
            foundSource = item.displayLink || item.link;
            break;
          }
        }
      }

      if (foundPrice) break;
    }

    const result: PriceResult = {
      price: foundPrice,
      source: foundSource,
      timestamp: Date.now(),
    };
    cache.set(key, result);
    return { price: foundPrice, source: foundSource };

  } catch (error) {
    console.error("Google Search error:", error);
    return { price: null, source: "error" };
  }
}

// GET /api/market-price?brand=Hyundai&model=Tucson&year=2022
router.get("/", async (req: Request, res: Response): Promise<void> => {
  const { brand, model, year } = req.query;

  if (!brand || !model || !year) {
    res.status(400).json({ error: "brand, model, year مطلوبة" });
    return;
  }

  const result = await fetchMarketPrice(
    String(brand),
    String(model),
    Number(year)
  );

  res.json({
    brand,
    model,
    year: Number(year),
    marketPrice: result.price,
    source: result.source,
    currency: "SAR",
  });
});

export default router;
