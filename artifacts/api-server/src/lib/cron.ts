import { logger } from "./logger";
import { db } from "@workspace/db";
import { alertsTable, alertSeenCarsTable } from "@workspace/db";
import { eq, and, inArray, lt } from "drizzle-orm";
import { sendPushToSession } from "../routes/alerts";

const ENCAR_API = "https://api.encar.com";
const ENCAR_PHOTO = "https://ci.encar.com";
const ENCAR_DETAIL = "https://www.encar.com/dc/dc_cardetailview.do?carid=";
const CHECK_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

/** Wrap Encar URL with Yandex Translate (Korean → Arabic, works in Gulf region) */
function toArabicUrl(url: string): string {
  return `https://translate.yandex.com/translate?url=${encodeURIComponent(url)}&lang=ko-ar`;
}

const EN_TO_FUEL_KR: Record<string, string> = {
  gasoline: "가솔린",
  diesel: "디젤",
  hybrid: "하이브리드",
  electric: "전기",
};

const EN_TO_TRANSMISSION_KR: Record<string, string> = {
  auto: "오토",
  manual: "수동",
};

const EN_COLOR_TO_KR: Record<string, string> = {
  white: "흰색",
  black: "검정색",
  gray: "쥐색",
  grey: "쥐색",
  silver: "은색",
  red: "빨간색",
  lightblue: "하늘색",
  blue: "하늘색",
  brown: "갈색",
  green: "녹색",
  yellow: "노란색",
  orange: "주황색",
  lime: "연두색",
};

const MANUFACTURER_TO_KR: Record<string, string> = {
  Hyundai: "현대",
  Kia: "기아",
  Genesis: "제네시스",
  SsangYong: "쌍용",
  "KG Mobility": "KG모빌리티",
  "Renault Samsung": "르노삼성",
  "Renault Korea": "르노코리아",
  Chevrolet: "쉐보레",
  BMW: "BMW",
  "Mercedes-Benz": "메르세데س-벤츠",
  Audi: "아우دي",
  Volkswagen: "폭스바겐",
  Volvo: "볼보",
  Toyota: "도요타",
  Lexus: "렉서스",
  Honda: "혼다",
  Nissan: "닛산",
  Infiniti: "인피니تي",
  Porsche: "포르쉐",
  "Land Rover": "랜드로بر",
  MINI: "MINI",
  Ford: "포드",
  Jeep: "지프",
  Lincoln: "링컨",
  Cadillac: "캐딜락",
  Maserati: "마세라تي",
  Jaguar: "재규어",
  "Rolls-Royce": "롤스로이스",
  McLaren: "맥라렌",
};

function buildCronQuery(alert: {
  brand?: string | null;
  model?: string | null;
  fuelType?: string | null;
  transmission?: string | null;
  bodyType?: string | null;
  color?: string | null;
  sunroof?: boolean | null;
}): string {
  let q = "(";

  if (alert.brand) {
    const mfr = MANUFACTURER_TO_KR[alert.brand] ?? alert.brand;
    q += `_.Manufacturer.${mfr}.`;
  }

  if (alert.model) {
    if (/[\uAC00-\uD7A3]/.test(alert.model)) {
      q += `_.Model.${alert.model}.`;
    }
  }

  if (alert.sunroof) {
    q += "_.Sunroof.Y.";
  }

  if (alert.fuelType && alert.fuelType !== "any") {
    const kr = EN_TO_FUEL_KR[alert.fuelType];
    if (kr) q += `_.FuelType.${kr}.`;
  }

  if (alert.transmission && alert.transmission !== "any") {
    const kr = EN_TO_TRANSMISSION_KR[alert.transmission];
    if (kr) q += `_.Transmission.${kr}.`;
  }

  if (alert.bodyType === "suv") {
    q += "_.Category.RV.";
  }

  if (alert.color && alert.color !== "any") {
    const kr = EN_COLOR_TO_KR[alert.color.toLowerCase()];
    if (kr) q += `_.Color.${kr}.`;
  }

  q += ")";
  return q;
}

async function fetchLatestCars(alert: typeof alertsTable.$inferSelect): Promise<
  Array<{ 
    id: string; 
    brand: string; 
    model: string; 
    year: number; 
    price: number; 
    imageUrl: string;
    images: string[];
    chassisNumber: string;
    location: string;
    options: string[];
  }>
> {
  const q = buildCronQuery(alert);
  const url = new URL(`${ENCAR_API}/search/car/list/general`);
  url.searchParams.set("count", "true");
  url.searchParams.set("q", q);
  url.searchParams.set("sr", "|ModifiedDate|0|30");

  const resp = await fetch(url.toString(), {
    headers: {
      Referer: "https://www.encar.com",
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      Accept: "application/json",
    },
    signal: AbortSignal.timeout(10000),
  });

  if (!resp.ok) throw new Error(`Encar ${resp.status}`);

  const data = (await resp.json()) as {
    SearchResults: Array<{
      Id: string;
      Manufacturer: string;
      Model: string;
      Badge?: string;
      FormYear: string;
      Price: number;
      Photos?: Array<{ location: string; ordering: number }>;
      Mileage?: number;
    }>;
  };

  const detailedCars = [];

  for (const c of data.SearchResults) {
    const year = parseInt(c.FormYear, 10) || 0;

    // الفلترة الأولية لتوفير الوقت والطلبات
    if (alert.yearFrom && year < alert.yearFrom) continue;
    if (alert.yearTo && year > alert.yearTo) continue;
    if (alert.priceMin && c.Price < alert.priceMin) continue;
    if (alert.priceMax && c.Price > alert.priceMax) continue;
    if (alert.mileageMax && (c.Mileage ?? 0) > alert.mileageMax) continue;

    try {
      // جلب التفاصيل العميقة لكل سيارة (الصور الكاملة والمواصفات من الـ API الداخلي لـ Encar)
      const detailUrl = `${ENCAR_API}/v1/readside/car/${c.Id}`;
      const detailResp = await fetch(detailUrl, {
        headers: {
          Referer: `https://www.encar.com/dc/dc_cardetailview.do?carid=${c.Id}`,
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          Accept: "application/json",
        },
        signal: AbortSignal.timeout(5000),
      });

      if (detailResp.ok) {
        const dData = await detailResp.json() as any;
        
        // تجميع روابط كافة الصور المتاحة للمعرض وترتيبها
        const allPhotos = dData.meta?.photos || [];
        const imagesArray = allPhotos
          .sort((a: any, b: any) => (a.ordering || 0) - (b.ordering || 0))
          .map((p: any) => `${ENCAR_PHOTO}${p.location}`);

        // تجميع كافة المميزات المتاحة بالسيارة (Options)
        const optionList = dData.options?.map((o: any) => o.name) || [];

        detailedCars.push({
          id: String(c.Id),
          brand: c.Manufacturer,
          model: c.Badge ? `${c.Model} ${c.Badge}` : c.Model,
          year,
          price: Math.round(c.Price),
          imageUrl: imagesArray[0] || (c.Photos?.[0] ? `${ENCAR_PHOTO}${c.Photos[0].location}` : ""),
          images: imagesArray.length > 0 ? imagesArray : (c.Photos?.map(p => `${ENCAR_PHOTO}${p.location}`) || []),
          chassisNumber: dData.inspect?.chassisNumber || dData.specification?.chassisNumber || "غير متوفر",
          location: dData.advertisement?.areaName || "كوريا الجنوبية",
          options: optionList,
        });
      } else {
        // في حال فشل طلب التفاصيل، نعتمد على البيانات الأساسية المتاحة كبديل مؤقت
        const photo = (c.Photos ?? []).sort((a, b) => a.ordering - b.ordering)[0];
        detailedCars.push({
          id: String(c.Id),
          brand: c.Manufacturer,
          model: c.Badge ? `${c.Model} ${c.Badge}` : c.Model,
          year,
          price: Math.round(c.Price),
          imageUrl: photo ? `${ENCAR_PHOTO}${photo.location}` : "",
          images: c.Photos?.map(p => `${ENCAR_PHOTO}${p.location}`) || [],
          chassisNumber: "غير متوفر",
          location: "كوريا الجنوبية",
          options: [],
        });
      }
    } catch (e) {
      const photo = (c.Photos ?? []).sort((a, b) => a.ordering - b.ordering)[0];
      detailedCars.push({
        id: String(c.Id),
        brand: c.Manufacturer,
        model: c.Badge ? `${c.Model} ${c.Badge}` : c.Model,
        year,
        price: Math.round(c.Price),
        imageUrl: photo ? `${ENCAR_PHOTO}${photo.location}` : "",
        images: c.Photos?.map(p => `${ENCAR_PHOTO}${p.location}`) || [],
        chassisNumber: "غير متوفر",
        location: "كوريا الجنوبية",
        options: [],
      });
    }
  }

  return detailedCars;
}

async function checkAlert(alert: typeof alertsTable.$inferSelect) {
  try {
    const cars = await fetchLatestCars(alert);
    if (!cars.length) return;

    // Get already-seen car IDs for this alert
    const seenRows = await db
      .select({ carId: alertSeenCarsTable.carId })
      .from(alertSeenCarsTable)
      .where(eq(alertSeenCarsTable.alertId, alert.id));
    const seenIds = new Set(seenRows.map((r) => r.carId));

    const newCars = cars.filter((c) => !seenIds.has(c.id));
    if (!newCars.length) return;

    // Mark new cars as seen
    await db.insert(alertSeenCarsTable).values(
      newCars.map((c) => ({ alertId: alert.id, carId: c.id })),
    );

    // Update lastCheckedAt
    await db
      .update(alertsTable)
      .set({ lastCheckedAt: new Date() })
      .where(eq(alertsTable.id, alert.id));

    // Send push notification
    const count = newCars.length;
    const first = newCars[0];
    const title = `🔔 ${count} سيارة جديدة — ${alert.name}`;
    const body =
      count === 1
        ? `${first.brand} ${first.model} ${first.year} — ${first.price.toLocaleString()}만원`
        : `${count} سيارات جديدة تطابق تنبيهك "${alert.name}"`;

    await sendPushToSession(alert.sessionId, {
      title,
      body,
      url: toArabicUrl(`${ENCAR_DETAIL}${first.id}`),
      cars: newCars.slice(0, 3),
      alertId: alert.id,
    });

    logger.info({ alertId: alert.id, newCount: count }, "Push notification sent for alert");
  } catch (err) {
    logger.warn({ alertId: alert.id, err }, "Error checking alert");
  }
}

async function runChecks() {
  try {
    const alerts = await db
      .select()
      .from(alertsTable)
      .where(eq(alertsTable.active, true));

    if (!alerts.length) return;
    logger.info({ count: alerts.length }, "Running alert checks");

    await Promise.all(alerts.map(checkAlert));
  } catch (err) {
    logger.error({ err }, "Cron job error");
  }
}

export function startCron() {
  logger.info("Starting alert cron job (5 min interval)");
  // Run immediately on start (after 10s delay to let DB settle)
  setTimeout(() => runChecks(), 10_000);
  setInterval(() => runChecks(), CHECK_INTERVAL_MS);
}
