import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number | null, currency: string = "INR"): string {
  if (amount === null || amount === undefined) {
    return "Price on request";
  }
  
  const symbols: Record<string, string> = {
    INR: "₹",
    USD: "$",
    CAD: "C$",
    GBP: "£",
    AUD: "A$",
    EUR: "€",
  };
  
  const symbol = symbols[currency] || currency;
  return `${symbol}${amount.toLocaleString()}`;
}

export function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return "just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  
  return date.toLocaleDateString();
}

export function isNewPost(date: Date): boolean {
  const now = new Date();
  const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
  return diffInHours < 24;
}

