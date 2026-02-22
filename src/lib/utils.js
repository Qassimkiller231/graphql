import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
    return twMerge(clsx(inputs));
}
/**
 * Rounds a number UP (ceiling) to 3 significant figures.
 * e.g. 714.1 → 715, 1.231 → 1.24
 */
function ceilTo3SF(n) {
    if (n === 0) return 0;
    const d = Math.floor(Math.log10(Math.abs(n))) - 2; // power for 3rd sig fig
    const factor = Math.pow(10, d);
    return Math.ceil(n / factor) * factor;
}

/**
 * Formats XP (in bytes) to human-readable units
 * @param {number} xp - XP amount in bytes
 * @returns {string} - Formatted string like "1.23 MB"
 */
export function formatXP(xp) {
    if (xp >= 1_000_000) {
        return `${ceilTo3SF(xp / 1_000_000)} MB`;
    }
    if (xp >= 1_000) {
        return `${ceilTo3SF(xp / 1_000)} kB`;
    }
    return `${xp} bytes`;
}