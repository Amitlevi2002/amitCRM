import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

export function timeAgo(iso: string, now = Date.now()) {
    const mins = Math.round((new Date(iso).getTime() - now) / 60000);
    if (Math.abs(mins) < 60) return rtf.format(mins, 'minute');
    const hours = Math.round(mins / 60);
    if (Math.abs(hours) < 24) return rtf.format(hours, 'hour');
    const days = Math.round(hours / 24);
    if (Math.abs(days) < 30) return rtf.format(days, 'day');
    return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

export const shortDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
