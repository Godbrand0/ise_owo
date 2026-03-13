import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function truncateAddress(address: string | null | undefined) {
  if (!address) return "...";
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
}

export function formatSTX(microstacks: number | bigint) {
  return Number(microstacks) / 1000000;
}

export function toMicrostacks(stx: number) {
  return Math.floor(stx * 1000000);
}

export function formatDate(date: Date | number | string) {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// Average block time on Stacks is ~10 minutes
export function estimateBlockTime(targetBlock: number, currentBlock: number) {
  const diff = targetBlock - currentBlock;
  const now = new Date();
  const estimatedDate = new Date(now.getTime() + diff * 10 * 60 * 1000);
  return estimatedDate;
}

// Deep unwrap for Stacks Responses/Optionals serialized with cvToJSON
export function unwrapCV(val: any): any {
  if (val === null || val === undefined) return null;
  // if it's an optional and value is null -> none
  if (val.type && val.type.includes("optional") && val.value === null) return null;
  
  // if it has an inner value, recurse
  if (val.value !== undefined) {
    if (typeof val.value === "object" && val.value !== null && val.value.value !== undefined) {
      return unwrapCV(val.value);
    }
    return val.value;
  }
  
  return val;
}
