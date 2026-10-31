import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function calculatePlatformFee(itemTotal: number): number {
  // Rentoby 5% platform facilitator fee (min ₹20)
  return Math.max(20, Math.round(itemTotal * 0.05));
}

export function calculateRentalTotals(params: {
  priceDaily: number;
  startDate: Date | string;
  endDate: Date | string;
  securityDeposit?: number;
  fulfillmentType?: 'PICKUP' | 'DELIVERY';
  deliveryFee?: number;
}) {
  const start = new Date(params.startDate);
  const end = new Date(params.endDate);

  const diffMs = Math.max(0, end.getTime() - start.getTime());
  const diffDays = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));

  const itemTotal = diffDays * params.priceDaily;
  const platformFee = calculatePlatformFee(itemTotal);
  const securityDeposit = params.securityDeposit || 0;
  const deliveryFee = params.fulfillmentType === 'DELIVERY' ? params.deliveryFee || 0 : 0;
  const grandTotal = itemTotal + platformFee + securityDeposit + deliveryFee;

  return {
    durationDays: diffDays,
    itemTotal,
    platformFee,
    securityDeposit,
    deliveryFee,
    grandTotal,
  };
}

/**
 * Calculates distance in kilometers between two coordinates using the Haversine formula
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date));
}

export function formatDateTime(date: string | Date): string {
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(new Date(date));
}

export function truncateText(text: string, maxLength: number = 100): string {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}
