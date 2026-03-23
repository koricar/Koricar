import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPriceKRW(millions: number): string {
  if (!millions) return "0 مليون وون";
  return `${millions.toLocaleString("en-US")} مليون وون`;
}

export function formatNumber(num: number): string {
  if (!num) return "0";
  return num.toLocaleString("en-US");
}
