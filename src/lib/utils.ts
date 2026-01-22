import { cache } from "react";

export const encodeBtoa = (data: Record<string, any>) => {
  const json = JSON.stringify(data);
  return btoa(encodeURIComponent(json));
};

export const decodeAtob = (token: string) => {
  try {
    const json = decodeURIComponent(atob(token));
    return JSON.parse(json);
  } catch {
    return null;
  }
};

export function getFlag(code: string) {
  const codePoints = code
    .toUpperCase()
    .split("")
    .map((char) => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

export const slugify = (text: string) =>
  text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-");

export const truncate = (text?: string, max: number = 100) => {
  if (!text) return null;
  if (text.length <= max) {
    return text;
  }
  return text.substring(0, max) + "...";
};

export const getSevenDaysAgo = cache(() => {
  return new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
});
