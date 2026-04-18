import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

interface Order {
  id: string;
  created_at: string;
  customer_name: string;
  phone: string;
  country: string;
  car_name: string;
  car_price: string;
  inspection: boolean;
  contact_method: string;
  notes: string;
  status: string;
}

const statusColors: Record<string, string> = {
  new: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  confirmed: "bg-green-500/20 text-green-400 border-green-500/30",
  processing: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  done: "bg-gray-500/20 text-gray-400 border-gray-500/30",
};

const statusLabels: Record<string, string> = {
  new: "🆕 جديد",
  confirmed: "✅ مؤكد",
  processing: "⚙️ قيد التنفيذ",
  done: "🏁 منتهي",
};

export default function Dashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    const { data } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setOrders(data);
    setLoading(false);
  };

  const updateStatus = async (id: string, status: string) => {
    await supabase.from("orders").update({ status }).eq("id", id);
    fetchOrders();
  };

  const sendWhatsApp = (order: Order) => {
    const msg = encodeURIComponent(
      `مرحباً ${order.customer_name} 👋\n\nبخصوص طلبك للسيارة: *${order.car_name}*\n\nتم تأكيد طلبك ✅ وسنتواصل معك قريباً بكافة التفاصيل.\n\nشكراً لثقتك بـ كوري كار 🚗`
    );
    window.open(`https://wa.me/${order.phone.replace(/\+/g, "")}?text=${msg}`, "_blank");
  };

  useEffect(() => { fetchOrders(); }, []);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-muted-foreground">جاري التحميل...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-background p-4" dir="rtl">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">📊 لوحة التحكم</h1>
            <p className="text-muted-foreground text-sm">{orders.length} طلب</p>
          </div>
          <button onClick={fetchOrders} className="px-4 py-2 border border-border rounded-xl text-sm">🔄 تحديث</button>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">لا توجد طلبات بعد</div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="border border-border rounded-2xl p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-bold text-lg">{order.customer_name}</p>
                    <p className="text-muted-foreground text-sm">{order.phone} • {order.country}</p>
                  </div>
                  <span className={`text-xs px-3 py-1 rounded-full border font-bold ${statusColors[order.status] || statusColors.new}`}>
                    {statusLabels[order.status] || "🆕 جديد"}
                  </span>
                </div>

                <div className="bg-muted/20 rounded-xl p-3">
                  <p className="font-bold">{order.car_name}</p>
                  <p className="text-primary text-sm">{order.car_price}</p>
                  <p className="text-muted-foreground text-xs mt-1">
                    فحص: {order.inspection ? "✅ نعم" : "❌ لا"} • {order.contact_method === "whatsapp" ? "💬 واتساب" : "📞 اتصال"}
                  </p>
                  {order.notes && <p className="text-sm mt-1">📝 {order.notes}</p>}
                </div>

                <div className="flex gap-2 flex-wrap">
                  <select
                    value={order.status || "new"}
                    onChange={(e) => updateStatus(order.id, e.target.value)}
                    className="bg-muted/20 border border-border rounded-xl px-3 py-2 text-sm flex-1"
                  >
                    <option value="new">🆕 جديد</option>
                    <option value="confirmed">✅ مؤكد</option>
                    <option value="processing">⚙️ قيد التنفيذ</option>
                    <option value="done">🏁 منتهي</option>
                  </select>
                  <button
                    onClick={() => sendWhatsApp(order)}
                    className="px-4 py-2 bg-green-600 text-white rounded-xl text-sm font-bold"
                  >
                    💬 واتساب
                  </button>
                </div>

                <p className="text-xs text-muted-foreground">
                  {new Date(order.created_at).toLocaleString("ar-SA")}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}