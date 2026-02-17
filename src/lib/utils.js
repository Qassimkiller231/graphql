import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
/**
 * Formats XP (in bytes) to human-readable units
 * @param {number} xp - XP amount in bytes
 * @returns {string} - Formatted string like "1.23 MB"
 */
export function formatXP(xp) {
    if (xp >= 1_000_000) {
        return `${(xp / 1_000_000).toPrecision(3)} MB`;
    }
    if (xp >= 1_000) {
        return `${(xp / 1_000).toPrecision(3)} kB`;
    }
    return `${xp} bytes`;
}