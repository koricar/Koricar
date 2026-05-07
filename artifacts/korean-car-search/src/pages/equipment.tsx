import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";

const API_BASE = "https://koricar-ba7l.onrender.com";

const CATEGORIES = [
  { en: "", ar: "الكل" },
  { en: "Large Excavator", ar: "حفار كبير" },
  { en: "Excavator 1.0m3", ar: "حفار متوسط" },
  { en: "Mini Excavator", ar: "ميني بوكلين" },
  { en: "Wheeled Excavator", ar: "بوكلين بعجلات" },
  { en: "Wheel Loader", ar: "شيول" },
  { en: "Bulldozer", ar: "بلدوزر" },
  { en: "Cargo Crane", ar: "كرين" },
  { en: "Dump Truck Large", ar: "قلاب كبير" },
  { en: "Forklift", ar: "رافعة شوكية" },
];

interface Equipment {
  id: number;
  title: string;
  price: string;
  image: string;
  link: string;
  category_ar: string;
  category_en: string;
}

export default function EquipmentPage() {
  const [selectedCategory, setSelectedCategory] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["equipment", selectedCategory, page],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), limit: "20" });
      if (selectedCategory) params.set("category", selectedCategory);
      const res = await fetch(`${API_BASE}/api/equipment?${params}`);
      return res.json();
    },
  });

  const equipment: Equipment[] = data?.data || [];
  const total = data?.total || 0;

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/">
            <span className="text-blue-600 hover:underline cursor-pointer text-sm">→ العودة للسيارات</span>
          </Link>
          <h1 className="text-xl font-bold text-gray-800">🚜 المعدات الثقيلة الكورية</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-2 flex-wrap mb-6">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.en}
              onClick={() => { setSelectedCategory(cat.en); setPage(1); }}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === cat.en
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 border hover:bg-blue-50"
              }`}
            >
              {cat.ar}
            </button>
          ))}
        </div>

        <p className="text-gray-500 text-sm mb-4">
          {isLoading ? "جاري التحميل..." : `${total} معدة متاحة`}
        </p>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl h-64 animate-pulse" />
            ))}
          </div>
        ) : equipment.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <div className="text-5xl mb-4">🚜</div>
            <p>لا توجد معدات في هذه الفئة</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {equipment.map((item) => (
              <a
                key={item.id}
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white rounded-xl shadow-sm border hover:shadow-md transition-shadow overflow-hidden"
              >
                <div className="bg-gray-100 h-40 flex items-center justify-center">
                  <span className="text-5xl">🚜</span>
                </div>
                <div className="p-3">
                  <p className="text-xs text-blue-600 font-medium mb-1">{item.category_ar}</p>
                  <h3 className="font-semibold text-gray-800 text-sm leading-snug mb-2 line-clamp-2">
                    {item.title}
                  </h3>
                  <p className="text-green-600 font-bold text-sm">{item.price}</p>
                </div>
              </a>
            ))}
          </div>
        )}

        {total > 20 && (
          <div className="flex justify-center gap-2 mt-8">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-4 py-2 rounded bg-white border disabled:opacity-40">السابق</button>
            <span className="px-4 py-2 text-gray-600">صفحة {page}</span>
            <button onClick={() => setPage(p => p + 1)} disabled={page * 20 >= total} className="px-4 py-2 rounded bg-white border disabled:opacity-40">التالي</button>
          </div>
        )}

        <div className="mt-10 bg-green-50 border border-green-200 rounded-xl p-6 text-center">
          <h3 className="font-bold text-gray-800 mb-2">هل تريد استيراد معدة؟</h3>
          <p className="text-gray-600 text-sm mb-4">تواصل معنا عبر واتساب للاستفسار عن أي معدة</p>
          <a
            href="https://wa.me/821068152732?text=مرحباً، أريد الاستفسار عن استيراد معدة ثقيلة من كوريا 🚜"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-green-500 text-white px-6 py-3 rounded-full font-medium hover:bg-green-600 transition-colors"
          >
            <span>تواصل عبر واتساب</span>
            <span>💬</span>
          </a>
        </div>
      </div>
    </div>
  );
}
