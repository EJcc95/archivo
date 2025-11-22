import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
export { encryptData, decryptData, setSecureItem, getSecureItem, removeSecureItem, clearSecureStorage } from './encryption';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
