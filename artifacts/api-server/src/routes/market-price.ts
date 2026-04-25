import { Router, Request, Response } from "express";

const router = Router();

// ─── أسعار السوق الخليجي التقريبية (ريال سعودي) ──────────────────────────────
// يمكن تحديثها يدوياً كل شهر
const GULF_PRICES: Record<string, Record<number, number>> = {
  // Hyundai
  "hyundai palisade":    { 2020: 118000, 2021: 125000, 2022: 135000, 2023: 145000, 2024: 158000 },
  "hyundai tucson":      { 2020: 78000,  2021: 85000,  2022: 92000,  2023: 98000,  2024: 108000 },
  "hyundai sonata":      { 2020: 72000,  2021: 78000,  2022: 84000,  2023: 90000,  2024: 98000  },
  "hyundai elantra":     { 2020: 58000,  2021: 62000,  2022: 68000,  2023: 74000,  2024: 80000  },
  "hyundai santa fe":    { 2020: 95000,  2021: 102000, 2022: 112000, 2023: 120000, 2024: 130000 },
  "hyundai ioniq 5":     { 2022: 145000, 2023: 155000, 2024: 165000 },
  "hyundai grandeur":    { 2020: 105000, 2021: 112000, 2022: 120000, 2023: 130000 },
  "hyundai staria":      { 2022: 118000, 2023: 128000, 2024: 138000 },

  // KIA
  "kia sportage":        { 2020: 82000,  2021: 88000,  2022: 95000,  2023: 105000, 2024: 115000 },
  "kia sorento":         { 2020: 95000,  2021: 102000, 2022: 112000, 2023: 122000, 2024: 132000 },
  "kia carnival":        { 2021: 115000, 2022: 125000, 2023: 135000, 2024: 145000 },
  "kia k5":              { 2020: 72000,  2021: 78000,  2022: 84000,  2023: 92000,  2024: 100000 },
  "kia telluride":       { 2020: 120000, 2021: 128000, 2022: 138000, 2023: 148000 },
  "kia ev6":             { 2022: 148000, 2023: 158000, 2024: 168000 },
  "kia stinger":         { 2020: 95000,  2021: 102000, 2022: 112000, 2023: 120000 },
  "kia k9":              { 2020: 145000, 2021: 155000, 2022: 165000, 2023: 178000 },

  // Genesis
  "genesis g80":         { 2020: 145000, 2021: 155000, 2022: 168000, 2023: 180000, 2024: 195000 },
  "genesis g90":         { 2020: 195000, 2021: 210000, 2022: 225000, 2023: 240000 },
  "genesis gv80":        { 2021: 175000, 2022: 188000, 2023: 200000, 2024: 215000 },
  "genesis gv70":        { 2022: 145000, 2023: 158000, 2024: 170000 },
  "genesis g70":         { 2020: 118000, 2021: 125000, 2022: 135000, 2023: 145000 },
};

function findGulfPrice(brand: string, model: string, year: number): number | null {
  // بناء مفتاح البحث
  const brandLower = brand.toLowerCase();
  const modelLower = model.toLowerCase()
    .replace(/\s+\d+\.\d+.*$/, "") // إزالة المواصفات مثل "2.5T"
    .replace(/\s+(awd|4wd|2wd|fwd|rwd|hybrid|ev|lpi|gdi|tci|turbo).*$/i, "")
    .trim();

  const key = `${brandLower} ${modelLower}`;

  // بحث مباشر
  if (GULF_PRICES[key]) {
    const yearPrices = GULF_PRICES[key];
    if (yearPrices[year]) return yearPrices[year];

    // أقرب سنة
    const years = Object.keys(yearPrices).map(Number).sort();
    const closest = years.reduce((prev, curr) =>
      Math.abs(curr - year) < Math.abs(prev - year) ? curr : prev
    );
    return yearPrices[closest];
  }

  // بحث جزئي
  for (const [priceKey, yearPrices] of Object.entries(GULF_PRICES)) {
    if (priceKey.includes(brandLower) && priceKey.includes(modelLower.split(" ")[0])) {
      if (yearPrices[year]) return yearPrices[year];
      const years = Object.keys(yearPrices).map(Number).sort();
      const closest = years.reduce((prev, curr) =>
        Math.abs(curr - year) < Math.abs(prev - year) ? curr : prev
      );
      return yearPrices[closest];
    }
  }

  return null;
}

// GET /api/market-price?brand=Hyundai&model=Palisade&year=2022
router.get("/", async (req: Request, res: Response): Promise<void> => {
  const { brand, model, year } = req.query;

  if (!brand || !model || !year) {
    res.status(400).json({ error: "brand, model, year مطلوبة" });
    return;
  }

  const gulfPrice = findGulfPrice(String(brand), String(model), Number(year));

  if (gulfPrice) {
    res.json({
      brand,
      model,
      year: Number(year),
      marketPrice: gulfPrice,
      source: "gulf-market-avg",
      currency: "SAR",
      note: "متوسط سعر السوق الخليجي",
    });
    return;
  }

  // لو ما لقى السعر
  res.json({
    brand,
    model,
    year: Number(year),
    marketPrice: null,
    source: "not_found",
    currency: "SAR",
  });
});

export default router;
