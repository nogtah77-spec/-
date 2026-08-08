import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const ARABIC_DIGITS = "٠١٢٣٤٥٦٧٨٩";
const PERSIAN_DIGITS = "۰۱۲۳۴۵۶۷۸۹";

function normalizeDigits(value: string) {
  return value
    .replace(/[٠-٩]/g, (digit) => String(ARABIC_DIGITS.indexOf(digit)))
    .replace(/[۰-۹]/g, (digit) => String(PERSIAN_DIGITS.indexOf(digit)));
}

/** Removes display separators before sending a numeric value to the API. */
export function toNumericString(value: unknown) {
  return normalizeDigits(String(value ?? ""))
    .replace(/[,\s٬]/g, "")
    .replace(/[^\d.-]/g, "");
}

/** Formats a number or numeric string with standard thousands separators. */
export function formatNumber(value: unknown, locale = "en-US") {
  const raw = toNumericString(value);
  if (!raw || raw === "-" || raw === ".") return "";
  const numeric = Number(raw);
  return Number.isFinite(numeric) ? numeric.toLocaleString(locale) : String(value ?? "");
}

/**
 * Formats a controlled numeric input while preserving an unfinished decimal.
 * The stored form value may contain commas; call toNumericString before submit.
 */
export function formatNumericInput(value: string) {
  const normalized = normalizeDigits(value)
    .replace(/[,\s٬]/g, "")
    .replace(/[^\d.-]/g, "")
    .replace(/(?!^)-/g, "");
  if (!normalized) return "";
  const [integerPart, decimalPart] = normalized.split(".");
  const groupedInteger = (integerPart || "0").replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return decimalPart === undefined ? groupedInteger : `${groupedInteger}.${decimalPart}`;
}

/** Formats money-like text when it is a plain numeric value, otherwise preserves its wording. */
export function formatMoneyText(value: unknown, suffix = "") {
  const formatted = formatNumber(value);
  return formatted ? `${formatted}${suffix ? ` ${suffix}` : ""}` : String(value ?? "");
}
