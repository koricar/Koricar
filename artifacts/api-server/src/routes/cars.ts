import { Router, type IRouter } from "express";
import { SearchCarsQueryParams } from "@workspace/api-zod";

const router: IRouter = Router();

const KOREAN_CAR_DATA = [
  {
    id: "1",
    brand: "Hyundai",
    model: "Avante (Elantra)",
    year: 2023,
    price: 2200,
    mileage: 15000,
    fuelType: "gasoline",
    transmission: "auto",
    bodyType: "sedan",
    color: "white",
    sunroof: true,
    imageUrl: "https://images.unsplash.com/photo-1617469767856-f4b47f1ea6a0?w=600&auto=format",
    thumbnailUrl: "https://images.unsplash.com/photo-1617469767856-f4b47f1ea6a0?w=300&auto=format",
    description: "هيونداي افانتي موديل 2023 بحالة ممتازة",
    features: ["فتحة سقف", "كاميرا خلفية", "تكييف ذكي", "مقاعد جلد"],
    source: "Encar",
    sourceUrl: "https://www.encar.com",
    location: "سيول",
  },
  {
    id: "2",
    brand: "Kia",
    model: "Sportage",
    year: 2022,
    price: 2800,
    mileage: 32000,
    fuelType: "diesel",
    transmission: "auto",
    bodyType: "suv",
    color: "black",
    sunroof: true,
    imageUrl: "https://images.unsplash.com/photo-1612544448445-b8232cff3b6c?w=600&auto=format",
    thumbnailUrl: "https://images.unsplash.com/photo-1612544448445-b8232cff3b6c?w=300&auto=format",
    description: "كيا سبورتاج 2022 ديزل بمميزات كاملة",
    features: ["فتحة سقف بانورامية", "نظام ملاحة", "مقاعد مدفأة", "4WD"],
    source: "K Car",
    sourceUrl: "https://www.kcar.com",
    location: "بوسان",
  },
  {
    id: "3",
    brand: "Genesis",
    model: "G80",
    year: 2023,
    price: 6500,
    mileage: 8000,
    fuelType: "gasoline",
    transmission: "auto",
    bodyType: "sedan",
    color: "silver",
    sunroof: true,
    imageUrl: "https://images.unsplash.com/photo-1525609004556-c46c7d6cf023?w=600&auto=format",
    thumbnailUrl: "https://images.unsplash.com/photo-1525609004556-c46c7d6cf023?w=300&auto=format",
    description: "جينيسيس G80 الفئة الراقية بمواصفات كاملة",
    features: ["فتحة سقف فاخرة", "صوت بوسي", "مقاعد تدليك", "رادار مسافة"],
    source: "Encar",
    sourceUrl: "https://www.encar.com",
    location: "إنتشون",
  },
  {
    id: "4",
    brand: "Hyundai",
    model: "Tucson",
    year: 2021,
    price: 2100,
    mileage: 55000,
    fuelType: "hybrid",
    transmission: "auto",
    bodyType: "suv",
    color: "blue",
    sunroof: false,
    imageUrl: "https://images.unsplash.com/photo-1532974297617-c0f05fe48bff?w=600&auto=format",
    thumbnailUrl: "https://images.unsplash.com/photo-1532974297617-c0f05fe48bff?w=300&auto=format",
    description: "هيونداي توسان هايبرد اقتصادي",
    features: ["هايبرد", "كاميرا 360", "شاشة لمس", "بلوتوث"],
    source: "Car Baza",
    sourceUrl: "https://www.carbaza.kr",
    location: "دايغو",
  },
  {
    id: "5",
    brand: "Kia",
    model: "EV6",
    year: 2023,
    price: 4500,
    mileage: 12000,
    fuelType: "electric",
    transmission: "auto",
    bodyType: "suv",
    color: "white",
    sunroof: true,
    imageUrl: "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=600&auto=format",
    thumbnailUrl: "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=300&auto=format",
    description: "كيا EV6 كهربائي بالكامل - مستقبل السيارات",
    features: ["شحن سريع 800V", "فتحة سقف بانورامية", "HUD", "قيادة شبه ذاتية"],
    source: "Encar",
    sourceUrl: "https://www.encar.com",
    location: "سيول",
  },
  {
    id: "6",
    brand: "SsangYong",
    model: "Rexton",
    year: 2022,
    price: 3200,
    mileage: 28000,
    fuelType: "diesel",
    transmission: "auto",
    bodyType: "suv",
    color: "black",
    sunroof: false,
    imageUrl: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600&auto=format",
    thumbnailUrl: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=300&auto=format",
    description: "سانغ يونغ ريكستون ديزل 7 مقاعد",
    features: ["7 مقاعد", "دفع رباعي", "سحب ثقيل", "شاشة كبيرة"],
    source: "K Car",
    sourceUrl: "https://www.kcar.com",
    location: "كيونغي",
  },
  {
    id: "7",
    brand: "Hyundai",
    model: "Sonata",
    year: 2022,
    price: 2700,
    mileage: 40000,
    fuelType: "gasoline",
    transmission: "auto",
    bodyType: "sedan",
    color: "gray",
    sunroof: true,
    imageUrl: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=600&auto=format",
    thumbnailUrl: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=300&auto=format",
    description: "هيونداي سوناتا بحالة ممتازة مع فتحة سقف",
    features: ["فتحة سقف", "مقاعد جلد", "Apple CarPlay", "Android Auto"],
    source: "Encar",
    sourceUrl: "https://www.encar.com",
    location: "سيول",
  },
  {
    id: "8",
    brand: "Kia",
    model: "K5",
    year: 2023,
    price: 2900,
    mileage: 5000,
    fuelType: "gasoline",
    transmission: "auto",
    bodyType: "sedan",
    color: "red",
    sunroof: true,
    imageUrl: "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=600&auto=format",
    thumbnailUrl: "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=300&auto=format",
    description: "كيا K5 موديل 2023 الجديد كلياً",
    features: ["فتحة سقف", "مقاعد مدفأة ومبردة", "نظام صوت رائع", "شاشة 12.3 بوصة"],
    source: "Car Baza",
    sourceUrl: "https://www.carbaza.kr",
    location: "بوسان",
  },
  {
    id: "9",
    brand: "Genesis",
    model: "GV80",
    year: 2022,
    price: 7800,
    mileage: 22000,
    fuelType: "diesel",
    transmission: "auto",
    bodyType: "suv",
    color: "white",
    sunroof: true,
    imageUrl: "https://images.unsplash.com/photo-1583267746897-2cf415887172?w=600&auto=format",
    thumbnailUrl: "https://images.unsplash.com/photo-1583267746897-2cf415887172?w=300&auto=format",
    description: "جينيسيس GV80 SUV الفاخر بمواصفات كاملة",
    features: ["فتحة سقف بانورامية", "مقاعد جلد فاخرة", "صوت 21 مكبر", "Lexicon Audio"],
    source: "Encar",
    sourceUrl: "https://www.encar.com",
    location: "سيول",
  },
  {
    id: "10",
    brand: "Renault Samsung",
    model: "QM6",
    year: 2021,
    price: 2400,
    mileage: 48000,
    fuelType: "gasoline",
    transmission: "auto",
    bodyType: "suv",
    color: "silver",
    sunroof: false,
    imageUrl: "https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=600&auto=format",
    thumbnailUrl: "https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=300&auto=format",
    description: "رينو سامسونج QM6 - تصميم أوروبي بجودة كورية",
    features: ["نظام ملاحة", "بداية بدون مفتاح", "كاميرا خلفية", "مقاعد مريحة"],
    source: "K Car",
    sourceUrl: "https://www.kcar.com",
    location: "دايجون",
  },
  {
    id: "11",
    brand: "Hyundai",
    model: "IONIQ 5",
    year: 2023,
    price: 5200,
    mileage: 6000,
    fuelType: "electric",
    transmission: "auto",
    bodyType: "suv",
    color: "green",
    sunroof: false,
    imageUrl: "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=600&auto=format",
    thumbnailUrl: "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=300&auto=format",
    description: "هيونداي أيونيك 5 كهربائي بالكامل",
    features: ["شحن سريع", "مدى 400 كم", "V2L (شحن الأجهزة)", "تصميم مستقبلي"],
    source: "Encar",
    sourceUrl: "https://www.encar.com",
    location: "سيول",
  },
  {
    id: "12",
    brand: "Kia",
    model: "Carnival",
    year: 2022,
    price: 4100,
    mileage: 35000,
    fuelType: "diesel",
    transmission: "auto",
    bodyType: "van",
    color: "black",
    sunroof: true,
    imageUrl: "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=600&auto=format",
    thumbnailUrl: "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=300&auto=format",
    description: "كيا كارنيفال 9 مقاعد فاخر",
    features: ["9 مقاعد VIP", "فتحة سقف بانورامية", "شاشة خلفية", "مقاعد أول درجة"],
    source: "Car Baza",
    sourceUrl: "https://www.carbaza.kr",
    location: "إنتشون",
  },
  {
    id: "13",
    brand: "Hyundai",
    model: "Palisade",
    year: 2023,
    price: 5500,
    mileage: 18000,
    fuelType: "diesel",
    transmission: "auto",
    bodyType: "suv",
    color: "white",
    sunroof: true,
    imageUrl: "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=600&auto=format",
    thumbnailUrl: "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=300&auto=format",
    description: "هيونداي باليسيد 8 مقاعد SUV الكبير",
    features: ["8 مقاعد", "فتحة سقف بانورامية", "دفع رباعي ذكي", "صوت Meridian"],
    source: "Encar",
    sourceUrl: "https://www.encar.com",
    location: "سيول",
  },
  {
    id: "14",
    brand: "Kia",
    model: "Stinger",
    year: 2021,
    price: 4200,
    mileage: 45000,
    fuelType: "gasoline",
    transmission: "auto",
    bodyType: "sedan",
    color: "gray",
    sunroof: true,
    imageUrl: "https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=600&auto=format",
    thumbnailUrl: "https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=300&auto=format",
    description: "كيا ستينغر الرياضية بمحرك 3.3 توربو",
    features: ["محرك توربو 3.3L", "AWD", "فتحة سقف", "مقاعد بكيرة رياضية"],
    source: "K Car",
    sourceUrl: "https://www.kcar.com",
    location: "دايغو",
  },
  {
    id: "15",
    brand: "Genesis",
    model: "G70",
    year: 2022,
    price: 4800,
    mileage: 28000,
    fuelType: "gasoline",
    transmission: "auto",
    bodyType: "sedan",
    color: "black",
    sunroof: true,
    imageUrl: "https://images.unsplash.com/photo-1525609004556-c46c7d6cf023?w=600&auto=format",
    thumbnailUrl: "https://images.unsplash.com/photo-1525609004556-c46c7d6cf023?w=300&auto=format",
    description: "جينيسيس G70 الرياضي الفاخر",
    features: ["فتحة سقف", "محرك توربو", "مقاعد جلد نابا", "Brembo بريك"],
    source: "Encar",
    sourceUrl: "https://www.encar.com",
    location: "بوسان",
  },
  {
    id: "16",
    brand: "Hyundai",
    model: "Grandeur",
    year: 2023,
    price: 4300,
    mileage: 10000,
    fuelType: "hybrid",
    transmission: "auto",
    bodyType: "sedan",
    color: "silver",
    sunroof: false,
    imageUrl: "https://images.unsplash.com/photo-1489824904134-891ab64532f1?w=600&auto=format",
    thumbnailUrl: "https://images.unsplash.com/photo-1489824904134-891ab64532f1?w=300&auto=format",
    description: "هيونداي غراندور هايبرد الفاخر",
    features: ["هايبرد اقتصادي", "مقاعد جلد فاخرة", "نظام صوت Lexicon", "شاشة 12.3 بوصة"],
    source: "Car Baza",
    sourceUrl: "https://www.carbaza.kr",
    location: "سيول",
  },
  {
    id: "17",
    brand: "Kia",
    model: "Sorento",
    year: 2022,
    price: 3800,
    mileage: 30000,
    fuelType: "hybrid",
    transmission: "auto",
    bodyType: "suv",
    color: "blue",
    sunroof: true,
    imageUrl: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=600&auto=format",
    thumbnailUrl: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=300&auto=format",
    description: "كيا سورينتو هايبرد 7 مقاعد",
    features: ["هايبرد", "7 مقاعد", "فتحة سقف بانورامية", "HTRAC AWD"],
    source: "Encar",
    sourceUrl: "https://www.encar.com",
    location: "كيونغي",
  },
  {
    id: "18",
    brand: "SsangYong",
    model: "Tivoli",
    year: 2021,
    price: 1500,
    mileage: 62000,
    fuelType: "gasoline",
    transmission: "manual",
    bodyType: "suv",
    color: "orange",
    sunroof: false,
    imageUrl: "https://images.unsplash.com/photo-1566473965997-3de9c817e938?w=600&auto=format",
    thumbnailUrl: "https://images.unsplash.com/photo-1566473965997-3de9c817e938?w=300&auto=format",
    description: "سانغ يونغ تيفولي اقتصادي بسعر مناسب",
    features: ["اقتصادي بالوقود", "تصميم عصري", "مساحة جيدة", "شاشة لمس"],
    source: "K Car",
    sourceUrl: "https://www.kcar.com",
    location: "دايجون",
  },
  {
    id: "19",
    brand: "Hyundai",
    model: "Santa Fe",
    year: 2023,
    price: 4600,
    mileage: 8000,
    fuelType: "diesel",
    transmission: "auto",
    bodyType: "suv",
    color: "gray",
    sunroof: true,
    imageUrl: "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=600&auto=format",
    thumbnailUrl: "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=300&auto=format",
    description: "هيونداي سانتا في ديزل موديل 2023",
    features: ["دفع رباعي", "7 مقاعد", "فتحة سقف بانورامية", "نظام ملاحة ذكي"],
    source: "Car Baza",
    sourceUrl: "https://www.carbaza.kr",
    location: "جيجو",
  },
  {
    id: "20",
    brand: "Kia",
    model: "Niro EV",
    year: 2022,
    price: 3600,
    mileage: 25000,
    fuelType: "electric",
    transmission: "auto",
    bodyType: "hatchback",
    color: "white",
    sunroof: false,
    imageUrl: "https://images.unsplash.com/photo-1617531653332-bd46c16f4d68?w=600&auto=format",
    thumbnailUrl: "https://images.unsplash.com/photo-1617531653332-bd46c16f4d68?w=300&auto=format",
    description: "كيا نيرو EV كهربائي بالكامل اقتصادي",
    features: ["مدى 385 كم", "شحن سريع", "Apple CarPlay", "تكييف مضمن في البطارية"],
    source: "Encar",
    sourceUrl: "https://www.encar.com",
    location: "سيول",
  },
];

function formatPrice(price: number): string {
  return `${price.toLocaleString()}만원 (~${Math.round(price * 8500).toLocaleString()}﷼)`;
}

router.get("/brands", (_req, res) => {
  const brands = [...new Set(KOREAN_CAR_DATA.map((c) => c.brand))].sort();
  res.json({ brands });
});

router.get("/search", (req, res) => {
  const queryResult = SearchCarsQueryParams.safeParse(req.query);
  if (!queryResult.success) {
    res.status(400).json({ error: "invalid_params", message: "Invalid query parameters" });
    return;
  }

  const {
    query,
    brand,
    yearFrom,
    yearTo,
    sunroof,
    transmission,
    fuelType,
    bodyType,
    priceMin,
    priceMax,
    mileageMax,
    color,
    page = 1,
    limit = 20,
  } = queryResult.data;

  let results = [...KOREAN_CAR_DATA];

  if (query) {
    const q = query.toLowerCase();
    results = results.filter(
      (c) =>
        c.brand.toLowerCase().includes(q) ||
        c.model.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q)
    );
  }

  if (brand && brand !== "any") {
    results = results.filter((c) => c.brand.toLowerCase() === brand.toLowerCase());
  }

  if (yearFrom !== undefined) {
    results = results.filter((c) => c.year >= yearFrom);
  }

  if (yearTo !== undefined) {
    results = results.filter((c) => c.year <= yearTo);
  }

  if (sunroof !== undefined) {
    results = results.filter((c) => c.sunroof === sunroof);
  }

  if (transmission && transmission !== "any") {
    results = results.filter((c) => c.transmission === transmission);
  }

  if (fuelType && fuelType !== "any") {
    results = results.filter((c) => c.fuelType === fuelType);
  }

  if (bodyType && bodyType !== "any") {
    results = results.filter((c) => c.bodyType === bodyType);
  }

  if (priceMin !== undefined) {
    results = results.filter((c) => c.price >= priceMin);
  }

  if (priceMax !== undefined) {
    results = results.filter((c) => c.price <= priceMax);
  }

  if (mileageMax !== undefined) {
    results = results.filter((c) => c.mileage <= mileageMax);
  }

  if (color) {
    results = results.filter((c) => c.color.toLowerCase().includes(color.toLowerCase()));
  }

  const total = results.length;
  const totalPages = Math.ceil(total / limit);
  const startIndex = (page - 1) * limit;
  const paginated = results.slice(startIndex, startIndex + limit);

  const carsWithPrice = paginated.map((car) => ({
    ...car,
    priceFormatted: formatPrice(car.price),
  }));

  res.json({
    cars: carsWithPrice,
    total,
    page,
    limit,
    totalPages,
  });
});

router.get("/:id", (req, res) => {
  const car = KOREAN_CAR_DATA.find((c) => c.id === req.params.id);
  if (!car) {
    res.status(404).json({ error: "not_found", message: "Car not found" });
    return;
  }
  res.json({ ...car, priceFormatted: formatPrice(car.price) });
});

export default router;
