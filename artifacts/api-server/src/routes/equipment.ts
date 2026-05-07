import { Router } from "express";
import * as cheerio from "cheerio";
import { createClient } from "@supabase/supabase-js";

const router = Router();

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

const CATEGORIES = [
  { cat1: 18, cat2: 27, nameAr: "حفار كبير", nameEn: "Large Excavator" },
  { cat1: 18, cat2: 28, nameAr: "حفار متوسط", nameEn: "Excavator 1.0m3" },
  { cat1: 18, cat2: 31, nameAr: "ميني بوكلين", nameEn: "Mini Excavator" },
  { cat1: 18, cat2: 32, nameAr: "بوكلين بعجلات", nameEn: "Wheeled Excavator" },
  { cat1: 21, cat2: 49, nameAr: "شيول", nameEn: "Wheel Loader" },
  { cat1: 21, cat2: 51, nameAr: "بلدوزر", nameEn: "Bulldozer" },
  { cat1: 22, cat2: 54, nameAr: "كرين كارغو", nameEn: "Cargo Crane" },
  { cat1: 19, cat2: 36, nameAr: "قلاب كبير", nameEn: "Dump Truck Large" },
  { cat1: 20, cat2: 46, nameAr: "رافعة شوكية", nameEn: "Forklift" },
];

async function scrapePage(cat1: number, cat2: number, nameAr: string, nameEn: string) {
  const url = `https://ty-heavyequipment.com/taeyang_product_list/?cat1=${cat1}&cat2=${cat2}`;
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" }
    });
    const html = await res.text();
    const $ = cheerio.load(html);
    const items: any[] = [];

    $("article, .post, [class*='product']").each((_, el) => {
      const title = $(el).find("h2, h3, .entry-title").first().text().trim();
      const link  = $(el).find("a").first().attr("href") || "";
      const image = $(el).find("img").first().attr("src") || "";
      const price = $(el).find("[class*='price']").first().text().trim();

      if (title && title.length > 2) {
        items.push({
          title, price, image,
          link: link.startsWith("http") ? link : `https://ty-heavyequipment.com${link}`,
          category_ar: nameAr,
          category_en: nameEn,
          source: "ty-heavyequipment",
          scraped_at: new Date().toISOString(),
        });
      }
    });
    return items;
  } catch (err) {
    console.error(`خطأ في ${nameAr}:`, err);
    return [];
  }
}

// GET /api/equipment
router.get("/", async (req, res) => {
  try {
    const { category, page = "1", limit = "20" } = req.query as any;
    const offset = (Number(page) - 1) * Number(limit);

    let query = supabase
      .from("equipment")
      .select("*", { count: "exact" })
      .order("scraped_at", { ascending: false })
      .range(offset, offset + Number(limit) - 1);

    if (category) query = query.eq("category_en", category);

    const { data, error, count } = await query;
    if (error) throw error;

    res.json({ success: true, data, total: count, page: Number(page) });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/equipment/scrape
router.get("/scrape", async (req, res) => {
  }

  res.json({ message: "بدأ السحب..." });

  let allItems: any[] = [];
  for (const cat of CATEGORIES) {
    const items = await scrapePage(cat.cat1, cat.cat2, cat.nameAr, cat.nameEn);
    allItems = [...allItems, ...items];
    await new Promise(r => setTimeout(r, 1000));
  }

  if (allItems.length > 0) {
    await supabase.from("equipment").delete().eq("source", "ty-heavyequipment");
    await supabase.from("equipment").insert(allItems);
    console.log(`✅ تم حفظ ${allItems.length} معدة`);
  }
});

export default router;
