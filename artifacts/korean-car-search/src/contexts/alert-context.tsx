import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import type { SearchCarsParams } from "@workspace/api-client-react";

interface AlertContextValue {
  open: boolean;
  defaultFilters: SearchCarsParams;
  openModal: (filters?: SearchCarsParams) => void;
  closeModal: () => void;
}

const AlertContext = createContext<AlertContextValue>({
  open: false,
  defaultFilters: {},
  openModal: () => {},
  closeModal: () => {},
});

export function AlertProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [defaultFilters, setDefaultFilters] = useState<SearchCarsParams>({});

  const openModal = useCallback((filters: SearchCarsParams = {}) => {
    setDefaultFilters(filters);
    setOpen(true);
  }, []);

  const closeModal = useCallback(() => setOpen(false), []);

  return (
    <AlertContext.Provider value={{ open, defaultFilters, openModal, closeModal }}>
      {children}
    </AlertContext.Provider>
  );
}

export function useAlertContext() {
  return useContext(AlertContext);
}
