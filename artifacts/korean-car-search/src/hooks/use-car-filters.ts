import { useState, useCallback } from "react";
import type { SearchCarsParams } from "@workspace/api-client-react";

export function useCarFilters(initialFilters: SearchCarsParams = { page: 1, limit: 12 }) {
  const [filters, setFilters] = useState<SearchCarsParams>(initialFilters);

  const updateFilter = useCallback(<K extends keyof SearchCarsParams>(key: K, value: SearchCarsParams[K]) => {
    setFilters((prev) => {
      const updated = { ...prev, [key]: value };
      // Reset page to 1 when any filter (other than page itself) changes
      if (key !== 'page') {
        updated.page = 1;
      }
      // Clean up undefined/empty values
      if (value === undefined || value === "") {
        delete updated[key];
      }
      return updated;
    });
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({ page: 1, limit: 12 });
  }, []);

  return {
    filters,
    setFilters,
    updateFilter,
    resetFilters,
  };
}
