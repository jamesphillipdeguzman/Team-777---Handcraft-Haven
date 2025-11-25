import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { isLoggedIn } from "@/lib/auth";


export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


// Check if the user is logged in via token cookie
export function checkLogin(): boolean {
  if (typeof document === "undefined") return false; // SSR guard

  const cookies = document.cookie; // "token=abc123; other=xyz"
  const tokenMatch = cookies.match(/token=([^;]+)/);
  const token = tokenMatch ? tokenMatch[1] : undefined;

  return isLoggedIn(token);
}