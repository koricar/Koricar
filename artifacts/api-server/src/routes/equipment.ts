import { Router } from "express";
import * as cheerio from "cheerio";
import { createClient } from "@supabase/supabase-js";

const router = Router();

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

const BROWSERLESS_TOKEN = process.env.BROWSERLESS_TOKEN!;

// فئات perfect82.com
const CATEGORIES = [
  { url: "https://www.perfect82.com/pt0203", nameAr: "ميني بوكلين", nameEn: "Mini Excavator" },
  { url: "https://www.perfect82.com/pt0608", nameAr: "بوكلين متوسط", nameEn: "Excavator Medium" },
  { url: "https://www.perfect82.com/pt10",   nameAr: "بوكلين كبير", nameEn: "Excavator Large" },
  { url: "https://www.perfect82.com/ptbig",  nameAr: "بوكلين ضخم", nameEn: "Excavator XL" },
  { url: "https://www.perfect82.com/pttire", nameAr: "بوكلين بعجلات", nameEn: "Wheeled Excavator" },
  { url: "https://www.perfect82.com/346",    nameAr: "شيول", nameEn: "Wheel Loader" },
  { url: "https://www.perfect82.com/348",    nameAr: "بلدوزر", nameEn: "Bulldozer" },
  { url: "https://www.perfect82.com/339",    nameAr: "كرين كارغو", nameEn: "Cargo Crane" },
  { url: "https://www.perfect82.com/d15",    nameAr: "دمبر 15 طن", nameEn: "Dump Truck 15T" },
  { url: "https://www.perfect82.com/d27",    nameAr: "دمبر 27 طن", nameEn: "Dump Truck 27T" },
  { url: "https://www.perfect82.com/3ton",   nameAr: "رافعة شوكية 3 طن", nameEn: "Forklift 3T" },
  { url: "https://www.perfect82.com/5ton",   nameAr: "رافعة شوكية 5 طن", nameEn: "Forklift 5T" },
];

async function scrapeWithBrowserless(url: string, nameAr: string, nameEn: string) {
  try {
    // استخدام Browserless لتحميل الصفحة كاملاً مع JavaScript
    const browserlessUrl = `https://chrome.browserless.io/content?token=${BROWSERLESS_TOKEN}`;
    
    const response = await fetch(browserlessUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        url,
        waitFor: 2000, // انتظر 2 ثانية لتحميل JavaScript
        rejectResourceTypes: ["image", "font", "stylesheet"],
      }),
    });

    if (!response.ok) {
      console.error(`Browserless error for ${nameAr}: ${response.status}`);
      return [];
    }

    const html = await response.text();
    const $ = cheerio.load(html);
    const items: any[] = [];

    // perfect82 يستخدم imweb - المنتجات في روابط محددة
    $("a[href]").each((_, el) => {
      const href = $(el).attr("href") || "";
      const text = $(el).text().trim();
      const img = $(el).find("img").attr("src") || "";

      // روابط المنتجات في perfect82 تحتوي على أرقام فقط
      if (
        href.match(/^https?:\/\/www\.perfect82\.com\/\d+$/) &&
        text.length > 5
      ) {
        // تحليل النص: "볼보/14톤/17년/전북/3600만원"
        const parts = text.split("/");
        const brand = parts[0]?.trim() || "";
        const tons = parts[1]?.trim() || "";
        const year = parts[2]?.replace("년", "")?.trim() || "";
        const region = parts[3]?.trim() || "";
        const price = parts[4]?.trim() || "";

        if (brand && price) {
          items.push({
            title: `${brand} ${tons} ${year}년`.trim(),
            price,
            year,
            tons,
            brand,
            region,
            image: img.startsWith("http") ? img : "",
            link: href,
            category_ar: nameAr,
            category_en: nameEn,
            source: "perfect82",
            scraped_at: new Date().toISOString(),
          });
        }
      }
    });

    console.log(`✅ ${nameAr}: ${items.length} معدة`);
    return items;

  } catch (err) {
    console.error(`❌ خطأ في ${nameAr}:`, err);
    return [];
  }
}

// GET /api/equipment
router.get("/", async (req, res) => {
  try {
    const { category, brand, year_min, page = "1", limit = "20" } = req.query as any;
    const offset = (Number(page) - 1) * Number(limit);

    let query = supabase
      .from("equipment")
      .select("*", { count: "exact" })
      .order("scraped_at", { ascending: false })
      .range(offset, offset + Number(limit) - 1);

    if (category) query = query.eq("category_en", category);
    if (brand) query = query.ilike("brand", `%${brand}%`);
    if (year_min) query = query.gte("year", year_min);

    const { data, error, count } = await query;
    if (error) throw error;

    res.json({ success: true, data, total: count, page: Number(page) });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/equipment/categories
router.get("/categories", async (req, res) => {
  const { data, error } = await supabase
    .from("equipment")
    .select("category_ar, category_en")
    .order("category_en");

  if (error) return res.status(500).json({ error: error.message });

  const unique = [...new Map(data.map(i => [i.category_en, i])).values()];
  res.json({ success: true, data: unique });
});

// GET /api/equipment/scrape
router.get("/scrape", async (req, res) => {
  res.json({ message: "🚀 بدأ السحب من perfect82..." });

  let allItems: any[] = [];

  for (const cat of CATEGORIES) {
    const items = await scrapeWithBrowserless(cat.url, cat.nameAr, cat.nameEn);
    allItems = [...allItems, ...items];
    await new Promise(r => setTimeout(r, 2000)); // انتظر بين الطلبات
  }

  console.log(`📦 المجموع: ${allItems.length} معدة`);

  if (allItems.length > 0) {
    await supabase.from("equipment").delete().eq("source", "perfect82");
    const { error } = await supabase.from("equipment").insert(allItems);
    if (error) {
      console.error("❌ خطأ Supabase:", error.message);
    } else {
      console.log(`✅ تم حفظ ${allItems.length} معدة`);
    }
  } else {
    console.log("⚠️ ما وجدنا معدات");
  }
});

export default router;
