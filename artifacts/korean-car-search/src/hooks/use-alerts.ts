import { useState, useEffect, useCallback } from "react";
import { getSessionId } from "@/lib/notifications";

const BASE = import.meta.env.BASE_URL;

function getApiBase() {
  const base = BASE.replace(/\/$/, "");
  const parts = base.split("/").filter(Boolean);
  if (parts.length === 0) return "/api";
  parts[parts.length - 1] = "api-server";
  return "/" + parts.join("/") + "/api";
}

const API_BASE = getApiBase();

export interface AlertFilter {
  brand?: string;
  model?: string;
  yearFrom?: number;
  yearTo?: number;
  priceMin?: number;
  priceMax?: number;
  mileageMax?: number;
  fuelType?: string;
  transmission?: string;
  bodyType?: string;
  color?: string;
  sunroof?: boolean;
}

export interface CarAlert {
  id: number;
  sessionId: string;
  name: string;
  brand?: string | null;
  model?: string | null;
  yearFrom?: number | null;
  yearTo?: number | null;
  priceMin?: number | null;
  priceMax?: number | null;
  mileageMax?: number | null;
  fuelType?: string | null;
  transmission?: string | null;
  bodyType?: string | null;
  color?: string | null;
  sunroof?: boolean | null;
  active: boolean;
  createdAt: string;
  lastCheckedAt?: string | null;
}

export function useAlerts() {
  const [alerts, setAlerts] = useState<CarAlert[]>([]);
  const [loading, setLoading] = useState(false);

  const sessionId = getSessionId();

  const fetchAlerts = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/alerts?sessionId=${sessionId}`);
      const data = await res.json();
      setAlerts(data.alerts ?? []);
    } catch {
      // silent
    }
  }, [sessionId]);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  const createAlert = useCallback(async (name: string, filters: AlertFilter) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/alerts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, name, ...filters }),
      });
      const data = await res.json();
      if (data.alert) setAlerts((prev) => [...prev, data.alert]);
      return data.alert;
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  const deleteAlert = useCallback(async (id: number) => {
    await fetch(`${API_BASE}/alerts/${id}`, { method: "DELETE" });
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const toggleAlert = useCallback(async (id: number) => {
    const res = await fetch(`${API_BASE}/alerts/${id}/toggle`, { method: "PATCH" });
    const data = await res.json();
    if (data.alert) {
      setAlerts((prev) => prev.map((a) => (a.id === id ? data.alert : a)));
    }
  }, []);

  return { alerts, loading, createAlert, deleteAlert, toggleAlert, refetch: fetchAlerts };
}
