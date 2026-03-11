import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function truncateAddress(address: string) {
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
}

export function formatSTX(microstacks: number | bigint) {
  return Number(microstacks) / 1000000;
}

export function toMicrostacks(stx: number) {
  return Math.floor(stx * 1000000);
}
