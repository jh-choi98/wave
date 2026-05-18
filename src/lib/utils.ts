import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const KST_DATE_FORMATTER = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Asia/Seoul',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
})

const KST_TIME_FORMATTER = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Asia/Seoul',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
})

function toDate(value: Date | string): Date {
  return value instanceof Date ? value : new Date(value)
}

// "2026.04.13" 형식 (KST)
export function formatDate(value: Date | string): string {
  const d = toDate(value)
  // en-CA returns "YYYY-MM-DD"
  return KST_DATE_FORMATTER.format(d).replace(/-/g, '.')
}

// "2026.04.13 08:30" 형식 (KST)
export function formatDateTime(value: Date | string): string {
  const d = toDate(value)
  return `${formatDate(d)} ${KST_TIME_FORMATTER.format(d)}`
}
