import { useState, useCallback } from "react";
import type { SearchCarsParams } from "@workspace/api-zod";

const STORAGE_KEY = "car_search_filters";

function getSavedFilters(initial: SearchCarsParams): SearchCarsParams {
  try {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    if (saved) return { ...initial, ...JSON.parse(saved) };
  } catch (e) {}
  return initial;
}

export function useCarFilters(initialFilters: SearchCarsParams = { page: 1, limit: 12 }) {
  const [filters, setFilters] = useState<SearchCarsParams>(() => getSavedFilters(initialFilters));

  const updateFilter = useCallback(<K extends keyof SearchCarsParams>(key: K, value: SearchCarsParams[K]) => {
    setFilters((prev) => {
      const updated = { ...prev, [key]: value };
      if (key !== 'page') { updated.page = 1; }
      if (value === undefined || value === "") { delete updated[key]; }
      try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(updated)); } catch (e) {}
      return updated;
    });
  }, []);

  const resetFilters = useCallback(() => {
    const reset = { page: 1, limit: 12 };
    setFilters(reset);
    try { sessionStorage.removeItem(STORAGE_KEY); } catch (e) {}
  }, []);

  return { filters, setFilters, updateFilter, resetFilters };
}
