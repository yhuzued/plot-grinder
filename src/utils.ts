import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const EVENT_COLORS: Record<string, string> = {
  Safe: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  Suspense: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  Violence: 'bg-red-500/20 text-red-400 border-red-500/30',
  Setback: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  Resolution: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
};

export const EVENT_BG_COLORS: Record<string, string> = {
  Safe: 'bg-[#1A1A1A] border-blue-500/20',
  Suspense: 'bg-[#1A1A1A] border-yellow-500/20',
  Violence: 'bg-[#1A1A1A] border-red-500/20',
  Setback: 'bg-[#1A1A1A] border-gray-500/20',
  Resolution: 'bg-[#1A1A1A] border-purple-500/20',
};
